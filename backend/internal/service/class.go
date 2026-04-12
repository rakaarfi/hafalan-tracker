package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// ClassService handles class business logic
type ClassService struct {
	classRepo   *repository.ClassRepository
	teacherRepo *repository.TeacherRepository
}

// NewClassService creates a new class service
func NewClassService(classRepo *repository.ClassRepository, teacherRepo *repository.TeacherRepository) *ClassService {
	return &ClassService{
		classRepo:   classRepo,
		teacherRepo: teacherRepo,
	}
}

// CreateClassRequest represents the request to create a class
type CreateClassRequest struct {
	Name      string  `json:"name" binding:"required"`
	TeacherID *string `json:"teacher_id"`
}

// UpdateClassRequest represents the request to update a class
type UpdateClassRequest struct {
	ID        string  `json:"id" binding:"required"`
	Name      string  `json:"name" binding:"required"`
	TeacherID *string `json:"teacher_id"`
}

// Create creates a new class
func (s *ClassService) Create(ctx context.Context, req *CreateClassRequest) (*repository.Class, error) {
	// Validate teacher if provided
	if req.TeacherID != nil {
		teacher, err := s.teacherRepo.GetByID(ctx, *req.TeacherID)
		if err != nil {
			return nil, fmt.Errorf("failed to verify teacher: %w", err)
		}
		if teacher == nil {
			return nil, errors.New("teacher not found")
		}
	}

	// Create class
	createReq := &struct {
		Name      string
		TeacherID *string
	}{
		Name:      req.Name,
		TeacherID: req.TeacherID,
	}

	class, err := s.classRepo.Create(ctx, createReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create class: %w", err)
	}

	return class, nil
}

// Update updates an existing class
func (s *ClassService) Update(ctx context.Context, req *UpdateClassRequest) (*repository.Class, error) {
	// Check if class exists
	existingClass, err := s.classRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve class: %w", err)
	}
	if existingClass == nil {
		return nil, errors.New("class not found")
	}

	// Validate teacher if provided
	if req.TeacherID != nil {
		teacher, err := s.teacherRepo.GetByID(ctx, *req.TeacherID)
		if err != nil {
			return nil, fmt.Errorf("failed to verify teacher: %w", err)
		}
		if teacher == nil {
			return nil, errors.New("teacher not found")
		}
	}

	// Update class
	updateReq := &struct {
		Name      string
		TeacherID *string
	}{
		Name:      req.Name,
		TeacherID: req.TeacherID,
	}

	class, err := s.classRepo.Update(ctx, req.ID, updateReq)
	if err != nil {
		return nil, fmt.Errorf("failed to update class: %w", err)
	}

	return class, nil
}

// Delete deletes a class
func (s *ClassService) Delete(ctx context.Context, id string) error {
	// Check if class exists
	existingClass, err := s.classRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to retrieve class: %w", err)
	}
	if existingClass == nil {
		return errors.New("class not found")
	}

	// Delete class
	err = s.classRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete class: %w", err)
	}

	return nil
}
