# Foundation Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the foundational infrastructure for the hafalan tracker system including database schema, backend API structure, and frontend project structure.

**Architecture:** Monorepo with PostgreSQL database, Golang backend (Gin framework), and React frontend (Vite + Bun). All validation uses blend/go-zod (backend) and Zod (frontend). Authentication uses JWT tokens.

**Tech Stack:**
- Backend: Golang 1.21+, Gin, sqlx, blend/go-zod, golang-migrate
- Frontend: React 18, Vite, Bun, TypeScript, React Router v6, Zustand, React Hook Form, shadcn/ui
- Database: PostgreSQL 15+
- Tools: Docker, Docker Compose

---

## Task 1: Initialize Backend Go Module

**Files:**
- Create: `backend/go.mod`
- Create: `backend/go.sum`

**Step 1: Create go.mod**

Create `backend/go.mod`:
```go
module github.com/yourusername/hafalan-tracker/backend

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/jmoiron/sqlx v1.3.5
	github.com/lib/pq v1.10.9
	github.com/go-playground/validator/v10 v10.14.0
	github.com/blend/go-zod v1.0.0
	github.com/golang-jwt/jwt/v5 v5.0.0
	github.com/rs/cors v1.10.1
)
```

**Step 2: Initialize Go module**

Run: `cd backend && go mod init github.com/yourusername/hafalan-tracker/backend`
Expected: Module initialized

**Step 3: Download dependencies**

Run: `cd backend && go mod tidy`
Expected: Dependencies downloaded, go.sum created

**Step 4: Commit**

```bash
git add backend/go.mod backend/go.sum
git commit -m "feat(backend): initialize Go module with dependencies"
```

---

## Task 2: Create Database Migration Files

**Files:**
- Create: `database/migrations/000001_init_schema.up.sql`
- Create: `database/migrations/000001_init_schema.down.sql`

**Step 1: Create up migration**

Create `database/migrations/000001_init_schema.up.sql`:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE parents (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    homeroom_teacher_id INTEGER REFERENCES teachers(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    enrollment_year INTEGER NOT NULL,
    semester INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student parents junction table
CREATE TABLE student_parents (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES parents(user_id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('father', 'mother', 'guardian')),
    is_primary_contact BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, parent_id)
);

-- Surah reference table
CREATE TABLE surah (
    id SERIAL PRIMARY KEY,
    surah_number INTEGER UNIQUE NOT NULL,
    name_latin VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    place VARCHAR(20) CHECK (place IN ('Mecca', 'Medina')),
    type VARCHAR(20) CHECK (type IN ('Makkiyah', 'Madaniyah')),
    ayah_count INTEGER,
    start_page INTEGER,
    juz_number INTEGER
);

-- Juz reference table
CREATE TABLE juz (
    id SERIAL PRIMARY KEY,
    juz_number INTEGER UNIQUE NOT NULL,
    start_surah_id INTEGER REFERENCES surah(id),
    start_ayah VARCHAR(20),
    end_surah_id INTEGER REFERENCES surah(id),
    end_ayah VARCHAR(20)
);

-- Memorization table
CREATE TABLE memorization (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    teacher_id INTEGER NOT NULL REFERENCES teachers(user_id),
    unit_type VARCHAR(10) NOT NULL CHECK (unit_type IN ('surah', 'page', 'juz')),
    surah_id INTEGER REFERENCES surah(id) ON DELETE SET NULL,
    juz_id INTEGER REFERENCES juz(id) ON DELETE SET NULL,
    page_start INTEGER,
    page_end INTEGER,
    status VARCHAR(30) NOT NULL CHECK (status IN ('fluent', 'good', 'needs_improvement')),
    notes TEXT,
    test_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (unit_type = 'surah' AND surah_id IS NOT NULL AND juz_id IS NULL AND page_start IS NULL AND page_end IS NULL) OR
        (unit_type = 'page' AND juz_id IS NOT NULL AND page_start IS NOT NULL AND page_end IS NOT NULL AND surah_id IS NULL) OR
        (unit_type = 'juz' AND juz_id IS NOT NULL AND surah_id IS NULL AND page_start IS NULL AND page_end IS NULL)
    )
);

