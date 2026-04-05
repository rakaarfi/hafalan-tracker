-- Test Users for Hafalan Tracker
-- Password: password123 (for both users)

-- Teacher User
INSERT INTO users (email, password_hash, role_id)
VALUES ('teacher@test.com', '$2b$12$4vQLyRR/B78EGbwWCsi64OjecldaY6MN5qq57vuXTkm/KTByObvuu', 2)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Parent User
INSERT INTO users (email, password_hash, role_id)
VALUES ('parent@test.com', '$2b$12$4vQLyRR/B78EGbwWCsi64OjecldaY6MN5qq57vuXTkm/KTByObvuu', 3)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Verify users
SELECT u.email, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id;
