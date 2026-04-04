package main

import (
	"log"
	"os"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/config"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/database"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database connection
	db, err := database.New(cfg.Database.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize server
	srv := server.New(cfg, db)

	// Start server
	addr := ":" + cfg.Server.Port
	log.Printf("Starting server on %s", addr)
	if err := srv.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	// Graceful shutdown
	// TODO: Add proper shutdown handling
	os.Exit(0)
}
