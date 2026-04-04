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
	ID        string `db:"id"`
	UserID    string `db:"user_id"`
	Phone     string `db:"phone"`
	Address   string `db:"address"`
	IsActive  bool   `db:"is_active"`
	CreatedAt string `db:"created_at"`
}

// ParentWithUser represents a parent with user information
type ParentWithUser struct {
	Parent
	Email string `db:"email"`
	Name  string `db:"name"`
}

// GetByUserID retrieves a parent by user ID
func (r *ParentRepository) GetByUserID(ctx context.Context, userID string) (*ParentWithUser, error) {
	query := `
		SELECT p.id, p.user_id, p.phone, p.address, p.is_active, p.created_at, u.email, u.name
		FROM parents p
		JOIN users u ON p.user_id = u.id
		WHERE p.user_id = $1 AND p.is_active = true
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

// GetByID retrieves a parent by ID
func (r *ParentRepository) GetByID(ctx context.Context, id string) (*ParentWithUser, error) {
	query := `
		SELECT p.id, p.user_id, p.phone, p.address, p.is_active, p.created_at, u.email, u.name
		FROM parents p
		JOIN users u ON p.user_id = u.id
		WHERE p.id = $1 AND p.is_active = true
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
