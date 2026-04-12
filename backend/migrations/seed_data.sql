-- Seed data for Hafalan Tracker

-- Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Full system access'),
(2, 'teacher', 'Can input and view student memorization'),
(3, 'parent', 'Can view their children progress')
ON CONFLICT (id) DO NOTHING;

-- Insert Users (passwords: admin123 and password123)
INSERT INTO users (id, email, password_hash, role_id) VALUES
(1, 'admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(2, 'teacher@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
(3, 'budi.santoso@sekolah.sch.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
(4, 'siti.rahayu@sekolah.sch.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
(5, 'parent@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Teachers
INSERT INTO teachers (user_id, full_name, phone) VALUES
(2, 'Guru Tester', '081234567890'),
(3, 'Budi Santoso, S.Pd.I', '081234567891'),
(4, 'Siti Rahayu, S.Pd', '081234567892')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Parents
INSERT INTO parents (user_id, full_name, phone) VALUES
(5, 'Orang Tua Tester', '081234567893')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Classes (update this based on actual schema)
-- Remove grade_level, homeroom_teacher_id if they don't exist
INSERT INTO classes (id, name, teacher_id) VALUES
(1, 'Kelas 1A', 4),
(2, 'Kelas 1B', 4),
(3, 'Kelas 6A', 3),
(4, 'Kelas 6B', 3)
ON CONFLICT (id) DO NOTHING;
