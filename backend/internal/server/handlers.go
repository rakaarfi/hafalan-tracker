package server

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/service"
)

// healthCheck returns the health status of the server
func (s *Server) healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"database": func() string {
			if err := s.db.Health(); err != nil {
				return "unhealthy"
			}
			return "healthy"
		}(),
	})
}

// ping returns a simple pong response
func (s *Server) ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

// login handles user authentication
func (s *Server) login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Authenticate user
	resp, err := s.authService.Login(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	// Set JWT token in httpOnly cookie (secure against XSS)
	c.SetSameSite(http.SameSiteStrictMode)

	// Check if running in production (HTTPS)
	isProduction := c.GetHeader("X-Forwarded-Proto") == "https"
	secureFlag := isProduction // true if HTTPS, false if HTTP

	c.SetCookie(
		"auth_token",
		resp.Token,
		3600*24*7, // 7 days
		"/",
		"",
		secureFlag, // true in production (HTTPS), false in development (HTTP)
		true,       // httpOnly - prevents JavaScript access (XSS protection)
	)

	// Return user info without token (token is in cookie)
	c.JSON(http.StatusOK, gin.H{
		"user": resp.User,
	})
}

// logout handles user logout
func (s *Server) logout(c *gin.Context) {
	// Clear the auth_token cookie
	c.SetSameSite(http.SameSiteStrictMode)

	// Check if running in production (HTTPS)
	isProduction := c.GetHeader("X-Forwarded-Proto") == "https"
	secureFlag := isProduction

	c.SetCookie(
		"auth_token",
		"",
		-1,          // Expire immediately
		"/",
		"",
		secureFlag,  // Must match login cookie settings
		true,        // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// getUsers returns all users
func (s *Server) getUsers(c *gin.Context) {
	// Only admin can access this endpoint
	userRole := c.GetString("role")
	if userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only admin can access user list",
		})
		return
	}

	ctx := c.Request.Context()

	// Get all users from database
	query := `
		SELECT u.id, u.email, r.name as role,
		       COALESCE(t.full_name, p.full_name, 'System Admin') as name,
		       COALESCE(t.phone, p.phone, '') as phone
		FROM users u
		INNER JOIN roles r ON u.role_id = r.id
		LEFT JOIN teachers t ON u.id = t.user_id
		LEFT JOIN parents p ON u.id = p.user_id
		ORDER BY u.created_at DESC
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch users",
		})
		return
	}
	defer rows.Close()

	users := []gin.H{}
	for rows.Next() {
		var id, email, role, name, phone string
		if err := rows.Scan(&id, &email, &role, &name, &phone); err != nil {
			continue
		}

		users = append(users, gin.H{
			"id":    id,
			"email": email,
			"role":  role,
			"name":  name,
			"phone": phone,
		})
	}

	c.JSON(http.StatusOK, users)
}

// getUser returns a specific user
func (s *Server) getUser(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "User details",
	})
}

// getMemorizations returns all memorizations
func (s *Server) getMemorizations(c *gin.Context) {
	// Get user info from context
	userID := c.GetString("user_id")
	role := c.GetString("role")

	var mems []repository.MemorizationWithDetails
	var err error

	// Filter based on role
	if role == "teacher" {
		// Teachers can only see their assigned students' memorizations
		mems, err = s.memorizationService.GetByTeacherID(c.Request.Context(), userID)
	} else if role == "parent" {
		// Parents can only see their children's memorizations
		// Get all children's progress (includes parent-child relationship validation)
		childProgress, err := s.parentService.GetChildrenProgressByUserID(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to retrieve children's memorizations",
			})
			return
		}

		// Flatten all memorizations from all children into a single array
		allMems := []repository.MemorizationWithDetails{}
		for _, child := range childProgress {
			allMems = append(allMems, child.RecentTests...)
		}

		mems = allMems
	} else {
		// Admins can see all memorizations
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid role for memorization view",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve memorizations",
		})
		return
	}

	c.JSON(http.StatusOK, mems)
}

// getMemorization returns a specific memorization
func (s *Server) getMemorization(c *gin.Context) {
	id := c.Param("id")

	mem, err := s.memorizationService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve memorization",
		})
		return
	}

	if mem == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Memorization not found",
		})
		return
	}

	c.JSON(http.StatusOK, mem)
}

// createMemorization creates a new memorization record
func (s *Server) createMemorization(c *gin.Context) {
	var req service.CreateMemorizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Get user info from context
	userID := c.GetString("user_id")
	role := c.GetString("role")

	// Convert userID to int
	teacherID := 0
	if _, err := fmt.Sscanf(userID, "%d", &teacherID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	// Only teachers can create memorization records
	if role != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teachers can create memorization records",
		})
		return
	}

	// Set teacher ID to current user (convert back to string)
	req.TeacherID = userID

	// VALIDATION: Check if student is in teacher's assigned class
	assignments, err := s.classQuranTeacherRepo.GetActiveByTeacher(c.Request.Context(), teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to verify teacher assignment",
		})
		return
	}

	// Get student's class ID
	student, err := s.studentRepo.GetByID(c.Request.Context(), req.StudentID)
	if err != nil || student == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Student not found",
		})
		return
	}

	// Parse student's class ID as integer
	studentClassID := 0
	if student.ClassID != "" {
		_, err := fmt.Sscanf(student.ClassID, "%d", &studentClassID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid student class ID",
			})
			return
		}
	}

	// Check if student's class is in teacher's assignments
	isAssigned := false
	for _, assignment := range assignments {
		if assignment.ClassID == studentClassID {
			isAssigned = true
			break
		}
	}

	if !isAssigned {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to input memorization for this student. This student is not in your assigned classes.",
		})
		return
	}

	// Create memorization
	mem, err := s.memorizationService.Create(c.Request.Context(), &req, userID)
	if err != nil {
		// Log error for debugging
		fmt.Printf("[createMemorization] Error: %v\n", err)
		fmt.Printf("[createMemorization] Request: %+v\n", req)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, mem)
}

// updateMemorization updates an existing memorization record
func (s *Server) updateMemorization(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateMemorizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Set ID from URL parameter
	req.ID = id

	// Get user info from context
	userID := c.GetString("user_id")
	role := c.GetString("role")

	// Convert userID to int
	teacherID := 0
	if _, err := fmt.Sscanf(userID, "%d", &teacherID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	// Only teachers can update memorization records
	if role != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teachers can update memorization records",
		})
		return
	}

	// VALIDATION: Get the existing memorization to check ownership
	existingMem, err := s.memorizationService.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Memorization record not found",
		})
		return
	}

	// Check if the teacher owns this record
	if existingMem.TeacherID != teacherID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to update this memorization record",
		})
		return
	}

	// Additional validation: Check if student is still in teacher's assigned class
	assignments, err := s.classQuranTeacherRepo.GetActiveByTeacher(c.Request.Context(), teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to verify teacher assignment",
		})
		return
	}

	// Get student's class ID from the existing record
	studentID := fmt.Sprintf("%d", existingMem.StudentID)
	student, err := s.studentRepo.GetByID(c.Request.Context(), studentID)
	if err != nil || student == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Student not found",
		})
		return
	}

	// Parse student's class ID as integer
	studentClassID := 0
	if student.ClassID != "" {
		_, err := fmt.Sscanf(student.ClassID, "%d", &studentClassID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid student class ID",
			})
			return
		}
	}

	// Check if student's class is still in teacher's assignments
	isAssigned := false
	for _, assignment := range assignments {
		if assignment.ClassID == studentClassID {
			isAssigned = true
			break
		}
	}

	if !isAssigned {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This student is no longer in your assigned classes",
		})
		return
	}

	// Update memorization
	mem, err := s.memorizationService.Update(c.Request.Context(), &req, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, mem)
}

// getParentChildren returns all children of the current parent with their progress
func (s *Server) getParentChildren(c *gin.Context) {
	// Get user info from context
	userID := c.GetString("user_id")

	// Get all children's progress for this user
	progress, err := s.parentService.GetChildrenProgressByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve children progress",
		})
		return
	}

	c.JSON(http.StatusOK, progress)
}

// getParentChildProgress returns detailed progress for a specific child
func (s *Server) getParentChildProgress(c *gin.Context) {
	childID := c.Param("id")

	// Get user info from context
	userID := c.GetString("user_id")

	// Get specific child's progress
	progress, err := s.parentService.GetChildProgressByUserID(c.Request.Context(), userID, childID)
	if err != nil {
		if err.Error() == "student not found in parent's children list" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You don't have permission to view this student's progress",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, progress)
}

// getTeacherStudents returns all students for the current teacher's assigned classes
func (s *Server) getTeacherStudents(c *gin.Context) {
	// Get teacher ID from context and convert to int
	userID := c.GetString("user_id")
	teacherID := 0
	if _, err := fmt.Sscanf(userID, "%d", &teacherID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid teacher ID",
		})
		return
	}

	ctx := c.Request.Context()

	// Get all active class assignments for this teacher in current academic year
	// For now, use 2025/2026 as default - this should be configurable later
	assignments, err := s.classQuranTeacherRepo.GetActiveByTeacher(ctx, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teacher assignments",
			"details": err.Error(),
		})
		return
	}

	// If no assignments found, return empty array
	if len(assignments) == 0 {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	// Get class IDs from assignments
	classIDs := make([]int, len(assignments))
	for i, assignment := range assignments {
		classIDs[i] = assignment.ClassID
	}

	// Get students from assigned classes
	query := `
		SELECT s.id, s.name, s.class_id, c.name as class_name, c.grade_level
		FROM students s
		INNER JOIN classes c ON CAST(s.class_id AS INTEGER) = c.id
		WHERE CAST(s.class_id AS INTEGER) = ANY($1::int[])
		  AND s.is_active = true
		  AND c.is_active = true
		ORDER BY c.name, s.name
	`

	rows, err := s.db.QueryContext(ctx, query, pq.Array(classIDs))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve students",
			"details": err.Error(),
		})
		return
	}
	defer rows.Close()

	students := []gin.H{}
	for rows.Next() {
		var id, name, classID, className, gradeLevel string
		if err := rows.Scan(&id, &name, &classID, &className, &gradeLevel); err != nil {
			continue
		}

		students = append(students, gin.H{
			"id":          id,
			"name":        name,
			"class_id":    classID,
			"class_name":  className,
			"grade_level": gradeLevel,
		})
	}

	c.JSON(http.StatusOK, students)
}

// getTeacherClasses returns all classes assigned to the current teacher
func (s *Server) getTeacherClasses(c *gin.Context) {
	// Get teacher ID from context and convert to int
	userID := c.GetString("user_id")
	teacherID := 0
	if _, err := fmt.Sscanf(userID, "%d", &teacherID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid teacher ID",
		})
		return
	}

	ctx := c.Request.Context()

	// Get all active class assignments for this teacher in current academic year
	assignments, err := s.classQuranTeacherRepo.GetActiveByTeacher(ctx, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teacher assignments",
			"details": err.Error(),
		})
		return
	}

	// If no assignments found, return empty array
	if len(assignments) == 0 {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	// Get class IDs from assignments
	classIDs := make([]int, len(assignments))
	for i, assignment := range assignments {
		classIDs[i] = assignment.ClassID
	}

	// Get class details
	query := `
		SELECT c.id, c.name, c.grade_level
		FROM classes c
		WHERE c.id = ANY($1::int[])
		  AND c.is_active = true
		ORDER BY c.name
	`

	rows, err := s.db.QueryContext(ctx, query, pq.Array(classIDs))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve classes",
			"details": err.Error(),
		})
		return
	}
	defer rows.Close()

	classes := []gin.H{}
	for rows.Next() {
		var id int
		var name, gradeLevel string
		if err := rows.Scan(&id, &name, &gradeLevel); err != nil {
			continue
		}

		classes = append(classes, gin.H{
			"id":          fmt.Sprintf("%d", id),
			"name":        name,
			"grade_level": gradeLevel,
		})
	}

	c.JSON(http.StatusOK, classes)
}

// getStudent retrieves a specific student by ID
func (s *Server) getStudent(c *gin.Context) {
	studentID := c.Param("id")

	// Get student with full details including parents
	student, err := s.studentRepo.GetByIDWithDetails(c.Request.Context(), studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve student",
		})
		return
	}

	if student == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Student not found",
		})
		return
	}

	c.JSON(http.StatusOK, student)
}

// getStudentMemorizations retrieves all memorizations for a specific student
func (s *Server) getStudentMemorizations(c *gin.Context) {
	studentID := c.Param("id")
	userRole := c.GetString("user_role")
	userID := c.GetString("user_id")

	ctx := c.Request.Context()

	// If user is a teacher, verify they have permission to view this student's memorizations
	if userRole == "teacher" {
		teacherID := 0
		if _, err := fmt.Sscanf(userID, "%d", &teacherID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid teacher ID",
			})
			return
		}

		// Get teacher's assigned classes
		assignments, err := s.classQuranTeacherRepo.GetActiveByTeacher(ctx, teacherID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to verify teacher permissions",
			})
			return
		}

		// If teacher has no assignments, deny access
		if len(assignments) == 0 {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You don't have permission to view this student's memorizations",
			})
			return
		}

		// Get class IDs from assignments
		classIDs := make([]int, len(assignments))
		for i, assignment := range assignments {
			classIDs[i] = assignment.ClassID
		}

		// Check if student belongs to any of teacher's assigned classes
		student, err := s.studentRepo.GetByID(ctx, studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to retrieve student information",
			})
			return
		}

		// Convert student's class_id to int for comparison
		studentClassID := 0
		if student.ClassID != "" {
			if _, err := fmt.Sscanf(student.ClassID, "%d", &studentClassID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Invalid student class ID",
				})
				return
			}
		}

		// Check if student's class is in teacher's assigned classes
		hasAccess := false
		for _, classID := range classIDs {
			if classID == studentClassID {
				hasAccess = true
				break
			}
		}

		if !hasAccess {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You don't have permission to view this student's memorizations",
			})
			return
		}
	}

	// For admin and parent roles, allow access (they have broader permissions)
	// For parents, the parent-specific endpoints should be used instead for their children

	memorizations, err := s.memorizationService.GetByStudentID(ctx, studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve memorizations",
		})
		return
	}

	c.JSON(http.StatusOK, memorizations)
}

// getDashboardStats retrieves dashboard statistics
func (s *Server) getDashboardStats(c *gin.Context) {
	// Get all stats
	students, err := s.studentRepo.GetAll(c.Request.Context(), "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve statistics",
		})
		return
	}

	// Count active students
	totalStudents := len(students)
	activeStudents := 0
	for _, s := range students {
		if s.IsActive {
			activeStudents++
		}
	}

	// Get real stats from database
	dbStats, err := s.statsRepo.GetDashboardStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve statistics",
		})
		return
	}

	// Combine with student stats
	stats := map[string]interface{}{
		"total_students":      totalStudents,
		"active_students":     activeStudents,
		"total_teachers":      dbStats.TotalTeachers,
		"total_parents":       dbStats.TotalParents,
		"total_memorizations": dbStats.TotalMemorizations,
		"recent_tests":        dbStats.TotalMemorizations,
	}

	c.JSON(http.StatusOK, stats)
}

// getAllStudents retrieves all students (for admin)
func (s *Server) getAllStudents(c *gin.Context) {
	search := c.Query("search")
	classID := c.Query("class_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	students, total, err := s.studentRepo.GetAllWithDetailsPaginated(c.Request.Context(), search, classID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve students",
		})
		return
	}

	totalPages := (total + limit - 1) / limit
	c.JSON(http.StatusOK, gin.H{
		"data":        students,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}

// getAllTeachers retrieves all teachers
func (s *Server) getAllTeachers(c *gin.Context) {
	search := c.Query("search")
	teacherType := c.Query("teacher_type") // "homeroom", "quran", or ""
	classID := c.Query("class_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	teachers, total, err := s.teacherRepo.GetAllWithClassesPaginated(c.Request.Context(), search, teacherType, classID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teachers",
		})
		return
	}

	totalPages := (total + limit - 1) / limit
	c.JSON(http.StatusOK, gin.H{
		"data":        teachers,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}

// getTeacher retrieves a specific teacher by ID
func (s *Server) getTeacher(c *gin.Context) {
	id := c.Param("id")

	teacher, err := s.teacherRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teacher",
		})
		return
	}

	if teacher == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Teacher not found",
		})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// getAllParents retrieves all parents
func (s *Server) getAllParents(c *gin.Context) {
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	parents, total, err := s.parentRepo.GetAllPaginated(c.Request.Context(), search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve parents",
		})
		return
	}

	totalPages := (total + limit - 1) / limit
	c.JSON(http.StatusOK, gin.H{
		"data":        parents,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}

// getParent retrieves a specific parent by ID
func (s *Server) getParent(c *gin.Context) {
	id := c.Param("id")

	parent, err := s.parentRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve parent",
		})
		return
	}

	if parent == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Parent not found",
		})
		return
	}

	c.JSON(http.StatusOK, parent)
}

// getAllClasses retrieves all classes
func (s *Server) getAllClasses(c *gin.Context) {
	search := c.Query("search")

	classes, err := s.classRepo.GetAll(c.Request.Context(), search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve classes",
		})
		return
	}

	c.JSON(http.StatusOK, classes)
}

// getClass retrieves a specific class by ID
func (s *Server) getClass(c *gin.Context) {
	id := c.Param("id")

	class, err := s.classRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve class",
		})
		return
	}

	if class == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Class not found",
		})
		return
	}

	c.JSON(http.StatusOK, class)
}

// createStudent creates a new student
func (s *Server) createStudent(c *gin.Context) {
	var req service.CreateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	student, err := s.studentService.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, student)
}

// updateStudent updates an existing student
func (s *Server) updateStudent(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	req.ID = id

	student, err := s.studentService.Update(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, student)
}

// deleteStudent deletes a student
func (s *Server) deleteStudent(c *gin.Context) {
	id := c.Param("id")

	err := s.studentService.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Student deleted successfully",
	})
}

// createTeacher creates a new teacher
func (s *Server) createTeacher(c *gin.Context) {
	var req service.CreateTeacherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	teacher, err := s.teacherService.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, teacher)
}

// updateTeacher updates an existing teacher
func (s *Server) updateTeacher(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateTeacherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Set UserID from URL parameter
	req.UserID = id

	teacher, err := s.teacherService.Update(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// deleteTeacher deletes a teacher
func (s *Server) deleteTeacher(c *gin.Context) {
	id := c.Param("id")

	err := s.teacherService.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Teacher deleted successfully",
	})
}

// createParent creates a new parent
func (s *Server) createParent(c *gin.Context) {
	var req service.CreateParentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	parent, err := s.parentService.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, parent)
}

// updateParent updates an existing parent
func (s *Server) updateParent(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateParentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	req.UserID = id

	parent, err := s.parentService.Update(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, parent)
}

// deleteParent deletes a parent
func (s *Server) deleteParent(c *gin.Context) {
	id := c.Param("id")

	err := s.parentService.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Parent deleted successfully",
	})
}

// getParentChildren retrieves all children for a specific parent (admin endpoint)
func (s *Server) getParentChildrenAdmin(c *gin.Context) {
	parentID := c.Param("id")

	// Log for debugging
	log.Printf("[DEBUG] getParentChildrenAdmin called with parentID: %s", parentID)

	children, err := s.studentRepo.GetByParentID(c.Request.Context(), parentID)
	if err != nil {
		log.Printf("[ERROR] Failed to retrieve children for parent %s: %v", parentID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve children",
		})
		return
	}

	log.Printf("[DEBUG] Found %d children for parent %s", len(children), parentID)
	c.JSON(http.StatusOK, children)
}

// addChildToParent assigns a child to a parent
func (s *Server) addChildToParent(c *gin.Context) {
	parentID := c.Param("id")

	var req struct {
		StudentID string `json:"student_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Student ID is required",
		})
		return
	}

	// Get parent to determine relationship type
	parent, err := s.parentRepo.GetByID(c.Request.Context(), parentID)
	if err != nil || parent == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Parent not found",
		})
		return
	}

	// Determine relationship type based on parent gender
	relationshipType := "father"
	if parent.Gender != nil && *parent.Gender == "female" {
		relationshipType = "mother"
	}

	// Check if student already has a parent of this type
	student, err := s.studentRepo.GetByIDWithDetails(c.Request.Context(), req.StudentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve student",
		})
		return
	}

	if student == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Student not found",
		})
		return
	}

	// Validate: max 1 father and 1 mother
	if relationshipType == "father" && student.Parent1ID != "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Murid sudah punya ayah. Silakan hapus ayah yang sudah ada terlebih dahulu.",
		})
		return
	}

	if relationshipType == "mother" && student.Parent2ID != "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Murid sudah punya ibu. Silakan hapus ibu yang sudah ada terlebih dahulu.",
		})
		return
	}

	// Add parent to student
	err = s.studentRepo.AddParent(c.Request.Context(), req.StudentID, parentID, relationshipType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to assign child to parent",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Child assigned successfully",
	})
}

