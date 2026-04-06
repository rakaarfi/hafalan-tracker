# Hafalan Tracker

Sistem tracking capaian hafalan Al-Qur'an untuk santri dengan fitur:
- Guru dapat input nilai hafalan murid
- Orang tua dapat melihat progress anak-anaknya
- Support tracking flexible (per surah, halaman, atau juz)
- **NOW WITH COMPLETE BACKEND API INTEGRATION! ✅**

## 🎉 Status: PRODUCTION READY

Backend API telah berhasil di-integrasikan 100% dengan frontend. Semua fitur sekarang menggunakan real API calls.

**Quick Start:** Lihat [QUICKSTART.md](QUICKSTART.md) untuk setup dalam 5 menit!

---

## 🏗️ Architecture

Monorepo dengan frontend (React + TypeScript) dan backend (Golang).

```
hafalan-tracker/
├── frontend/          # React + Vite + TypeScript ✅
├── backend/           # Golang ✅
├── database/          # PostgreSQL migrations & seeds
├── docker/            # Docker configurations
├── shared/            # Shared data & types
└── docs/              # Documentation
```

## 🚀 Tech Stack

### Frontend
- React 18 with Vite
- TypeScript
- Bun (runtime & package manager)
- React Router v6
- Zustand (state management)
- React Hook Form + Zod
- Tailwind CSS
- **Axios** (API client)

### Backend
- Golang 1.25+
- Gin framework
- sqlx (database)
- JWT authentication
- PostgreSQL 15+

### Database
- PostgreSQL 15+
- Docker Compose

---

## ⚡ Quick Start (3 Commands)

```bash
# 1. Start Database
docker-compose up -d

# 2. Start Backend
cd backend && go run cmd/server/main.go

# 3. Start Frontend
cd frontend && bun run dev
```

**Access:** `http://localhost:5173`

**Login Accounts:**
- **Admin:** admin@test.com / admin123
- **Guru:** teacher@test.com / password123
- **Orang Tua:** parent@test.com / password123

---

## ✅ What's Been Integrated

### Backend API (30+ Endpoints)
- ✅ JWT Authentication
- ✅ Student Management (CRUD)
- ✅ Teacher Management (CRUD)
- ✅ Parent Management (CRUD)
- ✅ Class Management (CRUD)
- ✅ Memorization Tracking
- ✅ Dashboard Statistics
- ✅ Settings Management
- ✅ Profile Management
- ✅ Password Reset

### Frontend Integration
- ✅ API Client dengan Axios
- ✅ Automatic Token Management
- ✅ Error Handling
- ✅ Role-based Access
- ✅ All Pages Connected
- ✅ Real-time Data Updates

---

## 📊 Features

### Admin Dashboard ✅
- Dashboard dengan statistics
- Student management (CRUD)
- Teacher management (CRUD)
- Parent management (CRUD)
- Class management (CRUD)
- Reports & export (PDF/Excel)
- Settings management
- Password reset

### Teacher Dashboard ✅
- Dashboard dengan class list
- Student progress tracking
- Input hafalan dengan Quran search
- Complete 114 surahs database
- Progress visualization

### Parent Dashboard ✅
- Dashboard dengan children list
- Child progress detail
- Memorization history
- Filter & search

### General ✅
- JWT authentication
- Profile management
- Password change
- Responsive design
- Error handling

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Setup cepat 5 menit
- **[API_INTEGRATION_COMPLETE.md](API_INTEGRATION_COMPLETE.md)** - Complete integration guide
- **[TESTING.md](TESTING.md)** - Testing checklist
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Implementation details

---

## 🔐 Roles & Access

- **Admin**: Full access, semua CRUD operations
- **Guru**: Input nilai hafalan murid
- **Orang Tua**: View progress anak-anaknya

---

## 📖 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
- `POST /public/login` - User login

### Students
- `GET /students` - List all students
- `GET /students/:id` - Get student detail
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Teachers, Parents, Classes
- Similar CRUD endpoints untuk semua resources

### Memorizations
- `GET /memorizations` - List all
- `POST /memorizations` - Create record
- `PUT /memorizations/:id` - Update record

**Full API docs:** Lihat [API_INTEGRATION_COMPLETE.md](API_INTEGRATION_COMPLETE.md)

---

## 🗄️ Database Schema

Tables:
- `users` - Admin, teachers, parents
- `students` - Student data dengan 2 parent relationships
- `classes` - Class data dengan teacher assignment
- `memorizations` - Hafalan records
- `settings` - Application settings
- `histories` - Audit trail

---

## 🧪 Testing

### Manual Testing
1. Start servers (Quick Start)
2. Login dengan test accounts
3. Test all features sesuai [TESTING.md](TESTING.md)

### API Testing
```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/v1/public/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Get students (with token)
curl http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 License

MIT

---

## 🎯 Status

**Frontend:** ✅ 100% Complete
**Backend:** ✅ 100% Complete
**Integration:** ✅ 100% Complete
**Documentation:** ✅ 100% Complete
**Demo Ready:** ✅ Yes

**Last Updated:** 2026-04-05
**Version:** 1.0.0