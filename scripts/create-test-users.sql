# Test Accounts for Hafalan Tracker
# Password: password123 (for all accounts)

## Admin
# Email: admin@test.com
# Password: password123
# Role: Admin
# Redirect: /admin/dashboard

INSERT INTO users (email, password_hash, role_id)
VALUES ('admin@test.com', '$2b$12$S1aZk/vPUrgzD39zhAZ97O/HDGoGb/llJKeRNT4pSYjVVJFUHPqIe', 1)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

## Teacher
# Email: teacher@test.com
# Password: password123
# Role: Teacher
# Redirect: /teacher/dashboard

INSERT INTO users (email, password_hash, role_id)
VALUES ('teacher@test.com', '$2b$12$4vQLyRR/B78EGbwWCsi64OjecldaY6MN5qq57vuXTkm/KTByObvuu', 2)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

## Parent
# Email: parent@test.com
# Password: password123
# Role: Parent
# Redirect: /parent/dashboard

INSERT INTO users (email, password_hash, role_id)
VALUES ('parent@test.com', '$2b$12$4vQLyRR/B78EGbwWCsi64OjecldaY6MN5qq57vuXTkm/KTByObvuu', 3)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Verify
SELECT u.email, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id;
