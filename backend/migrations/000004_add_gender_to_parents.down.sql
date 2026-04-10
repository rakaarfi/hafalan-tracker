-- Remove gender column from parents table
ALTER TABLE parents DROP CONSTRAINT IF EXISTS parents_gender_check;
ALTER TABLE parents DROP COLUMN IF EXISTS gender;
