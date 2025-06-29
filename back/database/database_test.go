package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestNewDB_Success(t *testing.T) {
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("could not get working dir: %v", err)
	}
	defer func() {
		if err := os.Chdir(origDir); err != nil {
			t.Fatalf("could not restore working dir: %v", err)
		}
	}()

	rootDir := filepath.Join(origDir, "..")
	if err := os.Chdir(rootDir); err != nil {
		t.Fatalf("could not chdir to project root (%s): %v", rootDir, err)
	}

	db, err := NewDB()
	if err != nil {
		t.Fatalf("NewDB() error = %v, want nil", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("db.DB() error = %v, want nil", err)
	}
	defer sqlDB.Close()

	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("sqlDB.Ping() error = %v, want nil", err)
	}
}
