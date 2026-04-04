package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
	// TODO: Implement with proper database query
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// getMemorization returns a specific memorization
func (s *Server) getMemorization(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Memorization details",
	})
}

// createMemorization creates a new memorization record
func (s *Server) createMemorization(c *gin.Context) {
	// TODO: Implement with proper validation and database insert
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Not yet implemented",
	})
}

// updateMemorization updates an existing memorization record
func (s *Server) updateMemorization(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"message": "Memorization updated",
	})
}
