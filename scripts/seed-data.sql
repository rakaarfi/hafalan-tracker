-- Seed Data for Hafalan Tracker Database
-- This will populate the database with initial data for testing and demo

-- ============================================
-- ROLES
-- ============================================

INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Full system access'),
(2, 'teacher', 'Can input and view student memorization'),
(3, 'parent', 'Can view their children''s progress');

-- ============================================
-- USERS (with passwords)
-- Password format: bcrypt hash (for demo, using simple hash)
-- In production, use proper bcrypt hashing
-- All passwords: 'password123' except admin which is 'admin123'

-- Admin
INSERT INTO users (id, email, password_hash, role_id) VALUES
(1, 'admin@test.com', '$2a$10$YourBcryptHashForPassword123', 1);

-- Teachers
INSERT INTO users (id, email, password_hash, role_id) VALUES
(2, 'teacher@test.com', '$2a$10$YourBcryptHashForPassword123', 2),
(3, 'budi.santoso@sekolah.sch.id', '$2a$10$YourBcryptHashForPassword123', 2),
(4, 'siti.rahayu@sekolah.sch.id', '$2a$10$YourBcryptHashForPassword123', 2);

-- Parents
INSERT INTO users (id, email, password_hash, role_id) VALUES
(5, 'parent@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(6, 'bapak.ahmad@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(7, 'ibu.siti@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(8, 'bapak.hasan@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(9, 'ibu.fatimah@test.com', '$2a$10$YourBcryptHashForPassword123', 3);

-- ============================================
-- TEACHERS
-- ============================================

INSERT INTO teachers (user_id, full_name, phone) VALUES
(2, 'Guru Tester', '081234567890'),
(3, 'Budi Santoso, S.Pd.I', '081234567891'),
(4, 'Siti Rahayu, S.Pd', '081234567892');

-- ============================================
-- PARENTS
-- ============================================

INSERT INTO parents (user_id, full_name, phone) VALUES
(5, 'Orang Tua Tester', '081234567893'),
(6, 'Bapak Ahmad', '081234567894'),
(7, 'Ibu Siti', '081234567895'),
(8, 'Bapak Hasan Basri', '081234567896'),
(9, 'Ibu Fatimah Az-Zahra', '081234567897');

-- ============================================
-- CLASSES
-- ============================================

INSERT INTO classes (id, name, grade_level, homeroom_teacher_id) VALUES
(1, 'Kelas 1A', 'Grade 1', 4),
(2, 'Kelas 1B', 'Grade 1', 4),
(3, 'Kelas 6A', 'Grade 6', 3),
(4, 'Kelas 6B', 'Grade 6', 3);

-- ============================================
-- STUDENTS
-- ============================================

INSERT INTO students (id, name, class_id, enrollment_year, semester) VALUES
(1, 'Ahmad Fauzi', 3, 2025, 1),
(2, 'Siti Aminah', 3, 2025, 1),
(3, 'Muhammad Rizki', 4, 2025, 1),
(4, 'Fatimah Zahra', 3, 2025, 1),
(5, 'Abdullah Rahman', 4, 2025, 1),
(6, 'Aisyah Humaira', 1, 2025, 1),
(7, 'Zainal Abidin', 1, 2025, 1),
(8, 'Khadijah Siti', 2, 2025, 1),
(9, 'Umar Faruq', 2, 2025, 1),
(10, 'Ali bin Abi Thalib', 3, 2025, 1);

-- ============================================
-- STUDENT-PARENT RELATIONSHIPS
-- ============================================

-- Ahmad Fauzi - Bapak Ahmad (father) & Ibu Siti (mother)
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(1, 6, 'father', true),
(1, 7, 'mother', false);

-- Siti Aminah - Bapak Hasan & Ibu Fatimah
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(2, 8, 'father', true),
(2, 9, 'mother', false);

-- Muhammad Rizki - Bapak Ahmad & Ibu Siti (same parents, sibling)
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(3, 6, 'father', true),
(3, 7, 'mother', false);

-- Fatimah Zahra - Parent tester (for testing)
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(4, 5, 'father', true);

-- Abdullah Rahman - Bapak Hasan & Ibu Fatimah (same parents, sibling)
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(5, 8, 'father', true),
(5, 9, 'mother', false);

-- Aisyah Humaira - Bapak Ahmad & Ibu Siti
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(6, 6, 'father', true),
(6, 7, 'mother', false);

-- Zainal Abidin - Parent tester
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(7, 5, 'father', true);

-- Khadijah Siti - Parent tester
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(8, 5, 'mother', true);

-- Umar Faruq - Bapak Hasan & Ibu Fatimah
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(9, 8, 'father', true),
(9, 9, 'mother', false);

-- Ali bin Abi Thalib - Bapak Ahmad & Ibu Siti
INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(10, 6, 'father', true),
(10, 7, 'mother', false);

-- ============================================
-- SETTINGS
-- ============================================

-- Note: Settings table structure needs to match your migration
-- Adjust this based on your actual settings table structure

-- ============================================
-- MEMORIZATION RECORDS (for demo/testing)
-- ============================================

-- Note: This table structure depends on your actual migration
-- Adjust based on your actual memorizations table structure

-- For Ahmad Fauzi
-- INSERT INTO memorizations (student_id, teacher_id, unit, unit_type, status, notes, date) VALUES
-- (1, 3, 'Juz 30', 'juz', 'fluent', 'Sangat lancar, makhraj baik', '2026-04-01'),
-- (1, 3, 'An-Naba', 'surah', 'good', 'Cukup lancar, perlu latihan tajwid', '2026-03-28'),
-- (1, 3, 'Al-Baqarah 1-10', 'page', 'fluent', 'Lancar, hafalan kuat', '2026-03-25');

-- For Siti Aminah
-- INSERT INTO memorizations (student_id, teacher_id, unit, unit_type, status, notes, date) VALUES
-- (2, 3, 'Al-Fatihah', 'surah', 'good', 'Cukup baik, perlu latihan lebih lanjut', '2026-04-03'),
-- (2, 4, 'Juz 1', 'juz', 'needs_improvement', 'Perlu banyak latihan lagi', '2026-03-30'),
-- (2, 3, 'Yasin', 'surah', 'good', 'Cukup baik, masih perlu review', '2026-03-27');

-- ============================================
-- SUMMARY OF DATA CREATED
-- ============================================

-- Roles: 3 (admin, teacher, parent)
-- Users: 9
--   - 1 Admin
--   - 3 Teachers
--   - 5 Parents
-- Classes: 4 (Kelas 1A, 1B, 6A, 6B)
-- Students: 10
-- Student-Parent Relationships: 10 records

-- Test Accounts:
-- Admin: admin@test.com / admin123
-- Teacher: teacher@test.com / password123
-- Parent: parent@test.com / password123
