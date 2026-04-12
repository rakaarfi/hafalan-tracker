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
			WHERE c.teacher_id = $1
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
			WHERE cqt.teacher_id = $1
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

	// Build WHERE conditions and JOINs based on filters
	type filterConfig struct {
		joins          string
		whereClause    string
		filterArgs     []interface{}
		requiresFilter bool
	}

	buildFilterConfig := func() filterConfig {
		if teacherType == "homeroom" {
			// Only homeroom teachers
			cfg := filterConfig{
				joins: ` JOIN classes c ON c.teacher_id = t.user_id`,
			}
			if classID != "" {
				cfg.whereClause = "c.id = $1"
				cfg.filterArgs = []interface{}{classID}
				cfg.requiresFilter = true
			}
			return cfg
		} else if teacherType == "quran" {
			// Only Quran teachers
			cfg := filterConfig{
				joins: ` JOIN class_quran_teachers cqt ON cqt.teacher_id = t.user_id`,
			}
			if classID != "" {
				cfg.whereClause = "cqt.class_id = $1"
				cfg.filterArgs = []interface{}{classID}
				cfg.requiresFilter = true
			}
			return cfg
		} else {
			// All teachers - but if classID is specified, show teachers associated with that class
			if classID != "" {
				// Show teachers who are either homeroom or Quran teacher for this class
				return filterConfig{
					joins: ` LEFT JOIN classes c ON c.teacher_id = t.user_id AND c.id = $1
					        LEFT JOIN class_quran_teachers cqt ON cqt.teacher_id = t.user_id AND cqt.class_id = $2`,
					whereClause:    "(c.id IS NOT NULL OR cqt.class_id IS NOT NULL)",
					filterArgs:     []interface{}{classID, classID},
					requiresFilter: true,
				}
			}
		}
		return filterConfig{}
	}

	cfg := buildFilterConfig()

	// Build base query parts
	baseQuery := `
		FROM teachers t
		JOIN users u ON t.user_id = u.id
	` + cfg.joins

	// Build WHERE clause with search
	whereClause := ""
	queryArgs := cfg.filterArgs
	argOffset := len(cfg.filterArgs)

	if search != "" {
		whereClause = "(t.full_name ILIKE $" + fmt.Sprint(argOffset+1) + " OR u.email ILIKE $" + fmt.Sprint(argOffset+1) + ")"
		queryArgs = append(queryArgs, "%"+search+"%")
		argOffset++
	}

	if cfg.whereClause != "" {
		if whereClause != "" {
			whereClause += " AND "
		}
		whereClause += cfg.whereClause
	}

	if whereClause != "" {
		whereClause = " WHERE " + whereClause
	}

	// Build and execute count query
	countQuery := "SELECT COUNT(DISTINCT t.user_id)" + baseQuery + whereClause
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, queryArgs...)
	if err != nil {
		return nil, 0, err
	}

	// Build and execute data query
	dataQuery := `SELECT DISTINCT t.user_id, t.full_name, t.phone, t.created_at, u.email` + baseQuery + whereClause
	dataQuery += " ORDER BY t.full_name LIMIT $" + fmt.Sprint(argOffset+1) + " OFFSET $" + fmt.Sprint(argOffset+2)
	queryArgs = append(queryArgs, limit, offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, queryArgs...)
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
			WHERE c.teacher_id = $1
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
			WHERE cqt.teacher_id = $1
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
