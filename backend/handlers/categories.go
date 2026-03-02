package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jvlzloons/design_portfolio/backend/database"
)

type Category struct {
	ID        string `json:"id"`
	CreatedAt string `json:"created_at"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	SortOrder int    `json:"sort_order"`
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		"SELECT id, created_at, name, slug, sort_order FROM categories ORDER BY sort_order",
	)
	if err != nil {
		http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categories := []Category{}
	for rows.Next() {
		var c Category
		err := rows.Scan(&c.ID, &c.CreatedAt, &c.Name, &c.Slug, &c.SortOrder)
		if err != nil {
			http.Error(w, "Failed to scan category", http.StatusInternalServerError)
			return
		}
		categories = append(categories, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

type CreateCategoryInput struct {
	Name      string `json:"name"`
	SortOrder int    `json:"sort_order"`
}

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var input CreateCategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	slug := strings.ToLower(strings.ReplaceAll(input.Name, " ", "-"))

	var c Category
	err := database.DB.QueryRow(
		`INSERT INTO categories (name, slug, sort_order)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, name, slug, sort_order`,
		input.Name, slug, input.SortOrder,
	).Scan(&c.ID, &c.CreatedAt, &c.Name, &c.Slug, &c.SortOrder)
	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := database.DB.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}