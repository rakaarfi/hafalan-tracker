-- Migration: Create Quran tables
-- Date: 2026-04-12

-- Quran surahs table
CREATE TABLE IF NOT EXISTS quran_surahs (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    name_indonesian VARCHAR(100) NOT NULL,
    number_of_ayahs INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quran ayahs memorization tracking table
CREATE TABLE IF NOT EXISTS quran_memorization (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    surah_id INTEGER NOT NULL REFERENCES quran_surahs(id) ON DELETE CASCADE,
    ayah_start INTEGER NOT NULL,
    ayah_end INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'memorized', 'in_progress', 'needs_review'
    notes TEXT,
    teacher_id INTEGER REFERENCES teachers(user_id) ON DELETE SET NULL,
    memorized_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_surah_ayah UNIQUE (student_id, surah_id, ayah_start, ayah_end)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quran_memorization_student ON quran_memorization(student_id);
CREATE INDEX IF NOT EXISTS idx_quran_memorization_surah ON quran_memorization(surah_id);
CREATE INDEX IF NOT EXISTS idx_quran_memorization_status ON quran_memorization(status);
CREATE INDEX IF NOT EXISTS idx_quran_memorization_teacher ON quran_memorization(teacher_id);

-- Comments for documentation
COMMENT ON TABLE quran_surahs IS 'Quran surahs reference data';
COMMENT ON TABLE quran_memorization IS 'Track student Quran memorization progress';
COMMENT ON COLUMN quran_memorization.status IS 'Memorization status: memorized, in_progress, needs_review';
