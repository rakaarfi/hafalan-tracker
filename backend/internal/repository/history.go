package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// HistoryRepository handles memorization history data operations
type HistoryRepository struct {
	db *sqlx.DB
}

// NewHistoryRepository creates a new history repository
func NewHistoryRepository(db *sqlx.DB) *HistoryRepository {
	return &HistoryRepository{db: db}
}

// MemorizationHistory represents a historical record of memorization changes
type MemorizationHistory struct {
	ID              string  `db:"id"`
	MemorizationID  string  `db:"memorization_id"`
	StudentID       string  `db:"student_id"`
	TeacherID       string  `db:"teacher_id"`
	SurahID         *string `db:"surah_id"`
	JuzID           *string `db:"juz_id"`
	UnitType        string  `db:"unit_type"`
	PageNumber      *int    `db:"page_number"`
	StartAyah       *int    `db:"start_ayah"`
	EndAyah         *int    `db:"end_ayah"`
	Score           float64 `db:"score"`
	Notes           string  `db:"notes"`
	TestDate        string  `db:"test_date"`
	ChangeType      string  `db:"change_type"` // created, updated
	ChangedBy       string  `db:"changed_by"`
	CreatedAt       string  `db:"created_at"`
}

// CreateHistory creates a new history record
func (r *HistoryRepository) CreateHistory(ctx context.Context, history *MemorizationHistory) error {
	query := `
		INSERT INTO memorization_history (id, memorization_id, student_id, teacher_id,
			surah_id, juz_id, unit_type, page_number, start_ayah, end_ayah,
			score, notes, test_date, change_type, changed_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	history.ID = uuid.New().String()

	_, err := r.db.ExecContext(ctx, query,
		history.ID, history.MemorizationID, history.StudentID, history.TeacherID,
		history.SurahID, history.JuzID, history.UnitType, history.PageNumber,
		history.StartAyah, history.EndAyah, history.Score, history.Notes,
		history.TestDate, history.ChangeType, history.ChangedBy,
	)

	return err
}

// GetByMemorizationID retrieves all history records for a memorization
func (r *HistoryRepository) GetByMemorizationID(ctx context.Context, memorizationID string) ([]MemorizationHistory, error) {
	query := `
		SELECT id, memorization_id, student_id, teacher_id, surah_id, juz_id,
			unit_type, page_number, start_ayah, end_ayah, score, notes, test_date,
			change_type, changed_by, created_at
		FROM memorization_history
		WHERE memorization_id = $1
		ORDER BY created_at DESC
	`

	var history []MemorizationHistory
	err := r.db.SelectContext(ctx, &history, query, memorizationID)
	if err != nil {
		return nil, err
	}

	return history, nil
}

// GetByStudentID retrieves all history records for a student
func (r *HistoryRepository) GetByStudentID(ctx context.Context, studentID string) ([]MemorizationHistory, error) {
	query := `
		SELECT id, memorization_id, student_id, teacher_id, surah_id, juz_id,
			unit_type, page_number, start_ayah, end_ayah, score, notes, test_date,
			change_type, changed_by, created_at
		FROM memorization_history
		WHERE student_id = $1
		ORDER BY created_at DESC
	`

	var history []MemorizationHistory
	err := r.db.SelectContext(ctx, &history, query, studentID)
	if err != nil {
		return nil, err
	}

	return history, nil
}
