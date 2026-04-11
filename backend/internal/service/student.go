package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// StudentService handles student business logic
type StudentService struct {
	studentRepo *repository.StudentRepository
	parentRepo  *repository.ParentRepository
}

// NewStudentService creates a new student service
func NewStudentService(studentRepo *repository.StudentRepository, parentRepo *repository.ParentRepository) *StudentService {
	return &StudentService{
		studentRepo: studentRepo,
		parentRepo:  parentRepo,
	}
}

// CreateStudentRequest represents the request to create a student
type CreateStudentRequest struct {
	Name      string   `json:"name" binding:"required"`
	ClassID   string   `json:"class_id"`
	ParentID1 string   `json:"parent_id_1" binding:"required"`
	ParentID2 string   `json:"parent_id_2"`
}

// UpdateStudentRequest represents the request to update a student
type UpdateStudentRequest struct {
	ID        string   `json:"id"`
	Name      string   `json:"name" binding:"required"`
	ClassID   string   `json:"class_id"`
	ParentID1 string   `json:"parent_id_1"`
	ParentID2 string   `json:"parent_id_2"`
	BirthDate string   `json:"birth_date"`
}

// Create creates a new student with parent relationships
func (s *StudentService) Create(ctx context.Context, req *CreateStudentRequest) (*repository.StudentWithClass, error) {
	// Validate parents exist
	if req.ParentID1 != "" {
		parent1, err := s.parentRepo.GetByID(ctx, req.ParentID1)
		if err != nil {
			return nil, fmt.Errorf("parent 1 not found: %w", err)
		}
		if parent1 == nil {
			return nil, errors.New("parent 1 not found")
		}
	}

	if req.ParentID2 != "" {
		parent2, err := s.parentRepo.GetByID(ctx, req.ParentID2)
		if err != nil {
			return nil, fmt.Errorf("parent 2 not found: %w", err)
		}
		if parent2 == nil {
			return nil, errors.New("parent 2 not found")
		}
	}

	// Create student
	student := &repository.Student{
		Name:     req.Name,
		ClassID:  req.ClassID,
		IsActive: true,
	}

	err := s.studentRepo.Create(ctx, student)
	if err != nil {
		return nil, fmt.Errorf("failed to create student: %w", err)
	}

	// Link parents with proper relationship types
	if req.ParentID1 != "" {
		err = s.studentRepo.AddParent(ctx, student.ID, req.ParentID1, "father")
		if err != nil {
			return nil, fmt.Errorf("failed to link parent 1 (father): %w", err)
		}
	}

	if req.ParentID2 != "" {
		err = s.studentRepo.AddParent(ctx, student.ID, req.ParentID2, "mother")
		if err != nil {
			return nil, fmt.Errorf("failed to link parent 2 (mother): %w", err)
		}
	}

	// Get the complete student with class info
	studentWithClass, err := s.studentRepo.GetByID(ctx, student.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created student: %w", err)
	}

	return studentWithClass, nil
}

// Update updates an existing student
func (s *StudentService) Update(ctx context.Context, req *UpdateStudentRequest) (*repository.StudentWithClass, error) {
	// Check if student exists
	existingStudent, err := s.studentRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve student: %w", err)
	}
	if existingStudent == nil {
		return nil, errors.New("student not found")
	}

	// Validate parents exist if provided
	if req.ParentID1 != "" {
		parent1, err := s.parentRepo.GetByID(ctx, req.ParentID1)
		if err != nil {
			return nil, fmt.Errorf("parent 1 not found: %w", err)
		}
		if parent1 == nil {
			return nil, errors.New("parent 1 not found")
		}
	}

	if req.ParentID2 != "" {
		parent2, err := s.parentRepo.GetByID(ctx, req.ParentID2)
		if err != nil {
			return nil, fmt.Errorf("parent 2 not found: %w", err)
		}
		if parent2 == nil {
			return nil, errors.New("parent 2 not found")
		}
	}

	// Update student basic info
	student := &repository.Student{
		Name:      req.Name,
		ClassID:   req.ClassID,
		IsActive:  true,
		BirthDate: nil,
	}

	// Handle birth_date
	if req.BirthDate != "" {
		student.BirthDate = &req.BirthDate
	}

	err = s.studentRepo.Update(ctx, req.ID, student)
	if err != nil {
		return nil, fmt.Errorf("failed to update student: %w", err)
	}

	// Update parent relationships (remove all and re-add with proper types)
	err = s.studentRepo.RemoveParents(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to update parent relationships: %w", err)
	}

	if req.ParentID1 != "" {
		err = s.studentRepo.AddParent(ctx, req.ID, req.ParentID1, "father")
		if err != nil {
			return nil, fmt.Errorf("failed to link parent 1 (father): %w", err)
		}
	}

	if req.ParentID2 != "" {
		err = s.studentRepo.AddParent(ctx, req.ID, req.ParentID2, "mother")
		if err != nil {
			return nil, fmt.Errorf("failed to link parent 2 (mother): %w", err)
		}
	}

	// Get the updated student with class info
	updatedStudent, err := s.studentRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated student: %w", err)
	}

	return updatedStudent, nil
}

// Delete deletes a student (soft delete)
func (s *StudentService) Delete(ctx context.Context, id string) error {
	// Check if student exists
	student, err := s.studentRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to retrieve student: %w", err)
	}
	if student == nil {
		return errors.New("student not found")
	}

	// Perform soft delete
	err = s.studentRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete student: %w", err)
	}

	return nil
}
