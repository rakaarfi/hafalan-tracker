package repository

import (
	"github.com/jmoiron/sqlx"
	"context"
)

// DashboardStats represents dashboard statistics
type DashboardStats struct {
	TotalStudents    int `json:"total_students"`
	TotalTeachers    int `json:"total_teachers"`
	TotalParents     int `json:"total_parents"`
	TotalMemorizations int `json:"total_memorizations"`
}

// StatsRepository handles statistics data operations
type StatsRepository struct {
	db *sqlx.DB
}

// NewStatsRepository creates a new stats repository
func NewStatsRepository(db *sqlx.DB) *StatsRepository {
	return &StatsRepository{db: db}
}

// GetDashboardStats retrieves dashboard statistics
func (r *StatsRepository) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	query := `
		SELECT
			(SELECT COUNT(*) FROM students) as total_students,
			(SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
			(SELECT COUNT(*) FROM users WHERE role = 'parent') as total_parents,
			(SELECT COUNT(*) FROM memorizations) as total_memorizations
	`

	var stats DashboardStats
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalStudents,
		&stats.TotalTeachers,
		&stats.TotalParents,
		&stats.TotalMemorizations,
	)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// GetRecentActivities retrieves recent activities
func (r *StatsRepository) GetRecentActivities(ctx context.Context, limit int) ([]map[string]interface{}, error) {
	query := `
		SELECT
			m.id,
			m.created_at,
			m.status,
			u.name as teacher_name,
			s.name as student_name,
			c.name as class_name
		FROM memorizations m
		JOIN users u ON m.teacher_id = u.id
		JOIN students s ON m.student_id = s.id
		JOIN classes c ON s.class_id = c.id
		ORDER BY m.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []map[string]interface{}
	for rows.Next() {
		var activity map[string]interface{}
		var id, teacherName, studentName, className, status, createdAt string

		if err := rows.Scan(&id, &createdAt, &status, &teacherName, &studentName, &className); err != nil {
			return nil, err
		}

		activity = map[string]interface{}{
			"id":           id,
			"created_at":   createdAt,
			"status":       status,
			"teacher_name": teacherName,
			"student_name": studentName,
			"class_name":   className,
		}
		activities = append(activities, activity)
	}

	return activities, nil
}
