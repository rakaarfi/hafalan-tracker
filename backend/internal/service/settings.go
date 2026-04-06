package service

import (
	"context"
	"errors"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// SettingsService handles settings business logic
type SettingsService struct {
	settingsRepo *repository.SettingsRepository
	userRepo     *repository.UserRepository
}

// NewSettingsService creates a new settings service
func NewSettingsService(settingsRepo *repository.SettingsRepository, userRepo *repository.UserRepository) *SettingsService {
	return &SettingsService{
		settingsRepo: settingsRepo,
		userRepo:     userRepo,
	}
}

// UpdateSettingsRequest represents the request to update settings
type UpdateSettingsRequest struct {
	SchoolName    string  `json:"school_name" binding:"required"`
	SchoolAddress *string `json:"school_address"`
	SchoolPhone   *string `json:"school_phone"`
	SchoolEmail   *string `json:"school_email"`
	AcademicYear  string  `json:"academic_year" binding:"required"`
}

// UpdateSettings updates school settings
func (s *SettingsService) UpdateSettings(ctx context.Context, req *UpdateSettingsRequest) (*repository.SchoolSettings, error) {
	settings := &repository.SchoolSettings{
		SchoolName:    req.SchoolName,
		SchoolAddress: req.SchoolAddress,
		SchoolPhone:   req.SchoolPhone,
		SchoolEmail:   req.SchoolEmail,
		AcademicYear:  req.AcademicYear,
		SchoolLogo:    nil,
	}

	err := s.settingsRepo.Update(ctx, settings)
	if err != nil {
		return nil, errors.New("failed to update settings")
	}

	// Return updated settings
	return s.settingsRepo.Get(ctx)
}

// GetSettings retrieves current settings
func (s *SettingsService) GetSettings(ctx context.Context) (*repository.SchoolSettings, error) {
	settings, err := s.settingsRepo.Get(ctx)
	if err != nil {
		return nil, errors.New("failed to retrieve settings")
	}

	return settings, nil
}

// ResetPasswordRequest represents the request to reset a user's password
type ResetPasswordRequest struct {
	UserID   string `json:"user_id" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

// ResetPassword resets a user's password (admin only)
func (s *SettingsService) ResetPassword(ctx context.Context, req *ResetPasswordRequest) error {
	// Verify user exists
	user, err := s.userRepo.GetByID(ctx, req.UserID)
	if err != nil {
		return errors.New("failed to retrieve user")
	}
	if user == nil {
		return errors.New("user not found")
	}

	// Update password
	err = s.userRepo.UpdatePassword(ctx, req.UserID, req.Password)
	if err != nil {
		return errors.New("failed to update password")
	}

	return nil
}

// ChangePasswordRequest represents the request to change own password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// ChangePassword allows a user to change their own password
func (s *SettingsService) ChangePassword(ctx context.Context, userID string, req *ChangePasswordRequest) error {
	// Get current user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return errors.New("failed to retrieve user")
	}
	if user == nil {
		return errors.New("user not found")
	}

	// Verify current password
	// In production, you should compare hashed passwords
	if user.Password != req.CurrentPassword {
		return errors.New("current password is incorrect")
	}

	// Update password
	err = s.userRepo.UpdatePassword(ctx, userID, req.NewPassword)
	if err != nil {
		return errors.New("failed to update password")
	}

	return nil
}

// UpdateProfileRequest represents the request to update user profile
type UpdateProfileRequest struct {
	Email string `json:"email" binding:"required,email"`
	Phone string `json:"phone"`
}

// UpdateProfile updates a user's profile information
func (s *SettingsService) UpdateProfile(ctx context.Context, userID string, req *UpdateProfileRequest, role string) error {
	// Determine which profile table to update based on role
	if role == "teacher" {
		// Update teacher profile
		query := `UPDATE teachers SET phone = $1 WHERE user_id = $2`
		_, err := s.userRepo.DB().ExecContext(ctx, query, req.Phone, userID)
		if err != nil {
			return errors.New("failed to update teacher profile")
		}
	} else if role == "parent" {
		// Update parent profile
		query := `UPDATE parents SET phone = $1 WHERE user_id = $2`
		_, err := s.userRepo.DB().ExecContext(ctx, query, req.Phone, userID)
		if err != nil {
			return errors.New("failed to update parent profile")
		}
	}

	// Update user email
	err := s.userRepo.UpdateEmail(ctx, userID, req.Email)
	if err != nil {
		return errors.New("failed to update user email")
	}

	return nil
}
