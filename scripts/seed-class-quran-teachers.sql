-- Seed Class Quran Teachers
-- This assigns Quran teachers to classes for the 2025/2026 academic year

-- Set current academic year
\set academic_year '2025/2026'

-- Assign Quran teachers to classes
-- Ibu Siti (teacher_id=4) handles Class 1A and 1B
INSERT INTO class_quran_teachers (class_id, quran_teacher_id, academic_year, start_date, is_active, notes)
VALUES
  (1, 4, :'academic_year', CURRENT_DATE, true, 'Initial assignment'),
  (2, 4, :'academic_year', CURRENT_DATE, true, 'Initial assignment');

-- Pak Budi (teacher_id=3) handles Class 6A and 6B
INSERT INTO class_quran_teachers (class_id, quran_teacher_id, academic_year, start_date, is_active, notes)
VALUES
  (3, 3, :'academic_year', CURRENT_DATE, true, 'Initial assignment'),
  (4, 3, :'academic_year', CURRENT_DATE, true, 'Initial assignment');

-- Verify the data
SELECT
  c.name as class_name,
  t.full_name as quran_teacher,
  cqt.academic_year,
  cqt.start_date,
  cqt.is_active
FROM class_quran_teachers cqt
JOIN classes c ON cqt.class_id = c.id
JOIN teachers t ON cqt.quran_teacher_id = t.user_id
ORDER BY c.name;
