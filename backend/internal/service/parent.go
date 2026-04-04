package service

import (
	"context"
	"errors"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// ParentService handles parent business logic
type ParentService struct {
	parentRepo  *repository.ParentRepository
	studentRepo *repository.StudentRepository
	memorizationRepo *repository.MemorizationRepository
}

// NewParentService creates a new parent service
func NewParentService(parentRepo *repository.ParentRepository, studentRepo *repository.StudentRepository, memorizationRepo *repository.MemorizationRepository) *ParentService {
	return &ParentService{
		parentRepo:  parentRepo,
		studentRepo: studentRepo,
		memorizationRepo: memorizationRepo,
	}
}

// ChildProgress represents a child's hafalan progress summary
type ChildProgress struct {
	Student        repository.StudentWithClass `json:"student"`
	RecentTests    []repository.MemorizationWithDetails `json:"recent_tests"`
	TotalTests     int `json:"total_tests"`
	AverageScore   float64 `json:"average_score"`
	LatestTest     *repository.MemorizationWithDetails `json:"latest_test,omitempty"`
}

// GetChildrenProgress retrieves progress for all children of a parent
func (s *ParentService) GetChildrenProgress(ctx context.Context, parentID string) ([]ChildProgress, error) {
	// Get all students for this parent
	students, err := s.studentRepo.GetByParentID(ctx, parentID)
	if err != nil {
		return nil, err
	}

	// Get progress for each student
	var progress []ChildProgress
	for _, student := range students {
		studentProgress, err := s.getChildProgress(ctx, student.ID)
		if err != nil {
			return nil, err
		}

		progress = append(progress, ChildProgress{
			Student:     student,
			RecentTests: studentProgress.RecentTests,
			TotalTests:  studentProgress.TotalTests,
			AverageScore: studentProgress.AverageScore,
			LatestTest:  studentProgress.LatestTest,
		})
	}

	return progress, nil
}

// getChildProgress retrieves progress for a specific student
func (s *ParentService) getChildProgress(ctx context.Context, studentID string) (*ChildProgress, error) {
	// Get all memorizations for this student
	memorizations, err := s.memorizationRepo.GetByStudentID(ctx, studentID)
	if err != nil {
		return nil, err
	}

	// Calculate statistics
	totalTests := len(memorizations)
	var averageScore float64
	if totalTests > 0 {
		var sum float64
		for _, mem := range memorizations {
			sum += mem.Score
		}
		averageScore = sum / float64(totalTests)
	}

	// Get recent tests (last 5)
	recentTests := memorizations
	if len(memorizations) > 5 {
		recentTests = memorizations[:5]
	}

	// Get latest test
	var latestTest *repository.MemorizationWithDetails
	if len(memorizations) > 0 {
		latestTest = &memorizations[0]
	}

	return &ChildProgress{
		RecentTests:  recentTests,
		TotalTests:   totalTests,
		AverageScore: averageScore,
		LatestTest:   latestTest,
	}, nil
}

// GetChildProgress retrieves progress for a specific child
func (s *ParentService) GetChildProgress(ctx context.Context, parentID, studentID string) (*ChildProgress, error) {
	// Verify this student belongs to this parent
	students, err := s.studentRepo.GetByParentID(ctx, parentID)
	if err != nil {
		return nil, err
	}

 belongsToParent := false
	for _, student := range students {
		if student.ID == studentID {
			belongsToParent = true
			break
		}
	}

	if !belongsToParent {
		return nil, errors.New("student not found in parent's children list")
	}

	// Get student details
	student, err := s.studentRepo.GetByID(ctx, studentID)
	if err != nil {
		return nil, err
	}
	if student == nil {
		return nil, errors.New("student not found")
	}

	// Get progress
	progress, err := s.getChildProgress(ctx, studentID)
	if err != nil {
		return nil, err
	}

	progress.Student = *student

	return progress, nil
}

// GetChildrenProgressByUserID retrieves progress for all children of a parent by user ID
func (s *ParentService) GetChildrenProgressByUserID(ctx context.Context, userID string) ([]ChildProgress, error) {
	// Get parent by user ID
	parent, err := s.parentRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if parent == nil {
		return nil, errors.New("parent profile not found")
	}

	return s.GetChildrenProgress(ctx, parent.ID)
}

// GetChildProgressByUserID retrieves progress for a specific child by user ID
func (s *ParentService) GetChildProgressByUserID(ctx context.Context, userID, studentID string) (*ChildProgress, error) {
	// Get parent by user ID
	parent, err := s.parentRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if parent == nil {
		return nil, errors.New("parent profile not found")
	}

	return s.GetChildProgress(ctx, parent.ID, studentID)
}
