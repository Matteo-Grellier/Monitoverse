package database

import (
    "fmt"
    // "os"

    "github.com/joho/godotenv"
    // "gorm.io/driver/postgres"
	"gorm.io/driver/sqlite" 
    "gorm.io/gorm"
)

func NewDB() (*gorm.DB, error) {
    // Charge les variables d'environnement depuis le fichier .env
    err := godotenv.Load(".env")
    if err != nil {
        return nil, fmt.Errorf("erreur lors du chargement du fichier .env: %w", err)
    }

    // host := os.Getenv("DB_HOST")
    // user := os.Getenv("DB_USER")
    // password := os.Getenv("DB_PASSWORD")

    // dsn := fmt.Sprintf("host=%v user=%v password=%v",
    //     host, user, password)

    // db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	db, err := gorm.Open(sqlite.Open("db.db"), &gorm.Config{})
    if err != nil {
        return nil, err
    }

    return db, nil
}
