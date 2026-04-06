package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// TeacherRepository handles teacher data operations
type TeacherRepository struct {
	db *sqlx.DB
}

// NewTeacherRepository creates a new teacher repository
func NewTeacherRepository(db *sqlx.DB) *TeacherRepository {
	return &TeacherRepository{db: db}
}

// Teacher represents a teacher in the system
type Teacher struct {
	UserID    string `db:"user_id"`
	FullName  string `db:"full_name"`
	Phone     string `db:"phone"`
	CreatedAt string `db:"created_at"`
}

// TeacherWithUser represents a teacher with user information
type TeacherWithUser struct {
	Teacher
	Email string `db:"email"`
}

// GetByUserID retrieves a teacher by user ID
func (r *TeacherRepository) GetByUserID(ctx context.Context, userID string) (*TeacherWithUser, error) {
	query := `
		SELECT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		WHERE t.user_id = $1
	`

	var teacher TeacherWithUser
	err := r.db.GetContext(ctx, &teacher, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &teacher, nil
}

// GetByID retrieves a teacher by ID (user_id)
func (r *TeacherRepository) GetByID(ctx context.Context, id string) (*TeacherWithUser, error) {
	return r.GetByUserID(ctx, id)
}

// GetAll retrieves all teachers with optional search
func (r *TeacherRepository) GetAll(ctx context.Context, search string) ([]TeacherWithUser, error) {
	query := `
		SELECT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	`

	args := []interface{}{}
	if search != "" {
		query += " WHERE t.full_name ILIKE $1 OR u.email ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY t.full_name"

	var teachers []TeacherWithUser
	err := r.db.SelectContext(ctx, &teachers, query, args...)
	if err != nil {
		return nil, err
	}

	return teachers, nil
}

// Create creates a new teacher (user account must be created first)
func (r *TeacherRepository) Create(ctx context.Context, teacher *Teacher) error {
	query := `
		INSERT INTO teachers (user_id, full_name, phone)
		VALUES ($1, $2, $3)
	`

	_, err := r.db.ExecContext(ctx, query, teacher.UserID, teacher.FullName, teacher.Phone)
	return err
}

// Update updates a teacher
func (r *TeacherRepository) Update(ctx context.Context, userID string, teacher *Teacher) error {
	query := `
		UPDATE teachers
		SET full_name = $1, phone = $2
		WHERE user_id = $3
	`

	_, err := r.db.ExecContext(ctx, query, teacher.FullName, teacher.Phone, userID)
	return err
}

// Delete deletes a teacher (cascades to user account)
func (r *TeacherRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM teachers WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
