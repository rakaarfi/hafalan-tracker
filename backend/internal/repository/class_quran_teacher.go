package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// ClassQuranTeacher represents a Quran teacher assignment to a class
type ClassQuranTeacher struct {
	ID         int     `db:"id"`
	ClassID    int     `db:"class_id"`
	TeacherID  int     `db:"teacher_id"`
	AssignedAt string  `db:"assigned_at"`
}

// ClassQuranTeacherRepository handles class_quran_teachers data operations
type ClassQuranTeacherRepository struct {
	db *sqlx.DB
}

// NewClassQuranTeacherRepository creates a new class_quran_teachers repository
func NewClassQuranTeacherRepository(db *sqlx.DB) *ClassQuranTeacherRepository {
	return &ClassQuranTeacherRepository{db: db}
}

// GetHistoryByClass returns all teacher assignments for a class
func (r *ClassQuranTeacherRepository) GetHistoryByClass(ctx context.Context, classID int) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, teacher_id, assigned_at
		FROM class_quran_teachers
		WHERE class_id = $1
		ORDER BY assigned_at DESC
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, classID)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// GetActiveByClass returns active Quran teacher assignments for a class
func (r *ClassQuranTeacherRepository) GetActiveByClass(ctx context.Context, classID int) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, teacher_id, assigned_at
		FROM class_quran_teachers
		WHERE class_id = $1
		ORDER BY assigned_at DESC
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, classID)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// GetActiveByTeacher returns all active classes for a teacher
func (r *ClassQuranTeacherRepository) GetActiveByTeacher(ctx context.Context, teacherID int) ([]ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, teacher_id, assigned_at
		FROM class_quran_teachers
		WHERE teacher_id = $1
		ORDER BY assigned_at DESC
	`

	var assignments []ClassQuranTeacher
	err := r.db.SelectContext(ctx, &assignments, query, teacherID)
	if err != nil {
		return nil, err
	}

	return assignments, nil
}

// Create creates a new Quran teacher assignment
func (r *ClassQuranTeacherRepository) Create(ctx context.Context, cqt *ClassQuranTeacher) error {
	query := `
		INSERT INTO class_quran_teachers (class_id, teacher_id)
		VALUES ($1, $2)
		RETURNING id, assigned_at
	`

	return r.db.QueryRowContext(ctx, query, cqt.ClassID, cqt.TeacherID).
		Scan(&cqt.ID, &cqt.AssignedAt)
}

// Delete deletes a Quran teacher assignment
func (r *ClassQuranTeacherRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM class_quran_teachers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByID retrieves a Quran teacher assignment by ID
func (r *ClassQuranTeacherRepository) GetByID(ctx context.Context, id int) (*ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, teacher_id, assigned_at
		FROM class_quran_teachers
		WHERE id = $1
	`

	var cqt ClassQuranTeacher
	err := r.db.GetContext(ctx, &cqt, query, id)
	if err != nil {
		return nil, err
	}

	return &cqt, nil
}

// GetByClassAndTeacher retrieves a specific assignment by class and teacher
func (r *ClassQuranTeacherRepository) GetByClassAndTeacher(ctx context.Context, classID, teacherID int) (*ClassQuranTeacher, error) {
	query := `
		SELECT id, class_id, teacher_id, assigned_at
		FROM class_quran_teachers
		WHERE class_id = $1 AND teacher_id = $2
	`

	var cqt ClassQuranTeacher
	err := r.db.GetContext(ctx, &cqt, query, classID, teacherID)
	if err != nil {
		return nil, err
	}

	return &cqt, nil
}
