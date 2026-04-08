package service

import (
	"context"
	"errors"
	"strconv"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// ParentService handles parent business logic
type ParentService struct {
	parentRepo       *repository.ParentRepository
	studentRepo      *repository.StudentRepository
	memorizationRepo *repository.MemorizationRepository
	userRepo         *repository.UserRepository
}

// NewParentService creates a new parent service
func NewParentService(parentRepo *repository.ParentRepository, studentRepo *repository.StudentRepository, memorizationRepo *repository.MemorizationRepository, userRepo *repository.UserRepository) *ParentService {
	return &ParentService{
		parentRepo:       parentRepo,
		studentRepo:      studentRepo,
		memorizationRepo: memorizationRepo,
		userRepo:         userRepo,
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
	// Convert student ID to int
	id, err := strconv.Atoi(studentID)
	if err != nil {
		return nil, errors.New("invalid student_id")
	}

	// Get all memorizations for this student
	memorizations, err := s.memorizationRepo.GetByStudentID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Calculate statistics
	totalTests := len(memorizations)

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
		AverageScore: calculateAverageScore(recentTests),
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

	return s.GetChildrenProgress(ctx, parent.UserID)
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

	return s.GetChildProgress(ctx, parent.UserID, studentID)
}

// CreateParentRequest represents the request to create a parent
type CreateParentRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// UpdateParentRequest represents the request to update a parent
type UpdateParentRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone"`
}

// Create creates a new parent with user account
func (s *ParentService) Create(ctx context.Context, req *CreateParentRequest) (*repository.ParentWithUser, error) {
	// Create user account first
	user := &repository.User{
		Email:    req.Email,
		Password: req.Password,
		IsActive: true,
	}

	err := s.userRepo.Create(ctx, user, "parent")
	if err != nil {
		return nil, errors.New("failed to create user account")
	}

	// Create parent profile
	parent := &repository.Parent{
		UserID:   user.ID,
		FullName: req.Name,
		Phone:    req.Phone,
	}

	err = s.parentRepo.Create(ctx, parent)
	if err != nil {
		return nil, errors.New("failed to create parent profile")
	}

	// Get the created parent with user info
	result, err := s.parentRepo.GetByID(ctx, user.ID)
	if err != nil {
		return nil, errors.New("failed to retrieve created parent")
	}

	return result, nil
}

// Update updates an existing parent
func (s *ParentService) Update(ctx context.Context, req *UpdateParentRequest) (*repository.ParentWithUser, error) {
	// Get existing parent
	existing, err := s.parentRepo.GetByUserID(ctx, req.UserID)
	if err != nil {
		return nil, errors.New("failed to retrieve parent")
	}
	if existing == nil {
		return nil, errors.New("parent not found")
	}

	// Update parent profile
	updateReq := &repository.Parent{
		FullName: req.Name,
		Phone:    req.Phone,
	}

	err = s.parentRepo.Update(ctx, req.UserID, updateReq)
	if err != nil {
		return nil, errors.New("failed to update parent profile")
	}

	// Get updated parent with user info
	result, err := s.parentRepo.GetByID(ctx, req.UserID)
	if err != nil {
		return nil, errors.New("failed to retrieve updated parent")
	}

	return result, nil
}

// Delete deletes a parent
func (s *ParentService) Delete(ctx context.Context, userID string) error {
	// Get parent by user ID
	parent, err := s.parentRepo.GetByUserID(ctx, userID)
	if err != nil {
		return errors.New("failed to retrieve parent")
	}
	if parent == nil {
		return errors.New("parent not found")
	}

	// Delete parent profile
	err = s.parentRepo.Delete(ctx, userID)
	if err != nil {
		return errors.New("failed to delete parent profile")
	}

	// Delete user account
	err = s.userRepo.Delete(ctx, userID)
	if err != nil {
		return errors.New("failed to delete user account")
	}

	return nil
}

// calculateAverageScore calculates average score from memorization statuses
func calculateAverageScore(tests []repository.MemorizationWithDetails) float64 {
	if len(tests) == 0 {
		return 0
	}

	// Score mapping for statuses
	scoreMap := map[string]float64{
		"fluent":             100,
		"good":               75,
		"needs_improvement":  50,
		"in_progress":        25,
		"completed":          100,
	}

	total := 0.0
	count := 0

	for _, test := range tests {
		if score, ok := scoreMap[test.Status]; ok {
			total += score
			count++
		}
	}

	if count == 0 {
		return 0
	}

	return total / float64(count)
}
