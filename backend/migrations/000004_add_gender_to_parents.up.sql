-- Add gender column to parents table (nullable first)
ALTER TABLE parents ADD COLUMN gender VARCHAR(20);

-- Add check constraint for gender values
ALTER TABLE parents ADD CONSTRAINT parents_gender_check
CHECK (gender IN ('male', 'female'));

-- Update existing parents based on name patterns
UPDATE parents
SET gender = 'male'
WHERE full_name ILIKE '%Bapak%' OR full_name ILIKE '%Ayah%';

UPDATE parents
SET gender = 'female'
WHERE full_name ILIKE '%Ibu%' OR full_name ILIKE '%Bunda%';

-- Set default for any remaining NULL values (they can update later)
UPDATE parents
SET gender = 'male'
WHERE gender IS NULL;

-- Now make gender column NOT NULL
ALTER TABLE parents ALTER COLUMN gender SET NOT NULL;

-- Add comment
COMMENT ON COLUMN parents.gender IS 'Gender of parent: male (father) or female (mother)';
