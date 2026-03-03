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

	fmt.Println("Database migration complete")
}