package repository

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
)

// ClassQuranTeacher represents a Quran teacher assignment to a class
type ClassQuranTeacher struct {
	ID              int     `db:"id"`
	ClassID         int     `db:"class_id"`
	QuranTeacherID  int     `db:"quran_teacher_id"`
	AcademicYear    string  `db:"academic_year"`
	StartDate       time.Time `db:"start_date"`
	EndDate         *time.Time `db:"end_date"`
	IsActive        bool    `db:"is_active"`
	Notes           *string `db:"notes"`
	CreatedBy       *int    `db:"created_by"`
	CreatedAt       time.Time `db:"created_at"`
	UpdatedAt       time.Time `db:"updated_at"`
}

// ClassQuranTeacherRepository handles class_quran_teachers data operations
type ClassQuranTeacherRepository struct {
	db *sqlx.DB
}

// NewClassQuranTeacherRepository creates a new class_quran_teachers repository
func NewClassQuranTeacherRepository(db *sqlx.DB) *ClassQuranTeacherRepository {
	return &ClassQuranTeacherRepository{db: db}
}

// GetActiveByClassAndYear returns active Quran teacher for a class in specific academic year
func (r *ClassQuranTeacherRepository) GetActiveByClassAndYear(ctx context.Context, classID int, academicYear string) (*ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, quran_teacher_id, academic_year,
		       start_date, end_date, is_active, notes, created_by, created_at, updated_at
		FROM class_quran_teachers
		WHERE class_id = $1 AND academic_year = $2 AND is_active = true
	`

	var cqt ClassQuranTeacher
	err := r.db.GetContext(ctx, &cqt, query, classID, academicYear)
	if err != nil {
		return nil, err
	}

	return &cqt, nil
}

// GetActiveByTeacher returns all active classes for a teacher in current academic year
func (r *ClassQuranTeacherRepository) GetActiveByTeacher(ctx context.Context, teacherID int, academicYear string) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, quran_teacher_id, academic_year,
		       start_date, end_date, is_active, notes, created_by, created_at, updated_at
		FROM class_quran_teachers
		WHERE quran_teacher_id = $1 AND academic_year = $2 AND is_active = true
		ORDER BY class_id
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, teacherID, academicYear)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// GetAllActiveByTeacher returns all active classes for a teacher (any year)
func (r *ClassQuranTeacherRepository) GetAllActiveByTeacher(ctx context.Context, teacherID int) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, quran_teacher_id, academic_year,
		       start_date, end_date, is_active, notes, created_by, created_at, updated_at
		FROM class_quran_teachers
		WHERE quran_teacher_id = $1 AND is_active = true
		ORDER BY academic_year DESC, class_id
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, teacherID)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// GetHistoryByClass returns all teacher assignments for a class (including inactive)
func (r *ClassQuranTeacherRepository) GetHistoryByClass(ctx context.Context, classID int) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, quran_teacher_id, academic_year,
		       start_date, end_date, is_active, notes, created_by, created_at, updated_at
		FROM class_quran_teachers
		WHERE class_id = $1
		ORDER BY academic_year DESC, start_date DESC
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, classID)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// Create creates a new Quran teacher assignment
func (r *ClassQuranTeacherRepository) Create(ctx context.Context, cqt *ClassQuranTeacher) error {
	query := `
		INSERT INTO class_quran_teachers
		(class_id, quran_teacher_id, academic_year, start_date, is_active, notes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		cqt.ClassID,
		cqt.QuranTeacherID,
		cqt.AcademicYear,
		cqt.StartDate,
		cqt.IsActive,
		cqt.Notes,
		cqt.CreatedBy,
	).Scan(&cqt.ID, &cqt.CreatedAt, &cqt.UpdatedAt)

	if err != nil {
		return err
	}

	return nil
}

// EndAssignment marks current assignment as inactive and sets end_date
func (r *ClassQuranTeacherRepository) EndAssignment(ctx context.Context, id int, notes *string) error {
	query := `
		UPDATE class_quran_teachers
		SET is_active = false,
		    end_date = CURRENT_DATE,
		    notes = $2,
		    updated_at = NOW()
		WHERE id = $1 AND is_active = true
	`

	_, err := r.db.ExecContext(ctx, query, id, notes)
	return err
}

// UpdateNotes updates the notes for an assignment
func (r *ClassQuranTeacherRepository) UpdateNotes(ctx context.Context, id int, notes string) error {
	query := `
		UPDATE class_quran_teachers
		SET notes = $2,
		    updated_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, id, notes)
	return err
}
