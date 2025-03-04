package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/lanayr/goServer/main/internal/services"
)

// Upgrader pour passer HTTP -> WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func RegisterMonitoringRoutes(r *gin.Engine, userService services.UserService) {
	// Route GET pour la température
	r.GET("/monitoring/temp", GetTemp)

	// Route GET pour le WebSocket
	r.GET("/monitoring/ws", func(c *gin.Context) {
		wsHandler(c, userService)
	})
}

// wsHandler : gère la connexion WebSocket
func wsHandler(c *gin.Context, userService services.UserService) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Erreur d'upgrade:", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	// Envoi périodique de la liste des users
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	go func() {
		for {
			select {
			case <-ticker.C:
				users, err := userService.GetAllUsers()
				if err != nil {
					log.Println("Erreur récupération users:", err)
					continue
				}

				userData, _ := json.Marshal(users)
				if err := conn.WriteMessage(websocket.TextMessage, userData); err != nil {
					log.Println("Erreur envoi message:", err)
					return
				}
			}
		}
	}()

	// Lire les messages du client (optionnel)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println("Client déconnecté:", err)
			break
		}
	}
}

// GetTemp : exemple de récupération de la température (fictive ici)
func GetTemp(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, gin.H{"temp": "20°"})
}
