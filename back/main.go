package main

import (
	"log"
	"os"

	"back/internal/services"

	"back/internal/repositories"
	"back/models"

	database "back/database"
	routes "back/internal/api"
	handlers "back/internal/api/handlers"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

func main() {
	handlers.StartMonitoringBackground()

	db, err := database.NewDB()
	if err != nil {
		log.Fatal("Failed to connect database: ", err)
	}

	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)

	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "*" // Development only
	}

	// Security headers middleware
	securityHeaders := func(c *gin.Context) {
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		c.Next()
	}

	router := gin.Default()
	router.Use(securityHeaders)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(router, userService)

	error := router.Run(":8081")
	if error != nil {
		log.Fatal("Failed to start server: ", error)
	}
}
