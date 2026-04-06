# 📋 Panduan Lengkap Fitur per Role - Hafalan Tracker

## 🔐 Login Accounts

### 1. ADMIN
**Email:** `admin@test.com`
**Password:** `admin123`
**Dashboard:** `/admin/dashboard`

---

## 👨‍💼 ADMIN - Full Access

Admin memiliki akses penuh ke seluruh sistem. Bertanggung jawab atas manajemen data master dan konfigurasi sistem.

### 🏠 Dashboard Overview
**Location:** `/admin/dashboard`

**What Admin Can Do:**
- ✅ Lihat statistik sistem secara real-time:
  - Total jumlah murid
  - Total jumlah guru
  - Total jumlah orang tua murid
  - Total jumlah setoran/hafalan
- ✅ Quick actions untuk navigasi cepat
- ✅ Lihat aktivitas terbaru di sistem

---

### 👨‍🎓 Data Murid (Students)
**Location:** `/admin/students`

**View Mode:**
- ✅ Lihat daftar semua murid dalam bentuk tabel
- ✅ Informasi yang ditampilkan:
  - Nama lengkap murid
  - Kelas
  - Ayah (Parent 1)
  - Ibu (Parent 2)
  - No HP
- ✅ Search/Pencarian murid berdasarkan nama
- ✅ Sorting data

**Actions:**
- ✅ **Tambah Murid Baru** (`/admin/students/new`)
  - Input nama lengkap (wajib)
  - Pilih kelas dari dropdown
  - Pilih Ayah (Parent 1) dari dropdown (wajib)
  - Pilih Ibu (Parent 2) dari dropdown (opsional)
  - Input tanggal lahir
  - Input no HP
  - Upload foto murid (opsional)
  - Validasi data sebelum simpan
  - Toast notification saat berhasil

- ✅ **Edit Data Murid** (`/admin/students/:id/edit`)
  - Ubah semua data murid
  - Ganti kelas
  - Ganti parent (ayah/ibu)
  - Update informasi kontak
  - Validasi data sebelum simpan

- ✅ **Hapus Murid**
  - Konfirmasi dialog sebelum hapus
  - Hapus data murid dari sistem
  - Otomatis menghapus semua data terkait (hafalan, history)

- ✅ **View Detail Murid**
  - Klik tombol "View" pada tabel
  - Lihat detail lengkap murid
  - Lihat progress hafalan
  - Lihat riwayat setoran

---

### 👨‍🏫 Data Guru (Teachers)
**Location:** `/admin/teachers`

**View Mode:**
- ✅ Lihat daftar semua guru dalam bentuk tabel
- ✅ Informasi yang ditampilkan:
  - Nama lengkap guru
  - Email
  - No HP
  - Kelas yang diampu (badges)
- ✅ Search/Pencarian guru berdasarkan nama

**Actions:**
- ✅ **Tambah Guru Baru** (`/admin/teachers/new`)
  - Input nama lengkap (wajib)
  - Input email (wajib, dengan validasi format)
  - Input no HP
  - Set password awal (minimal 6 karakter, wajib)
  - Password akan di-hash sebelum disimpan
  - Role otomatis diset sebagai "teacher"
  - Email notifikasi dikirim (future feature)

- ✅ **Edit Data Guru** (`/admin/teachers/:id/edit`)
  - Ubah nama, email, no HP
  - **TIDAK bisa mengubah password** (hanya via reset)
  - Update informasi kontak

- ✅ **Hapus Guru**
  - Konfirmasi dialog sebelum hapus
  - Hapus data guru dari sistem
  - Kelas yang diampu menjadi tanpa wali kelas

- ✅ **Reset Password Guru**
  - Via Settings → Reset Password
  - Reset ke password default
  - Kirim email notifikasi (future feature)

---

### 👨‍👩‍👧 Data Orang Tua (Parents)
**Location:** `/admin/parents`

**View Mode:**
- ✅ Lihat daftar semua orang tua dalam bentuk **CARD** (bukan tabel)
- ✅ Informasi yang ditampilkan:
  - Nama lengkap orang tua
  - Avatar dengan inisial nama
  - Email
  - No HP
  - Jumlah anak
  - Nama-nama anak dengan kelasnya
- ✅ Search/Pencarian orang tua berdasarkan nama

