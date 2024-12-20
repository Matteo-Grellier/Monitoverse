package cpu

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetTemp(c *gin.Context) {
	// Retrieve temperature
	
	c.IndentedJSON(http.StatusOK, gin.H{"temp": "20°"})
}
func RegisterRoutes(router *gin.Engine) {
	router.GET("/temp", GetTemp)
}