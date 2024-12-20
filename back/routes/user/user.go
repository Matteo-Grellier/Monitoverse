package user

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/lanayr/goServer/main/services"
)

// Upgrader: permet de transformer une connexion HTTP en WebSocket.
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        // Par défaut, on peut autoriser toutes les origines. 
        // Pour plus de sécurité, limitez aux origines que vous jugez fiables.
        return true
    },
}


func RegisterRoutes(router *gin.Engine, userService services.UserService) {
    router.GET("/ws", func(c *gin.Context) {
        wsHandler(c, userService)
    })
}

func wsHandler(c *gin.Context, userService services.UserService) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Println("Erreur d'upgrade:", err)
        c.AbortWithStatus(http.StatusInternalServerError)
        return
    }
    defer conn.Close()

    // Exemple : toutes les 10 secondes, envoyer la liste des users.
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

                // Conversion en JSON et envoi
                userData, _ := json.Marshal(users)
                if err := conn.WriteMessage(websocket.TextMessage, userData); err != nil {
                    log.Println("Erreur envoi message:", err)
                    return
                }
            }
        }
    }()

    // Boucle pour lire côté client (facultatif)
    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            log.Println("Client déconnecté:", err)
            break
        }
    }
}
