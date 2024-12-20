package totp

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

var test *otp.Key

func GenerateTotp(c *gin.Context) {
	TotpEmail := c.Param("TotpEmail")
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer: "Lanaperture",
		AccountName: TotpEmail,
	})
	if err != nil {
		panic(err)
	}
	test = key
	c.IndentedJSON(http.StatusOK, gin.H{"temp": key.String()})

	// Génération d’un code TOTP actuel (valide pendant 30s par défaut)
	code, err := totp.GenerateCode(key.Secret(), time.Now())
	if err != nil {
		panic(err)
	}

	fmt.Println("Votre code TOTP :", code)

}

type KeyRequestBody struct {
	Key string
}

func TestKey(c *gin.Context) {

	var requestBody KeyRequestBody
	if err := c.BindJSON(&requestBody); err != nil {
		fmt.Println(err)
	}

	userCode := requestBody.Key // Par exemple, code saisi par l’utilisateur
	valid := totp.Validate(userCode, test.Secret())
	if valid {
		fmt.Println("Code valide!")
		c.IndentedJSON(http.StatusOK, "")
	} else {
		fmt.Println("Code invalide!")
	}
}
func RegisterRoutes(router *gin.Engine) {
	router.GET("/GenerateTotp/:TotpEmail", GenerateTotp)
	router.POST("/checkTotp", TestKey)
}
