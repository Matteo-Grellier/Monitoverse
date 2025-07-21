package handlers

import (
	models "back/internal/domain"
	"back/internal/services"
	"errors"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func AuthenticateUser(userService services.UserService, email, password string) (*models.User, error) {
	user, err := userService.GetUserByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func isProduction() bool {
	return os.Getenv("ENV") == "production"
}
