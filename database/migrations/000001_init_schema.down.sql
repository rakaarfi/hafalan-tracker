-- Drop indexes first
DROP INDEX IF EXISTS idx_juz_number;
DROP INDEX IF EXISTS idx_surah_number;
DROP INDEX IF EXISTS idx_student_parents_parent;
DROP INDEX IF EXISTS idx_student_parents_student;
DROP INDEX IF EXISTS idx_memorization_active;
DROP INDEX IF EXISTS idx_memorization_date;
DROP INDEX IF EXISTS idx_memorization_teacher;
DROP INDEX IF EXISTS idx_memorization_student;
DROP INDEX IF EXISTS idx_students_active;
DROP INDEX IF EXISTS idx_students_class;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS memorization_history;
DROP TABLE IF EXISTS memorization;
DROP TABLE IF EXISTS juz;
DROP TABLE IF EXISTS surah;
DROP TABLE IF EXISTS student_parents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
