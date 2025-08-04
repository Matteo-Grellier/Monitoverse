package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	authutil "back/internal/authutil"
	models "back/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Mock user service for testing
type mockUserService struct{}

func (m *mockUserService) CreateUser(name, email, password string) (*models.User, error) {
	return &models.User{ID: "1", Email: email}, nil
}

func (m *mockUserService) GetUserByID(id uint) (*models.User, error) {
	return &models.User{ID: "1", Email: "test@example.com"}, nil
}

func (m *mockUserService) GetUserByEmail(email string) (*models.User, error) {
	return &models.User{ID: "1", Email: email}, nil
}

func (m *mockUserService) GetAllUsers() ([]models.User, error) {
	return []models.User{}, nil
}

func (m *mockUserService) UpdateUser(user *models.User) error {
	return nil
}

func (m *mockUserService) DeleteUser(user *models.User) error {
	return nil
}

// Helper function to create a valid JWT token
func createTestToken() string {
	claims := &authutil.Claims{
		UserID: "1",
		Email:  "test@example.com",
	}

	// Set JWT secret for testing
	if err := os.Setenv("JWT_SECRET", "test_secret"); err != nil {
		panic(fmt.Sprintf("Failed to set JWT_SECRET: %v", err))
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(authutil.GetJWTSecret())
	return tokenString
}

// Helper function to create a test server
func createTestServer() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	userService := &mockUserService{}
	RegisterTerminalRoutes(r, userService)

	return r
}

// Helper function to read until we get the final result
func readUntilResult(conn *websocket.Conn) (*TerminalMessage, error) {
	for {
		var msg TerminalMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			return nil, err
		}

		if msg.Type == "result" || msg.Type == "error" {
			return &msg, nil
		}
		// Continue reading if it's a partial message
	}
}

func TestTerminalWebSocketConnection(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Create WebSocket URL with valid token
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token

	// Connect to WebSocket
	conn, resp, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	require.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Test that we can establish a connection successfully
	// The connection test is successful if we can connect without errors
	assert.NotNil(t, conn)
}

func TestTerminalWebSocketAuthentication(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	tests := []struct {
		name        string
		token       string
		expectError bool
	}{
		{
			name:        "Missing token",
			token:       "",
			expectError: true,
		},
		{
			name:        "Invalid token",
			token:       "invalid_token",
			expectError: true,
		},
		{
			name:        "Valid token",
			token:       createTestToken(),
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal"
			if tt.token != "" {
				wsURL += "?token=" + tt.token
			}

			conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				if conn != nil {
					if err := conn.Close(); err != nil {
						t.Logf("Failed to close connection: %v", err)
					}
				}
			}
		})
	}
}

func TestTerminalCommandExecution(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)
	assert.Equal(t, "history", historyMsg.Type)

	// Send a simple command
	cmd := &TerminalCommand{
		ID:      "test-1",
		Command: "echo 'Hello World'",
		Time:    time.Now().Unix(),
	}

	msg := TerminalMessage{
		Type:    "execute",
		Command: cmd,
	}

	err = conn.WriteJSON(msg)
	require.NoError(t, err)

	// Read messages until we get the final result
	var finalMsg TerminalMessage
	for {
		var msg TerminalMessage
		err = conn.ReadJSON(&msg)
		require.NoError(t, err)

		if msg.Type == "result" {
			finalMsg = msg
			break
		}
		// Continue reading if it's a partial message
	}

	assert.Equal(t, "result", finalMsg.Type)
	assert.NotNil(t, finalMsg.Command)
	assert.Equal(t, "test-1", finalMsg.Command.ID)
	assert.Equal(t, "echo 'Hello World'", finalMsg.Command.Command)
	assert.Equal(t, 0, finalMsg.Command.Status) // Success
	assert.Contains(t, finalMsg.Command.Output, "Hello World")
}

func TestTerminalCommandWithSudo(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	// Send a command with sudo
	cmd := &TerminalCommand{
		ID:      "test-sudo-1",
		Command: "whoami",
		UseSudo: true,
		Time:    time.Now().Unix(),
	}

	msg := TerminalMessage{
		Type:    "execute",
		Command: cmd,
	}

	err = conn.WriteJSON(msg)
	require.NoError(t, err)

	// Read the result
	resultMsg, err := readUntilResult(conn)
	require.NoError(t, err)

	assert.Equal(t, "result", resultMsg.Type)
	assert.NotNil(t, resultMsg.Command)
	assert.Equal(t, "test-sudo-1", resultMsg.Command.ID)
	assert.True(t, resultMsg.Command.UseSudo)
}

