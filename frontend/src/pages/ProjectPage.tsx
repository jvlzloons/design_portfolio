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
  year: number | null;
  client: string | null;
  role: string | null;
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
        <nav className="flex items-center gap-1 text-sm font-medium" style={{ color: "#4a4a4a" }}>
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

        <div className="flex items-center gap-4 ml-auto" style={{ color: "#4a4a4a" }}>
          <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter"><XIcon /></a>
          <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram"><InstagramIcon /></a>
          <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
        </div>
      </header>

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
              <span className="text-sm">{project.client}</span>
            </>
          )}
          {project.role && (
            <>
              <span style={{ color: "#d4cfc6" }}>·</span>
              <span className="text-sm">{project.role}</span>
            </>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            className="leading-relaxed mb-16"
            style={{ fontSize: "1.1rem", color: "#3a3a3a", maxWidth: "65ch" }}
          >
            {description}
          </p>
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
