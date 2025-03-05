package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

var test *otp.Key

type KeyRequestBody struct {
	Key string
}

func RegisterTOTPRoutes(r *gin.Engine) {
	r.GET("/totp/generate/:TotpEmail", GenerateTotp)
	r.POST("/totp/get", TestKey)
	r.GET("/totp/resetToken")
}

func GenerateTotp(c *gin.Context) {
	TotpEmail := c.Param("TotpEmail")
	fmt.Printf("TotpEmail: %s\n", TotpEmail)
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Lanaperture",
		AccountName: TotpEmail,
	})
	if err != nil {
		panic(err)
	}
	test = key
	c.IndentedJSON(http.StatusOK, gin.H{"totp": key.String()})

	// Génération d’un code TOTP actuel (valide pendant 30s par défaut)
	code, err := totp.GenerateCode(key.Secret(), time.Now())
	if err != nil {
		panic(err)
	}
	fmt.Println("Votre code TOTP :", code)

}

func TestKey(c *gin.Context) {

	var requestBody KeyRequestBody
	if err := c.BindJSON(&requestBody); err != nil {
		fmt.Println(err)
	}

	userCode := requestBody.Key // Par exemple, code saisi par l’utilisateur
	fmt.Println("Code saisi par l’utilisateur :", userCode)
	valid := totp.Validate(userCode, test.Secret())
	if valid {
		fmt.Println("Code valide!")
		c.IndentedJSON(http.StatusOK, gin.H{"codeStatus": "Code Valide !"})
	} else {
		c.IndentedJSON(http.StatusOK, gin.H{"codeStatus": "Code Invalide !"})
		fmt.Println("Code invalide!")
	}
}
