package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *sqlx.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

// User represents a user in the system
type User struct {
	ID        string `db:"id"`
	Email     string `db:"email"`
	Password  string `db:"password_hash"`
	RoleID    string `db:"role_id"`
	IsActive  bool   `db:"is_active"`
	CreatedAt string `db:"created_at"`
}

// UserWithRole represents a user with role information
type UserWithRole struct {
	User
	RoleName string `db:"role_name"`
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*UserWithRole, error) {
	query := `
		SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, u.created_at, r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE u.email = $1 AND u.is_active = true
	`

	var user UserWithRole
	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}

	return &user, nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*UserWithRole, error) {
	query := `
		SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, u.created_at, r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1 AND u.is_active = true
	`

	var user UserWithRole
	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}

	return &user, nil
}
