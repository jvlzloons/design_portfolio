package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jvlzloons/design_portfolio/backend/database"
	"github.com/lib/pq"
)

type CreateProjectInput struct {
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

// Admin: get all projects (including unpublished)
func AdminGetProjects(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT id, created_at, updated_at, title, slug, description,
		long_description, category, tags, thumbnail_url, images,
		year, client, role, is_featured, is_published, sort_order
		FROM projects ORDER BY sort_order`,
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

// Admin: create a project
func CreateProject(w http.ResponseWriter, r *http.Request) {
	var input CreateProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Title == "" || input.Slug == "" || input.Category == "" {
		http.Error(w, "Title, slug, and category are required", http.StatusBadRequest)
		return
	}

	var p Project
	err := database.DB.QueryRow(
		`INSERT INTO projects (title, slug, description, long_description,
		category, tags, thumbnail_url, images, year, client, role,
		is_featured, is_published, sort_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
		RETURNING id, created_at, updated_at, title, slug, description,
		long_description, category, tags, thumbnail_url, images,
		year, client, role, is_featured, is_published, sort_order`,
		input.Title, input.Slug, input.Description, input.LongDescription,
		input.Category, pq.Array(input.Tags), input.ThumbnailURL,
		pq.Array(input.Images), input.Year, input.Client, input.Role,
		input.IsFeatured, input.IsPublished, input.SortOrder,
	).Scan(
		&p.ID, &p.CreatedAt, &p.UpdatedAt, &p.Title, &p.Slug,
		&p.Description, &p.LongDescription, &p.Category,
		pq.Array(&p.Tags), &p.ThumbnailURL, pq.Array(&p.Images),
		&p.Year, &p.Client, &p.Role, &p.IsFeatured,
		&p.IsPublished, &p.SortOrder,
	)
	if err != nil {
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

// Admin: update a project
func UpdateProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input CreateProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var p Project
	err := database.DB.QueryRow(
		`UPDATE projects SET title=$1, slug=$2, description=$3,
		long_description=$4, category=$5, tags=$6, thumbnail_url=$7,
		images=$8, year=$9, client=$10, role=$11, is_featured=$12,
		is_published=$13, sort_order=$14
		WHERE id=$15
		RETURNING id, created_at, updated_at, title, slug, description,
		long_description, category, tags, thumbnail_url, images,
		year, client, role, is_featured, is_published, sort_order`,
		input.Title, input.Slug, input.Description, input.LongDescription,
		input.Category, pq.Array(input.Tags), input.ThumbnailURL,
		pq.Array(input.Images), input.Year, input.Client, input.Role,
		input.IsFeatured, input.IsPublished, input.SortOrder, id,
	).Scan(
		&p.ID, &p.CreatedAt, &p.UpdatedAt, &p.Title, &p.Slug,
		&p.Description, &p.LongDescription, &p.Category,
		pq.Array(&p.Tags), &p.ThumbnailURL, pq.Array(&p.Images),
		&p.Year, &p.Client, &p.Role, &p.IsFeatured,
		&p.IsPublished, &p.SortOrder,
	)
	if err != nil {
		http.Error(w, "Failed to update project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// Admin: delete a project
func DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := database.DB.Exec("DELETE FROM projects WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete project", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}