-- Memorization history table
CREATE TABLE memorization_history (
    id SERIAL PRIMARY KEY,
    memorization_id INTEGER NOT NULL REFERENCES memorization(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id),
    teacher_id INTEGER NOT NULL REFERENCES teachers(user_id),
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_active ON students(is_active);
CREATE INDEX idx_memorization_student ON memorization(student_id);
CREATE INDEX idx_memorization_teacher ON memorization(teacher_id);
CREATE INDEX idx_memorization_date ON memorization(test_date);
CREATE INDEX idx_memorization_active ON memorization(is_active);
CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);
CREATE INDEX idx_surah_number ON surah(surah_number);
CREATE INDEX idx_juz_number ON juz(juz_number);
```

**Step 2: Create down migration**

Create `database/migrations/000001_init_schema.down.sql`:
```sql
DROP INDEX IF EXISTS idx_juz_number;
DROP INDEX IF EXISTS idx_surah_number;
DROP INDEX IF EXISTS idx_student_parents_parent;
DROP INDEX IF EXISTS idx_student_parents_student;
DROP INDEX IF EXISTS idx_memorization_active;
DROP INDEX IF EXISTS idx_memorization_date;
DROP INDEX IF EXISTS idx_memorization_teacher;
DROP INDEX IF EXISTS idx_memorization_student;
DROP INDEX IF EXISTS idx_students_active;
DROP INDEX IF EXISTS idx_students_class;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS memorization_history;
DROP TABLE IF EXISTS memorization;
DROP TABLE IF EXISTS juz;
DROP TABLE IF EXISTS surah;
DROP TABLE IF EXISTS student_parents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

DROP EXTENSION IF EXISTS "uuid-ossp";
```

**Step 3: Commit**

```bash
git add database/migrations/
git commit -m "feat(database): create initial schema migration with RBAC"
```

---

## Task 3: Create Quran Data Seed Script

**Files:**
- Create: `database/seeds/000001_quran_data.sql`
- Create: `database/scripts/import_quran_data.go`

**Step 1: Create SQL seed file template**

Create `database/seeds/000001_quran_data.sql`:
```sql
-- This file is auto-generated by import_quran_data.go
-- Run: cd database && go run scripts/import_quran_data.go

-- Surah data will be inserted here
-- Juz data will be inserted here

-- Initial roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System administrator with full access'),
(2, 'teacher', 'Teacher who can input memorization records'),
(3, 'parent', 'Parent who can view their children''s progress');

-- Initial permissions
INSERT INTO permissions (name, resource, action) VALUES
('create_memorization', 'memorization', 'create'),
('view_children_progress', 'student', 'read'),
('manage_users', 'user', 'manage'),
('view_assigned_students', 'student', 'read'),
('access_all_data', 'all', 'all');

-- Role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Teacher permissions
(2, 1), -- create_memorization
(2, 4), -- view_assigned_students
-- Parent permissions
(3, 2), -- view_children_progress
-- Admin permissions (all)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);
```

**Step 2: Create Go script to import Quran JSON**

Create `database/scripts/import_quran_data.go`:
```go
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type Surah struct {
	Index     string   `json:"index"`
	Title     string   `json:"title"`
	TitleAr   string   `json:"titleAr"`
	Place     string   `json:"place"`
	Type      string   `json:"type"`
	Count     int      `json:"count"`
	Pages     string   `json:"pages"`
	Juz       []JuzRef `json:"juz"`
}

type JuzRef struct {
	Index string       `json:"index"`
	Verse VerseRange   `json:"verse"`
}

