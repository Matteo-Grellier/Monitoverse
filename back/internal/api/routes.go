package routes

import (
	"back/internal/api/handlers"
	"back/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, userService services.UserService) {

	handlers.RegisterTOTPRoutes(router, userService)

	handlers.RegisterMonitoringRoutes(router, userService)

	handlers.RegisterTerminalRoutes(router, userService)

	handlers.RegisterAuthRoutes(router, userService)
}
