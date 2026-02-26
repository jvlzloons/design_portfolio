<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=36&pause=1000&color=FFFFFF&center=true&vCenter=true&random=false&width=600&height=60&lines=Josh+Villaluz;Design+%C3%97+Code" alt="Josh Villaluz — Design × Code" />
</p>

<p align="center">
  <strong>Marketing Graphic Designer · Illustrator · Motion Designer</strong>
</p>

<p align="center">
  <em>A design portfolio that doesn't just display the work — it is the work.</em>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
</p>

---

## About

This isn't just a portfolio — it's a full-stack project built from scratch to showcase both **design craft** and **frontend development skills**. Every brand identity, illustration, and motion piece lives inside a system I designed and engineered myself.

The frontend is built with React and styled with Tailwind CSS. The backend runs on Go with a Chi router serving a REST API. PostgreSQL handles the data. Clerk handles auth. No templates, no site builders — just code.

## Architecture

```
┌─────────────────────────┐          ┌─────────────────────────┐
│                         │   HTTP   │                         │
│   React + Tailwind      │ ───────▶ │   Go API (Chi)          │
│   Clerk Auth (frontend) │          │   Clerk Auth (backend)  │
│   Vite · TypeScript     │          │   REST endpoints        │
│                         │          │                         │
│   :5173                 │          │   :8080                 │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │                         │
                                     │   PostgreSQL             │
                                     │   projects · categories │
                                     │   site_settings         │
                                     │                         │
                                     │   :5432                 │
                                     └─────────────────────────┘
```

## Project Structure

```
portfolio/
│
├── frontend/                   React application
│   ├── src/
│   │   ├── pages/              Page components
│   │   │   ├── HomePage.tsx        Public portfolio grid
│   │   │   ├── AdminPage.tsx       Project management dashboard
│   │   │   └── SignInPage.tsx      Clerk authentication
│   │   ├── components/         Reusable UI components
│   │   ├── lib/
│   │   │   └── api.ts              API client with auth helpers
│   │   ├── App.tsx                 Routing + protected routes
│   │   └── main.tsx                Clerk provider setup
│   └── .env.local              Clerk publishable key
│
├── backend/                    Go API server
│   ├── main.go                 Routes + middleware + server
│   ├── database/
│   │   └── database.go             PostgreSQL connection
│   ├── handlers/
│   │   ├── categories.go          GET /api/categories
│   │   ├── projects.go            GET /api/projects (public)
│   │   └── admin.go               CRUD /api/admin/projects
│   ├── middleware/
│   │   └── auth.go                 Clerk JWT verification
│   └── .env                    Secrets (not committed)
│
└── .gitignore
```

## API

### Public

| Method | Endpoint                | Description             |
|--------|-------------------------|-------------------------|
| GET    | `/api/health`           | Health check            |
| GET    | `/api/categories`       | List all categories     |
| GET    | `/api/projects`         | List published projects |
| GET    | `/api/projects/{slug}`  | Single project by slug  |

### Admin (requires Clerk auth)

| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| GET    | `/api/admin/projects`       | All projects      |
| POST   | `/api/admin/projects`       | Create project    |
| PUT    | `/api/admin/projects/{id}`  | Update project    |
| DELETE | `/api/admin/projects/{id}`  | Delete project    |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Go](https://go.dev/) (v1.22+)
- [PostgreSQL](https://www.postgresql.org/) (v15+)
- [Clerk](https://clerk.com/) account

