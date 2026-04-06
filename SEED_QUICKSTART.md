# 🚀 Quick Start - Seed Data untuk Demo

## 🎯 Cara Cepat (Satu Command)

Jalankan script bash yang sudah disiapkan:

```bash
cd /home/rakaarfi/documents/hafalan-tracker
./scripts/seed-all.sh
```

Script ini akan otomatis:
1. ✅ Check PostgreSQL running
2. ✅ Create database jika belum ada
3. ✅ Run semua migrations
4. ✅ Seed data dengan Go script
5. ✅ Show summary

---

## 📝 Atau Manual (Step-by-Step)

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Run Migrations
```bash
# Masuk ke database folder
cd database

# Jalankan semua migrations
psql -U postgres -d hafalan_tracker -f migrations/000001_init_schema.up.sql
```

### 3. Run Seed Script (Go)
```bash
cd backend
go run cmd/seed/main.go
```

---

## ✅ Cek Data Berhasil

Setelah seed, cek dengan query ini:

```sql
-- Cek jumlah data per tabel
SELECT 'users' as table, COUNT(*) as count FROM users
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'parents', COUNT(*) FROM parents
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'student_parents', COUNT(*) FROM student_parents;
```

Hasil harusnya:
```
table             | count
-------------------+------
users              |     9
teachers           |     3
parents            |     5
classes            |     4
students           |    10
student_parents    |    16
```

---

## 🧪 Test di Frontend

Setelah seed berhasil:

### 1. Start Backend
```bash
cd backend
go run cmd/server/main.go
```
Backend running di: `http://localhost:8080`

### 2. Start Frontend
```bash
cd frontend
bun run dev
```
Frontend running di: `http://localhost:5173`

### 3. Test Login

**Admin Dashboard:**
- Email: `admin@test.com`
- Password: `admin123`
- Cek: Stats harus menunjukkan angka yang benar (10 students, 3 teachers, 5 parents)

**Teacher Dashboard:**
- Email: `teacher@test.com`
- Password: `password123`
- Cek: Harus ada murid-murid (tergantung kelas yang diassign)

**Parent Dashboard:**
- Email: `parent@test.com`
- Password: `password123`
- Cek: Harus ada anak-anak (tergantung relasi)

---

## 📊 Detail Data yang Dibuat

### Murid (10 students):
1. **Ahmad Fauzi** - Kelas 6A (Ayah: Bapak Ahmad, Ibu: Ibu Siti)
2. **Siti Aminah** - Kelas 6A (Ayah: Bapak Hasan, Ibu: Ibu Fatimah)
3. **Muhammad Rizki** - Kelas 6B (Ayah: Bapak Ahmad, Ibu: Ibu Siti)
4. **Fatimah Zahra** - Kelas 6A (Ayah: Orang Tua Tester)
5. **Abdullah Rahman** - Kelas 6B (Ayah: Bapak Hasan, Ibu: Ibu Fatimah)
6. **Aisyah Humaira** - Kelas 1A (Ayah: Bapak Ahmad, Ibu: Ibu Siti)
7. **Zainal Abidin** - Kelas 1A (Ayah: Orang Tua Tester)
8. **Khadijah Siti** - Kelas 1B (Ibu: Orang Tua Tester)
9. **Umar Faruq** - Kelas 1B (Ayah: Bapak Hasan, Ibu: Ibu Fatimah)
10. **Ali bin Abi Thalib** - Kelas 6A (Ayah: Bapak Ahmad, Ibu: Ibu Siti)

### Kelas (4 classes):
- **Kelas 1A** - Wali: Siti Rahayu, S.Pd (3 murid)
- **Kelas 1B** - Wali: Siti Rahayu, S.Pd (2 murid)
- **Kelas 6A** - Wali: Budi Santoso, S.Pd.I (4 murid)
- **Kelas 6B** - Wali: Budi Santoso, S.Pd.I (2 murid)

### Test Accounts (9 users):
- **Admin**: admin@test.com / admin123
- **Guru**: teacher@test.com / password123
- **Orang Tua**: parent@test.com / password123
- **Budi Santoso**: budi.santoso@sekolah.sch.id / password123
- **Siti Rahayu**: siti.rahayu@sekolah.sch.id / password123
- **Bapak Ahmad**: bapak.ahmad@test.com / password123
- **Ibu Siti**: ibu.siti@test.com / password123
- **Bapak Hasan**: bapak.hasan@test.com / password123
- **Ibu Fatimah**: ibu.fatimah@test.com / password123

---

## 🔧 Troubleshooting

### "database does not exist"
```bash
docker exec postgres createdb -U postgres hafalan_tracker
```

### "relation does not exist"
```bash
# Run migrations dulu
cd database
psql -U postgres -d hafalan_tracker -f migrations/000001_init_schema.up.sql
```

### "duplicate key" error
Data sudah ada, hapus dulu:
```sql
-- RESET SEMUA DATA (PERHATIF: ini akan menghapus semua data!)
TRUNCATE student_parents, students, classes, parents, teachers, users, roles RESTART IDENTITY CASCADE;
```

Lalu jalankan seed lagi.

### Go script error
Pastikan Go terinstall:
```bash
go version
```

Jika belum ada, install Go dulu.

---

## ✅ Setelah Seed Berhasil

1. **Start Backend:**
```bash
cd backend
go run cmd/server/main.go
```

2. **Start Frontend:**
```bash
cd frontend
bun run dev
```

3. **Buka Browser:**
```
http://localhost:5173
```

4. **Test Login:**
- Login sebagai admin → cek dashboard stats
- Login sebagai teacher → cek daftar murid
- Login sebagai parent → cek daftar anak

---

**Status:** ✅ Ready to use  
**Last Updated:** 2026-04-05
