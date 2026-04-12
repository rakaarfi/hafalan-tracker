package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// TeacherRepository handles teacher data operations
type TeacherRepository struct {
	db *sqlx.DB
}

// NewTeacherRepository creates a new teacher repository
func NewTeacherRepository(db *sqlx.DB) *TeacherRepository {
	return &TeacherRepository{db: db}
}

// Teacher represents a teacher in the system
type Teacher struct {
	UserID    string `db:"user_id"`
	FullName  string `db:"full_name"`
	Phone     string `db:"phone"`
	CreatedAt string `db:"created_at"`
}

// TeacherWithUser represents a teacher with user information
type TeacherWithUser struct {
	Teacher
	Email string `db:"email"`
}

// TeacherWithClasses represents a teacher with class information
type TeacherWithClasses struct {
	TeacherWithUser
	HomeroomClasses  []string `db:"homeroom_classes"`  // Classes where teacher is homeroom
	QuranTeacherClasses []string `db:"quran_classes"` // Classes where teacher is Quran teacher
}

// GetByUserID retrieves a teacher by user ID
func (r *TeacherRepository) GetByUserID(ctx context.Context, userID string) (*TeacherWithUser, error) {
	query := `
		SELECT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
		WHERE t.user_id = $1
	`

	var teacher TeacherWithUser
	err := r.db.GetContext(ctx, &teacher, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &teacher, nil
}

// GetByID retrieves a teacher by ID (user_id)
func (r *TeacherRepository) GetByID(ctx context.Context, id string) (*TeacherWithUser, error) {
	return r.GetByUserID(ctx, id)
}

// GetAll retrieves all teachers with optional search
func (r *TeacherRepository) GetAll(ctx context.Context, search string) ([]TeacherWithUser, error) {
	query := `
		SELECT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	`

	args := []interface{}{}
	if search != "" {
		query += " WHERE t.full_name ILIKE $1 OR u.email ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY t.full_name"

	var teachers []TeacherWithUser
	err := r.db.SelectContext(ctx, &teachers, query, args...)
	if err != nil {
		return nil, err
	}

	return teachers, nil
}

// GetAllWithClasses retrieves all teachers with their assigned classes
func (r *TeacherRepository) GetAllWithClasses(ctx context.Context, search string) ([]TeacherWithClasses, error) {
	// First, get all teachers
	query := `
		SELECT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	`

	args := []interface{}{}
	if search != "" {
		query += " WHERE t.full_name ILIKE $1 OR u.email ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY t.full_name"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teachers []TeacherWithClasses
	for rows.Next() {
		var t TeacherWithClasses
		if err := rows.Scan(&t.UserID, &t.FullName, &t.Phone, &t.CreatedAt, &t.Email); err != nil {
			return nil, err
		}
		teachers = append(teachers, t)
	}

	// Now, get class information for each teacher
	for i := range teachers {
		// Get homeroom classes
		homeroomQuery := `
			SELECT c.name
			FROM classes c
			WHERE c.homeroom_teacher_id = $1
			ORDER BY c.name
		`
		var homeroomClasses []string
		err := r.db.SelectContext(ctx, &homeroomClasses, homeroomQuery, teachers[i].UserID)
		if err != nil {
			return nil, err
		}
		teachers[i].HomeroomClasses = homeroomClasses

		// Get Quran teacher classes
		quranQuery := `
			SELECT DISTINCT c.name
			FROM classes c
			INNER JOIN class_quran_teachers cqt ON c.id = cqt.class_id
			WHERE cqt.quran_teacher_id = $1 AND cqt.is_active = true
			ORDER BY c.name
		`
		var quranClasses []string
		err = r.db.SelectContext(ctx, &quranClasses, quranQuery, teachers[i].UserID)
		if err != nil {
			return nil, err
		}
		teachers[i].QuranTeacherClasses = quranClasses
	}

	return teachers, nil
}

// GetAllWithClassesPaginated retrieves teachers with pagination and their assigned classes
func (r *TeacherRepository) GetAllWithClassesPaginated(ctx context.Context, search string, teacherType string, classID string, page, limit int) ([]TeacherWithClasses, int, error) {
	offset := (page - 1) * limit

	// Build WHERE conditions for filtering
	whereConditions := []string{}
	whereArgs := []interface{}{}
	argOffset := 0

	// For filtering by teacher type and class, we need to join with appropriate tables
	if teacherType == "homeroom" {
		// Only homeroom teachers
		if classID != "" {
			// Specific homeroom teacher for a class
			whereConditions = append(whereConditions, "c.id = $"+fmt.Sprint(argOffset+1))
			whereArgs = append(whereArgs, classID)
			argOffset++
		}
	} else if teacherType == "quran" {
		// Only Quran teachers
		if classID != "" {
			// Quran teachers for a specific class
			whereConditions = append(whereConditions, "cqt.class_id = $"+fmt.Sprint(argOffset+1))
			whereArgs = append(whereArgs, classID)
			argOffset++
		}
	}

	// Build count query
	countQuery := `
		SELECT COUNT(DISTINCT t.user_id)
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	`

	// Add appropriate joins based on filter
	if teacherType == "homeroom" {
		countQuery += ` JOIN classes c ON c.homeroom_teacher_id = t.user_id`
	} else if teacherType == "quran" {
		countQuery += ` JOIN class_quran_teachers cqt ON cqt.quran_teacher_id = t.user_id AND cqt.is_active = true`
		if classID == "" {
			countQuery += ` JOIN classes c ON c.id = cqt.class_id`
		}
	}

	if len(whereConditions) > 0 || search != "" {
		countQuery += " WHERE "
	}

	// Add search condition
	if search != "" {
		countQuery += "(t.full_name ILIKE $" + fmt.Sprint(argOffset+1) + " OR u.email ILIKE $" + fmt.Sprint(argOffset+1) + ")"
		whereArgs = append(whereArgs, "%"+search+"%")
		argOffset++
	}

	// Add filter conditions
	if len(whereConditions) > 0 {
		if search != "" {
			countQuery += " AND "
		}
		countQuery += whereConditions[0]
	}

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, whereArgs...)
	if err != nil {
		return nil, 0, err
	}

	// Build data query
	query := `
		SELECT DISTINCT t.user_id, t.full_name, t.phone, t.created_at, u.email
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	`

	// Add appropriate joins based on filter
	if teacherType == "homeroom" {
		query += ` JOIN classes c ON c.homeroom_teacher_id = t.user_id`
	} else if teacherType == "quran" {
		query += ` JOIN class_quran_teachers cqt ON cqt.quran_teacher_id = t.user_id AND cqt.is_active = true`
		if classID == "" {
			query += ` JOIN classes c ON c.id = cqt.class_id`
		}
	}

	// Build WHERE clause for data query
	whereConditions = []string{}
	whereArgs = []interface{}{}
	argOffset = 0

	if len(whereConditions) > 0 || search != "" {
		query += " WHERE "
	}

	// Add search condition
	if search != "" {
		query += "(t.full_name ILIKE $" + fmt.Sprint(argOffset+1) + " OR u.email ILIKE $" + fmt.Sprint(argOffset+1) + ")"
		whereArgs = append(whereArgs, "%"+search+"%")
		argOffset++
	}

	// Add filter conditions
	if len(whereConditions) > 0 {
		if search != "" {
			query += " AND "
		}
		query += whereConditions[0]
	}

	query += " ORDER BY t.full_name LIMIT $" + fmt.Sprint(argOffset+1) + " OFFSET $" + fmt.Sprint(argOffset+2)
	whereArgs = append(whereArgs, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, whereArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var teachers []TeacherWithClasses
	for rows.Next() {
		var t TeacherWithClasses
		if err := rows.Scan(&t.UserID, &t.FullName, &t.Phone, &t.CreatedAt, &t.Email); err != nil {
			return nil, 0, err
		}
		teachers = append(teachers, t)
	}

	// Now, get class information for each teacher
	for i := range teachers {
		// Get homeroom classes
		homeroomQuery := `
			SELECT c.name
			FROM classes c
			WHERE c.homeroom_teacher_id = $1
			ORDER BY c.name
		`
		var homeroomClasses []string
		err := r.db.SelectContext(ctx, &homeroomClasses, homeroomQuery, teachers[i].UserID)
		if err != nil {
			return nil, 0, err
		}
		teachers[i].HomeroomClasses = homeroomClasses

		// Get Quran teacher classes
		quranQuery := `
			SELECT DISTINCT c.name
			FROM classes c
			INNER JOIN class_quran_teachers cqt ON c.id = cqt.class_id
			WHERE cqt.quran_teacher_id = $1 AND cqt.is_active = true
			ORDER BY c.name
		`
		var quranClasses []string
		err = r.db.SelectContext(ctx, &quranClasses, quranQuery, teachers[i].UserID)
		if err != nil {
			return nil, 0, err
		}
		teachers[i].QuranTeacherClasses = quranClasses
	}

	return teachers, total, nil
}

// Create creates a new teacher (user account must be created first)
func (r *TeacherRepository) Create(ctx context.Context, teacher *Teacher) error {
	query := `
		INSERT INTO teachers (user_id, full_name, phone)
		VALUES ($1, $2, $3)
	`

	_, err := r.db.ExecContext(ctx, query, teacher.UserID, teacher.FullName, teacher.Phone)
	return err
}

// Update updates a teacher
func (r *TeacherRepository) Update(ctx context.Context, userID string, teacher *Teacher) error {
	query := `
		UPDATE teachers
		SET full_name = $1, phone = $2
		WHERE user_id = $3
	`

	_, err := r.db.ExecContext(ctx, query, teacher.FullName, teacher.Phone, userID)
	return err
}

// Delete deletes a teacher (cascades to user account)
func (r *TeacherRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM teachers WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
