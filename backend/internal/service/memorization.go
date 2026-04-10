package service

import (
	"context"
	"errors"
	"strconv"

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
	UnitType   string `json:"unit_type" binding:"required,oneof=surah juz page"`
	SurahID    *string `json:"surah_id,omitempty"`
	JuzID      *string `json:"juz_id,omitempty"`
	PageStart  *int    `json:"page_start,omitempty"`
	PageEnd    *int    `json:"page_end,omitempty"`
	Status     string `json:"status" binding:"required,oneof=fluent good needs_improvement"`
	Notes      string `json:"notes"`
	TestDate   string  `json:"test_date" binding:"required"`
}

// UpdateMemorizationRequest represents a request to update a memorization
type UpdateMemorizationRequest struct {
	ID        string  `json:"id" binding:"required"`
	UnitType  string  `json:"unit_type" binding:"required,oneof=surah juz page"`
	SurahID   *string `json:"surah_id,omitempty"`
	JuzID     *string `json:"juz_id,omitempty"`
	PageStart *int    `json:"page_start,omitempty"`
	PageEnd   *int    `json:"page_end,omitempty"`
	Status    string  `json:"status" binding:"required,oneof=fluent good needs_improvement"`
	Notes     string  `json:"notes"`
	TestDate  string  `json:"test_date" binding:"required"`
}

// Validate validates the memorization request based on unit type
func (s *MemorizationService) Validate(req interface{}) error {
	switch r := req.(type) {
	case *CreateMemorizationRequest:
		return s.validateUnitType(r.UnitType, r.SurahID, r.JuzID, r.PageStart, r.PageEnd)
	case *UpdateMemorizationRequest:
		return s.validateUnitType(r.UnitType, r.SurahID, r.JuzID, r.PageStart, r.PageEnd)
	default:
		return errors.New("invalid request type")
	}
}

