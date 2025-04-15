package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/lanayr/goServer/main/internal/services"
	"github.com/lanayr/goServer/main/internal/api/handlers"
)

func SetupRoutes(router *gin.Engine, userService services.UserService) {

	handlers.RegisterTOTPRoutes(router)

	handlers.RegisterMonitoringRoutes(router, userService)

	handlers.RegisterAuthRoutes(router, userService)
}
