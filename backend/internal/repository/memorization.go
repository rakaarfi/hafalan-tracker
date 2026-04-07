package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// MemorizationRepository handles memorization data operations
type MemorizationRepository struct {
	db *sqlx.DB
}

// NewMemorizationRepository creates a new memorization repository
func NewMemorizationRepository(db *sqlx.DB) *MemorizationRepository {
	return &MemorizationRepository{db: db}
}

// Memorization represents a hafalan memorization record
type Memorization struct {
	ID              int     `db:"id" json:"id"`
	StudentID       int     `db:"student_id" json:"student_id"`
	TeacherID       int     `db:"teacher_id" json:"teacher_id"`
	SurahID         *int    `db:"surah_id" json:"surah_id"`
	JuzID           *int    `db:"juz_id" json:"juz_id"`
	UnitType        string  `db:"unit_type" json:"unit_type"` // surah, juz, page
	PageStart       *int    `db:"page_start" json:"page_start"`
	PageEnd         *int    `db:"page_end" json:"page_end"`
	Status          string  `db:"status" json:"status"`
	Notes           string  `db:"notes" json:"notes"`
	TestDate        string  `db:"test_date" json:"test_date"`
	IsActive        bool    `db:"is_active" json:"is_active"`
	CreatedAt       string  `db:"created_at" json:"created_at"`
	UpdatedAt       string  `db:"updated_at" json:"updated_at"`
}

// MemorizationWithDetails represents a memorization with related data
type MemorizationWithDetails struct {
	Memorization
	StudentName     string  `db:"student_name" json:"student_name"`
	TeacherName     string  `db:"teacher_name" json:"teacher_name"`
	SurahNumber     *int    `db:"surah_number" json:"surah_number"`
	SurahName       *string `db:"surah_name" json:"surah_name"`
	JuzNumber       *int    `db:"juz_number" json:"juz_number"`
}

// Create inserts a new memorization record
func (r *MemorizationRepository) Create(ctx context.Context, mem *Memorization) error {
	query := `
		INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type,
			page_start, page_end, status, notes, test_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		mem.StudentID, mem.TeacherID, mem.SurahID, mem.JuzID, mem.UnitType,
		mem.PageStart, mem.PageEnd, mem.Status, mem.Notes, mem.TestDate,
	).Scan(&mem.ID, &mem.CreatedAt, &mem.UpdatedAt)

	return err
}

// GetByID retrieves a memorization by ID
func (r *MemorizationRepository) GetByID(ctx context.Context, id int) (*MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_start, m.page_end, m.status, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.full_name as teacher_name,
			sur.surah_number, sur.name_latin as surah_name,
			j.juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.user_id
		LEFT JOIN surah sur ON m.surah_id = sur.id
		LEFT JOIN juz j ON m.juz_id = j.id
		WHERE m.id = $1 AND m.is_active = true
	`

	var mem MemorizationWithDetails
	err := r.db.GetContext(ctx, &mem, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &mem, nil
}

// GetByStudentID retrieves all memorizations for a student
func (r *MemorizationRepository) GetByStudentID(ctx context.Context, studentID int) ([]MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_start, m.page_end, m.status, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.full_name as teacher_name,
			sur.surah_number, sur.name_latin as surah_name,
			j.juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.user_id
		LEFT JOIN surah sur ON m.surah_id = sur.id
		LEFT JOIN juz j ON m.juz_id = j.id
		WHERE m.student_id = $1 AND m.is_active = true
		ORDER BY m.test_date DESC
	`

	var mems []MemorizationWithDetails
	err := r.db.SelectContext(ctx, &mems, query, studentID)
	if err != nil {
		return nil, err
	}

	return mems, nil
}

// GetByTeacherID retrieves all memorizations for a teacher
func (r *MemorizationRepository) GetByTeacherID(ctx context.Context, teacherID int) ([]MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_start, m.page_end, m.status, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.full_name as teacher_name,
			sur.surah_number, sur.name_latin as surah_name,
			j.juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.user_id
		LEFT JOIN surah sur ON m.surah_id = sur.id
		LEFT JOIN juz j ON m.juz_id = j.id
		WHERE m.teacher_id = $1 AND m.is_active = true
		ORDER BY m.test_date DESC
	`

	var mems []MemorizationWithDetails
	err := r.db.SelectContext(ctx, &mems, query, teacherID)
	if err != nil {
		return nil, err
	}

	return mems, nil
}

// Update updates an existing memorization record (soft delete old, create new)
func (r *MemorizationRepository) Update(ctx context.Context, mem *Memorization) error {
	// Soft delete the old record
	query := `
		UPDATE memorization
		SET is_active = false, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, mem.ID)
	if err != nil {
		return err
	}

	// Create a new record with the updated data
	return r.Create(ctx, mem)
}
