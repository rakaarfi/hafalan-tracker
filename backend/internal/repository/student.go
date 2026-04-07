package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// StudentRepository handles student data operations
type StudentRepository struct {
	db *sqlx.DB
}

// NewStudentRepository creates a new student repository
func NewStudentRepository(db *sqlx.DB) *StudentRepository {
	return &StudentRepository{db: db}
}

// Student represents a student in the system
type Student struct {
	ID        string `db:"id" json:"id"`
	Name      string `db:"name" json:"name"`
	ClassID   string `db:"class_id" json:"class_id"`
	IsActive  bool   `db:"is_active" json:"is_active"`
	CreatedAt string `db:"created_at" json:"created_at"`
}

// StudentWithClass represents a student with class information
type StudentWithClass struct {
	Student
	ClassName string `db:"class_name" json:"class_name"`
}

// StudentWithDetails represents a student with class and parent information
type StudentWithDetails struct {
	Student
	ClassName   string  `db:"class_name" json:"class_name"`
	Parent1ID   string  `db:"parent_1_id" json:"parent_1_id,omitempty"`
	Parent1Name string  `db:"parent_1_name" json:"parent_1_name,omitempty"`
	Parent2ID   string  `db:"parent_2_id" json:"parent_2_id,omitempty"`
	Parent2Name string  `db:"parent_2_name" json:"parent_2_name,omitempty"`
	Phone       string  `db:"phone" json:"phone,omitempty"`
}