func TestTerminalCommandError(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	// Send an invalid command
	cmd := &TerminalCommand{
		ID:      "test-error-1",
		Command: "invalid_command_that_does_not_exist",
		Time:    time.Now().Unix(),
	}

	msg := TerminalMessage{
		Type:    "execute",
		Command: cmd,
	}

	err = conn.WriteJSON(msg)
	require.NoError(t, err)

	// Read the result
	resultMsg, err := readUntilResult(conn)
	require.NoError(t, err)

	assert.Equal(t, "result", resultMsg.Type)
	assert.NotNil(t, resultMsg.Command)
	assert.Equal(t, "test-error-1", resultMsg.Command.ID)
	assert.Equal(t, 1, resultMsg.Command.Status) // Error
	assert.NotEmpty(t, resultMsg.Command.Error)
}

func TestTerminalCommandHistory(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)
	assert.Equal(t, "history", historyMsg.Type)

	// Execute multiple commands
	commands := []string{"echo 'First'", "echo 'Second'", "echo 'Third'"}

	for i, command := range commands {
		cmd := &TerminalCommand{
			ID:      fmt.Sprintf("test-history-%d", i+1),
			Command: command,
			Time:    time.Now().Unix(),
		}

		msg := TerminalMessage{
			Type:    "execute",
			Command: cmd,
		}

		err = conn.WriteJSON(msg)
		require.NoError(t, err)

		// Read the result
		resultMsg, err := readUntilResult(conn)
		require.NoError(t, err)

		assert.Equal(t, "result", resultMsg.Type)
		assert.Equal(t, 0, resultMsg.Command.Status)
	}

	// Reconnect to verify history is maintained
	conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn2.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg2 TerminalMessage
	err = conn2.ReadJSON(&historyMsg2)
	require.NoError(t, err)
	assert.Equal(t, "history", historyMsg2.Type)
	// Should have at least 3 commands in history (our test commands)
	assert.GreaterOrEqual(t, len(historyMsg2.History), 3)

	// Verify our specific commands are in the history
	commandIDs := make(map[string]bool)
	for _, cmd := range historyMsg2.History {
		commandIDs[cmd.ID] = true
	}
	assert.True(t, commandIDs["test-history-1"])
	assert.True(t, commandIDs["test-history-2"])
	assert.True(t, commandIDs["test-history-3"])
}

func TestTerminalCommandTargets(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	tests := []struct {
		name          string
		target        string
		containerName string
		command       string
		expectSuccess bool
	}{
		{
			name:          "Host target",
			target:        "host",
			command:       "echo 'Host command'",
			expectSuccess: true,
		},
		{
			name:          "Default target (host)",
			target:        "",
			command:       "echo 'Default command'",
			expectSuccess: true,
		},
		{
			name:          "Container target without name",
			target:        "container",
			containerName: "",
			command:       "echo 'Container command'",
			expectSuccess: false, // Should fail without container name
		},
		{
			name:          "Container target with name",
			target:        "container",
			containerName: "test-container",
			command:       "echo 'Container command'",
			expectSuccess: false, // Will fail because container doesn't exist
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &TerminalCommand{
				ID:            fmt.Sprintf("test-target-%s", tt.name),
				Command:       tt.command,
				Target:        tt.target,
				ContainerName: tt.containerName,
				Time:          time.Now().Unix(),
			}

			msg := TerminalMessage{
				Type:    "execute",
				Command: cmd,
			}

			err = conn.WriteJSON(msg)
			require.NoError(t, err)

			// Read the result
			resultMsg, err := readUntilResult(conn)
			require.NoError(t, err)

			if tt.expectSuccess {
				assert.Equal(t, "result", resultMsg.Type)
				assert.Equal(t, 0, resultMsg.Command.Status)
			} else {
				// Should either be result with error or error message
				if resultMsg.Type == "result" {
					assert.Equal(t, 1, resultMsg.Command.Status)
				} else {
					assert.Equal(t, "error", resultMsg.Type)
				}
			}
		})
	}
}

