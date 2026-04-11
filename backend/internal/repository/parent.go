package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// ParentRepository handles parent data operations
type ParentRepository struct {
	db *sqlx.DB
}

// NewParentRepository creates a new parent repository
func NewParentRepository(db *sqlx.DB) *ParentRepository {
	return &ParentRepository{db: db}
}

// Parent represents a parent in the system
type Parent struct {
	UserID    string `db:"user_id"`
	FullName  string `db:"full_name"`
	Phone     string `db:"phone"`
	Gender    string `db:"gender"`
	CreatedAt string `db:"created_at"`
}

// ParentWithUser represents a parent with user information
type ParentWithUser struct {
	Parent
	Email string `db:"email"`
}

// GetByUserID retrieves a parent by user ID
func (r *ParentRepository) GetByUserID(ctx context.Context, userID string) (*ParentWithUser, error) {
	query := `
		SELECT p.user_id, p.full_name, p.phone, p.gender, p.created_at, u.email
		FROM parents p
		JOIN users u ON p.user_id = u.id
		WHERE p.user_id = $1
	`

	var parent ParentWithUser
	err := r.db.GetContext(ctx, &parent, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &parent, nil
}

// GetByID retrieves a parent by ID (user_id)
func (r *ParentRepository) GetByID(ctx context.Context, id string) (*ParentWithUser, error) {
	query := `
		SELECT p.user_id, p.full_name, p.phone, p.gender, p.created_at, u.email
		FROM parents p
		JOIN users u ON p.user_id = u.id
		WHERE p.user_id = $1
	`

	var parent ParentWithUser
	err := r.db.GetContext(ctx, &parent, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &parent, nil
}

// GetAll retrieves all parents with optional search
func (r *ParentRepository) GetAll(ctx context.Context, search string) ([]ParentWithUser, error) {
	query := `
		SELECT p.user_id, p.full_name, p.phone, p.gender, p.created_at, u.email
		FROM parents p
		JOIN users u ON p.user_id = u.id
	`

	args := []interface{}{}
	if search != "" {
		query += " WHERE p.full_name ILIKE $1 OR u.email ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY p.full_name"

	var parents []ParentWithUser
	err := r.db.SelectContext(ctx, &parents, query, args...)
	if err != nil {
		return nil, err
	}

	return parents, nil
}

// Create creates a new parent (user account must be created first)
func (r *ParentRepository) Create(ctx context.Context, parent *Parent) error {
	query := `
		INSERT INTO parents (user_id, full_name, phone, gender)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.db.ExecContext(ctx, query, parent.UserID, parent.FullName, parent.Phone, parent.Gender)
	return err
}

// Update updates a parent
func (r *ParentRepository) Update(ctx context.Context, userID string, parent *Parent) error {
	query := `
		UPDATE parents
		SET full_name = $1, phone = $2, gender = $3
		WHERE user_id = $4
	`

	_, err := r.db.ExecContext(ctx, query, parent.FullName, parent.Phone, parent.Gender, userID)
	return err
}

// Delete deletes a parent (cascades to user account)
func (r *ParentRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM parents WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
