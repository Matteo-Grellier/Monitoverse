package services

import (
	"github.com/lanayr/goServer/main/models"
	"github.com/lanayr/goServer/main/repositories"
)

type UserService interface {
    CreateUser(name, email, password string) (*models.User, error)
    GetUserByID(id uint) (*models.User, error)
    GetAllUsers() ([]models.User, error)
    UpdateUser(user *models.User) error
    DeleteUser(user *models.User) error
}

type userService struct {
    repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) UserService {
    return &userService{repo: repo}
}

func (s *userService) CreateUser(name, email, password string) (*models.User, error) {
    // Ici on pourrait ajouter de la logique métier, par exemple hashage du mot de passe, validation, etc.
    user := &models.User{
        Email:    email,
        Password: password, // Idéalement, hacher le mot de passe
    }
    if err := s.repo.Create(user); err != nil {
        return nil, err
    }
    return user, nil
}

func (s *userService) GetUserByID(id uint) (*models.User, error) {
    return s.repo.FindByID(id)
}

func (s *userService) GetAllUsers() ([]models.User, error) {
    return s.repo.FindAll()
}

func (s *userService) UpdateUser(user *models.User) error {
    return s.repo.Update(user)
}

func (s *userService) DeleteUser(user *models.User) error {
    return s.repo.Delete(user)
}