func TestTerminalMessageTypes(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	tests := []struct {
		name        string
		messageType string
		command     *TerminalCommand
		expectError bool
	}{
		{
			name:        "Execute command",
			messageType: "execute",
			command: &TerminalCommand{
				ID:      "test-msg-1",
				Command: "echo 'Test message'",
				Time:    time.Now().Unix(),
			},
			expectError: false,
		},
		{
			name:        "Execute without command",
			messageType: "execute",
			command:     nil,
			expectError: false, // Should be ignored
		},
		{
			name:        "Unknown message type",
			messageType: "unknown",
			command:     nil,
			expectError: false, // Should be ignored
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := TerminalMessage{
				Type:    tt.messageType,
				Command: tt.command,
			}

			err = conn.WriteJSON(msg)
			require.NoError(t, err)

			if tt.messageType == "execute" && tt.command != nil {
				// Should receive a result
				resultMsg, err := readUntilResult(conn)
				require.NoError(t, err)
				assert.Equal(t, "result", resultMsg.Type)
			}
		})
	}
}

func TestTerminalConcurrentCommands(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	// Send multiple commands concurrently
	commands := []string{
		"echo 'Command 1'",
		"echo 'Command 2'",
		"echo 'Command 3'",
	}

	// Send all commands
	for i, command := range commands {
		cmd := &TerminalCommand{
			ID:      fmt.Sprintf("test-concurrent-%d", i+1),
			Command: command,
			Time:    time.Now().Unix(),
		}

		msg := TerminalMessage{
			Type:    "execute",
			Command: cmd,
		}

		err = conn.WriteJSON(msg)
		require.NoError(t, err)
	}

	// Read all results
	results := make([]*TerminalMessage, len(commands))
	for i := range commands {
		resultMsg, err := readUntilResult(conn)
		require.NoError(t, err)
		results[i] = resultMsg
		assert.Equal(t, "result", results[i].Type)
		assert.Equal(t, 0, results[i].Command.Status)
	}

	// Verify all commands were executed
	for i, result := range results {
		assert.Equal(t, fmt.Sprintf("test-concurrent-%d", i+1), result.Command.ID)
		assert.Contains(t, result.Command.Output, fmt.Sprintf("Command %d", i+1))
	}
}

func TestTerminalCommandTimeout(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Set a short timeout for the connection
	if err := conn.SetReadDeadline(time.Now().Add(5 * time.Second)); err != nil {
		t.Logf("Failed to set read deadline: %v", err)
	}

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	// Send a command that might take time
	cmd := &TerminalCommand{
		ID:      "test-timeout-1",
		Command: "echo 'Delayed output'",
		Time:    time.Now().Unix(),
	}

	msg := TerminalMessage{
		Type:    "execute",
		Command: cmd,
	}

	err = conn.WriteJSON(msg)
	require.NoError(t, err)

	// Read the result
	resultMsg, err := readUntilResult(conn)
	require.NoError(t, err)

	assert.Equal(t, "result", resultMsg.Type)
	assert.NotNil(t, resultMsg.Command)
	assert.Equal(t, "test-timeout-1", resultMsg.Command.ID)
}

func TestTerminalLargeOutput(t *testing.T) {
	server := createTestServer()

	// Create test server
	ts := httptest.NewServer(server)
	defer ts.Close()

	// Connect to WebSocket
	token := createTestToken()
	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http") + "/terminal?token=" + token
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer func() {
		if err := conn.Close(); err != nil {
			t.Logf("Failed to close connection: %v", err)
		}
	}()

	// Read initial history message
	var historyMsg TerminalMessage
	err = conn.ReadJSON(&historyMsg)
	require.NoError(t, err)

	// Send a command that produces multiple lines of output
	cmd := &TerminalCommand{
		ID:      "test-large-output-1",
		Command: "echo 'Line 1' && echo 'Line 2' && echo 'Line 3'",
		Time:    time.Now().Unix(),
	}

	msg := TerminalMessage{
		Type:    "execute",
		Command: cmd,
	}

	err = conn.WriteJSON(msg)
	require.NoError(t, err)

	// Read the result
	resultMsg, err := readUntilResult(conn)
	require.NoError(t, err)

	assert.Equal(t, "result", resultMsg.Type)
	assert.NotNil(t, resultMsg.Command)
	assert.Equal(t, "test-large-output-1", resultMsg.Command.ID)
	assert.Equal(t, 0, resultMsg.Command.Status)
	assert.Contains(t, resultMsg.Command.Output, "Line 1")
	assert.Contains(t, resultMsg.Command.Output, "Line 3")
}
