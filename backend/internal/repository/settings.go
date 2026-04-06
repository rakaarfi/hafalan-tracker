package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// SettingsRepository handles settings data operations
type SettingsRepository struct {
	db *sqlx.DB
}

// NewSettingsRepository creates a new settings repository
func NewSettingsRepository(db *sqlx.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// Setting represents a single key-value setting
type Setting struct {
	Key         string `db:"key"`
	Value       string `db:"value"`
	Description string `db:"description"`
	UpdatedAt   string `db:"updated_at"`
	UpdatedBy   int    `db:"updated_by"`
}

// SchoolSettings represents school configuration (composite)
type SchoolSettings struct {
	SchoolName    string  `json:"school_name"`
	SchoolLogo    *string `json:"school_logo"`
	SchoolAddress *string `json:"school_address"`
	SchoolPhone   *string `json:"school_phone"`
	SchoolEmail   *string `json:"school_email"`
	AcademicYear  string  `json:"academic_year"`
}

// Get retrieves school settings
func (r *SettingsRepository) Get(ctx context.Context) (*SchoolSettings, error) {
	// Get individual settings
	settingsMap := make(map[string]string)

	rows, err := r.db.QueryContext(ctx, `SELECT "key", value FROM settings`)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return default settings if none exist
			return &SchoolSettings{
				SchoolName:   "Hafalan Tracker School",
				AcademicYear: "2025/2026",
			}, nil
		}
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return nil, err
		}
		settingsMap[key] = value
	}

	// Build SchoolSettings from key-value pairs
	schoolSettings := &SchoolSettings{
		SchoolName:   getSetting(settingsMap, "school_name", "Hafalan Tracker School"),
		AcademicYear: getSetting(settingsMap, "academic_year", "2025/2026"),
	}

	// Parse optional fields
	if logo, ok := settingsMap["school_logo"]; ok && logo != "" {
		schoolSettings.SchoolLogo = &logo
	}
	if address, ok := settingsMap["school_address"]; ok && address != "" {
		schoolSettings.SchoolAddress = &address
	}
	if phone, ok := settingsMap["school_phone"]; ok && phone != "" {
		schoolSettings.SchoolPhone = &phone
	}
	if email, ok := settingsMap["school_email"]; ok && email != "" {
		schoolSettings.SchoolEmail = &email
	}

	return schoolSettings, nil
}

// getSetting helper to get setting value with default
func getSetting(settings map[string]string, key, defaultValue string) string {
	if val, ok := settings[key]; ok {
		return val
	}
	return defaultValue
}

// Update updates school settings
func (r *SettingsRepository) Update(ctx context.Context, req *SchoolSettings) error {
	// Update each setting individually
	settingsToUpdate := map[string]string{
		"school_name":   req.SchoolName,
		"academic_year": req.AcademicYear,
	}

	if req.SchoolLogo != nil {
		settingsToUpdate["school_logo"] = *req.SchoolLogo
	}
	if req.SchoolAddress != nil {
		settingsToUpdate["school_address"] = *req.SchoolAddress
	}
	if req.SchoolPhone != nil {
		settingsToUpdate["school_phone"] = *req.SchoolPhone
	}
	if req.SchoolEmail != nil {
		settingsToUpdate["school_email"] = *req.SchoolEmail
	}

	// Use INSERT ... ON CONFLICT for each setting
	for key, value := range settingsToUpdate {
		query := `
			INSERT INTO settings ("key", value, description)
			VALUES ($1, $2, $3)
			ON CONFLICT ("key")
			DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
		`
		_, err := r.db.ExecContext(ctx, query, key, value, "School setting")
		if err != nil {
			return err
		}
	}

	return nil
}

// UpdateLogo updates only the logo URL
func (r *SettingsRepository) UpdateLogo(ctx context.Context, logoURL string) error {
	query := `
		INSERT INTO settings ("key", value, description)
		VALUES ($1, $2, $3)
		ON CONFLICT ("key")
		DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
	`

	_, err := r.db.ExecContext(ctx, query, "school_logo", logoURL, "School logo URL")
	return err
}
