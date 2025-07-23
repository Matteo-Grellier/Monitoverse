package main

import (
	"log"

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

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Indiquez les domaines autorisés
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(router, userService)

	error := router.Run("back:8081")
	if error != nil {
		log.Fatal("Failed to start server: ", error)
	}
}