// GetByID retrieves a student by ID
func (r *StudentRepository) GetByID(ctx context.Context, id string) (*StudentWithClass, error) {
	query := `
		SELECT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE s.id = $1 AND s.is_active = true
	`

	var student StudentWithClass
	err := r.db.GetContext(ctx, &student, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &student, nil
}

// GetByParentID retrieves all students for a parent
func (r *StudentRepository) GetByParentID(ctx context.Context, parentID string) ([]StudentWithClass, error) {
	query := `
		SELECT DISTINCT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		JOIN student_parents sp ON s.id = sp.student_id
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE sp.parent_id = $1 AND s.is_active = true AND sp.is_active = true
		ORDER BY s.name
	`

	var students []StudentWithClass
	err := r.db.SelectContext(ctx, &students, query, parentID)
	if err != nil {
		return nil, err
	}

	return students, nil
}

// GetByClassID retrieves all students for a class
func (r *StudentRepository) GetByClassID(ctx context.Context, classID string) ([]StudentWithClass, error) {
	query := `
		SELECT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE s.class_id = $1 AND s.is_active = true
		ORDER BY s.name
	`

	var students []StudentWithClass
	err := r.db.SelectContext(ctx, &students, query, classID)
	if err != nil {
		return nil, err
	}

	return students, nil
}

// GetAll retrieves all students with optional search
func (r *StudentRepository) GetAll(ctx context.Context, search string) ([]StudentWithClass, error) {
	query := `
		SELECT s.id, s.name, s.class_id, s.is_active, s.created_at, c.name as class_name
		FROM students s
		LEFT JOIN classes c ON s.class_id = c.id
		WHERE s.is_active = true
	`

	args := []interface{}{}
	if search != "" {
		query += " AND s.name ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY s.name"

	var students []StudentWithClass
	err := r.db.SelectContext(ctx, &students, query, args...)
	if err != nil {
		return nil, err
	}

	return students, nil
}

// GetAllWithDetails retrieves all students with class and parent information
func (r *StudentRepository) GetAllWithDetails(ctx context.Context, search string) ([]StudentWithDetails, error) {
	// First, get all students with class info using the existing method
	students, err := r.GetAll(ctx, search)
	if err != nil {
		return nil, err
	}

	// Convert to StudentWithDetails and fetch parent info for each student
	result := make([]StudentWithDetails, len(students))
	for i, student := range students {
		result[i] = StudentWithDetails{
			Student:   student.Student,
			ClassName: student.ClassName,
		}

		// Fetch parents for this student
		parents, err := r.getParentsForStudent(ctx, student.ID)
		if err == nil && len(parents) > 0 {
			for _, p := range parents {
				if p.RelationshipType == "father" {
					result[i].Parent1ID = p.UserID
					result[i].Parent1Name = p.FullName
					result[i].Phone = p.Phone
				} else if p.RelationshipType == "mother" {
					result[i].Parent2ID = p.UserID
					result[i].Parent2Name = p.FullName
					if result[i].Phone == "" {
						result[i].Phone = p.Phone
					}
				}
			}
		}
	}

	return result, nil
}

// getParentsForStudent fetches all parents for a student
type parentInfo struct {
	UserID          string `db:"user_id"`
	FullName        string `db:"full_name"`
	Phone           string `db:"phone"`
	RelationshipType string `db:"relationship_type"`
}

func (r *StudentRepository) getParentsForStudent(ctx context.Context, studentID string) ([]parentInfo, error) {
	query := `
		SELECT p.user_id, p.full_name, p.phone, sp.relationship_type
		FROM student_parents sp
		JOIN parents p ON sp.parent_id = p.user_id
		WHERE sp.student_id = $1 AND sp.is_active = true
		ORDER BY sp.relationship_type
	`

	var parents []parentInfo
	err := r.db.SelectContext(ctx, &parents, query, studentID)
	if err != nil {
		return nil, err
	}

	return parents, nil
}

// Create creates a new student
func (r *StudentRepository) Create(ctx context.Context, student *Student) error {
	query := `
		INSERT INTO students (name, class_id, enrollment_year, semester)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(ctx, query,
		student.Name,
		student.ClassID,
		2025, // enrollment_year
		1,    // semester
	).Scan(&student.ID, &student.CreatedAt)
}

// Update updates a student
func (r *StudentRepository) Update(ctx context.Context, id string, student *Student) error {
	query := `
		UPDATE students
		SET name = $1, class_id = $2
		WHERE id = $3
	`

	_, err := r.db.ExecContext(ctx, query, student.Name, student.ClassID, id)
	return err
}

// Delete deletes a student (soft delete by setting is_active to false)
func (r *StudentRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE students SET is_active = false WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// AddParent links a parent to a student
func (r *StudentRepository) AddParent(ctx context.Context, studentID, parentID string) error {
	query := `
		INSERT INTO student_parents (student_id, parent_id, relationship_type, is_active)
		VALUES ($1, $2, 'guardian', true)
		ON CONFLICT (student_id, parent_id)
		DO UPDATE SET is_active = true
	`
	_, err := r.db.ExecContext(ctx, query, studentID, parentID)
	return err
}

// RemoveParents removes all parent relationships for a student
func (r *StudentRepository) RemoveParents(ctx context.Context, studentID string) error {
	query := `UPDATE student_parents SET is_active = false WHERE student_id = $1`
	_, err := r.db.ExecContext(ctx, query, studentID)
	return err
}

// GetByIDWithDetails retrieves a student by ID with full details including parents
func (r *StudentRepository) GetByIDWithDetails(ctx context.Context, id string) (*StudentWithDetails, error) {
	// First get the student with class info
	student, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if student == nil {
		return nil, nil
	}

	// Convert to StudentWithDetails
	result := &StudentWithDetails{
		Student:   student.Student,
		ClassName: student.ClassName,
	}

	// Fetch parents for this student
	parents, err := r.getParentsForStudent(ctx, id)
	if err == nil && len(parents) > 0 {
		for _, p := range parents {
			if p.RelationshipType == "father" {
				result.Parent1ID = p.UserID
				result.Parent1Name = p.FullName
				result.Phone = p.Phone
			} else if p.RelationshipType == "mother" {
				result.Parent2ID = p.UserID
				result.Parent2Name = p.FullName
				if result.Phone == "" {
					result.Phone = p.Phone
				}
			}
		}
	}

	return result, nil
}
