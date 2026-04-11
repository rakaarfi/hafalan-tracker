package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// RoleRepository handles role data operations
type RoleRepository struct {
	db *sqlx.DB
}

// NewRoleRepository creates a new role repository
func NewRoleRepository(db *sqlx.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

// Role represents a role in the system
type Role struct {
	ID          int     `db:"id"`
	Name        string  `db:"name"`
	Description *string `db:"description"`
}

// GetByName retrieves a role by name
func (r *RoleRepository) GetByName(ctx context.Context, name string) (*Role, error) {
	query := `
		SELECT id, name, description
		FROM roles
		WHERE name = $1
	`

	var role Role
	err := r.db.GetContext(ctx, &role, query, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Role not found
		}
		return nil, err
	}

	return &role, nil
}

// GetByID retrieves a role by ID
func (r *RoleRepository) GetByID(ctx context.Context, id string) (*Role, error) {
	query := `
		SELECT id, name, description
		FROM roles
		WHERE id = $1
	`

	var role Role
	err := r.db.GetContext(ctx, &role, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Role not found
		}
		return nil, err
	}

	return &role, nil
}
