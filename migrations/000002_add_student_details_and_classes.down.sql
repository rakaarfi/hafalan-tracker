-- Rollback: Add student details and parent relationships

-- Drop indexes
DROP INDEX IF EXISTS idx_students_class;
DROP INDEX IF EXISTS idx_students_parent_2;
DROP INDEX IF EXISTS idx_students_parent_1;

-- Remove class column from students
ALTER TABLE students DROP COLUMN IF EXISTS class_id;

-- Drop classes table
DROP TABLE IF EXISTS classes;

-- Remove parent columns from students
ALTER TABLE students DROP COLUMN IF EXISTS parent_id_2;
ALTER TABLE students DROP COLUMN IF EXISTS parent_id_1;
ALTER TABLE students DROP COLUMN IF EXISTS photo_url;
ALTER TABLE students DROP COLUMN IF EXISTS phone;
ALTER TABLE students DROP COLUMN IF EXISTS birth_date;
