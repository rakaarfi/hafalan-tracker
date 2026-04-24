-- Rollback: Add gender column to parents

-- Remove NOT NULL constraint first
ALTER TABLE parents ALTER COLUMN gender DROP NOT NULL;

-- Remove check constraint
ALTER TABLE parents DROP CONSTRAINT IF EXISTS parents_gender_check;

-- Drop gender column
ALTER TABLE parents DROP COLUMN IF EXISTS gender;
