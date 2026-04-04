package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/google/uuid"
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
	ID              string  `db:"id"`
	StudentID       string  `db:"student_id"`
	TeacherID       string  `db:"teacher_id"`
	SurahID         *string `db:"surah_id"`
	JuzID           *string `db:"juz_id"`
	UnitType        string  `db:"unit_type"` // surah, juz, page
	PageNumber      *int    `db:"page_number"`
	StartAyah       *int    `db:"start_ayah"`
	EndAyah         *int    `db:"end_ayah"`
	Score           float64 `db:"score"`
	Notes           string  `db:"notes"`
	TestDate        string  `db:"test_date"`
	IsActive        bool    `db:"is_active"`
	CreatedAt       string  `db:"created_at"`
	UpdatedAt       string  `db:"updated_at"`
}

// MemorizationWithDetails represents a memorization with related data
type MemorizationWithDetails struct {
	Memorization
	StudentName     string  `db:"student_name"`
	TeacherName     string  `db:"teacher_name"`
	SurahNumber     *int    `db:"surah_number"`
	SurahName       *string `db:"surah_name"`
	SurahNameIndo   *string `db:"surah_name_indo"`
	JuzNumber       *int    `db:"juz_number"`
}

// Create inserts a new memorization record
func (r *MemorizationRepository) Create(ctx context.Context, mem *Memorization) error {
	query := `
		INSERT INTO memorization (id, student_id, teacher_id, surah_id, juz_id, unit_type,
			page_number, start_ayah, end_ayah, score, notes, test_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`

	mem.ID = uuid.New().String()

	err := r.db.QueryRowContext(ctx, query,
		mem.ID, mem.StudentID, mem.TeacherID, mem.SurahID, mem.JuzID, mem.UnitType,
		mem.PageNumber, mem.StartAyah, mem.EndAyah, mem.Score, mem.Notes, mem.TestDate,
	).Scan(&mem.ID, &mem.CreatedAt, &mem.UpdatedAt)

	return err
}

// GetByID retrieves a memorization by ID
func (r *MemorizationRepository) GetByID(ctx context.Context, id string) (*MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_number, m.start_ayah, m.end_ayah, m.score, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.name as teacher_name,
			sur.number as surah_number, sur.name as surah_name, sur.name_indo as surah_name_indo,
			j.number as juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.id
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
func (r *MemorizationRepository) GetByStudentID(ctx context.Context, studentID string) ([]MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_number, m.start_ayah, m.end_ayah, m.score, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.name as teacher_name,
			sur.number as surah_number, sur.name as surah_name, sur.name_indo as surah_name_indo,
			j.number as juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.id
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
func (r *MemorizationRepository) GetByTeacherID(ctx context.Context, teacherID string) ([]MemorizationWithDetails, error) {
	query := `
		SELECT m.id, m.student_id, m.teacher_id, m.surah_id, m.juz_id, m.unit_type,
			m.page_number, m.start_ayah, m.end_ayah, m.score, m.notes, m.test_date,
			m.is_active, m.created_at, m.updated_at,
			s.name as student_name, t.name as teacher_name,
			sur.number as surah_number, sur.name as surah_name, sur.name_indo as surah_name_indo,
			j.number as juz_number
		FROM memorization m
		JOIN students s ON m.student_id = s.id
		JOIN teachers t ON m.teacher_id = t.id
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
