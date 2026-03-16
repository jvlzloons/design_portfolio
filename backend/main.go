package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/jvlzloons/design_portfolio/backend/database"
	"github.com/jvlzloons/design_portfolio/backend/handlers"
	customMiddleware "github.com/jvlzloons/design_portfolio/backend/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system env")
	}

	database.Connect()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	// CORS_ORIGINS env var: comma-separated list of allowed origins
	// e.g. "http://localhost:5173,https://yourdomain.com"
	rawOrigins := os.Getenv("CORS_ORIGINS")
	if rawOrigins == "" {
		rawOrigins = "http://localhost:5173"
	}
	allowedOrigins := strings.Split(rawOrigins, ",")

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// Public routes
	r.Get("/api/categories", handlers.GetCategories)
	r.Get("/api/projects", handlers.GetProjects)
	r.Get("/api/projects/{slug}", handlers.GetProjectBySlug)
	r.Get("/api/videos", handlers.GetVideos)
	r.Get("/api/videos/{slug}", handlers.GetVideoBySlug)

	// Admin routes (protected by Clerk auth)
	r.Route("/api/admin", func(r chi.Router) {
		r.Use(customMiddleware.RequireAuth)
		r.Get("/projects", handlers.AdminGetProjects)
		r.Post("/projects", handlers.CreateProject)
		r.Post("/projects/reorder", handlers.ReorderProjects)
		r.Put("/projects/{id}", handlers.UpdateProject)
		r.Delete("/projects/{id}", handlers.DeleteProject)
		r.Post("/categories", handlers.CreateCategory)
		r.Delete("/categories/{id}", handlers.DeleteCategory)
		r.Get("/videos", handlers.AdminGetVideos)
		r.Post("/videos", handlers.CreateVideo)
		r.Post("/videos/reorder", handlers.ReorderVideos)
		r.Put("/videos/{id}", handlers.UpdateVideo)
		r.Delete("/videos/{id}", handlers.DeleteVideo)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Server running on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}