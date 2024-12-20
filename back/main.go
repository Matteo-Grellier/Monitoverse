package main

import (
	"log"

	database "github.com/lanayr/goServer/main/Database"
	"github.com/lanayr/goServer/main/models"
	"github.com/lanayr/goServer/main/repositories"
	"github.com/lanayr/goServer/main/routes"
	"github.com/lanayr/goServer/main/services"

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

	routes.SetupRoutes(router, userService)

	router.Run("localhost:8080")
}
