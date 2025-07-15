package routes

import (
	handlers "back/internal/api/handlers"
	authutil "back/internal/authutil"
	"back/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, userService services.UserService) {

	protected := router.Group("/")
	protected.Use(JWTAuthMiddleware(authutil.GetJWTSecret()))

	// Protected routes
	handlers.RegisterTOTPRoutes(router, userService)
	handlers.RegisterMonitoringRoutes(router, userService)
	handlers.RegisterTerminalRoutes(router, userService)

	// Public routes
	handlers.RegisterAuthRoutes(router, userService)
}
