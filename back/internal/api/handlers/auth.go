package handlers

import (
	"back/internal/services"
	"net/http"
	"time"

	authutil "back/internal/authutil"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginTOTPRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	TOTP     string `json:"totp" binding:"required"`
}

func RegisterAuthRoutes(r *gin.Engine, userService services.UserService) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", func(c *gin.Context) { CreateUser(c, userService) })
		auth.POST("/login", func(c *gin.Context) { LoginUser(c, userService) })
		auth.POST("/login/totp", func(c *gin.Context) { LoginUserTOTP(c, userService) })
		auth.POST("/logout", LogoutUser)
		auth.GET("/me", GetCurrentUser)
	}
}

func CreateUser(c *gin.Context, userService services.UserService) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if isProduction() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		}
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		if isProduction() {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		}
		return
	}

	// Create user with hashed password
	user, err := userService.CreateUser(req.Name, req.Email, string(hashedPassword))
	if err != nil {
		if isProduction() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Registration failed"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		return
	}

	// Don't return the password in response
	userResponse := gin.H{
		"id":    user.ID,
		"name":  req.Name,
		"email": user.Email,
	}

	// Always require TOTP setup after registration
	c.JSON(http.StatusCreated, gin.H{
		"user":                userResponse,
		"message":             "User created successfully",
		"totp_setup_required": true,
	})
}

func LoginUser(c *gin.Context, userService services.UserService) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	user, err := AuthenticateUser(userService, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Always require TOTP after password check
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"totp":  true,
		},
		"message":       "TOTP required",
		"totp_required": true,
	})
}

func LoginUserTOTP(c *gin.Context, userService services.UserService) {
	var req LoginTOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	user, err := AuthenticateUser(userService, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if TOTP is enabled
	if user.Totp == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TOTP is not enabled for this user"})
		return
	}

	// Validate the TOTP code
	valid := false
	if req.TOTP != "" {
		valid = totp.Validate(req.TOTP, user.Totp)
	}
	if !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid TOTP code"})
		return
	}

	// Login successful
	userResponse := gin.H{
		"id":    user.ID,
		"email": user.Email,
		"totp":  true,
	}

	// Generate JWT token
	expiresAt := time.Now().Add(24 * time.Hour)
	claims := authutil.Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(authutil.GetJWTSecret())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": userResponse, "message": "Login successful", "totp_required": false, "token": tokenString})
}

func LogoutUser(c *gin.Context) {
	// JWT is stateless; client should delete token
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful. Please remove the token on the client."})
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userEmail, _ := c.Get("user_email")
	if userID == nil || userEmail == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":    userID,
		"email": userEmail,
	})
}
