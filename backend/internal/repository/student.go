package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// StudentRepository handles student data operations
type StudentRepository struct {
	db *sqlx.DB
}

// NewStudentRepository creates a new student repository
func NewStudentRepository(db *sqlx.DB) *StudentRepository {
	return &StudentRepository{db: db}
}

// Student represents a student in the system
type Student struct {
	ID        string `db:"id"`
	Name      string `db:"name"`
	ClassID   string `db:"class_id"`
	IsActive  bool   `db:"is_active"`
	CreatedAt string `db:"created_at"`
}

// StudentWithClass represents a student with class information
type StudentWithClass struct {
	Student
	ClassName string `db:"class_name"`
}

// GetByID retrieves a student by ID
func (r *StudentRepository) GetByID(ctx context.Context, id string) (*StudentWithClass, error) {
	query := `
		SELECT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE s.id = $1 AND s.is_active = true
	`

	var student StudentWithClass
	err := r.db.GetContext(ctx, &student, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &student, nil
}

// GetByParentID retrieves all students for a parent
func (r *StudentRepository) GetByParentID(ctx context.Context, parentID string) ([]StudentWithClass, error) {
	query := `
		SELECT DISTINCT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		JOIN student_parents sp ON s.id = sp.student_id
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE sp.parent_id = $1 AND s.is_active = true AND sp.is_active = true
		ORDER BY s.name
	`

	var students []StudentWithClass
	err := r.db.SelectContext(ctx, &students, query, parentID)
	if err != nil {
		return nil, err
	}

	return students, nil
}

// GetByClassID retrieves all students for a class
func (r *StudentRepository) GetByClassID(ctx context.Context, classID string) ([]StudentWithClass, error) {
	query := `
		SELECT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE s.class_id = $1 AND s.is_active = true
		ORDER BY s.name
	`

	var students []StudentWithClass
	err := r.db.SelectContext(ctx, &students, query, classID)
	if err != nil {
		return nil, err
	}

	return students, nil
}
