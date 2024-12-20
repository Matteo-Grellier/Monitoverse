package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/lanayr/goServer/main/routes/cpu"
	"github.com/lanayr/goServer/main/routes/totp"
	"github.com/lanayr/goServer/main/routes/user"
	"github.com/lanayr/goServer/main/services"
)

func SetupRoutes(router *gin.Engine, userService services.UserService) {
  cpu.RegisterRoutes(router)
  totp.RegisterRoutes(router)
  user.RegisterRoutes(router, userService)
}