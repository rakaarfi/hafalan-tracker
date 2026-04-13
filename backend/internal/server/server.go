package server

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/auth"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/config"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/database"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/repository"
	"github.com/rakaarfi/hafalan-tracker/backend/internal/service"
)

// Server represents the HTTP server
type Server struct {
	cfg                 *config.Config
	db                  *database.DB
	router              *gin.Engine
	authService         *service.AuthService
	jwtManager          *auth.JWTManager
	memorizationService *service.MemorizationService
	parentService       *service.ParentService
	studentService      *service.StudentService
	teacherService      *service.TeacherService
	classService        *service.ClassService
	settingsService     *service.SettingsService
	studentRepo             *repository.StudentRepository
	teacherRepo             *repository.TeacherRepository
	parentRepo              *repository.ParentRepository
	classRepo               *repository.ClassRepository
	classQuranTeacherRepo    *repository.ClassQuranTeacherRepository
	memorizationRepo         *repository.MemorizationRepository
}

// New creates a new server instance
func New(cfg *config.Config, db *database.DB) *Server {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	router := gin.New()

	// Add middleware
	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	router.Use(corsMiddleware())

	// Initialize JWT manager
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, 24*time.Hour)

	// Initialize repositories
	roleRepo := repository.NewRoleRepository(db.DB)
	userRepo := repository.NewUserRepository(db.DB, roleRepo)
	memorizationRepo := repository.NewMemorizationRepository(db.DB)
	historyRepo := repository.NewHistoryRepository(db.DB)
	parentRepo := repository.NewParentRepository(db.DB)
	studentRepo := repository.NewStudentRepository(db.DB)
	teacherRepo := repository.NewTeacherRepository(db.DB)
	classRepo := repository.NewClassRepository(db.DB)
	classQuranTeacherRepo := repository.NewClassQuranTeacherRepository(db.DB)
	settingsRepo := repository.NewSettingsRepository(db.DB)

	// Initialize services
	authService := service.NewAuthService(userRepo, jwtManager)
	memorizationService := service.NewMemorizationService(memorizationRepo, historyRepo)
	parentService := service.NewParentService(parentRepo, studentRepo, memorizationRepo, userRepo)
	studentService := service.NewStudentService(studentRepo, parentRepo)
	teacherService := service.NewTeacherService(teacherRepo, userRepo, jwtManager)
	classService := service.NewClassService(classRepo, teacherRepo)
	settingsService := service.NewSettingsService(settingsRepo, userRepo)

	// Create server
	srv := &Server{
		cfg:                 cfg,
		db:                  db,
		router:              router,
		authService:         authService,
		jwtManager:          jwtManager,
		memorizationService: memorizationService,
		parentService:       parentService,
		studentService:          studentService,
		teacherService:          teacherService,
		classService:            classService,
		settingsService:         settingsService,
		studentRepo:             studentRepo,
		teacherRepo:             teacherRepo,
		parentRepo:              parentRepo,
		classRepo:               classRepo,
		classQuranTeacherRepo:    classQuranTeacherRepo,
		memorizationRepo:         memorizationRepo,
	}

	// Setup routes
	srv.setupRoutes()

	return srv
}

// setupRoutes configures all routes
func (s *Server) setupRoutes() {
	// Health check
	s.router.GET("/health", s.healthCheck)
	s.router.GET("/ping", s.ping)

	// API v1 routes
	v1 := s.router.Group("/api/v1")
	{
		// Public routes
		public := v1.Group("/public")
		{
			public.POST("/login", s.login)
			public.POST("/logout", s.logout)
		}

		// Protected routes (require authentication)
		protected := v1.Group("/")
		protected.Use(s.authMiddleware())
		{
				// Current user info
				protected.GET("/me", s.getCurrentUser)

			// User management
			protected.GET("/users", s.getUsers)
			protected.GET("/users/:id", s.getUser)

				// Teacher-specific routes (only accessible by teachers)
				teachers := protected.Group("/teachers/me")
				teachers.Use(s.teacherRoleMiddleware())
				{
					teachers.GET("/students", s.getTeacherStudents)
					teachers.GET("/classes", s.getTeacherClasses)
				}

			// Parent-specific routes (only accessible by parents)
			parents := protected.Group("/parents/me")
			parents.Use(s.parentRoleMiddleware())
			{
				parents.GET("/children", s.getParentChildren)
				parents.GET("/children/:id", s.getParentChildProgress)
			}

			// Memorization routes
			protected.GET("/memorizations", s.getMemorizations)
			protected.GET("/memorizations/:id", s.getMemorization)
			protected.POST("/memorizations", s.createMemorization)
			protected.PUT("/memorizations/:id", s.updateMemorization)

			// Student routes
			protected.GET("/students", s.getAllStudents)
			protected.GET("/students/:id", s.getStudent)
			protected.GET("/students/:id/memorizations", s.getStudentMemorizations)
			protected.POST("/students", s.createStudent)
			protected.PUT("/students/:id", s.updateStudent)
			protected.DELETE("/students/:id", s.deleteStudent)

			// Teacher routes
			protected.GET("/teachers", s.getAllTeachers)
			protected.GET("/teachers/:id", s.getTeacher)
			protected.POST("/teachers", s.createTeacher)
			protected.PUT("/teachers/:id", s.updateTeacher)
			protected.DELETE("/teachers/:id", s.deleteTeacher)

			// Parent routes
			protected.GET("/parents", s.getAllParents)
			protected.GET("/parents/:id", s.getParent)
			protected.POST("/parents", s.createParent)
			protected.PUT("/parents/:id", s.updateParent)
			protected.DELETE("/parents/:id", s.deleteParent)
			protected.GET("/parents/:id/children", s.getParentChildrenAdmin)
			protected.POST("/parents/:id/children", s.addChildToParent)
			protected.DELETE("/parents/:id/children/:studentId", s.removeChildFromParent)

			// Class routes
			protected.GET("/classes", s.getAllClasses)
			protected.GET("/classes/:id", s.getClass)
			protected.POST("/classes", s.createClass)
			protected.PUT("/classes/:id", s.updateClass)
			protected.DELETE("/classes/:id", s.deleteClass)

			// Quran teacher assignment routes
			protected.GET("/classes/:id/quran-teachers", s.getClassQuranTeachers)
			protected.POST("/classes/:id/quran-teachers", s.assignQuranTeacherToClass)
			protected.PUT("/classes/:id/quran-teachers/:assignmentId", s.updateQuranTeacherAssignment)
			protected.DELETE("/classes/:id/quran-teachers/:assignmentId", s.endQuranTeacherAssignment)

			// Dashboard routes
			protected.GET("/dashboard/stats", s.getDashboardStats)

			// Settings routes
			protected.GET("/settings", s.getSettings)
			protected.PUT("/settings", s.updateSettings)
			protected.POST("/settings/logo", s.uploadLogo)
			protected.POST("/admin/reset-password", s.resetPassword)

			// Profile routes
			protected.PUT("/profile", s.updateProfile)
			protected.POST("/profile/change-password", s.changePassword)
		}
	}
}

// Run starts the server
func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

// Router returns the gin router (useful for testing)
func (s *Server) Router() *gin.Engine {
	return s.router
}
