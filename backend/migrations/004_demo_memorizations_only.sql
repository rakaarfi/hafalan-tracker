-- Memorization Records for Demo Data (CORRECTED STUDENT IDs)
-- Student IDs are 36-42, not 1-7

-- Delete existing memorizations for demo students
DELETE FROM memorization_records WHERE student_id IN (36,37,38,39,40,41,42);

-- Ahmad Fauzi (student_id 36) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(36, 4, 114, 1, 3, '2025-01-15', 75, 'Lancar, perlu latihan lebih sering'),
(36, 4, 114, 1, 5, '2025-01-20', 80, 'Ada kemajuan'),
(36, 4, 112, 1, 3, '2025-02-01', 70, 'Masih perlu bimbingan'),
(36, 4, 112, 1, 5, '2025-02-10', 75, 'Mulai lancar');

-- Aisyah Putri (student_id 37) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(37, 4, 108, 1, 2, '2025-01-18', 65, 'Perlu diulangi'),
(37, 4, 108, 1, 3, '2025-01-25', 70, 'Sudah mulai hafal'),
(37, 4, 103, 1, 3, '2025-02-05', 68, 'Tajwid perlu diperbaiki');

-- Muhammad Rizki (student_id 38) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(38, 4, 107, 1, 2, '2025-01-20', 72, 'Cukup baik'),
(38, 4, 111, 1, 3, '2025-02-01', 78, 'Progress memuaskan'),
(38, 4, 113, 1, 5, '2025-02-15', 85, 'Sangat baik');

-- Fatimah Zahra (student_id 39) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(39, 4, 109, 1, 2, '2025-01-22', 68, 'Perlu latihan'),
(39, 4, 109, 1, 3, '2025-02-08', 75, 'Ada kemajuan'),
(39, 4, 110, 1, 3, '2025-02-20', 70, 'Belum stabil');

-- Ibrahim Khalil (student_id 40) - Pemula, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(40, 3, 105, 1, 2, '2025-01-25', 70, 'Cukup baik'),
(40, 3, 106, 1, 3, '2025-02-10', 75, 'Meningkat'),
(40, 3, 108, 1, 4, '2025-02-25', 78, 'Progress baik');

-- Umar Faruq (student_id 41) - Menengah, Juz Amma + Al-Fatihah
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(41, 3, 1, 1, 5, '2024-09-01', 85, 'Sangat lancar'),
(41, 3, 1, 1, 7, '2024-09-15', 90, 'Fluent'),
(41, 3, 2, 1, 5, '2024-10-01', 88, 'Lancar'),
(41, 3, 2, 1, 10, '2024-10-15', 92, 'Sangat baik'),
(41, 3, 114, 1, 5, '2024-11-01', 95, 'Fluent'),
(41, 3, 114, 1, 6, '2024-11-15', 93, 'Excellent'),
(41, 3, 113, 1, 5, '2025-01-10', 90, 'Maintained'),
(41, 3, 112, 1, 5, '2025-02-01', 88, 'Good progress');

-- Khadijah Aminah (student_id 42) - Menengah, Juz Amma
INSERT INTO memorization_records (student_id, teacher_id, surah_number, ayah_start, ayah_end, memorization_date, score, notes) VALUES
(42, 3, 1, 1, 4, '2024-09-05', 80, 'Cukup lancar'),
(42, 3, 1, 1, 7, '2024-09-20', 85, 'Baik'),
(42, 3, 2, 1, 3, '2024-10-05', 82, 'Lancar'),
(42, 3, 103, 1, 5, '2024-11-01', 88, 'Sangat baik'),
(42, 3, 105, 1, 4, '2024-12-01', 90, 'Excellent'),
(42, 3, 111, 1, 5, '2025-01-15', 87, 'Baik'),
(42, 3, 110, 1, 3, '2025-02-10', 85, 'Maintained well');

-- Verification
SELECT 'Demo data successfully inserted!' as status;
SELECT 'Total students:' as info, COUNT(*) as count FROM students;
SELECT 'Total memorizations:' as info, COUNT(*) as count FROM memorization_records;
SELECT 'Total parents:' as info, COUNT(*) as count FROM parents WHERE user_id > 5;
