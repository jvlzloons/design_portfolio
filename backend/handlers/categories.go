package handlers

import (
	"encoding/json"
	"net/http"

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