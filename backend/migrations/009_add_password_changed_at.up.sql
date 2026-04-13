-- Add password_changed_at column to users table
-- This column tracks when a user last changed their password
-- NULL means password has never been changed (still default)

ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN users.password_changed_at IS 'Timestamp when user last changed their password. NULL indicates password is still the default (generated from phone number)';
