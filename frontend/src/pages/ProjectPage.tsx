import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAPI } from "../lib/api";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  images: string[];
  year: string | null;
  client: string | null;
  role: string | null;
  github_url: string | null;
  client_instagram: string | null;
  client_website: string | null;
  client_x: string | null;
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchAPI(`/projects/${slug}`)
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const pageStyle = { backgroundColor: "#f0ebe0", fontFamily: "'Space Grotesk', sans-serif" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <p className="text-sm" style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={pageStyle}>
        <p className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Project not found</p>
        <a href="/" className="mt-4 text-sm underline" style={{ color: "#888" }}>← Back to portfolio</a>
      </div>
    );
  }

  const description = project.long_description || project.description;

  return (
    <div className="min-h-screen" style={pageStyle}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #d4cfc6" }} className="flex items-center px-8 py-4 relative">
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" style={{ color: "#4a4a4a" }}>
          <a href="/" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>Design</a>
          <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>
          <a href="/#ict" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>ICT</a>
          <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>
          <a href="/#contact" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>Contact</a>
        </nav>

        <a href="/" className="absolute left-1/2 -translate-x-1/2">
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            JV
          </span>
        </a>

        <div className="hidden md:flex items-center gap-4 ml-auto" style={{ color: "#4a4a4a" }}>
          <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter"><XIcon /></a>
          <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram"><InstagramIcon /></a>
          <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
        </div>

        {/* Hamburger button - mobile only */}
        <button
          className="md:hidden ml-auto p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{ color: "#4a4a4a" }}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{ borderBottom: "1px solid #d4cfc6", backgroundColor: "#f0ebe0" }}>
          <nav className="flex flex-col px-8 py-4 gap-4 text-sm font-medium" style={{ color: "#4a4a4a" }}>
            <a href="/" className="hover:text-black transition-colors" style={{ color: "#4a4a4a" }}>Design</a>
            <a href="/#ict" className="hover:text-black transition-colors" style={{ color: "#4a4a4a" }}>ICT</a>
            <a href="/#contact" className="hover:text-black transition-colors" style={{ color: "#4a4a4a" }}>Contact</a>
          </nav>
          <div className="flex items-center gap-4 px-8 pb-4" style={{ color: "#4a4a4a" }}>
            <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter"><XIcon /></a>
            <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram"><InstagramIcon /></a>
            <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm mb-12 transition-colors hover:text-black"
          style={{ color: "#888" }}
        >
          <span>←</span>
          <span>Back</span>
        </a>

        {/* Title */}
        <h1
          className="font-bold leading-none mb-4"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#1a1a1a", letterSpacing: "-0.03em" }}
        >
          {project.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-10" style={{ color: "#888" }}>
          {project.category && (
            <span className="text-sm uppercase tracking-widest" style={{ fontSize: "0.7rem" }}>
              {project.category}
            </span>
          )}
          {project.year && (
            <>
              <span style={{ color: "#d4cfc6" }}>·</span>
              <span className="text-sm">{project.year}</span>
            </>
          )}
          {project.client && (
            <>
              <span style={{ color: "#d4cfc6" }}>·</span>
              <span className="text-sm">Client: {project.client}</span>
            </>
          )}
          {project.role && (
            <>
              <span style={{ color: "#d4cfc6" }}>·</span>
              <span className="text-sm">{project.role}</span>
            </>
          )}
        </div>

        {/* GitHub link */}
        {project.github_url && (
          <div className="mb-10">
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-black"
              style={{ color: "#4a4a4a", borderBottom: "1px solid #c4bfb6", paddingBottom: "2px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View on GitHub
            </a>
          </div>
        )}

        {/* Description */}
        {description && (
          <p
            className="leading-relaxed mb-16"
            style={{ fontSize: "1.1rem", color: "#3a3a3a", maxWidth: "65ch" }}
          >
            {description}
          </p>
        )}

        {/* Client Links */}
        {(project.client_instagram || project.client_website || project.client_x) && (
          <div className="flex flex-wrap items-center gap-5 mb-16" style={{ color: "#4a4a4a" }}>
            <span className="text-xs uppercase tracking-widest" style={{ fontSize: "0.65rem", color: "#aaa" }}>Client</span>
            {project.client_website && (
              <a
                href={project.client_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-black"
                style={{ borderBottom: "1px solid #c4bfb6", paddingBottom: "1px" }}
              >
                Website
              </a>
            )}
            {project.client_instagram && (
              <a
                href={project.client_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-black"
                style={{ borderBottom: "1px solid #c4bfb6", paddingBottom: "1px" }}
              >
                <InstagramIcon />
                Instagram
              </a>
            )}
            {project.client_x && (
              <a
                href={project.client_x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-black"
                style={{ borderBottom: "1px solid #c4bfb6", paddingBottom: "1px" }}
              >
                <XIcon />
                X
              </a>
            )}
          </div>
        )}

        {/* Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="space-y-3">
            {project.images.map((src, i) => (
              <div key={i} className="w-full overflow-hidden rounded-sm">
                <img
                  src={src}
                  alt={`${project.title} — image ${i + 1}`}
                  className="w-full h-auto block"
                  style={{ display: "block" }}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