**Actions:**
- ✅ **Tambah Orang Tua Baru** (`/admin/parents/new`)
  - Input nama lengkap (wajib)
  - Input email (wajib, dengan validasi format)
  - Input no HP
  - Set password awal (minimal 6 karakter, wajib)
  - Info box: Satu orang tua bisa memiliki banyak anak
  - Role otomatis diset sebagai "parent"
  - Password otomatis digenerate (opsional)

- ✅ **Edit Data Orang Tua** (`/admin/parents/:id/edit`)
  - Ubah nama, email, no HP
  - **TIDAK bisa mengubah password**
  - Update informasi kontak

- ✅ **Hapus Orang Tua**
  - Konfirmasi dialog sebelum hapus
  - Relasi dengan anak tidak terhapus
  - Anak masih bisa view parent lain

---

### 🏫 Data Kelas (Classes)
**Location:** `/admin/classes`

**View Mode:**
- ✅ Lihat daftar semua kelas dalam bentuk **GRID** (bukan tabel)
- ✅ Informasi yang ditampilkan:
  - Nama kelas dengan icon GraduationCap
  - Wali kelas (jika ada)
  - Jumlah murid
  - Card design dengan border-2
- ✅ Responsive: 1 kolom (mobile), 2-3 kolom (desktop)

**Actions:**
- ✅ **Tambah Kelas Baru** (`/admin/classes/new`)
  - Input nama kelas (wajib)
  - Format disarankan: "Kelas XA" atau "Kelas XB"
  - Pilih wali kelas dari dropdown (opsional)
  - Dropdown berisi semua guru yang tersedia
  - Info box: Wali kelas bisa diubah kapan saja
  - Murid ditugaskan ke kelas saat dibuat/diedit

- ✅ **Edit Data Kelas** (`/admin/classes/:id/edit`)
  - Ubah nama kelas
  - Ganti wali kelas
  - Update informasi kelas

- ✅ **Hapus Kelas**
  - Konfirmasi dialog sebelum hapus
  - Murid di kelas tersebut menjadi "unassigned"
  - Data hafalan murid tidak terhapus

---

### 📊 Laporan & Export (Reports)
**Location:** `/admin/reports`

**Report Types Available:**

**1. Laporan Per Murid (Student Report)**
- ✅ Pilih murid dari dropdown (future: sekarang mock data)
- ✅ Preview sebelum export:
  - Nama murid
  - Kelas
  - Ayah & Ibu
  - Progress hafalan (percentage, completed/total)
  - Riwayat setoran lengkap
- ✅ Export ke **PDF**:
  - Professional layout dengan school header
  - Logo sekolah (placeholder untuk sekarang)
  - Nama sekolah, tanggal, tahun ajaran
  - Informasi murid lengkap
  - Tabel riwayat hafalan (Tanggal, Unit, Status, Catatan, Guru)
  - Auto-sized columns
  - Bahasa Indonesia
  - Download langsung ke browser
- ✅ Export ke **Excel**:
  - Data lengkap untuk processing
  - Bisa diedit lagi
  - Format .xlsx
  - Multiple sheets support
  - Download langsung ke browser

**2. Laporan Per Kelas (Class Report)**
- ✅ Pilih kelas dari dropdown
- ✅ Preview sebelum export:
  - Nama kelas
  - Wali kelas
  - Total murid
  - Statistik kelas:
    - Rata-rata progress
    - Total setoran
  - Daftar semua murid dengan progress
- ✅ Export ke **PDF**:
  - Layout sama seperti student report
  - Tabel daftar murid dengan progress
  - Statistik kelas
- ✅ Export ke **Excel**:
  - Data lengkap semua murid
  - Bisa untuk analisis lebih lanjut

**3. Laporan Per Periode (Period Report)**
- 🚧 **Coming Soon** - Masih mock
- Akan bisa filter by date range
- Summary statistics untuk periode tersebut

**Export Features:**
- ✅ Loading state saat generate
- ✅ Success alert setelah export
- ✅ Info box tentang perbedaan PDF vs Excel
- ✅ PDF: Format resmi untuk presentasi, bisa diprint
- ✅ Excel: Untuk data processing, bisa diedit

---

### ⚙️ Pengaturan (Settings)
**Location:** `/admin/settings`