// removeChildFromParent removes a child from a parent
func (s *Server) removeChildFromParent(c *gin.Context) {
	parentID := c.Param("id")
	studentID := c.Param("studentId")

	// Get parent to determine relationship type
	parent, err := s.parentRepo.GetByID(c.Request.Context(), parentID)
	if err != nil || parent == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Parent not found",
		})
		return
	}

	// Get student to check current parents
	student, err := s.studentRepo.GetByIDWithDetails(c.Request.Context(), studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve student",
		})
		return
	}

	if student == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Student not found",
		})
		return
	}

	// Verify this parent is actually linked to this student
	relationshipType := "father"
	if parent.Gender != nil && *parent.Gender == "female" {
		relationshipType = "mother"
	}

	isLinked := false
	if relationshipType == "father" && student.Parent1ID == parentID {
		isLinked = true
	} else if relationshipType == "mother" && student.Parent2ID == parentID {
		isLinked = true
	}

	if !isLinked {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Orang tua ini tidak terhubung dengan murid tersebut",
		})
		return
	}

	// Remove all parents and re-add the ones that should remain
	var parentsToAdd []struct {
		id        string
		relType   string
	}

	if student.Parent1ID != "" && student.Parent1ID != parentID {
		parentsToAdd = append(parentsToAdd, struct {
			id        string
			relType   string
		}{student.Parent1ID, "father"})
	}

	if student.Parent2ID != "" && student.Parent2ID != parentID {
		parentsToAdd = append(parentsToAdd, struct {
			id        string
			relType   string
		}{student.Parent2ID, "mother"})
	}

	// Remove all parents
	err = s.studentRepo.RemoveParents(c.Request.Context(), studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to remove parent",
		})
		return
	}

	// Re-add remaining parents
	for _, p := range parentsToAdd {
		err = s.studentRepo.AddParent(c.Request.Context(), studentID, p.id, p.relType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to restore parent relationships",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Child removed successfully",
	})
}

