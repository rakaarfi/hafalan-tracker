# Hafalan Tracker

Sistem tracking capaian hafalan Al-Qur'an untuk santri dengan fitur:
- Guru dapat input nilai hafalan murid
- Orang tua dapat melihat progress anak-anaknya
- Support tracking flexible (per surah, halaman, atau juz)

## 🏗️ Architecture

Monorepo dengan frontend (React + TypeScript) dan backend (Golang).

```
hafalan-tracker/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Golang
├── database/          # PostgreSQL migrations & seeds
├── docker/            # Docker configurations
├── shared/            # Shared data & types
└── docs/              # Documentation
```

## 🚀 Tech Stack

### Frontend
- React 18 with Vite
- TypeScript
- React Router v6
- Zustand (state management)
- React Hook Form + Zod
- Tailwind CSS

### Backend
- Golang 1.21+
- Gin framework
- sqlx (database)
- blend/go-zod (validation)
- golang-migrate (migrations)

### Database
- PostgreSQL 15+

## 📦 Setup Development

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL 15+
- Docker (optional)

### Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
go mod download
```

### Database Setup

```bash
# Run migrations
cd database
migrate -path migrations -database "postgresql://user:pass@localhost/hafalan_tracker?sslmode=disable" up

# Seed Quran data
psql -U user -d hafalan_tracker -f seeds/quran_data.sql
```

### Run Development

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
go run cmd/server/main.go
# Runs on http://localhost:8080
```

**Docker:**
```bash
cd docker
docker-compose up
```

## 🔐 Roles & Access

- **Guru**: Input nilai hafalan murid
- **Orang Tua**: View progress anak-anaknya
- **Admin**: Manage users & data

## 📖 API Documentation

See [docs/api.md](docs/api.md) for detailed API documentation.

## 🗄️ Database Schema

See [docs/database.md](docs/database.md) for database schema documentation.

## 🧪 Testing

**Frontend:**
```bash
cd frontend
npm test
```

**Backend:**
```bash
cd backend
go test ./...
```

## 📝 License

MIT
