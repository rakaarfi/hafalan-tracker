-- Rollback: Create Quran tables

-- Drop indexes
DROP INDEX IF EXISTS idx_quran_memorization_teacher;
DROP INDEX IF EXISTS idx_quran_memorization_status;
DROP INDEX IF EXISTS idx_quran_memorization_surah;
DROP INDEX IF EXISTS idx_quran_memorization_student;

-- Drop tables
DROP TABLE IF EXISTS quran_memorization;
DROP TABLE IF EXISTS quran_surahs;
