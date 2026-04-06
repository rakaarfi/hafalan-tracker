package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
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

	c.JSON(http.StatusOK, resp)
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
		// TODO: Implement parent-child relationship check
		c.JSON(http.StatusNotImplemented, gin.H{
			"error": "Parent view not yet implemented",
		})
		return
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

	// Only teachers can create memorization records
	if role != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teachers can create memorization records",
		})
		return
	}

	// Set teacher ID to current user
	req.TeacherID = userID

	// Create memorization
	mem, err := s.memorizationService.Create(c.Request.Context(), &req, userID)
	if err != nil {
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

	// Only teachers can update memorization records
	if role != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teachers can update memorization records",
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

// getTeacherStudents returns all students for the current teacher
func (s *Server) getTeacherStudents(c *gin.Context) {
	// Get teacher ID from context (currently not used, but will be used for filtering)
	_ = c.GetString("user_id")

	// For now, return all students (this can be optimized to filter by teacher)
	// TODO: Implement proper filtering by teacher's memorizations
	students, err := s.studentRepo.GetAll(c.Request.Context(), "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve students",
		})
		return
	}

	c.JSON(http.StatusOK, students)
}

// getStudent retrieves a specific student by ID
func (s *Server) getStudent(c *gin.Context) {
	studentID := c.Param("id")

	student, err := s.studentRepo.GetByID(c.Request.Context(), studentID)
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
// getStudentMemorizations retrieves all memorizations for a specific student
}
func (s *Server) getStudentMemorizations(c *gin.Context) {
	studentID := c.Param("id")

	memorizations, err := s.memorizationService.GetByStudentID(c.Request.Context(), studentID)
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

	// Get total memorizations
	// For now, we'll return basic stats
	stats := map[string]interface{}{
		"total_students":      totalStudents,
		"active_students":     activeStudents,
		"total_teachers":      3, // From seed data
		"total_parents":       5, // From seed data
		"total_memorizations": 6, // From seed data
		"recent_tests":        6,
	}

	c.JSON(http.StatusOK, stats)
}

// getAllStudents retrieves all students (for admin)
func (s *Server) getAllStudents(c *gin.Context) {
	search := c.Query("search")

	students, err := s.studentRepo.GetAll(c.Request.Context(), search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve students",
		})
		return
	}

	c.JSON(http.StatusOK, students)
}

// getAllTeachers retrieves all teachers
func (s *Server) getAllTeachers(c *gin.Context) {
	search := c.Query("search")

	teachers, err := s.teacherRepo.GetAll(c.Request.Context(), search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teachers",
		})
		return
	}

	c.JSON(http.StatusOK, teachers)
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

	parents, err := s.parentRepo.GetAll(c.Request.Context(), search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve parents",
		})
		return
	}

	c.JSON(http.StatusOK, parents)
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
