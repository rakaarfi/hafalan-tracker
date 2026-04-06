# 🌱 Seed Data Guide - Hafalan Tracker

## 📋 Apa yang Akan Dibuat?

Script ini akan membuat data awal untuk testing dan demo:

### Data yang Dibuat:
- **Roles:** 3 (admin, teacher, parent)
- **Users:** 9 account
  - 1 Admin
  - 3 Teachers
  - 5 Parents
- **Classes:** 4 kelas (1A, 1B, 6A, 6B)
- **Students:** 10 murid
- **Student-Parent Relationships:** 16 relasi
- **Passwords:** Sudah di-hash dengan bcrypt

### Test Accounts:
- **Admin:** `admin@test.com` / `admin123`
- **Teacher:** `teacher@test.com` / `password123`
- **Parent:** `parent@test.com` / `password123`

---

## 🚀 Cara Menjalankan Seed Data

### Metode 1: Menggunakan Go Script (RECOMMENDED)

#### Prerequisites:
- PostgreSQL running
- Database sudah dibuat
- Go terinstall

#### Steps:

1. **Start Database:**
```bash
cd /home/rakaarfi/documents/hafalan-tracker
docker-compose up -d
```

2. **Run Migrations (jika belum):**
```bash
# Jalankan semua migrations
cd database
psql -U postgres -d hafalan_tracker -f migrations/000001_init_schema.up.sql
psql -U postgres -d hafalan_tracker -f migrations/000002_add_student_details.sql
psql -U postgres -d hafalan_tracker -f migrations/000003_create_reports_and_settings.sql
```

3. **Run Seed Script:**
```bash
cd backend
go run cmd/seed/main.go
```

Done! Data akan terisi otomatis.

---

### Metode 2: Manual SQL (jika Go script error)

#### Steps:

1. **Connect ke Database:**
```bash
docker exec -it postgres psql -U postgres -d hafalan_tracker
```

2. **Copy-paste SQL dari seed-data.sql:**
```bash
# Di luar container
psql -U postgres -d hafalan_tracker -f /home/rakaarfi/documents/hafalan-tracker/scripts/seed-data.sql
```

Atau copas manual isi file `scripts/seed-data.sql`

---

## 📊 Data yang Dibuat

### 1. Users & Passwords

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@test.com | admin123 | Admin |
| Teacher | teacher@test.com | password123 | Guru Tester |
| Teacher | budi.santoso@sekolah.sch.id | password123 | Budi Santoso, S.Pd.I |
| Teacher | siti.rahayu@sekolah.sch.id | password123 | Siti Rahayu, S.Pd |
| Parent | parent@test.com | password123 | Orang Tua Tester |
| Parent | bapak.ahmad@test.com | password123 | Bapak Ahmad |
| Parent | ibu.siti@test.com | password123 | Ibu Siti |
| Parent | bapak.hasan@test.com | password123 | Bapak Hasan Basri |
| Parent | ibu.fatimah@test.com | password123 | Ibu Fatimah Az-Zahra |

### 2. Classes

| ID | Kelas | Grade | Wali Kelas |
|----|-------|-------|------------|
| 1 | Kelas 1A | Grade 1 | Siti Rahayu, S.Pd |
| 2 | Kelas 1B | Grade 1 | Siti Rahayu, S.Pd |
| 3 | Kelas 6A | Grade 6 | Budi Santoso, S.Pd.I |
| 4 | Kelas 6B | Grade 6 | Budi Santoso, S.Pd.I |

### 3. Students

| ID | Nama | Kelas | Ayah | Ibu |
|----|------|-------|------|------|
| 1 | Ahmad Fauzi | 6A | Bapak Ahmad | Ibu Siti |
| 2 | Siti Aminah | 6A | Bapak Hasan | Ibu Fatimah |
| 3 | Muhammad Rizki | 6B | Bapak Ahmad | Ibu Siti |
| 4 | Fatimah Zahra | 6A | Orang Tua Tester | - |
| 5 | Abdullah Rahman | 6B | Bapak Hasan | Ibu Fatimah |
| 6 | Aisyah Humaira | 1A | Bapak Ahmad | Ibu Siti |
| 7 | Zainal Abidin | 1A | Orang Tua Tester | - |
| 8 | Khadijah Siti | 1B | Orang Tua Tester | - |
| 9 | Umar Faruq | 1B | Bapak Hasan | Ibu Fatimah |
| 10 | Ali bin Abi Thalib | 6A | Bapak Ahmad | Ibu Siti |

---

## ✅ Cara Cek Data Berhasil

Setelah menjalankan seed script, cek dengan SQL:

```sql
-- Cek users
SELECT id, email, role_id FROM users;

-- Cek students
SELECT s.id, s.name, c.name as class_name 
FROM students s 
LEFT JOIN classes c ON s.class_id = c.id;

-- Cek student-parents
SELECT sp.student_id, s.name as student_name, p.full_name as parent_name, sp.relationship_type
FROM student_parents sp
JOIN students s ON sp.student_id = s.id
JOIN parents p ON sp.parent_id = p.user_id;
```

---

## 🧪 Test dengan Frontend

Setelah seed berhasil, test login:

1. **Start Backend:**
```bash
cd backend && go run cmd/server/main.go
```

2. **Start Frontend:**
```bash
cd frontend && bun run dev
```

3. **Login & Test:**
- Admin: admin@test.com / admin123
- Teacher: teacher@test.com / password123
- Parent: parent@test.com / password123

4. **Verify Data:**
- Admin dashboard harus menunjukkan stats yang benar
- Teacher dashboard harus menunjukkan murid-murid
- Parent dashboard harus menunjukkan anak-anak

---

## 🔧 Troubleshooting

### Error: "database does not exist"
**Solution:**
```bash
# Buat database dulu
docker exec -it postgres createdb -U postgres hafalan_tracker
```

### Error: "relation does not exist"
**Solution:**
```bash
# Jalankan migrations dulu
cd /home/rakaarfi/documents/hafalan-tracker/database
psql -U postgres -d hafalan_tracker -f migrations/000001_init_schema.up.sql
```

### Error: "duplicate key value violates unique constraint"
**Solution:**
Data sudah ada. Hapus dulu:
```sql
-- Hapus semua data (PERHATIF: ini akan menghapus semua data!)
TRUNCATE student_parents, students, classes, parents, teachers, users, roles RESTART IDENTITY CASCADE;
```

Lalu jalankan seed lagi.

---

## 📝 Notes

- Password di-hash menggunakan bcrypt
- Semua passwords default: `password123` kecuali admin: `admin123`
- Email unique untuk setiap user
- Student bisa punya 2 parents (ayah & ibu)
- Parent bisa punya banyak anak

---

**Last Updated:** 2026-04-05  
**Status:** ✅ Ready to use
