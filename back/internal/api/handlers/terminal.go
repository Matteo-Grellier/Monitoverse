package handlers

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	"back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type TerminalCommand struct {
	ID            string `json:"id"`
	Command       string `json:"command"`
	Output        string `json:"output"`
	Error         string `json:"error"`
	Status        int    `json:"status"`
	Time          int64  `json:"time"`
	Target        string `json:"target,omitempty"`        // "host" or "container"
	ContainerName string `json:"containerName,omitempty"` // for container target
	UseSudo       bool   `json:"useSudo,omitempty"`
}

type TerminalMessage struct {
	Type    string            `json:"type"`
	Command *TerminalCommand  `json:"command,omitempty"`
	History []TerminalCommand `json:"history,omitempty"`
}

var terminalHistory []TerminalCommand

func RegisterTerminalRoutes(r *gin.Engine, userService services.UserService) {
	r.GET("/terminal", func(c *gin.Context) {
		handleTerminalWebSocket(c)
	})
}

func handleTerminalWebSocket(c *gin.Context) {
	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Println("Error closing WebSocket connection:", err)
		}
	}()

	// Send initial history
	historyMsg := TerminalMessage{
		Type:    "history",
		History: terminalHistory,
	}
	if err := conn.WriteJSON(historyMsg); err != nil {
		log.Println("Error sending history:", err)
		return
	}

	for {
		var msg TerminalMessage
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Error reading message:", err)
			break
		}

		if msg.Type == "execute" && msg.Command != nil {
			executeCommand(conn, msg.Command)
		}
	}
}

func executeCommand(conn *websocket.Conn, cmd *TerminalCommand) {
	var writeMutex sync.Mutex

	var execCmd *exec.Cmd

	// Always run host commands via Docker socket for host access
	switch cmd.Target {
	case "host", "":
		// Use Docker to run a privileged container with host root mounted
		commandStr := cmd.Command
		if cmd.UseSudo {
			commandStr = "sudo " + commandStr
		}
		// Use Alpine as the helper container
		execCmd = exec.Command(
			"docker", "run", "--rm", "--privileged",
			"-v", "/:/host", "alpine",
			"chroot", "/host", "sh", "-c", commandStr,
		)
	case "container":
		if cmd.ContainerName == "" {
			sendError(conn, cmd, "Container name required for container target")
			return
		}
		containerCmd := cmd.Command
		if cmd.UseSudo {
			containerCmd = "sudo " + containerCmd
		}
		execCmd = exec.Command("docker", "exec", cmd.ContainerName, "sh", "-c", containerCmd)
	default:
		// Fallback: run in container (should not be used)
		commandStr := cmd.Command
		if cmd.UseSudo {
			commandStr = "sudo " + commandStr
		}
		execCmd = exec.Command("sh", "-c", commandStr)
	}

	// Capture stdout and stderr
	stdout, err := execCmd.StdoutPipe()
	if err != nil {
		sendError(conn, cmd, fmt.Sprintf("Failed to create stdout pipe: %v", err))
		return
	}

	stderr, err := execCmd.StderrPipe()
	if err != nil {
		sendError(conn, cmd, fmt.Sprintf("Failed to create stderr pipe: %v", err))
		return
	}

	if err := execCmd.Start(); err != nil {
		sendError(conn, cmd, fmt.Sprintf("Failed to start command: %v", err))
		return
	}

	var output strings.Builder
	var errorOutput strings.Builder

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			output.WriteString(line + "\n")

			partialCmd := &TerminalCommand{
				ID:      cmd.ID,
				Command: cmd.Command,
				Output:  output.String(),
				Time:    time.Now().Unix(),
			}

			partialMsg := TerminalMessage{
				Type:    "partial",
				Command: partialCmd,
			}

			writeMutex.Lock()
			if err := conn.WriteJSON(partialMsg); err != nil {
				log.Println("Error sending partial output:", err)
				writeMutex.Unlock()
				return
			}
			writeMutex.Unlock()
		}
	}()

	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			line := scanner.Text()
			errorOutput.WriteString(line + "\n")
		}
	}()

	err = execCmd.Wait()

	cmd.Output = output.String()
	cmd.Error = errorOutput.String()
	cmd.Time = time.Now().Unix()

	if err != nil {
		cmd.Status = 1
		if cmd.Error == "" {
			cmd.Error = err.Error()
		}
	} else {
		cmd.Status = 0
	}

	terminalHistory = append(terminalHistory, *cmd)
	if len(terminalHistory) > 100 {
		terminalHistory = terminalHistory[len(terminalHistory)-100:]
	}

	finalMsg := TerminalMessage{
		Type:    "result",
		Command: cmd,
	}

	writeMutex.Lock()
	if err := conn.WriteJSON(finalMsg); err != nil {
		log.Println("Error sending final result:", err)
	}
	writeMutex.Unlock()
}

func sendError(conn *websocket.Conn, cmd *TerminalCommand, errorMsg string) {
	cmd.Error = errorMsg
	cmd.Status = 1
	cmd.Time = time.Now().Unix()

	msg := TerminalMessage{
		Type:    "error",
		Command: cmd,
	}

	if err := conn.WriteJSON(msg); err != nil {
		log.Println("Error sending error message:", err)
	}
}
