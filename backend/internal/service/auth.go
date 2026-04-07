package service

import (
	"context"
	"errors"

	"golang.org/x/crypto/bcrypt"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/auth"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// AuthService handles authentication operations
type AuthService struct {
	userRepo   *repository.UserRepository
	jwtManager *auth.JWTManager
}

// NewAuthService creates a new authentication service
func NewAuthService(userRepo *repository.UserRepository, jwtManager *auth.JWTManager) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents a login response
type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

// UserResponse represents user information in responses
type UserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.jwtManager.Generate(user.ID, user.RoleName, user.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Role:  user.RoleName,
		},
	}, nil
}

// ValidateToken validates a JWT token and returns the user claims
func (s *AuthService) ValidateToken(tokenString string) (*auth.Claims, error) {
	return s.jwtManager.Validate(tokenString)
}

// RegisterTeacherRequest represents a teacher registration request
type RegisterTeacherRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone"`
}

// RegisterTeacher registers a new teacher
func (s *AuthService) RegisterTeacher(ctx context.Context, req *RegisterTeacherRequest) (*UserResponse, error) {
	// TODO: Implement teacher registration
	// For now, return a placeholder response
	return &UserResponse{
		ID:    "0",
		Email: req.Email,
		Role:  "teacher",
	}, nil
}

// RegisterParentRequest represents a parent registration request
type RegisterParentRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone"`
}

// RegisterParent registers a new parent
func (s *AuthService) RegisterParent(ctx context.Context, req *RegisterParentRequest) (*UserResponse, error) {
	// TODO: Implement parent registration
	// For now, return a placeholder response
	return &UserResponse{
		ID:    "0",
		Email: req.Email,
		Role:  "parent",
	}, nil
}

// ChangePassword changes a user's password
func (s *AuthService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
	// TODO: Implement password change with proper bcrypt hashing
	return nil
}

// ResetPassword resets a user's password to a default value
func (s *AuthService) ResetPassword(ctx context.Context, userID string) error {
	// TODO: Implement password reset
	return nil
}