type VerseRange struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type Juz struct {
	Index string     `json:"index"`
	Start SurahRef   `json:"start"`
	End   SurahRef   `json:"end"`
}

type SurahRef struct {
	Index string `json:"index"`
	Verse string `json:"verse"`
	Name  string `json:"name"`
}

func main() {
	// Read database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://hafalan_user:hafalan_pass@localhost/hafalan_tracker?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Read surah JSON
	surahData, err := ioutil.ReadFile("../../shared/data/surah.json")
	if err != nil {
		log.Fatal(err)
	}

	var surahs []Surah
	if err := json.Unmarshal(surahData, &surahs); err != nil {
		log.Fatal(err)
	}

	// Insert surahs
	for _, surah := range surahs {
		_, err := db.Exec(`
			INSERT INTO surah (surah_number, name_latin, name_arabic, place, type, ayah_count, start_page, juz_number)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (surah_number) DO NOTHING
		`, surah.Index, surah.Title, surah.TitleAr, surah.Place, surah.Type, surah.Count, surah.Pages, surah.Juz[0].Index)
		if err != nil {
			log.Printf("Error inserting surah %s: %v", surah.Title, err)
		}
	}

	// Read juz JSON
	juzData, err := ioutil.ReadFile("../../shared/data/juz.json")
	if err != nil {
		log.Fatal(err)
	}

	var juzs []Juz
	if err := json.Unmarshal(juzData, &juzs); err != nil {
		log.Fatal(err)
	}

	// Insert juzs
	for _, juz := range juzs {
		_, err := db.Exec(`
			INSERT INTO juz (juz_number, start_surah_id, start_ayah, end_surah_id, end_ayah)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (juz_number) DO NOTHING
		`, juz.Index, juz.Start.Index, juz.Start.Verse.Start, juz.End.Index, juz.End.Verse.End)
		if err != nil {
			log.Printf("Error inserting juz %s: %v", juz.Index, err)
		}
	}

	fmt.Println("Quran data imported successfully!")
}
```

**Step 3: Test the import script**

Run: `cd database/scripts && go run import_quran_data.go`
Expected: "Quran data imported successfully!"

**Step 4: Verify data in database**

Run: `psql -U hafalan_user -d hafalan_tracker -c "SELECT COUNT(*) FROM surah;"`
Expected: `114`

Run: `psql -U hafalan_user -d hafalan_tracker -c "SELECT COUNT(*) FROM juz;"`
Expected: `30`

**Step 5: Commit**

```bash
git add database/
git commit -m "feat(database): add Quran data import script and seed file"
```

---

## Task 4: Initialize Frontend Project with Bun

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/vite-env.d.ts`

**Step 1: Create package.json**

Create `frontend/package.json`:
```json
{
  "name": "hafalan-tracker-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "i18next": "^23.7.6",
    "react-i18next": "^13.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@types/node": "^20.10.5"
  }
}
```

**Step 2: Create vite.config.ts**

Create `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 3: Create tsconfig.json**

Create `frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 4: Create tsconfig.node.json**

Create `frontend/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: Create index.html**

Create `frontend/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hafalan Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Create main.tsx**

Create `frontend/src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 7: Create index.css**

Create `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

**Step 8: Create App.tsx**

Create `frontend/src/App.tsx`:
```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center p-8">Hafalan Tracker</h1>
      <p className="text-center text-gray-600">Frontend setup complete!</p>
    </div>
  )
}

export default App
```

**Step 9: Create vite-env.d.ts**

Create `frontend/src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

**Step 10: Create tailwind.config.js**

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 11: Create postcss.config.js**

Create `frontend/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 12: Install dependencies**

Run: `cd frontend && bun install`
Expected: Dependencies installed successfully

**Step 13: Test build**

Run: `cd frontend && bun run dev`
Expected: Vite server running on http://localhost:5173

**Step 14: Verify in browser**

