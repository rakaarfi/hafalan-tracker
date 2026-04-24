-- Migration: Create reports table and settings
-- Date: 2026-04-05

-- Create reports table for generated reports
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- 'student', 'class', 'period'
    title VARCHAR(255) NOT NULL,
    filters JSONB, -- Store filter parameters
    generated_by INT REFERENCES users(id),
    file_url VARCHAR(500),
    file_format VARCHAR(10), -- 'pdf' or 'xlsx'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table for school configuration
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT REFERENCES users(id)
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('school_name', 'Hafalan Tracker School', 'School name for reports'),
('school_address', '', 'School address'),
('school_phone', '', 'School phone number'),
('school_logo_url', '', 'School logo URL'),
('current_academic_year', '2025/2026', 'Current academic year')
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

COMMENT ON TABLE reports IS 'Generated reports history';
COMMENT ON TABLE settings IS 'School configuration settings';
