-- Simple Seed Data for Hafalan Tracker
-- Run this after database is created and migrations are run

-- This will populate the database with demo data
-- Run with: psql -U hafalan_user -d hafalan_tracker < scripts/seed-simple.sql

BEGIN;

-- ============================================
-- ROLES
-- ============================================

INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Full system access'),
(2, 'teacher', 'Can input and view student memorization'),
(3, 'parent', 'Can view their children''s progress')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USERS (Simple password hash - FOR DEMO ONLY!)
-- In production, use proper bcrypt!
-- password123 = simple hash (CHANGE IN PRODUCTION!)
-- admin123 = simple hash (CHANGE IN PRODUCTION!)

INSERT INTO users (id, email, password_hash, role_id) VALUES
(1, 'admin@test.com', '$2a$10$YourBcryptHashForAdmin123', 1),
(2, 'teacher@test.com', '$2a$10$YourBcryptHashForPassword123', 2),
(3, 'budi.santoso@sekolah.sch.id', '$2a$10$YourBcryptHashForPassword123', 2),
(4, 'siti.rahayu@sekolah.sch.id', '$2a$10$YourBcryptHashForPassword123', 2),
(5, 'parent@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(6, 'bapak.ahmad@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(7, 'ibu.siti@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(8, 'bapak.hasan@test.com', '$2a$10$YourBcryptHashForPassword123', 3),
(9, 'ibu.fatimah@test.com', '$2a$10$YourBcryptHashForPassword123', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEACHERS
-- ============================================

INSERT INTO teachers (user_id, full_name, phone) VALUES
(2, 'Guru Tester', '081234567890'),
(3, 'Budi Santoso, S.Pd.I', '081234567891'),
(4, 'Siti Rahayu, S.Pd', '081234567892')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PARENTS
-- ============================================

INSERT INTO parents (user_id, full_name, phone) VALUES
(5, 'Orang Tua Tester', '081234567893'),
(6, 'Bapak Ahmad', '081234567894'),
(7, 'Ibu Siti', '081234567895'),
(8, 'Bapak Hasan Basri', '081234567896'),
(9, 'Ibu Fatimah Az-Zahra', '081234567897')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- CLASSES
-- ============================================

INSERT INTO classes (id, name, grade_level, homeroom_teacher_id) VALUES
(1, 'Kelas 1A', 'Grade 1', 4),
(2, 'Kelas 1B', 'Grade 1', 4),
(3, 'Kelas 6A', 'Grade 6', 3),
(4, 'Kelas 6B', 'Grade 6', 3)
ON CONFLICT (id) DO NOTHING;

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
(10, 'Ali bin Abi Thalib', 3, 2025, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STUDENT-PARENT RELATIONSHIPS
-- ============================================

INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
(1, 6, 'father', true),
(1, 7, 'mother', false),
(2, 8, 'father', true),
(2, 9, 'mother', false),
(3, 6, 'father', true),
(3, 7, 'mother', false),
(4, 5, 'father', true),
(5, 8, 'father', true),
(5, 9, 'mother', false),
(6, 6, 'father', true),
(6, 7, 'mother', false),
(7, 5, 'father', true),
(8, 5, 'mother', true),
(9, 8, 'father', true),
(9, 9, 'mother', false),
(10, 6, 'father', true),
(10, 7, 'mother', false)
ON CONFLICT (student_id, parent_id) DO NOTHING;

COMMIT;

-- ============================================
-- SUMMARY
-- ============================================

-- Roles: 3
-- Users: 9 (1 admin, 3 teachers, 5 parents)
-- Classes: 4
-- Students: 10
-- Student-Parent Relationships: 16

-- Test Accounts:
-- Admin:   admin@test.com / admin123
-- Teacher: teacher@test.com / password123
-- Parent:  parent@test.com / password123
