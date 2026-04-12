-- Rollback: Create reports table and settings

-- Drop indexes
DROP INDEX IF EXISTS idx_reports_created_at;
DROP INDEX IF EXISTS idx_reports_created_by;
DROP INDEX IF EXISTS idx_reports_type;

-- Drop settings table
DROP TABLE IF EXISTS settings;

-- Drop reports table
DROP TABLE IF EXISTS reports;
