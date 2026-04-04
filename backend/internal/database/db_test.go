package database

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

// TestNew tests the database connection
// This test requires a running PostgreSQL instance
func TestNew(t *testing.T) {
	// Load .env file for testing
	_ = godotenv.Load("../../.env.dev")

	// Get database configuration
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Construct DSN from environment variables
		host := getEnv("DB_HOST", "localhost")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "hafalan_user")
		password := getEnv("DB_PASSWORD", "")
		dbname := getEnv("DB_NAME", "hafalan_db")
		sslmode := getEnv("DB_SSLMODE", "disable")

		if password == "" {
			t.Skip("DB_PASSWORD not set, skipping database test")
		}

		dsn = buildDSN(host, port, user, password, dbname, sslmode)
	}

	// Try to connect
	db, err := New(dsn)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test health check
	if err := db.Health(); err != nil {
		t.Errorf("Health check failed: %v", err)
	}
}

// TestHealth tests the health check method
// This test requires a running PostgreSQL instance
func TestHealth(t *testing.T) {
	// Load .env file for testing
	_ = godotenv.Load("../../.env.dev")

	// Get database configuration
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Construct DSN from environment variables
		host := getEnv("DB_HOST", "localhost")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "hafalan_user")
		password := getEnv("DB_PASSWORD", "")
		dbname := getEnv("DB_NAME", "hafalan_db")
		sslmode := getEnv("DB_SSLMODE", "disable")

		if password == "" {
			t.Skip("DB_PASSWORD not set, skipping database test")
		}

		dsn = buildDSN(host, port, user, password, dbname, sslmode)
	}

	// Try to connect
	db, err := New(dsn)
	if err != nil {
		t.Skipf("Failed to connect to database: %v", err)
		return
	}
	defer db.Close()

	// Test health check
	if err := db.Health(); err != nil {
		t.Errorf("Health check failed: %v", err)
	}
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func buildDSN(host, port, user, password, dbname, sslmode string) string {
	return "host=" + host + " port=" + port + " user=" + user + " password=" + password + " dbname=" + dbname + " sslmode=" + sslmode
}
