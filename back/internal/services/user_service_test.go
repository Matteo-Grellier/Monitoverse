package services

import (
	models "back/internal/domain"
	"testing"

	"github.com/stretchr/testify/assert"
)

type mockUserRepo struct{}

func (m *mockUserRepo) Create(user *models.User) error { return nil }
func (m *mockUserRepo) FindByID(id uint) (*models.User, error) {
	return &models.User{ID: "1", Email: "test@example.com"}, nil
}
func (m *mockUserRepo) FindAll() ([]models.User, error) { return []models.User{}, nil }
func (m *mockUserRepo) Update(user *models.User) error  { return nil }
func (m *mockUserRepo) Delete(user *models.User) error  { return nil }
func (m *mockUserRepo) FindByEmail(email string) (*models.User, error) {
	return &models.User{ID: "1", Email: email}, nil
}

func TestCreateUser(t *testing.T) {
	repo := &mockUserRepo{}
	service := NewUserService(repo)
	user, err := service.CreateUser("Test", "test@example.com", "password")
	assert.NoError(t, err)
	assert.Equal(t, "test@example.com", user.Email)
}