// createClass creates a new class
func (s *Server) createClass(c *gin.Context) {
	var req service.CreateClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	class, err := s.classService.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, class)
}

// updateClass updates an existing class
func (s *Server) updateClass(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	req.ID = id

	class, err := s.classService.Update(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, class)
}

// deleteClass deletes a class
func (s *Server) deleteClass(c *gin.Context) {
	id := c.Param("id")

	err := s.classService.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class deleted successfully",
	})
}

// getClassQuranTeachers retrieves active Quran teacher assignments for a class
func (s *Server) getClassQuranTeachers(c *gin.Context) {
	classID := c.Param("id")

	// Convert classID to int
	classIDInt, err := strconv.Atoi(classID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid class ID",
		})
		return
	}

	// Get history of Quran teachers for this class
	assignments, err := s.classQuranTeacherRepo.GetHistoryByClass(c.Request.Context(), classIDInt)
	if err != nil {
		// Return empty array instead of error
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	// Get teacher names for each assignment
	type AssignmentWithTeacherName struct {
		ID               int     `json:"id"`
		ClassID          int     `json:"class_id"`
		TeacherID        int     `json:"teacher_id"`
		QuranTeacherName string `json:"quran_teacher_name"`
		AssignedAt       string  `json:"assigned_at"`
	}

	result := []AssignmentWithTeacherName{}
	for _, assignment := range assignments {
		// Get teacher name
		teacher, err := s.teacherRepo.GetByUserID(c.Request.Context(), fmt.Sprint(assignment.TeacherID))
		var teacherName string
		if err == nil && teacher != nil {
			teacherName = teacher.FullName
		} else {
			teacherName = "Unknown"
		}

		result = append(result, AssignmentWithTeacherName{
			ID:               assignment.ID,
			ClassID:          assignment.ClassID,
			TeacherID:        assignment.TeacherID,
			QuranTeacherName: teacherName,
			AssignedAt:       assignment.AssignedAt,
		})
	}

	c.JSON(http.StatusOK, result)

}
// assignQuranTeacherToClass assigns a Quran teacher to a class
func (s *Server) assignQuranTeacherToClass(c *gin.Context) {

	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Quran teacher assignment feature is temporarily disabled",
	})

}