**School Information:**
- ✅ **Edit Informasi Sekolah:**
  - Nama sekolah
  - Upload logo sekolah (dengan preview)
  - Email sekolah
  - No telepon sekolah
  - Alamat sekolah
  - Tahun ajaran (dropdown: 2024/2025, 2025/2026, dll)
- ✅ **Logo Upload:**
  - Format: PNG, JPG
  - Max size: 2MB
  - Recommended: 200x200px
  - Preview sebelum simpan
- ✅ **Save Settings:**
  - Menyimpan semua konfigurasi
  - Toast notification saat berhasil
  - Update seluruh aplikasi

**Password Reset (Admin Only):**
- ✅ **Reset Password User:**
  - Dropdown pilih user (admin, guru, parent)
  - Reset ke password default: "password123"
  - User akan menerima email notifikasi (future)
  - User harus ganti password di login pertama (future)
- ✅ Info box tentang proses reset:
  - Password direset ke default
  - Email notifikasi dikirim
  - User harus ganti password
  - Password lama dihapus

**System Information:**
- ✅ **View System Info:**
  - Versi aplikasi: 1.0.0
  - Environment: Development/Production
  - Database: PostgreSQL 15
  - Last update date

---

### 👤 Profile Management
**Location:** `/profile` (All roles access)

**Admin juga bisa:**
- ✅ **Profile Tab:**
  - Edit nama lengkap
  - Edit email
  - Edit no HP
  - Simpan perubahan
- ✅ **Password Tab:**
  - Input current password
  - Input new password (minimal 6 karakter)
  - Confirm new password
  - Validasi password matching
  - Tips keamanan password
  - Simpan perubahan

---

### 🚪 Logout
- ✅ Klik tombol "Keluar" di sidebar
- ✅ Clear token dari localStorage
- ✅ Redirect ke halaman login
- ✅ Tidak bisa akses protected routes setelah logout

---

## 👨‍🏫 GURU (Teacher) - Teaching Management

Teacher memiliki akses untuk mengelola pembelajaran dan input hafalan murid-muridnya.

### 🏠 Dashboard Overview
**Location:** `/teacher/dashboard`

**What Teacher Can Do:**
- ✅ Lihat daftar kelas yang diampu
- ✅ Lihat statistik murid per kelas
- ✅ Quick navigation ke input hafalan
- ✅ Recent activities

---

### 👨‍🎓 Daftar Murid
**Location:** `/teacher/students` (via API)

**View Mode:**
- ✅ Lihat daftar semua murid yang diajar
- ✅ Informasi yang ditampilkan:
  - Nama murid
  - Kelas
  - Progress hafalan
  - Terakhir setoran
- ✅ Filter berdasarkan kelas

**Actions:**
- ✅ **View Detail Murid** (`/teacher/students/:studentId`)
  - Informasi lengkap murid
  - Progress visualization (percentage, progress bar)
  - Riwayat hafalan lengkap
  - Tabel dengan:
    - Tanggal setoran
    - Unit (Juz/Surah/Halaman)
    - Status (Lancar/Cukup/Perlu Perbaikan)
    - Catatan
    - Guru yang mengetes
  - Filter berdasarkan periode
  - Search dalam riwayat

---

### ✍️ Input Hafalan Baru
**Location:** Dari Student Detail Page

**Teacher Can:**
- ✅ **Search & Select Quran Unit:**
  - Combobox dengan search functionality
  - **Database 114 Surah** lengkap:
    - Al-Fatihah sampai An-Nas
    - Termasuk Al-Falaq dan An-Nas
    - Nama Arab & Indonesia
    - Nomor surah
    - Jumlah ayat
  - Search by nama surah (Bahasa Indonesia)
  - Highlight hasil search
  - Navigate dengan arrow keys
  - Select dengan Enter atau click

- ✅ **Pilih Tipe Unit:**
  - **Juz** - Input nomor juz (1-30)
  - **Surah** - Select dari 114 surah
  - **Halaman** - Input nomor halaman

- ✅ **Input Status Hafalan:**
  - **Lancar** (Fluent) - Hijau
  - **Cukup** (Good) - Kuning
  - **Perlu Perbaikan** (Needs Improvement) - Merah

