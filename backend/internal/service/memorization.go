package service

import (
	"context"
	"errors"

	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
)

// MemorizationService handles memorization business logic
type MemorizationService struct {
	memorizationRepo *repository.MemorizationRepository
	historyRepo      *repository.HistoryRepository
}

// NewMemorizationService creates a new memorization service
func NewMemorizationService(memorizationRepo *repository.MemorizationRepository, historyRepo *repository.HistoryRepository) *MemorizationService {
	return &MemorizationService{
		memorizationRepo: memorizationRepo,
		historyRepo:      historyRepo,
	}
}

// CreateMemorizationRequest represents a request to create a memorization
type CreateMemorizationRequest struct {
	StudentID  string  `json:"student_id" binding:"required"`
	TeacherID  string  `json:"teacher_id" binding:"required"`
	UnitType   string  `json:"unit_type" binding:"required,oneof=surah juz page"`
	SurahID    *string `json:"surah_id,omitempty" binding:"omitempty_if=UnitType surah"`
	JuzID      *string `json:"juz_id,omitempty" binding:"omitempty_if=UnitType juz"`
	PageNumber *int    `json:"page_number,omitempty" binding:"omitempty_if=UnitType page,min=1,max=604"`
	StartAyah  *int    `json:"start_ayah,omitempty" binding:"omitempty,min=1"`
	EndAyah    *int    `json:"end_ayah,omitempty" binding:"omitempty,min=1"`
	Score      float64 `json:"score" binding:"required,min=0,max=100"`
	Notes      string  `json:"notes"`
	TestDate   string  `json:"test_date" binding:"required"`
}

// UpdateMemorizationRequest represents a request to update a memorization
type UpdateMemorizationRequest struct {
	ID         string  `json:"id" binding:"required"`
	UnitType   string  `json:"unit_type" binding:"required,oneof=surah juz page"`
	SurahID    *string `json:"surah_id,omitempty" binding:"omitempty_if=UnitType surah"`
	JuzID      *string `json:"juz_id,omitempty" binding:"omitempty_if=UnitType juz"`
	PageNumber *int    `json:"page_number,omitempty" binding:"omitempty_if=UnitType page,min=1,max=604"`
	StartAyah  *int    `json:"start_ayah,omitempty" binding:"omitempty,min=1"`
	EndAyah    *int    `json:"end_ayah,omitempty" binding:"omitempty,min=1"`
	Score      float64 `json:"score" binding:"required,min=0,max=100"`
	Notes      string  `json:"notes"`
	TestDate   string  `json:"test_date" binding:"required"`
}

// Validate validates the memorization request based on unit type
func (s *MemorizationService) Validate(req interface{}) error {
	switch r := req.(type) {
	case *CreateMemorizationRequest:
		return s.validateUnitType(r.UnitType, r.SurahID, r.JuzID, r.PageNumber)
	case *UpdateMemorizationRequest:
		return s.validateUnitType(r.UnitType, r.SurahID, r.JuzID, r.PageNumber)
	default:
		return errors.New("invalid request type")
	}
}

// validateUnitType validates that the correct fields are set based on unit type
func (s *MemorizationService) validateUnitType(unitType string, surahID, juzID *string, pageNumber *int) error {
	switch unitType {
	case "surah":
		if surahID == nil {
			return errors.New("surah_id is required when unit_type is surah")
		}
	case "juz":
		if juzID == nil {
			return errors.New("juz_id is required when unit_type is juz")
		}
	case "page":
		if pageNumber == nil {
			return errors.New("page_number is required when unit_type is page")
		}
	default:
		return errors.New("invalid unit_type")
	}
	return nil
}