// updateQuranTeacherAssignment updates a Quran teacher assignment
func (s *Server) updateQuranTeacherAssignment(c *gin.Context) {

	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Quran teacher assignment feature is temporarily disabled",
	})

}


// endQuranTeacherAssignment ends a Quran teacher assignment
func (s *Server) endQuranTeacherAssignment(c *gin.Context) {

	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Quran teacher assignment feature is temporarily disabled",
	})

}


// getSettings retrieves current settings
func (s *Server) getSettings(c *gin.Context) {
	settings, err := s.settingsService.GetSettings(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve settings",
		})
		return
	}

	// Return settings with proper field name mapping
	response := map[string]interface{}{
		"school_name":    settings.SchoolName,
		"school_logo":    settings.SchoolLogo,
		"school_address": settings.SchoolAddress,
		"school_phone":   settings.SchoolPhone,
		"school_email":   settings.SchoolEmail,
		"academic_year":  settings.AcademicYear,
	}

	c.JSON(http.StatusOK, response)
}

// updateSettings updates school settings
func (s *Server) updateSettings(c *gin.Context) {
	var req service.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	settings, err := s.settingsService.UpdateSettings(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// uploadLogo handles logo upload
func (s *Server) uploadLogo(c *gin.Context) {
	// TODO: Implement file upload logic
	// For now, return a mock response
	c.JSON(http.StatusOK, gin.H{
		"message": "Logo upload functionality - to be implemented with file storage",
		"logo_url": "/uploads/school-logo.png",
	})
}

// resetPassword resets a user's password (admin only)
func (s *Server) resetPassword(c *gin.Context) {
	var req service.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	err := s.settingsService.ResetPassword(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}

// updateProfile updates user profile
func (s *Server) updateProfile(c *gin.Context) {
	var req service.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	userID := c.GetString("user_id")
	role := c.GetString("role")

	err := s.settingsService.UpdateProfile(c.Request.Context(), userID, &req, role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
}

// changePassword allows user to change their own password
func (s *Server) changePassword(c *gin.Context) {
	var req service.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	userID := c.GetString("user_id")

	err := s.settingsService.ChangePassword(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully",
	})
}

// formatDatePtr converts a time pointer to a string pointer in YYYY-MM-DD format
func formatDatePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formatted := t.Format("2006-01-02")
	return &formatted
}
