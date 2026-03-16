package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Connected to PostgreSQL")
	migrate()
}

func migrate() {
	_, err := DB.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)
	if err != nil {
		log.Fatal("Failed to create pgcrypto extension:", err)
	}

	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS categories (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			name       TEXT NOT NULL,
			slug       TEXT NOT NULL UNIQUE,
			sort_order INT NOT NULL DEFAULT 0
		)
	`)
	if err != nil {
		log.Fatal("Failed to create categories table:", err)
	}

	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS projects (
			id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			title            TEXT NOT NULL,
			slug             TEXT NOT NULL UNIQUE,
			description      TEXT,
			long_description TEXT,
			category         TEXT NOT NULL,
			tags             TEXT[] NOT NULL DEFAULT '{}',
			thumbnail_url    TEXT,
			images           TEXT[] NOT NULL DEFAULT '{}',
			year             INT,
			client           TEXT,
			role             TEXT,
			is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
			is_published     BOOLEAN NOT NULL DEFAULT FALSE,
			sort_order       INT NOT NULL DEFAULT 0
		)
	`)
	if err != nil {
		log.Fatal("Failed to create projects table:", err)
	}

	_, err = DB.Exec(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT`)
	if err != nil {
		log.Fatal("Failed to add github_url column:", err)
	}

	_, err = DB.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'projects' AND column_name = 'year' AND data_type = 'integer'
			) THEN
				ALTER TABLE projects ALTER COLUMN year TYPE TEXT USING year::TEXT;
			END IF;
		END $$
	`)
	if err != nil {
		log.Fatal("Failed to ensure year column is TEXT:", err)
	}

	_, err = DB.Exec(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_instagram TEXT`)
	if err != nil {
		log.Fatal("Failed to add client_instagram column:", err)
	}

	_, err = DB.Exec(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_website TEXT`)
	if err != nil {
		log.Fatal("Failed to add client_website column:", err)
	}

	_, err = DB.Exec(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_x TEXT`)
	if err != nil {
		log.Fatal("Failed to add client_x column:", err)
	}

	_, err = DB.Exec(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_captions JSONB NOT NULL DEFAULT '[]'`)
	if err != nil {
		log.Fatal("Failed to add image_captions column:", err)
	}

	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS videos (
			id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			title         TEXT NOT NULL,
			slug          TEXT NOT NULL UNIQUE,
			description   TEXT,
			video_url     TEXT,
			thumbnail_url TEXT,
			tags          TEXT[] NOT NULL DEFAULT '{}',
			client        TEXT,
			year          TEXT,
			is_published  BOOLEAN NOT NULL DEFAULT FALSE,
			sort_order    INT NOT NULL DEFAULT 0
		)
	`)
	if err != nil {
		log.Fatal("Failed to create videos table:", err)
	}

	fmt.Println("Database migration complete")
}