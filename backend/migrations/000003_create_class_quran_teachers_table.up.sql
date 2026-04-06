-- Create table for tracking Quran teachers assigned to classes with history
-- This supports:
-- 1. One teacher can handle multiple classes
-- 2. Full history of teacher assignments
-- 3. Academic year tracking
-- 4. Teacher change tracking

CREATE TABLE class_quran_teachers (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    quran_teacher_id INTEGER NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2025/2026"
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL if still active
    is_active BOOLEAN DEFAULT true,
    notes TEXT, -- Comments: "Transferred", "Resigned", "Promoted", etc
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index for constraint: One active Quran teacher per class per academic year
CREATE UNIQUE INDEX idx_cqt_unique_active_teacher
ON class_quran_teachers(class_id, academic_year)
WHERE is_active = true;

-- Create additional indexes for performance
CREATE INDEX idx_cqt_class ON class_quran_teachers(class_id);
CREATE INDEX idx_cqt_teacher ON class_quran_teachers(quran_teacher_id);
CREATE INDEX idx_cqt_year_active ON class_quran_teachers(academic_year, is_active);
CREATE INDEX idx_cqt_dates ON class_quran_teachers(start_date, end_date);

-- Add comments for documentation
COMMENT ON TABLE class_quran_teachers IS 'Track Quran teacher assignments to classes with full history support';
COMMENT ON COLUMN class_quran_teachers.class_id IS 'Reference to class being taught';
COMMENT ON COLUMN class_quran_teachers.quran_teacher_id IS 'Reference to teacher (from teachers table)';
COMMENT ON COLUMN class_quran_teachers.academic_year IS 'Academic year in format YYYY/YYYY';
COMMENT ON COLUMN class_quran_teachers.start_date IS 'When teacher started teaching this class';
COMMENT ON COLUMN class_quran_teachers.end_date IS 'When teacher stopped teaching this class (NULL if still active)';
COMMENT ON COLUMN class_quran_teachers.is_active IS 'Whether this assignment is currently active';
COMMENT ON COLUMN class_quran_teachers.notes IS 'Optional notes about the assignment or teacher change';