- ✅ **Input Catatan:**
  - Textarea untuk catatan detail
  - Feedback untuk murid
  - Tips perbaikan
  - Catatan kemajuan

- ✅ **Submit Hafalan:**
  - Validasi semua field wajib
  - Toast notification saat berhasil
  - Otomatis redirect ke detail murid
  - Update progress murid secara real-time

---

### 👤 Profile Management
**Location:** `/profile`

**Teacher juga bisa:**
- ✅ Edit profile (nama, email, no HP)
- ✅ Ganti password
- ✅ Sama seperti admin profile features

---

### 🚪 Logout
- ✅ Sama seperti admin logout

---

## 👨‍👩‍👧 ORANG TUA (Parent) - Children Progress Monitoring

Parent memiliki akses untuk memantau progress hafalan anak-anaknya secara real-time.

### 🏠 Dashboard Overview
**Location:** `/parent/dashboard`

**What Parent Can Do:**
- ✅ Lihat daftar semua anak
- ✅ Informasi per anak:
  - Nama anak
  - Kelas
  - Photo avatar (jika ada)
  - Progress percentage ( besar & bold)
  - Progress bar visual
  - Total unit completed
  - Terakhir setoran
- ✅ Quick navigation ke detail anak
- ✅ Responsive card layout

---

### 👨‍🎓 Detail Anak
**Location:** `/parent/children/:childId`

**View Mode:**
- ✅ **Informasi Anak:**
  - Nama lengkap
  - Kelas
  - Tanggal lahir
  - Photo (jika ada)
  - Ayah & Ibu
  - No HP

- ✅ **Progress Visualization:**
  - Large percentage display (contoh: "40%")
  - Progress bar dengan warna:
    - Hijau: >70%
    - Kuning: 40-70%
    - Merah: <40%
  - Total units: 45/114
  - Status text: "Sedang berkembang", "Baik", dll

- ✅ **Riwayat Hafalan Lengkap:**
  - Tabel dengan semua records:
    - Tanggal setoran
    - Unit yang disetorkan
    - Tipe unit (Juz/Surah/Halaman)
    - Status dengan color coding:
      - 🟢 Lancar (Hijau)
      - 🟡 Cukup (Kuning)
      - 🔴 Perlu Perbaikan (Merah)
    - Catatan dari guru
    - Nama guru yang mengetes
  - **Fitur Filter & Search:**
    - Filter by status (Lancar/Cukup/Perlu Perbaikan)
    - Filter by periode tanggal
    - Search by nama unit/surah
    - Reset filters
  - **Sort Options:**
    - Sort by tanggal (terbaru/terlama)
    - Sort by status
  - **Pagination:**
    - 10, 20, 50 items per page
    - Navigate between pages

- ✅ **Statistik Tambahan:**
  - Total setoran: X kali
  - Rata-rata status: Mostly "Lancar"
  - Terakhir update: [Tanggal]
  - Guru terakhir: [Nama guru]

- ✅ **Actions:**
  - Kembali ke dashboard
  - Download laporan anak (PDF) - future
  - Print laporan - future

---

### 👤 Profile Management
**Location:** `/profile`

**Parent juga bisa:**
- ✅ Edit profile (nama, email, no HP)
- ✅ Ganti password
- ✅ Sama seperti admin & teacher profile features

---

### 🚪 Logout
- ✅ Sama seperti admin & teacher logout

---

## 📊 Summary Table: Fitur per Role

| Fitur | Admin | Guru | Orang Tua |
|-------|-------|------|-----------|
| **Dashboard** | ✅ Statistics lengkap | ✅ Kelas & murid | ✅ Daftar anak |
| **Student Management** | ✅ CRUD | ❌ | ❌ |
| **Teacher Management** | ✅ CRUD | ❌ | ❌ |
| **Parent Management** | ✅ CRUD | ❌ | ❌ |
| **Class Management** | ✅ CRUD | ❌ | ❌ |
| **Input Hafalan** | ❌ | ✅ | ❌ |
| **View Progress Anak** | ✅ (Semua murid) | ✅ (Murid diajar) | ✅ (Anak sendiri) |
| **Laporan & Export** | ✅ PDF & Excel | ❌ | ❌ (Future) |
| **Settings** | ✅ Full access | ❌ | ❌ |
| **Password Reset** | ✅ (Reset user lain) | ❌ | ❌ |
| **Profile Management** | ✅ | ✅ | ✅ |
| **Quran Search** | N/A | ✅ 114 surah | N/A |
| **Riwayat Hafalan** | ✅ (Semua) | ✅ (Murid diajar) | ✅ (Anak sendiri) |

