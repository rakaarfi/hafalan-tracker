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
	cfg                *config.Config
	db                 *database.DB
	router             *gin.Engine
	authService        *service.AuthService
	jwtManager         *auth.JWTManager
	memorizationService *service.MemorizationService
	parentService      *service.ParentService
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
	userRepo := repository.NewUserRepository(db.DB)
	memorizationRepo := repository.NewMemorizationRepository(db.DB)
	historyRepo := repository.NewHistoryRepository(db.DB)
	parentRepo := repository.NewParentRepository(db.DB)
	studentRepo := repository.NewStudentRepository(db.DB)

	// Initialize services
	authService := service.NewAuthService(userRepo, jwtManager)
	memorizationService := service.NewMemorizationService(memorizationRepo, historyRepo)
	parentService := service.NewParentService(parentRepo, studentRepo, memorizationRepo)

	// Create server
	srv := &Server{
		cfg:                cfg,
		db:                 db,
		router:             router,
		authService:        authService,
		jwtManager:         jwtManager,
		memorizationService: memorizationService,
		parentService:      parentService,
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
		}

		// Protected routes (require authentication)
		protected := v1.Group("/")
		protected.Use(s.authMiddleware())
		{
			// User management
			protected.GET("/users", s.getUsers)
			protected.GET("/users/:id", s.getUser)

			// Teacher routes
			protected.GET("/teachers", s.getTeachers)
			protected.GET("/teachers/:id", s.getTeacher)

			// Parent routes
			protected.GET("/parents", s.getParents)
			protected.GET("/parents/:id", s.getParent)

			// Student routes
			protected.GET("/students", s.getStudents)
			protected.GET("/students/:id", s.getStudent)

			// Class routes
			protected.GET("/classes", s.getClasses)
			protected.GET("/classes/:id", s.getClass)

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
