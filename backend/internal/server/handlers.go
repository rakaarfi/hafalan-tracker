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
	// TODO: Implement with proper authorization
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getUser returns a specific user
func (s *Server) getUser(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "User details",
	})
}

// getTeachers returns all teachers
func (s *Server) getTeachers(c *gin.Context) {
	// TODO: Implement with proper database query
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getTeacher returns a specific teacher
func (s *Server) getTeacher(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Teacher details",
	})
}

// getParents returns all parents
func (s *Server) getParents(c *gin.Context) {
	// TODO: Implement with proper database query
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getParent returns a specific parent
func (s *Server) getParent(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Parent details",
	})
}

// getStudents returns all students
func (s *Server) getStudents(c *gin.Context) {
	// TODO: Implement with proper database query
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getStudent returns a specific student
func (s *Server) getStudent(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Student details",
	})
}

// getClasses returns all classes
func (s *Server) getClasses(c *gin.Context) {
	// TODO: Implement with proper database query
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getClass returns a specific class
func (s *Server) getClass(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Class details",
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
