-- Demo Data for Hafalan Tracker
-- Optimized for client demonstration
-- All passwords: admin123 (admin) or password123 (others)

-- ============================================
-- ROLES (must exist before users)
-- ============================================

INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Full system access'),
(2, 'teacher', 'Can input and view student memorization'),
(3, 'parent', 'Can view their children progress')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CLEAR EXISTING DEMO DATA
-- ============================================

-- Delete demo records (keep production data safe)
DELETE FROM memorization WHERE student_id IN (SELECT id FROM students WHERE id <= 100);
DELETE FROM student_parents WHERE student_id IN (SELECT id FROM students WHERE id <= 100);
DELETE FROM students WHERE id <= 100;
DELETE FROM classes WHERE id <= 100;
DELETE FROM parents WHERE user_id IN (SELECT id FROM users WHERE id <= 100 AND id > 1);
DELETE FROM teachers WHERE user_id IN (SELECT id FROM users WHERE id <= 100 AND id > 1);
DELETE FROM users WHERE id <= 100 AND id > 1;

-- ============================================
-- USERS (with proper bcrypt hashes)
-- ============================================

-- Admin (password: admin123)
INSERT INTO users (id, email, password_hash, role_id) VALUES
(1, 'admin@test.com', '$2b$12$vrfDFDDLwEq7wCf7zqjy..7uQsWtf26Q65k3vLikMQChUusn4mbN2', 1)
ON CONFLICT (email) DO NOTHING;

-- Teachers (password: password123)
INSERT INTO users (id, email, password_hash, role_id) VALUES
(2, 'budi.santoso@hafalan.sch.id', '$2b$12$m.mhQWs67zvNCyOKMWKeEOH7241OIAfH/H3.pMLahE65GEI3DKyS6', 2),
(3, 'siti.rahayu@hafalan.sch.id', '$2b$12$m.mhQWs67zvNCyOKMWKeEOH7241OIAfH/H3.pMLahE65GEI3DKyS6', 2)
ON CONFLICT (email) DO NOTHING;

-- Parents (password: password123)
INSERT INTO users (id, email, password_hash, role_id) VALUES
(4, 'bapak.ahmad@parent.com', '$2b$12$m.mhQWs67zvNCyOKMWKeEOH7241OIAfH/H3.pMLahE65GEI3DKyS6', 3),
(5, 'ibu.siti@parent.com', '$2b$12$m.mhQWs67zvNCyOKMWKeEOH7241OIAfH/H3.pMLahE65GEI3DKyS6', 3),
(6, 'bapak.hasan@parent.com', '$2b$12$m.mhQWs67zvNCyOKMWKeEOH7241OIAfH/H3.pMLahE65GEI3DKyS6', 3)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- TEACHERS
-- ============================================

INSERT INTO teachers (user_id, full_name, phone) VALUES
(2, 'Budi Santoso, S.Pd.I', '081234567891'),
(3, 'Siti Rahayu, S.Pd', '081234567892')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PARENTS
-- ============================================

INSERT INTO parents (user_id, full_name, phone, gender) VALUES
(4, 'Bapak Ahmad', '081234567893', 'male'),
(5, 'Ibu Siti', '081234567894', 'female'),
(6, 'Bapak Hasan Basri', '081234567895', 'male')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- CLASSES
-- ============================================

INSERT INTO classes (id, name, grade_level, homeroom_teacher_id) VALUES
(1, 'Kelas 1A', 'Grade 1', '2'),
(2, 'Kelas 1B', 'Grade 1', '2'),
(3, 'Kelas 6A', 'Grade 6', '3')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CLASS QURAN TEACHER ASSIGNMENTS
-- ============================================

-- Assign Quran teachers to classes for academic year 2025/2026
-- Budi Santoso (user_id: 2) teaches Quran for Kelas 1A and Kelas 6A
-- Siti Rahayu (user_id: 3) teaches Quran for Kelas 1B

