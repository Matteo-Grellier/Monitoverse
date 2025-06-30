package handlers

import (
	"back/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
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

func RegisterAuthRoutes(r *gin.Engine, userService services.UserService) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", func(c *gin.Context) { CreateUser(c, userService) })
		auth.POST("/login", func(c *gin.Context) { LoginUser(c, userService) })
		auth.POST("/logout", LogoutUser)
		auth.GET("/me", GetCurrentUser)
	}
}

func CreateUser(c *gin.Context, userService services.UserService) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user with hashed password
	user, err := userService.CreateUser(req.Name, req.Email, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Don't return the password in response
	userResponse := gin.H{
		"id":    user.ID,
		"name":  req.Name,
		"email": user.Email,
	}

	c.JSON(http.StatusCreated, gin.H{"user": userResponse, "message": "User created successfully"})
}

func LoginUser(c *gin.Context, userService services.UserService) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Get user by email
	user, err := userService.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create session or JWT token here if needed
	// For now, just return user info
	userResponse := gin.H{
		"id":    user.ID,
		"email": user.Email,
		"totp":  user.Totp != "",
	}

	c.JSON(http.StatusOK, gin.H{"user": userResponse, "message": "Login successful"})
}

func LogoutUser(c *gin.Context) {
	// In a real application, you would invalidate the session/token here
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

func GetCurrentUser(c *gin.Context) {
	// In a real application, you would get the user from the session/token
	c.JSON(http.StatusOK, gin.H{"message": "Current user endpoint"})
}
