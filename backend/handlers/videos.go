package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jvlzloons/design_portfolio/backend/database"
	"github.com/lib/pq"
)

type Video struct {
	ID              string         `json:"id"`
	CreatedAt       string         `json:"created_at"`
	UpdatedAt       string         `json:"updated_at"`
	Title           string         `json:"title"`
	Slug            string         `json:"slug"`
	Description     *string        `json:"description"`
	LongDescription *string        `json:"long_description"`
	VideoURL        *string        `json:"video_url"`
	ThumbnailURL    *string        `json:"thumbnail_url"`
	Images          []string       `json:"images"`
	ImageCaptions   []ImageCaption `json:"image_captions"`
	Tags            []string       `json:"tags"`
	Client          *string        `json:"client"`
	Year            *string        `json:"year"`
	IsPublished     bool           `json:"is_published"`
	SortOrder       int            `json:"sort_order"`
}

type CreateVideoInput struct {
	Title           string         `json:"title"`
	Slug            string         `json:"slug"`
	Description     *string        `json:"description"`
	LongDescription *string        `json:"long_description"`
	VideoURL        *string        `json:"video_url"`
	ThumbnailURL    *string        `json:"thumbnail_url"`
	Images          []string       `json:"images"`
	ImageCaptions   []ImageCaption `json:"image_captions"`
	Tags            []string       `json:"tags"`
	Client          *string        `json:"client"`
	Year            *string        `json:"year"`
	IsPublished     bool           `json:"is_published"`
	SortOrder       int            `json:"sort_order"`
}

const videoSelectCols = `id, created_at, updated_at, title, slug, description,
	long_description, video_url, thumbnail_url, images, image_captions,
	tags, client, year, is_published, sort_order`

func scanVideoRow(row interface{ Scan(dest ...any) error }) (Video, error) {
	var v Video
	var captionsJSON []byte
	err := row.Scan(
		&v.ID, &v.CreatedAt, &v.UpdatedAt, &v.Title, &v.Slug,
		&v.Description, &v.LongDescription, &v.VideoURL, &v.ThumbnailURL,
		pq.Array(&v.Images), &captionsJSON,
		pq.Array(&v.Tags), &v.Client, &v.Year,
		&v.IsPublished, &v.SortOrder,
	)
	if v.Images == nil {
		v.Images = []string{}
	}
	if v.Tags == nil {
		v.Tags = []string{}
	}
	if err == nil {
		json.Unmarshal(captionsJSON, &v.ImageCaptions)
	}
	if v.ImageCaptions == nil {
		v.ImageCaptions = []ImageCaption{}
	}
	return v, err
}

// Public: get published videos (grid fields only)
func GetVideos(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT id, created_at, updated_at, title, slug, description,
		long_description, video_url, thumbnail_url, images, image_captions,
		tags, client, year, is_published, sort_order
		FROM videos WHERE is_published = true ORDER BY sort_order`,
	)
	if err != nil {
		http.Error(w, "Failed to fetch videos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	videos := []Video{}
	for rows.Next() {
		v, err := scanVideoRow(rows)
		if err != nil {
			http.Error(w, "Failed to scan video", http.StatusInternalServerError)
			return
		}
		videos = append(videos, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}

// Public: get single video by slug
func GetVideoBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	row := database.DB.QueryRow(
		`SELECT `+videoSelectCols+` FROM videos WHERE slug = $1 AND is_published = true`, slug,
	)
	v, err := scanVideoRow(row)
	if err != nil {
		http.Error(w, "Video not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// Admin: get all videos (including unpublished)
func AdminGetVideos(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		`SELECT ` + videoSelectCols + ` FROM videos ORDER BY sort_order`,
	)
	if err != nil {
		http.Error(w, "Failed to fetch videos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	videos := []Video{}
	for rows.Next() {
		v, err := scanVideoRow(rows)
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
	if input.Images == nil {
		input.Images = []string{}
	}
	captions := input.ImageCaptions
	if captions == nil {
		captions = []ImageCaption{}
	}
	captionsJSON, _ := json.Marshal(captions)

	row := database.DB.QueryRow(
		`INSERT INTO videos (title, slug, description, long_description, video_url, thumbnail_url,
		images, image_captions, tags, client, year, is_published, sort_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		RETURNING `+videoSelectCols,
		input.Title, input.Slug, input.Description, input.LongDescription,
		input.VideoURL, input.ThumbnailURL,
		pq.Array(input.Images), string(captionsJSON),
		pq.Array(input.Tags), input.Client, input.Year, input.IsPublished, input.SortOrder,
	)
	v, err := scanVideoRow(row)
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
	if input.Images == nil {
		input.Images = []string{}
	}
	captions := input.ImageCaptions
	if captions == nil {
		captions = []ImageCaption{}
	}
	captionsJSON, _ := json.Marshal(captions)

	row := database.DB.QueryRow(
		`UPDATE videos SET title=$1, slug=$2, description=$3, long_description=$4,
		video_url=$5, thumbnail_url=$6, images=$7, image_captions=$8,
		tags=$9, client=$10, year=$11, is_published=$12, sort_order=$13, updated_at=NOW()
		WHERE id=$14
		RETURNING `+videoSelectCols,
		input.Title, input.Slug, input.Description, input.LongDescription,
		input.VideoURL, input.ThumbnailURL,
		pq.Array(input.Images), string(captionsJSON),
		pq.Array(input.Tags), input.Client, input.Year,
		input.IsPublished, input.SortOrder, id,
	)
	v, err := scanVideoRow(row)
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