// Create creates a new memorization record
func (s *MemorizationService) Create(ctx context.Context, req *CreateMemorizationRequest, changedBy string) (*repository.MemorizationWithDetails, error) {
	// Validate request
	if err := s.Validate(req); err != nil {
		return nil, err
	}

	// Create memorization record
	mem := &repository.Memorization{
		StudentID:  req.StudentID,
		TeacherID:  req.TeacherID,
		UnitType:   req.UnitType,
		SurahID:    req.SurahID,
		JuzID:      req.JuzID,
		PageNumber: req.PageNumber,
		StartAyah:  req.StartAyah,
		EndAyah:    req.EndAyah,
		Score:      req.Score,
		Notes:      req.Notes,
		TestDate:   req.TestDate,
	}

	if err := s.memorizationRepo.Create(ctx, mem); err != nil {
		return nil, err
	}

	// Create history record
	history := &repository.MemorizationHistory{
		MemorizationID: mem.ID,
		StudentID:      req.StudentID,
		TeacherID:      req.TeacherID,
		UnitType:       req.UnitType,
		SurahID:        req.SurahID,
		JuzID:          req.JuzID,
		PageNumber:     req.PageNumber,
		StartAyah:      req.StartAyah,
		EndAyah:        req.EndAyah,
		Score:          req.Score,
		Notes:          req.Notes,
		TestDate:       req.TestDate,
		ChangeType:     "created",
		ChangedBy:      changedBy,
	}

	if err := s.historyRepo.CreateHistory(ctx, history); err != nil {
		// Log error but don't fail the operation
		// In production, you might want to handle this differently
	}

	// Get the created record with details
	return s.memorizationRepo.GetByID(ctx, mem.ID)
}

// Update updates an existing memorization record
func (s *MemorizationService) Update(ctx context.Context, req *UpdateMemorizationRequest, changedBy string) (*repository.MemorizationWithDetails, error) {
	// Validate request
	if err := s.Validate(req); err != nil {
		return nil, err
	}

	// Get existing record
	existing, err := s.memorizationRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("memorization not found")
	}

	// Create updated record (soft delete old, create new)
	mem := &repository.Memorization{
		ID:         req.ID,
		StudentID:  existing.StudentID,
		TeacherID:  existing.TeacherID,
		UnitType:   req.UnitType,
		SurahID:    req.SurahID,
		JuzID:      req.JuzID,
		PageNumber: req.PageNumber,
		StartAyah:  req.StartAyah,
		EndAyah:    req.EndAyah,
		Score:      req.Score,
		Notes:      req.Notes,
		TestDate:   req.TestDate,
	}

	if err := s.memorizationRepo.Update(ctx, mem); err != nil {
		return nil, err
	}

	// Create history record
	history := &repository.MemorizationHistory{
		MemorizationID: mem.ID,
		StudentID:      existing.StudentID,
		TeacherID:      existing.TeacherID,
		UnitType:       req.UnitType,
		SurahID:        req.SurahID,
		JuzID:          req.JuzID,
		PageNumber:     req.PageNumber,
		StartAyah:      req.StartAyah,
		EndAyah:        req.EndAyah,
		Score:          req.Score,
		Notes:          req.Notes,
		TestDate:       req.TestDate,
		ChangeType:     "updated",
		ChangedBy:      changedBy,
	}

	if err := s.historyRepo.CreateHistory(ctx, history); err != nil {
		// Log error but don't fail the operation
	}

	// Get the updated record with details
	return s.memorizationRepo.GetByID(ctx, mem.ID)
}

// GetByStudentID retrieves all memorizations for a student
func (s *MemorizationService) GetByStudentID(ctx context.Context, studentID string) ([]repository.MemorizationWithDetails, error) {
	return s.memorizationRepo.GetByStudentID(ctx, studentID)
}

// GetByTeacherID retrieves all memorizations for a teacher
func (s *MemorizationService) GetByTeacherID(ctx context.Context, teacherID string) ([]repository.MemorizationWithDetails, error) {
	return s.memorizationRepo.GetByTeacherID(ctx, teacherID)
}

// GetByID retrieves a specific memorization
func (s *MemorizationService) GetByID(ctx context.Context, id string) (*repository.MemorizationWithDetails, error) {
	return s.memorizationRepo.GetByID(ctx, id)
}

// GetHistory retrieves the history of a memorization
func (s *MemorizationService) GetHistory(ctx context.Context, memorizationID string) ([]repository.MemorizationHistory, error) {
	return s.historyRepo.GetByMemorizationID(ctx, memorizationID)
}

// GetStudentHistory retrieves all history for a student
func (s *MemorizationService) GetStudentHistory(ctx context.Context, studentID string) ([]repository.MemorizationHistory, error) {
	return s.historyRepo.GetByStudentID(ctx, studentID)
}
