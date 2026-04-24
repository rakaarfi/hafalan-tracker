-- Rollback: Drop class_quran_teachers table
DROP INDEX IF EXISTS idx_cqt_dates;
DROP INDEX IF EXISTS idx_cqt_year_active;
DROP INDEX IF EXISTS idx_cqt_teacher;
DROP INDEX IF EXISTS idx_cqt_class;
DROP INDEX IF EXISTS idx_cqt_unique_active_teacher;
DROP TABLE IF EXISTS class_quran_teachers;