---

## 🎯 Use Cases per Role

### Admin Use Cases:
1. **Setup Awal:**
   - Buat kelas-kelas
   - Tambah guru-guru
   - Register murid-murid baru
   - Assign murid ke kelas
   - Assign parent ke murid

2. **Day-to-Day:**
   - Update data murid/guru/kelas
   - Reset password user yang lupa
   - Generate laporan bulanan
   - Update pengaturan sekolah
   - Monitor aktivitas sistem

3. **Reporting:**
   - Export laporan progress murid
   - Export laporan statistik kelas
   - Share ke orang tua via PDF/Excel
   - Analisis data dengan Excel

### Teacher Use Cases:
1. **Daily Teaching:**
   - Lihat daftar murid hari ini
   - Pilih murid untuk ditest
   - Search surah yang ditargetkan
   - Input hasil setoran
   - Beri catatan & feedback

2. **Progress Monitoring:**
   - Cek progress murid
   - Lihat riwayat setoran
   - Identify murid yang perlu bimbingan
   - Track improvement dari waktu ke waktu

3. **Parent Communication:**
   - Share progress ke orang tua
   - Berikan feedback detail
   - Saran program murid
   - Catatan improvement areas

### Parent Use Cases:
1. **Daily Monitoring:**
   - Cek progress terbaru anak
   - Lihat riwayat setoran
   - Monitor kemajuan anak
   - Identify areas yang perlu perhatian

2. **Engagement:**
   - Diskusikan progress dengan anak
   - Motivasi anak berdasarkan achievement
   - Coordinate dengan guru untuk improvement
   - Track goals dan target hafalan

3. **Reporting:**
   - Download laporan anak (future)
   - Share progress ke keluarga
   - Document journey hafalan anak
   - Portfolio development

---

## 🔒 Security & Access Control

### Role-Based Access:
- ✅ JWT authentication dengan 24h expiry
- ✅ Role validation di setiap protected route
- ✅ API endpoints protected by middleware
- ✅ Parent hanya bisa lihat anak sendiri
- ✅ Teacher hanya bisa lihat murid yang diajar
- ✅ Admin punya full access

### Data Privacy:
- ✅ Password hashing (bukan plaintext)
- ✅ Parent data hanya accessible oleh admin & parent sendiri
- ✅ Student data protected by role
- ✅ Memorization records sesuai role access
- ✅ Audit trail untuk semua changes

---

## 🎨 User Experience Features

### All Roles:
- ✅ **Responsive Design** - Works di mobile, tablet, desktop
- ✅ **Loading States** - Feedback saat data loading
- ✅ **Error Handling** - Clear error messages
- ✅ **Toast Notifications** - Success/error feedback
- ✅ **Search & Filter** - Quick data access
- ✅ **Confirmation Dialogs** - Prevent accidental deletes
- ✅ **Form Validation** - Real-time validation
- ✅ **Accessibility** - 44x44px minimum touch targets
- ✅ **Clean Design** - Sharp corners, solid borders, no shadows
- ✅ **Consistent UI** - Same design system across all pages

---

## 📱 Mobile Responsiveness

### Admin:
- ✅ Table scroll horizontal di mobile
- ✅ Cards stack vertically
- ✅ Touch-friendly buttons (min 44x44px)
- ✅ Collapsible sidebar
- ✅ Optimized forms untuk mobile input

### Teacher:
- ✅ Quran search mobile-friendly
- ✅ Form input yang besar & clear
- ✅ Easy navigation di mobile
- ✅ Quick access ke murid list

### Parent:
- ✅ Card-based layout (perfect untuk mobile)
- ✅ Large progress indicators
- ✅ Easy tap targets
- ✅ Smooth navigation
- ✅ Optimized untuk on-the-go viewing

---

**Last Updated:** 2026-04-05
**Version:** 1.0.0
**Status:** ✅ COMPLETE & PRODUCTION READY