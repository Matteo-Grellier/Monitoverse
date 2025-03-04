package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/lanayr/goServer/main/internal/services"
	"github.com/lanayr/goServer/main/internal/api/handlers"
)

// SetupRoutes assemble tous les endpoints de l'application.
func SetupRoutes(router *gin.Engine, userService services.UserService) {

	// Routes de TOTP
	handlers.RegisterTOTPRoutes(router)

	// Routes de monitoring
	handlers.RegisterMonitoringRoutes(router, userService)

	// Routes user
	handlers.RegisterAuthRoutes(router, userService)
}
