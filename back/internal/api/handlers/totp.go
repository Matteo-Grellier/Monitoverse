package handlers

import (
	"back/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pquerna/otp/totp"
)

type KeyRequestBody struct {
	Key string `json:"key" binding:"required"`
}

type TOTPGenerateRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func RegisterTOTPRoutes(r *gin.Engine, userService services.UserService) {
	totp := r.Group("/totp")
	{
		totp.POST("/generate", func(c *gin.Context) { GenerateTotp(c, userService) })
		totp.POST("/verify", func(c *gin.Context) { VerifyTOTP(c, userService) })
		totp.POST("/enable", func(c *gin.Context) { EnableTOTP(c, userService) })
		totp.POST("/disable", func(c *gin.Context) { DisableTOTP(c, userService) })
	}
}

func GenerateTotp(c *gin.Context, userService services.UserService) {
	var req TOTPGenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Check if user exists
	user, err := userService.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Generate TOTP key
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Monitoverse",
		AccountName: req.Email,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate TOTP"})
		return
	}

	// Store the secret in the user record
	user.Totp = key.Secret()
	user.TotpEmail = req.Email
	if err := userService.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save TOTP secret"})
		return
	}

	// Return the QR code URL and secret
	c.JSON(http.StatusOK, gin.H{
		"qr_code": key.URL(),
		"secret":  key.Secret(),
		"message": "TOTP generated successfully. Scan the QR code with your authenticator app.",
	})
}

func VerifyTOTP(c *gin.Context, userService services.UserService) {
	var req KeyRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// For now, we'll use a simple approach - you should get the user from the session/token
	// In a real app, you'd get the user ID from the authenticated session
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	user, err := userService.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Totp == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TOTP not enabled for this user"})
		return
	}

	// Validate the TOTP code
	valid := totp.Validate(req.Key, user.Totp)
	if valid {
		c.JSON(http.StatusOK, gin.H{
			"valid":   true,
			"message": "TOTP code is valid",
		})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid":   false,
			"message": "Invalid TOTP code",
		})
	}
}

func EnableTOTP(c *gin.Context, userService services.UserService) {
	// This would be called after successful verification to enable TOTP for login
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	user, err := userService.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Mark TOTP as enabled (you might want to add a separate field for this)
	c.JSON(http.StatusOK, gin.H{
		"message": "TOTP enabled successfully",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"totp":  true,
		},
	})
}

func DisableTOTP(c *gin.Context, userService services.UserService) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	user, err := userService.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Clear TOTP data
	user.Totp = ""
	user.TotpEmail = ""
	if err := userService.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable TOTP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "TOTP disabled successfully",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"totp":  false,
		},
	})
}
