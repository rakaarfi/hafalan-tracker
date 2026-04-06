package repository

import (
	"context"

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
	ID             int     `db:"id"`
	MemorizationID int     `db:"memorization_id"`
	StudentID      int     `db:"student_id"`
	TeacherID      int     `db:"teacher_id"`
	OldStatus      *string `db:"old_status"`
	NewStatus      string  `db:"new_status"`
	Notes          string  `db:"notes"`
	ChangedAt      string  `db:"changed_at"`
}

// CreateHistory creates a new history record
func (r *HistoryRepository) CreateHistory(ctx context.Context, history *MemorizationHistory) error {
	query := `
		INSERT INTO memorization_history (memorization_id, student_id, teacher_id,
			old_status, new_status, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, changed_at
	`

	err := r.db.QueryRowContext(ctx, query,
		history.MemorizationID, history.StudentID, history.TeacherID,
		history.OldStatus, history.NewStatus, history.Notes,
	).Scan(&history.ID, &history.ChangedAt)

	return err
}

// GetByMemorizationID retrieves all history records for a memorization
func (r *HistoryRepository) GetByMemorizationID(ctx context.Context, memorizationID int) ([]MemorizationHistory, error) {
	query := `
		SELECT id, memorization_id, student_id, teacher_id,
			old_status, new_status, notes, changed_at
		FROM memorization_history
		WHERE memorization_id = $1
		ORDER BY changed_at DESC
	`

	var history []MemorizationHistory
	err := r.db.SelectContext(ctx, &history, query, memorizationID)
	if err != nil {
		return nil, err
	}

	return history, nil
}

// GetByStudentID retrieves all history records for a student
func (r *HistoryRepository) GetByStudentID(ctx context.Context, studentID int) ([]MemorizationHistory, error) {
	query := `
		SELECT id, memorization_id, student_id, teacher_id,
			old_status, new_status, notes, changed_at
		FROM memorization_history
		WHERE student_id = $1
		ORDER BY changed_at DESC
	`

	var history []MemorizationHistory
	err := r.db.SelectContext(ctx, &history, query, studentID)
	if err != nil {
		return nil, err
	}

	return history, nil
}
