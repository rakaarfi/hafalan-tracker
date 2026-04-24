#!/bin/bash

# Seed Data Script for Hafalan Tracker
# This script will populate the database with initial demo data

set -e  # Exit on error

echo "🌱 Hafalan Tracker - Seed Data Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"
DB_NAME="${DB_NAME:-hafalan_tracker}"

echo -e "${YELLOW}Database Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! docker ps | grep -q postgres; then
    echo -e "${RED}PostgreSQL is not running!${NC}"
    echo "Please start PostgreSQL first:"
    echo "  docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check if database exists
echo -e "${YELLOW}Checking database...${NC}"
DB_EXISTS=$(docker exec postgres psql -U postgres -lqt | grep -c "$DB_NAME" || true)
if [ "$DB_EXISTS" -eq 0 ]; then
    echo -e "${RED}Database '$DB_NAME' does not exist!${NC}"
    echo "Creating database..."
    docker exec postgres createdb -U postgres "$DB_NAME"
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi
echo ""

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
MIGRATIONS_DIR="$(dirname "$0")/../backend/migrations"

if [ -d "$MIGRATIONS_DIR" ]; then
    for migration in "$MIGRATIONS_DIR"/*.up.sql; do
        if [ -f "$migration" ]; then
            echo "  Running: $(basename "$migration")"
            docker exec -i postgres psql -U postgres -d "$DB_NAME" < "$migration" > /dev/null 2>&1
        fi
    done
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}No migrations directory found, skipping...${NC}"
fi
echo ""

# Run Go seed script
echo -e "${YELLOW}Running seed data script...${NC}"
cd /home/rakaarfi/documents/hafalan-tracker/backend

# Check if go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Go is not installed!${NC}"
    echo "Please install Go first."
    exit 1
fi

# Run the seed script
if go run cmd/seed/main.go 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Seed data completed successfully!${NC}"
    echo ""
    echo "📊 Summary of data created:"
    echo "  - Roles: 3 (admin, teacher, parent)"
    echo "  - Users: 9 (1 admin, 3 teachers, 5 parents)"
    echo "  - Classes: 4 (Kelas 1A, 1B, 6A, 6B)"
    echo "  - Students: 10"
    echo "  - Student-Parent Relationships: 16"
    echo ""
    echo "🔐 Test Accounts:"
    echo -e "  ${GREEN}Admin:${NC}   admin@test.com / admin123"
    echo -e "  ${GREEN}Teacher:${NC} teacher@test.com / password123"
    echo -e "  ${GREEN}Parent:${NC}  parent@test.com / password123"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Start backend:  cd backend && go run cmd/server/main.go"
    echo "  2. Start frontend: cd frontend && bun run dev"
    echo "  3. Open browser:  http://localhost:5173"
else
    echo ""
    echo -e "${RED}❌ Seed script failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi
