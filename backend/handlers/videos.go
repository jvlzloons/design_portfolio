package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jvlzloons/design_portfolio/backend/database"
	"github.com/lib/pq"
)

type Video struct {
	ID           string   `json:"id"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
	Title        string   `json:"title"`
	Slug         string   `json:"slug"`
	Description  *string  `json:"description"`
	VideoURL     *string  `json:"video_url"`
	ThumbnailURL *string  `json:"thumbnail_url"`
	Tags         []string `json:"tags"`
	Client       *string  `json:"client"`
	Year         *string  `json:"year"`
	IsPublished  bool     `json:"is_published"`
	SortOrder    int      `json:"sort_order"`
}

type CreateVideoInput struct {
	Title        string   `json:"title"`
	Slug         string   `json:"slug"`
	Description  *string  `json:"description"`
	VideoURL     *string  `json:"video_url"`
	ThumbnailURL *string  `json:"thumbnail_url"`
	Tags         []string `json:"tags"`
	Client       *string  `json:"client"`
	Year         *string  `json:"year"`
	IsPublished  bool     `json:"is_published"`
	SortOrder    int      `json:"sort_order"`
}

func scanVideo(row interface {
	Scan(dest ...any) error
}) (Video, error) {
	var v Video
	err := row.Scan(
		&v.ID, &v.CreatedAt, &v.UpdatedAt, &v.Title, &v.Slug,
		&v.Description, &v.VideoURL, &v.ThumbnailURL,
		pq.Array(&v.Tags), &v.Client, &v.Year,
		&v.IsPublished, &v.SortOrder,
	)
	if v.Tags == nil {
		v.Tags = []string{}
	}
	return v, err
}

// Public: get published videos
func GetVideos(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT id, created_at, updated_at, title, slug, description,
		video_url, thumbnail_url, tags, client, year, is_published, sort_order
		FROM videos WHERE is_published = true ORDER BY sort_order`,
	)
	if err != nil {
		http.Error(w, "Failed to fetch videos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	videos := []Video{}
	for rows.Next() {
		v, err := scanVideo(rows)
		if err != nil {
			http.Error(w, "Failed to scan video", http.StatusInternalServerError)
			return
		}
		videos = append(videos, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// Admin: get all videos (including unpublished)
func AdminGetVideos(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT id, created_at, updated_at, title, slug, description,
		video_url, thumbnail_url, tags, client, year, is_published, sort_order
		FROM videos ORDER BY sort_order`,
	)
	if err != nil {
		http.Error(w, "Failed to fetch videos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	videos := []Video{}
	for rows.Next() {
		v, err := scanVideo(rows)
		if err != nil {
			http.Error(w, "Failed to scan video", http.StatusInternalServerError)
			return
		}
		videos = append(videos, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// Admin: create a video
func CreateVideo(w http.ResponseWriter, r *http.Request) {
	var input CreateVideoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if input.Title == "" || input.Slug == "" {
		http.Error(w, "Title and slug are required", http.StatusBadRequest)
		return
	}
	if input.Tags == nil {
		input.Tags = []string{}
	}

	row := database.DB.QueryRow(
		`INSERT INTO videos (title, slug, description, video_url, thumbnail_url,
		tags, client, year, is_published, sort_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id, created_at, updated_at, title, slug, description,
		video_url, thumbnail_url, tags, client, year, is_published, sort_order`,
		input.Title, input.Slug, input.Description, input.VideoURL, input.ThumbnailURL,
		pq.Array(input.Tags), input.Client, input.Year, input.IsPublished, input.SortOrder,
	)
	v, err := scanVideo(row)
	if err != nil {
		http.Error(w, "Failed to create video", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(v)
}

// Admin: update a video
func UpdateVideo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input CreateVideoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if input.Tags == nil {
		input.Tags = []string{}
	}

	row := database.DB.QueryRow(
		`UPDATE videos SET title=$1, slug=$2, description=$3, video_url=$4,
		thumbnail_url=$5, tags=$6, client=$7, year=$8, is_published=$9, sort_order=$10,
		updated_at=NOW()
		WHERE id=$11
		RETURNING id, created_at, updated_at, title, slug, description,
		video_url, thumbnail_url, tags, client, year, is_published, sort_order`,
		input.Title, input.Slug, input.Description, input.VideoURL,
		input.ThumbnailURL, pq.Array(input.Tags), input.Client, input.Year,
		input.IsPublished, input.SortOrder, id,
	)
	v, err := scanVideo(row)
	if err != nil {
		http.Error(w, "Failed to update video", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// Admin: reorder videos
func ReorderVideos(w http.ResponseWriter, r *http.Request) {
	var input ReorderInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}

	for _, item := range input.Items {
		_, err := tx.Exec("UPDATE videos SET sort_order = $1 WHERE id = $2", item.SortOrder, item.ID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to update sort order", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Admin: delete a video
func DeleteVideo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := database.DB.Exec("DELETE FROM videos WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete video", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Video not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
