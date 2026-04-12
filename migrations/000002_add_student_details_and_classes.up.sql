-- Migration: Add student details and parent relationships
-- Date: 2026-04-05

-- Add student details
ALTER TABLE students
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_id_1 INT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS parent_id_2 INT REFERENCES users(id) ON DELETE SET NULL;

-- Add index for parent relationships
CREATE INDEX IF NOT EXISTS idx_students_parent_1 ON students(parent_id_1);
CREATE INDEX IF NOT EXISTS idx_students_parent_2 ON students(parent_id_2);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    teacher_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add class to students
ALTER TABLE students
ADD COLUMN IF NOT EXISTS class_id INT REFERENCES classes(id) ON DELETE SET NULL;

-- Create index for class
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);

-- Comments for documentation
COMMENT ON COLUMN students.birth_date IS 'Student birth date';
COMMENT ON COLUMN students.phone IS 'Student phone number';
COMMENT ON COLUMN students.photo_url IS 'URL to student photo';
COMMENT ON COLUMN students.parent_id_1 IS 'First parent (usually father)';
COMMENT ON COLUMN students.parent_id_2 IS 'Second parent (usually mother)';
COMMENT ON COLUMN students.class_id IS 'Class ID';
COMMENT ON TABLE classes IS 'School classes';