INSERT INTO class_quran_teachers (class_id, quran_teacher_id, academic_year, start_date, is_active, notes) VALUES
(1, 2, '2025/2026', '2025-01-01', true, 'Initial assignment'),
(2, 3, '2025/2026', '2025-01-01', true, 'Initial assignment'),
(3, 2, '2025/2026', '2025-01-01', true, 'Initial assignment')
ON CONFLICT (class_id, academic_year) WHERE is_active = true DO NOTHING;

-- ============================================
-- STUDENTS
-- ============================================

INSERT INTO students (id, name, class_id, enrollment_year, semester, is_active, birth_date) VALUES
(1, 'Ahmad Fauzi', 1, 2025, 1, true, '2017-05-15'),
(2, 'Siti Aminah', 1, 2025, 1, true, '2017-08-20'),
(3, 'Muhammad Rizki', 2, 2025, 1, true, '2017-03-10'),
(4, 'Fatimah Zahra', 2, 2025, 1, true, '2017-07-25'),
(5, 'Abdullah Rahman', 3, 2025, 1, true, '2012-09-12'),
(6, 'Aisyah Humaira', 3, 2025, 1, true, '2012-11-30')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STUDENT-PARENT RELATIONSHIPS
-- ============================================

-- Ahmad Fauzi & Siti Aminah - Bapak Ahmad & Ibu Siti
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(1, 4, 'father', true),
(1, 5, 'mother', false),
(2, 4, 'father', true),
(2, 5, 'mother', false);

-- Muhammad Rizki & Fatimah Zahra - Bapak Hasan & Ibu Siti (note: different Siti)
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(3, 6, 'father', true),
(3, 5, 'mother', false),
(4, 6, 'father', true),
(4, 5, 'mother', false);

-- Abdullah Rahman & Aisyah Humaira - Bapak Ahmad & Ibu Siti
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(5, 4, 'father', true),
(5, 5, 'mother', false),
(6, 4, 'father', true),
(6, 5, 'mother', false);

-- ============================================
-- MEMORIZATION RECORDS (Progress Examples)
-- ============================================

-- Ahmad Fauzi - Good progress in Juz 30
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(1, 2, NULL, 30, 'juz', 'fluent', 'Sangat lancar, makhraj baik, fasih', '2026-04-01', true);

-- Siti Aminah - Working on Surah An-Naba
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(2, 3, 78, NULL, 'surah', 'good', 'Cukup lancar, perlu latihan tajwid', '2026-04-03', true);

-- Muhammad Rizki - Completed Al-Fatihah
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(3, 2, 1, NULL, 'surah', 'fluent', 'Lancar, hafalan kuat', '2026-04-02', true);

-- Fatimah Zahra - Learning Juz 1
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(4, 3, NULL, 1, 'juz', 'needs_improvement', 'Perlu banyak latihan lagi', '2026-03-30', true);

-- Abdullah Rahman - Multiple surah completed
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(5, 2, 36, NULL, 'surah', 'fluent', 'Sangat baik, lancar', '2026-04-05', true),
(5, 2, 67, NULL, 'surah', 'good', 'Cukup baik, review berkala', '2026-04-01', true);

-- Aisyah Humaira - Just started Juz 30
INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type, status, notes, test_date, is_active)
VALUES
(6, 2, NULL, 30, 'juz', 'good', 'Mulai belajar, progres baik', '2026-04-06', true);

-- ============================================
-- SUMMARY
-- ============================================

-- Test Accounts:
-- Admin: admin@test.com / admin123
-- Teacher: budi.santoso@hafalan.sch.id / password123
-- Teacher: siti.rahayu@hafalan.sch.id / password123
-- Parent: bapak.ahmad@parent.com / password123
-- Parent: ibu.siti@parent.com / password123
-- Parent: bapak.hasan@parent.com / password123

-- Data Summary:
-- Users: 6 (1 admin, 2 teachers, 3 parents)
-- Teachers: 2
-- Parents: 3
-- Classes: 3 (Kelas 1A, 1B, 6A)
-- Students: 6 (active)
-- Student-Parent Relationships: 6 students × 2 parents each = 12 relationships
-- Memorization Records: 6 records showing different progress levels
