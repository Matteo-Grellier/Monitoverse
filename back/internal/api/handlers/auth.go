package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/lanayr/goServer/main/internal/services"
)

func RegisterAuthRoutes(r *gin.Engine, userService services.UserService) {
	// Route GET pour la température
	r.GET("/auth/login")

	// Route GET pour le WebSocket
	r.GET("/auth/register")
}

func CreateUser(c *gin.Context) {
	// Récupération des paramètres
	name := c.PostForm("name")
	email := c.PostForm("email")
	password := c.PostForm("password")
	var userService services.UserService

	// Création de l'utilisateur
	user, err := userService.CreateUser(name, email, password)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"user": user})
}
