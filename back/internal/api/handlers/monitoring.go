package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	authutil "back/internal/authutil"
	"back/internal/services"

	"github.com/golang-jwt/jwt/v5"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"golang.org/x/sys/unix"
)

// MonitoringData holds a snapshot of all metrics at a point in time
type MonitoringData struct {
	ID        int64   `json:"id"`
	Timestamp int64   `json:"timestamp"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
	DiskRoot  float64 `json:"disk_root"`
	DiskHome  float64 `json:"disk_home"`
}

var monitoringHistory []MonitoringData
var monitoringID int64 = 1

func RegisterMonitoringRoutes(r *gin.Engine, userService services.UserService) {

	r.GET("/monitoring/history", func(c *gin.Context) {
		c.JSON(200, monitoringHistory)
	})

	r.GET("/monitoring/cpu", MakeWebSocketHandler(1000*time.Millisecond, func() (any, error) {
		cpuUsage, err := getCPUUsage()
		if err != nil {
			return nil, err
		}
		memoryUsage, _ := getMemoryUsage()
		diskUsage, _ := getDiskUsage()
		now := time.Now().Unix()
		data := MonitoringData{
			ID:        monitoringID,
			Timestamp: now,
			CPU:       cpuUsage,
			Memory:    memoryUsage,
			DiskRoot:  diskUsage["/"],
			DiskHome:  diskUsage["/home"],
		}
		monitoringID++
		monitoringHistory = append(monitoringHistory, data)
		if len(monitoringHistory) > 1000 {
			monitoringHistory = monitoringHistory[len(monitoringHistory)-1000:]
		}
		return cpuUsage, nil
	}))

	r.GET("/monitoring/memory", MakeWebSocketHandler(1000*time.Millisecond, func() (interface{}, error) {
		usage, err := getMemoryUsage()
		if err != nil {
			return nil, err
		}
		return usage, nil
	}))

	r.GET("/monitoring/disk", MakeWebSocketHandler(10000*time.Millisecond, func() (interface{}, error) {
		usage, err := getDiskUsage()
		if err != nil {
			return nil, err
		}
		return usage, nil
	}))
}

type dataFunc func() (any, error)

func MakeWebSocketHandler(interval time.Duration, dataFn dataFunc) gin.HandlerFunc {
	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	return func(c *gin.Context) {
		tokenString := c.Query("token")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}
		token, err := jwt.ParseWithClaims(tokenString, &authutil.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return authutil.GetJWTSecret(), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("Erreur d'upgrade:", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		done := make(chan struct{})

		go func() {
			for {
				select {
				case <-ticker.C:
					value, err := dataFn()
					if err != nil {
						log.Println("Erreur récupération data:", err)
						continue
					}
					msg, _ := json.Marshal(value)
					if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
						log.Println("Erreur envoi message:", err)
						return
					}

				case <-done:
					return
				}
			}
		}()

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Println("Client déconnecté:", err)
				close(done)
				break
			}
		}
	}
}

func getDiskUsage() (map[string]float64, error) {
	usageMap := make(map[string]float64)

	rootUsage, err := usageFor("/")
	if err != nil {
		return nil, fmt.Errorf("disk usage error for '/': %v", err)
	}
	usageMap["/"] = rootUsage

	homeUsage, err := usageFor("/home")
	if err != nil {
		return nil, fmt.Errorf("disk usage error for '/home': %v", err)
	}
	usageMap["/home"] = homeUsage

	return usageMap, nil
}

func usageFor(path string) (float64, error) {
	var stat unix.Statfs_t
	if err := unix.Statfs(path, &stat); err != nil {
		return 0, err
	}

	total := stat.Blocks * uint64(stat.Bsize)
	free := stat.Bfree * uint64(stat.Bsize)
	used := total - free

	if total == 0 {
		return 0, fmt.Errorf("total blocks are zero on path: %s", path)
	}

	usagePercent := float64(used) / float64(total) * 100.0
	return usagePercent, nil
}

type cpuTimes struct {
	user    uint64
	nice    uint64
	system  uint64
	idle    uint64
	iowait  uint64
	irq     uint64
	softirq uint64
	steal   uint64
	total uint64
}

func getCPUUsage() (float64, error) {
	c1, err := readCPUSnapshot()
	if err != nil {
		return 0.0, err
	}

	time.Sleep(100 * time.Millisecond)

	c2, err := readCPUSnapshot()
	if err != nil {
		return 0.0, err
	}

	idleDelta := float64((c2.idle + c2.iowait) - (c1.idle + c1.iowait))
	totalDelta := float64(c2.total - c1.total)

	if totalDelta == 0 {
		return 0.0, nil
	}

	usage := (1.0 - idleDelta/totalDelta) * 100.0
	return usage, nil
}

// readCPUSnapshot parses the first "cpu " line in /proc/stat to extract CPU counters
func readCPUSnapshot() (*cpuTimes, error) {
	data, err := os.ReadFile("/proc/stat")
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "cpu ") {
			fields := strings.Fields(line)
			if len(fields) < 8 {
				break
			}

			user, _ := strconv.ParseUint(fields[1], 10, 64)
			nice, _ := strconv.ParseUint(fields[2], 10, 64)
			system, _ := strconv.ParseUint(fields[3], 10, 64)
			idle, _ := strconv.ParseUint(fields[4], 10, 64)
			iowait, _ := strconv.ParseUint(fields[5], 10, 64)
			irq, _ := strconv.ParseUint(fields[6], 10, 64)
			softirq, _ := strconv.ParseUint(fields[7], 10, 64)

			var steal uint64
			if len(fields) > 8 {
				steal, _ = strconv.ParseUint(fields[8], 10, 64)
			}

			total := user + nice + system + idle + iowait + irq + softirq + steal
			return &cpuTimes{
				user:    user,
				nice:    nice,
				system:  system,
				idle:    idle,
				iowait:  iowait,
				irq:     irq,
				softirq: softirq,
				steal:   steal,
				total:   total,
			}, nil
		}
	}
	return nil, fmt.Errorf("could not find 'cpu ' line in /proc/stat")
}

func getMemoryUsage() (float64, error) {
	file, err := os.Open("/proc/meminfo")
	if err != nil {
		return 0, err
	}
	defer func() {
		if cerr := file.Close(); cerr != nil {
			log.Printf("warning: échec de la fermeture du fichier : %v", cerr)
		}
	}()

	var totalMem, availableMem uint64
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "MemTotal:") {
			fields := strings.Fields(line)
			totalMem, _ = strconv.ParseUint(fields[1], 10, 64)
		} else if strings.HasPrefix(line, "MemAvailable:") {
			fields := strings.Fields(line)
			availableMem, _ = strconv.ParseUint(fields[1], 10, 64)
		}
	}

	if totalMem == 0 {
		return 0, fmt.Errorf("could not find MemTotal in /proc/meminfo")
	}

	used := totalMem - availableMem
	usage := (float64(used) / float64(totalMem)) * 100.0

	return usage, nil
}

func StartMonitoringBackground() {
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for {
			<-ticker.C
			cpuUsage, err := getCPUUsage()
			if err != nil {
				continue
			}
			memoryUsage, _ := getMemoryUsage()
			diskUsage, _ := getDiskUsage()
			now := time.Now().Unix()
			data := MonitoringData{
				ID:        monitoringID,
				Timestamp: now,
				CPU:       cpuUsage,
				Memory:    memoryUsage,
				DiskRoot:  diskUsage["/"],
				DiskHome:  diskUsage["/home"],
			}
			monitoringID++
			monitoringHistory = append(monitoringHistory, data)
			if len(monitoringHistory) > 1000 {
				monitoringHistory = monitoringHistory[len(monitoringHistory)-1000:]
			}
		}
	}()
}
