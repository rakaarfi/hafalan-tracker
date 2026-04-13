package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/auth"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/util"
	"golang.org/x/crypto/bcrypt"
)

// TeacherService handles teacher business logic
type TeacherService struct {
	teacherRepo *repository.TeacherRepository
	userRepo    *repository.UserRepository
	jwtManager  *auth.JWTManager
}

// NewTeacherService creates a new teacher service
func NewTeacherService(teacherRepo *repository.TeacherRepository, userRepo *repository.UserRepository, jwtManager *auth.JWTManager) *TeacherService {
	return &TeacherService{
		teacherRepo: teacherRepo,
		userRepo:    userRepo,
		jwtManager:  jwtManager,
	}
}

// CreateTeacherRequest represents the request to create a teacher
type CreateTeacherRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password"`
}

// UpdateTeacherRequest represents the request to update a teacher
type UpdateTeacherRequest struct {
	UserID string `json:"user_id"`
	Name   string `json:"name" binding:"required"`
	Email  string `json:"email" binding:"required,email"`
	Phone  string `json:"phone"`
}

// Create creates a new teacher with user account
func (s *TeacherService) Create(ctx context.Context, req *CreateTeacherRequest) (*repository.TeacherWithUser, error) {
	// Check if email already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	// Normalize phone number to format 628xxxxxxxxxx
	normalizedPhone, err := util.NormalizePhoneNumber(req.Phone)
	if err != nil {
		return nil, fmt.Errorf("invalid phone number: %w", err)
	}

	// Generate password from phone if not provided
	password := req.Password
	if password == "" {
		password = util.GeneratePasswordFromPhone(normalizedPhone)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user account
	user := &repository.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		IsActive: true,
	}

	err = s.userRepo.Create(ctx, user, "teacher")
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Create teacher profile with normalized phone
	teacher := &repository.Teacher{
		UserID:   user.ID,
		FullName: req.Name,
		Phone:    normalizedPhone,
	}

	err = s.teacherRepo.Create(ctx, teacher)
	if err != nil {
		// Rollback user creation on failure
		s.userRepo.Delete(ctx, user.ID)
		return nil, fmt.Errorf("failed to create teacher: %w", err)
	}

	// Get the complete teacher with user info
	teacherWithUser, err := s.teacherRepo.GetByID(ctx, teacher.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created teacher: %w", err)
	}

	return teacherWithUser, nil
}

// Update updates an existing teacher
func (s *TeacherService) Update(ctx context.Context, req *UpdateTeacherRequest) (*repository.TeacherWithUser, error) {
	// Check if teacher exists
	existingTeacher, err := s.teacherRepo.GetByID(ctx, req.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve teacher: %w", err)
	}
	if existingTeacher == nil {
		return nil, errors.New("teacher not found")
	}

	// Check if email is being changed and if it already exists
	if existingTeacher.Email != req.Email {
		existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
		if err != nil {
			return nil, fmt.Errorf("failed to check existing email: %w", err)
		}
		if existingUser != nil && existingUser.ID != req.UserID {
			return nil, errors.New("email already exists")
		}

		// Update email in users table
		err = s.userRepo.UpdateEmail(ctx, req.UserID, req.Email)
		if err != nil {
			return nil, fmt.Errorf("failed to update email: %w", err)
		}
	}

	// Normalize phone number to format 628xxxxxxxxxx
	normalizedPhone, err := util.NormalizePhoneNumber(req.Phone)
	if err != nil {
		return nil, fmt.Errorf("invalid phone number: %w", err)
	}

	// Update teacher profile
	teacher := &repository.Teacher{
		UserID:   req.UserID,
		FullName: req.Name,
		Phone:    normalizedPhone,
	}

	err = s.teacherRepo.Update(ctx, req.UserID, teacher)
	if err != nil {
		return nil, fmt.Errorf("failed to update teacher: %w", err)
	}

	// Get the updated teacher with user info
	updatedTeacher, err := s.teacherRepo.GetByID(ctx, req.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated teacher: %w", err)
	}

	return updatedTeacher, nil
}

// Delete deletes a teacher (cascades to user account)
func (s *TeacherService) Delete(ctx context.Context, userID string) error {
	// Check if teacher exists
	existingTeacher, err := s.teacherRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to retrieve teacher: %w", err)
	}
	if existingTeacher == nil {
		return errors.New("teacher not found")
	}

	// Delete teacher (will cascade to user account)
	err = s.teacherRepo.Delete(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to delete teacher: %w", err)
	}

	return nil
}
