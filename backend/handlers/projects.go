package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jvlzloons/design_portfolio/backend/database"
	"github.com/lib/pq"
)

type Project struct {
	ID              string   `json:"id"`
	CreatedAt       string   `json:"created_at"`
	UpdatedAt       string   `json:"updated_at"`
	Title           string   `json:"title"`
	Slug            string   `json:"slug"`
	Description     *string  `json:"description"`
	LongDescription *string  `json:"long_description"`
	Category        string   `json:"category"`
	Tags            []string `json:"tags"`
	ThumbnailURL    *string  `json:"thumbnail_url"`
	Images          []string `json:"images"`
	Year            *int     `json:"year"`
	Client          *string  `json:"client"`
	Role            *string  `json:"role"`
	IsFeatured      bool     `json:"is_featured"`
	IsPublished     bool     `json:"is_published"`
	SortOrder       int      `json:"sort_order"`
}

// Public: get published projects
func GetProjects(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT id, created_at, updated_at, title, slug, description,
		long_description, category, tags, thumbnail_url, images,
		year, client, role, is_featured, is_published, sort_order
		FROM projects WHERE is_published = true ORDER BY sort_order`,
	)
	if err != nil {
		http.Error(w, "Failed to fetch projects", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		var p Project
		err := rows.Scan(
			&p.ID, &p.CreatedAt, &p.UpdatedAt, &p.Title, &p.Slug,
			&p.Description, &p.LongDescription, &p.Category,
			pq.Array(&p.Tags), &p.ThumbnailURL, pq.Array(&p.Images),
			&p.Year, &p.Client, &p.Role, &p.IsFeatured,
			&p.IsPublished, &p.SortOrder,
		)
		if err != nil {
			http.Error(w, "Failed to scan project", http.StatusInternalServerError)
			return
		}
		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// Public: get single project by slug
func GetProjectBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var p Project
	err := database.DB.QueryRow(
		`SELECT id, created_at, updated_at, title, slug, description,
		long_description, category, tags, thumbnail_url, images,
		year, client, role, is_featured, is_published, sort_order
		FROM projects WHERE slug = $1 AND is_published = true`, slug,
	).Scan(
		&p.ID, &p.CreatedAt, &p.UpdatedAt, &p.Title, &p.Slug,
		&p.Description, &p.LongDescription, &p.Category,
		pq.Array(&p.Tags), &p.ThumbnailURL, pq.Array(&p.Images),
		&p.Year, &p.Client, &p.Role, &p.IsFeatured,
		&p.IsPublished, &p.SortOrder,
	)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}