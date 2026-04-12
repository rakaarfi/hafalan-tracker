package repository

import (
	"github.com/jmoiron/sqlx"
	"context"
	"database/sql"
	"fmt"
)

// Class represents a class
type Class struct {
	ID            string  `db:"id" json:"id"`
	Name          string  `db:"name" json:"name"`
	TeacherID     *string `db:"teacher_id" json:"teacher_id"`
	TeacherName   *string `db:"teacher_name" json:"teacher_name"`
	StudentsCount int     `db:"students_count" json:"students_count"`
	CreatedAt     string  `db:"created_at" json:"created_at"`
}

// ClassRepository handles class data operations
type ClassRepository struct {
	db *sqlx.DB
}

// NewClassRepository creates a new class repository
func NewClassRepository(db *sqlx.DB) *ClassRepository {
	return &ClassRepository{db: db}
}

// GetAll retrieves all classes
func (r *ClassRepository) GetAll(ctx context.Context, search string) ([]Class, error) {
	query := `
		SELECT
			c.id, c.name, c.teacher_id,
			t.full_name as teacher_name,
			COUNT(s.id) as students_count,
			c.created_at
		FROM classes c
		LEFT JOIN teachers t ON c.teacher_id = t.user_id
		LEFT JOIN students s ON s.class_id = c.id
	`

	args := []interface{}{}
	if search != "" {
		query += " WHERE c.name ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " GROUP BY c.id, c.name, c.teacher_id, t.full_name, c.created_at ORDER BY c.name"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []Class
	for rows.Next() {
		var c Class
		err := rows.Scan(
			&c.ID, &c.Name, &c.GradeLevel, &c.HomeroomTeacherID,
			&c.TeacherName,
			&c.StudentsCount,
			&c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		classes = append(classes, c)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return classes, nil
}

// GetByID retrieves a class by ID
func (r *ClassRepository) GetByID(ctx context.Context, id string) (*Class, error) {
	query := `
		SELECT
			c.id, c.name, c.teacher_id,
			t.full_name as teacher_name,
			COUNT(s.id) as students_count,
			c.created_at
		FROM classes c
		LEFT JOIN teachers t ON c.teacher_id = t.user_id
		LEFT JOIN students s ON s.class_id = c.id
		WHERE c.id = $1
		GROUP BY c.id, c.name, c.teacher_id, t.full_name, c.created_at
	`

	var c Class
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.GradeLevel, &c.HomeroomTeacherID,
		&c.TeacherName,
		&c.StudentsCount,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("class not found")
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

// Create creates a new class
func (r *ClassRepository) Create(ctx context.Context, req *struct {
	Name     string
	TeacherID *string
}) (*Class, error) {
	query := `
		INSERT INTO classes (name, teacher_id)
		VALUES ($1, $2)
		RETURNING id, name, teacher_id, created_at
	`

	var c Class
	err := r.db.QueryRowContext(ctx, query, req.Name, req.TeacherID).Scan(
		&c.ID, &c.Name, &c.TeacherID, &c.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &c, nil
}

// Update updates a class
func (r *ClassRepository) Update(ctx context.Context, id string, req *struct {
	Name         string
		TeacherID *string
}) (*Class, error) {
	query := `
		UPDATE classes
		SET name = $1, grade_level = $2, homeroom_teacher_id = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING id, name, teacher_id, created_at, updated_at
	`

	var c Class
	err := r.db.QueryRowContext(ctx, query, req.Name, req.TeacherID, id).Scan(
		&c.ID, &c.Name, &c.TeacherID, &c.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("class not found")
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

// Delete deletes a class
func (r *ClassRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM classes WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("class not found")
	}

	return nil
}
