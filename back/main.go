package main

import (
	"log"

	"github.com/gin-contrib/cors"
	database "github.com/lanayr/goServer/main/Database"
	"github.com/lanayr/goServer/main/internal/domain"
	"github.com/lanayr/goServer/main/internal/repositories"
	"github.com/lanayr/goServer/main/internal/api"
	"github.com/lanayr/goServer/main/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {

	db, err := database.NewDB()
	if err != nil {
		log.Fatal("Failed to connect database: ", err)
	}

	// Migration des schémas
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"}, // Indiquez les domaines autorisés
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
	

	routes.SetupRoutes(router, userService)

	router.Run("localhost:8080")
}