// validateUnitType validates that the correct fields are set based on unit type
func (s *MemorizationService) validateUnitType(unitType string, surahID, juzID *string, pageStart, pageEnd *int) error {
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
		if pageStart == nil || pageEnd == nil {
			return errors.New("page_start and page_end are required when unit_type is page")
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

	// Convert string IDs to int
	studentID, err := strconv.Atoi(req.StudentID)
	if err != nil {
		return nil, errors.New("invalid student_id")
	}
	teacherID, err := strconv.Atoi(req.TeacherID)
	if err != nil {
		return nil, errors.New("invalid teacher_id")
	}

	// Convert optional SurahID
	var surahID *int
	if req.SurahID != nil {
		id, err := strconv.Atoi(*req.SurahID)
		if err != nil {
			return nil, errors.New("invalid surah_id")
		}
		surahID = &id
	}

	// Convert optional JuzID
	var juzID *int
	if req.JuzID != nil {
		id, err := strconv.Atoi(*req.JuzID)
		if err != nil {
			return nil, errors.New("invalid juz_id")
		}
		juzID = &id
	}

	// Create memorization record
	mem := &repository.Memorization{
		StudentID:  studentID,
		TeacherID:  teacherID,
		UnitType:   req.UnitType,
		SurahID:    surahID,
		JuzID:      juzID,
		PageStart:  req.PageStart,
		PageEnd:    req.PageEnd,
		Status:     req.Status,
		Notes:      req.Notes,
		TestDate:   req.TestDate,
	}

	if err := s.memorizationRepo.Create(ctx, mem); err != nil {
		return nil, err
	}

	// Create history record for initial memorization
	if s.historyRepo != nil {
		history := &repository.MemorizationHistory{
			MemorizationID: mem.ID,
			StudentID:      mem.StudentID,
			TeacherID:      mem.TeacherID,
			OldStatus:      nil,
			NewStatus:      mem.Status,
			Notes:          "Initial memorization record",
		}
		if err := s.historyRepo.CreateHistory(ctx, history); err != nil {
			// Log error but don't fail the operation
			// History is secondary to the main operation
		}
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

	// Convert ID to int
	id, err := strconv.Atoi(req.ID)
	if err != nil {
		return nil, errors.New("invalid id")
	}

	// Get existing record
	existing, err := s.memorizationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("memorization not found")
	}

	// Convert optional SurahID
	var surahID *int
	if req.SurahID != nil {
		id, err := strconv.Atoi(*req.SurahID)
		if err != nil {
			return nil, errors.New("invalid surah_id")
		}
		surahID = &id
	}

	// Convert optional JuzID
	var juzID *int
	if req.JuzID != nil {
		id, err := strconv.Atoi(*req.JuzID)
		if err != nil {
			return nil, errors.New("invalid juz_id")
		}
		juzID = &id
	}

	// Create updated record (soft delete old, create new)
	mem := &repository.Memorization{
		ID:        id,
		StudentID: existing.StudentID,
		TeacherID: existing.TeacherID,
		UnitType:  req.UnitType,
		SurahID:   surahID,
		JuzID:     juzID,
		PageStart: req.PageStart,
		PageEnd:   req.PageEnd,
		Status:    req.Status,
		Notes:     req.Notes,
		TestDate:  req.TestDate,
	}

	// Store old status for history
	oldStatus := existing.Status

	if err := s.memorizationRepo.Update(ctx, mem); err != nil {
		return nil, err
	}

	// Create history record for status change
	if s.historyRepo != nil {
		history := &repository.MemorizationHistory{
			MemorizationID: mem.ID,
			StudentID:      mem.StudentID,
			TeacherID:      mem.TeacherID,
			OldStatus:      &oldStatus,
			NewStatus:      mem.Status,
			Notes:          mem.Notes,
		}
		if err := s.historyRepo.CreateHistory(ctx, history); err != nil {
			// Log error but don't fail the operation
			// History is secondary to the main operation
		}
	}

	// Get the updated record with details
	return s.memorizationRepo.GetByID(ctx, mem.ID)
}

// GetByStudentID retrieves all memorizations for a student
func (s *MemorizationService) GetByStudentID(ctx context.Context, studentID string) ([]repository.MemorizationWithDetails, error) {
	id, err := strconv.Atoi(studentID)
	if err != nil {
		return nil, errors.New("invalid student_id")
	}
	return s.memorizationRepo.GetByStudentID(ctx, id)
}

// GetByTeacherID retrieves all memorizations for a teacher
func (s *MemorizationService) GetByTeacherID(ctx context.Context, teacherID string) ([]repository.MemorizationWithDetails, error) {
	id, err := strconv.Atoi(teacherID)
	if err != nil {
		return nil, errors.New("invalid teacher_id")
	}
	return s.memorizationRepo.GetByTeacherID(ctx, id)
}

// GetByID retrieves a specific memorization
func (s *MemorizationService) GetByID(ctx context.Context, id string) (*repository.MemorizationWithDetails, error) {
	memID, err := strconv.Atoi(id)
	if err != nil {
		return nil, errors.New("invalid id")
	}
	return s.memorizationRepo.GetByID(ctx, memID)
}

// GetHistory retrieves the history of a memorization
func (s *MemorizationService) GetHistory(ctx context.Context, memorizationID string) ([]repository.MemorizationHistory, error) {
	id, err := strconv.Atoi(memorizationID)
	if err != nil {
		return nil, errors.New("invalid memorization_id")
	}
	return s.historyRepo.GetByMemorizationID(ctx, id)
}

// GetStudentHistory retrieves all history for a student
func (s *MemorizationService) GetStudentHistory(ctx context.Context, studentID string) ([]repository.MemorizationHistory, error) {
	id, err := strconv.Atoi(studentID)
	if err != nil {
		return nil, errors.New("invalid student_id")
	}
	return s.historyRepo.GetByStudentID(ctx, id)
}
