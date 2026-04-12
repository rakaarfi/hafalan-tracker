-- Demo Data for Hafalan Tracker Presentation
-- This file contains realistic sample data for demonstration
-- Safe to run multiple times - uses ON CONFLICT

-- ============================================
-- CLEANUP EXISTING DEMO DATA (if any)
-- ============================================

-- Delete memorization records for demo students
DELETE FROM memorization_records WHERE student_id IN (1,2,3,4,5,6,7);

-- Delete demo students
DELETE FROM students WHERE full_name IN (
    'Ahmad Fauzi', 'Aisyah Putri', 'Muhammad Rizki', 'Fatimah Zahra',
    'Ibrahim Khalil', 'Umar Faruq', 'Khadijah Aminah'
);

-- Delete demo parents
DELETE FROM parents WHERE user_id IN (7,8,9,10,11,12);

-- Delete demo parent users
DELETE FROM users WHERE email IN (
    'bapak.santoso@email.com', 'ibu.rahayu@email.com', 'bapak.widjaja@email.com',
    'ibu.fatmawati@email.com', 'bapak.hidayat@email.com', 'ibu.siti.aminah@email.com'
);

-- ============================================
-- PARENT USER ACCOUNTS (6 new parents)
-- ============================================

-- Parent 1: Bapak Santoso (Ayah dari Ahmad Fauzi)
INSERT INTO users (email, password_hash, role_id) VALUES
('bapak.santoso@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Parent 2: Ibu Rahayu (Ibu dari Aisyah Putri)
INSERT INTO users (email, password_hash, role_id) VALUES
('ibu.rahayu@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Parent 3: Bapak Widjaja (Ayah dari Muhammad Rizki)
INSERT INTO users (email, password_hash, role_id) VALUES
('bapak.widjaja@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Parent 4: Ibu Fatmawati (Ibu dari Fatimah Zahra)
INSERT INTO users (email, password_hash, role_id) VALUES
('ibu.fatmawati@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Parent 5: Bapak Hidayat (Ayah dari Ibrahim Khalil & Umar Faruq)
INSERT INTO users (email, password_hash, role_id) VALUES
('bapak.hidayat@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- Parent 6: Ibu Siti Aminah (Ibu dari Khadijah Aminah)
INSERT INTO users (email, password_hash, role_id) VALUES
('ibu.siti.aminah@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);

-- ============================================
-- PARENTS PROFILES
-- ============================================

-- Parent 1: Bapak Santoso
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(7, 'Bapak Santoso', '081234567891', 'male');

-- Parent 2: Ibu Rahayu
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(8, 'Ibu Rahayu', '081234567892', 'female');

-- Parent 3: Bapak Widjaja
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(9, 'Bapak Widjaja', '081234567893', 'male');

-- Parent 4: Ibu Fatmawati
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(10, 'Ibu Fatmawati', '081234567894', 'female');

-- Parent 5: Bapak Hidayat
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(11, 'Bapak Hidayat', '081234567895', 'male');

-- Parent 6: Ibu Siti Aminah
INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(12, 'Ibu Siti Aminah', '081234567896', 'female');

-- ============================================
-- STUDENTS (7 students)
-- ============================================

-- Student 1: Ahmad Fauzi (Kelas 1A) - Ayah saja (user_id 7)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Ahmad Fauzi', '2018-03-15', 'male', '2024-07-15', '081111111001', 7, NULL, 1, true);

-- Student 2: Aisyah Putri (Kelas 1A) - Ibu saja (user_id 8)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Aisyah Putri', '2018-05-20', 'female', '2024-07-15', '081111111002', NULL, 8, 1, true);

-- Student 3: Muhammad Rizki (Kelas 1A) - Ayah saja (user_id 9)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Muhammad Rizki', '2017-08-10', 'male', '2024-07-15', '081111111003', 9, NULL, 1, true);

-- Student 4: Fatimah Zahra (Kelas 1B) - Ibu saja (user_id 10)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Fatimah Zahra', '2018-11-25', 'female', '2024-07-15', '081111111004', NULL, 10, 2, true);

-- Student 5: Ibrahim Khalil (Kelas 1B) - Ayah (user_id 11, punya kakak di kelas 6)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Ibrahim Khalil', '2017-02-14', 'male', '2024-07-15', '081111111005', 11, NULL, 2, true);

-- Student 6: Umar Faruq (Kelas 6A) - Ayah (user_id 11, sama seperti Ibrahim)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Umar Faruq', '2013-06-18', 'male', '2024-07-15', '081111111006', 11, NULL, 3, true);

-- Student 7: Khadijah Aminah (Kelas 6A) - Ibu saja (user_id 12)
INSERT INTO students (full_name, birth_date, gender, enrollment_date, phone, parent_id_1, parent_id_2, class_id, is_active) VALUES
('Khadijah Aminah', '2013-09-30', 'female', '2024-07-15', '081111111007', NULL, 12, 3, true);

-- ============================================
-- MEMORIZATION RECORDS (Demo progress data)
-- ============================================

-- Ahmad Fauzi (Kelas 1A) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(1, 4, 114, 1, 3, '2025-01-15', 75, 'Lancar, perlu latihan lebih sering'),
(1, 4, 114, 1, 5, '2025-01-20', 80, 'Ada kemajuan'),
(1, 4, 112, 1, 3, '2025-02-01', 70, 'Masih perlu bimbingan'),
(1, 4, 112, 1, 5, '2025-02-10', 75, 'Mulai lancar');

-- Aisyah Putri (Kelas 1A) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(2, 4, 108, 1, 2, '2025-01-18', 65, 'Perlu diulangi'),
(2, 4, 108, 1, 3, '2025-01-25', 70, 'Sudah mulai hafal'),
(2, 4, 103, 1, 3, '2025-02-05', 68, 'Tajwid perlu diperbaiki');

-- Muhammad Rizki (Kelas 1A) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(3, 4, 107, 1, 2, '2025-01-20', 72, 'Cukup baik'),
(3, 4, 111, 1, 3, '2025-02-01', 78, 'Progress memuaskan'),
(3, 4, 113, 1, 5, '2025-02-15', 85, 'Sangat baik');

-- Fatimah Zahra (Kelas 1B) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(4, 4, 109, 1, 2, '2025-01-22', 68, 'Perlu latihan'),
(4, 4, 109, 1, 3, '2025-02-08', 75, 'Ada kemajuan'),
(4, 4, 110, 1, 3, '2025-02-20', 70, 'Belum stabil');

-- Ibrahim Khalil (Kelas 1B) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(5, 3, 105, 1, 2, '2025-01-25', 70, 'Cukup baik'),
(5, 3, 106, 1, 3, '2025-02-10', 75, 'Meningkat'),
(5, 3, 108, 1, 4, '2025-02-25', 78, 'Progress baik');

-- Umar Faruq (Kelas 6A) - Menengah, Juz Amma + Al-Fatihah
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(6, 3, 1, 1, 5, '2024-09-01', 85, 'Sangat lancar'),
( 6, 3, 1, 1, 7, '2024-09-15', 90, 'Fluent'),
( 6, 3, 2, 1, 5, '2024-10-01', 88, 'Lancar'),
( 6, 3, 2, 1, 10, '2024-10-15', 92, 'Sangat baik'),
( 6, 3, 114, 1, 5, '2024-11-01', 95, 'Fluent'),
( 6, 3, 114, 1, 6, '2024-11-15', 93, 'Excellent'),
( 6, 3, 113, 1, 5, '2025-01-10', 90, 'Maintained'),
( 6, 3, 112, 1, 5, '2025-02-01', 88, 'Good progress');

-- Khadijah Aminah (Kelas 6A) - Menengah, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(7, 3, 1, 1, 4, '2024-09-05', 80, 'Cukup lancar'),
(7, 3, 1, 1, 7, '2024-09-20', 85, 'Baik'),
(7, 3, 2, 1, 3, '2024-10-05', 82, 'Lancar'),
(7, 3, 103, 1, 5, '2024-11-01', 88, 'Sangat baik'),
(7, 3, 105, 1, 4, '2024-12-01', 90, 'Excellent'),
(7, 3, 111, 1, 5, '2025-01-15', 87, 'Baik'),
(7, 3, 110, 1, 3, '2025-02-10', 85, 'Maintained well');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data was inserted correctly
SELECT 'Users:' as type, COUNT(*) as count FROM users WHERE id > 5
UNION ALL
SELECT 'Parents:' as type, COUNT(*) as count FROM parents WHERE user_id > 5
UNION ALL
SELECT 'Students:' as type, COUNT(*) as count FROM students
UNION ALL
SELECT 'Memorizations:' as type, COUNT(*) as count FROM memorization_records;