Open: http://localhost:5173
Expected: "Hafalan Tracker" heading with "Frontend setup complete!" message

**Step 15: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): initialize React + Vite + Bun project with TypeScript"
```

---

## Task 5: Setup Backend Configuration and Database Connection

**Files:**
- Create: `backend/internal/config/config.go`
- Create: `backend/pkg/database/database.go`

**Step 1: Create configuration structure**

Create `backend/internal/config/config.go`:
```go
package config

import (
	"os"
	"time"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	Secret     string
	ExpiryTime time.Duration
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "hafalan_user"),
			Password: getEnv("DB_PASSWORD", "hafalan_pass"),
			DBName:   getEnv("DB_NAME", "hafalan_tracker"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			ExpiryTime: 24 * time.Hour,
		},
	}
}

func (c *DatabaseConfig) ConnectionString() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.DBName, c.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
```

**Step 2: Create database connection helper**

Create `backend/pkg/database/database.go`:
```go
package database

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	*sqlx.DB
}

func New(connectionString string) (*DB, error) {
	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{db}, nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}
```

**Step 3: Test database connection**

Create test file `backend/pkg/database/database_test.go`:
```go
package database

import (
	"testing"
)

func TestNewConnection(t *testing.T) {
	// This test requires a running database
	db, err := New("postgres://hafalan_user:hafalan_pass@localhost/hafalan_tracker?sslmode=disable")
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Fatalf("Failed to ping: %v", err)
	}
}
```

**Step 4: Run test**

Run: `cd backend && go test ./pkg/database -v`
Expected: PASS (if database is running)

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): add configuration and database connection"
```

---

## Task 6: Create Backend Main Server Structure

**Files:**
- Create: `backend/cmd/server/main.go`
- Create: `backend/internal/handler/health.go`

**Step 1: Create health check handler**

Create `backend/internal/handler/health.go`:
```go
package handler

import "github.com/gin-gonic/gin"

func HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "ok",
		"message": "Hafalan Tracker API is running",
	})
}
```

**Step 2: Create main server**

Create `backend/cmd/server/main.go`:
```go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/hafalan-tracker/backend/internal/config"
	"github.com/yourusername/hafalan-tracker/backend/internal/handler"
	"github.com/yourusername/hafalan-tracker-backend/pkg/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.New(cfg.Database.ConnectionString())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Database connected successfully")

	// Create Gin router
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Routes will be added here
		v1.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Hafalan Tracker API v1",
			})
		})
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
```

**Step 3: Test server**

Run: `cd backend && go run cmd/server/main.go`
Expected: "Database connected successfully" and "Server starting on port 8080"

**Step 4: Test health endpoint**

Run (in new terminal): `curl http://localhost:8080/health`
Expected:
```json
{"message":"Hafalan Tracker API is running","status":"ok"}
```

**Step 5: Test API v1 endpoint**

Run: `curl http://localhost:8080/api/v1/`
Expected:
```json
{"message":"Hafalan Tracker API v1"}
```

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): create main server with health check endpoint"
```

---

## Summary

This implementation plan sets up the foundational infrastructure:

✅ Backend Go module initialized with dependencies
✅ Database schema created with migrations
✅ Quran data import script created
✅ Frontend React + Vite + Bun project initialized
✅ Backend configuration and database connection
✅ Main server with health check endpoint

**Next steps:** Implement authentication system, then build out teacher and parent workflows.

**Testing Checklist:**
- [ ] Database migrations run successfully
- [ ] Quran data imports correctly (114 surahs, 30 juz)
- [ ] Frontend dev server runs on port 5173
- [ ] Backend server runs on port 8080
- [ ] Health check endpoint returns OK
- [ ] Database connection works from backend

**Prerequisites for running:**
- PostgreSQL 15+ running with database created
- Environment variables set (or use defaults)
- Bun installed for frontend
- Go 1.21+ installed for backend
