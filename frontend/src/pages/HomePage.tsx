import { useEffect, useState } from "react";
import { fetchAPI } from "../lib/api";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  is_featured: boolean;
}

type Section = "Design" | "ICT" | "Contact";

const NAV_ITEMS: Section[] = ["Design", "ICT", "Contact"];

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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("Design");

  useEffect(() => {
    fetchAPI("/projects")
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ebe0", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #d4cfc6" }} className="flex items-center px-8 py-4 relative">
        {/* Left nav */}
        <nav className="flex items-center gap-1 text-sm font-medium" style={{ color: "#4a4a4a" }}>
          {NAV_ITEMS.map((item, i) => (
            <span key={item} className="flex items-center gap-1">
              {i > 0 && <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>}
              <button
                onClick={() => setActiveSection(item)}
                className="px-2 py-0.5 transition-colors hover:text-black bg-transparent border-0 cursor-pointer"
                style={{
                  borderBottom: activeSection === item ? "1.5px solid #1a1a1a" : "1.5px solid transparent",
                  color: activeSection === item ? "#1a1a1a" : undefined,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                }}
              >
                {item}
              </button>
            </span>
          ))}
        </nav>

        {/* Center logo */}
        <a href="/" className="absolute left-1/2 -translate-x-1/2">
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            JV
          </span>
        </a>

        {/* Right social icons */}
        <div className="flex items-center gap-4 ml-auto" style={{ color: "#4a4a4a" }}>
          <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter">
            <XIcon />
          </a>
          <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main>
        {activeSection === "Design" && (
          loading ? (
            <p className="p-8 text-sm" style={{ color: "#888" }}>Loading...</p>
          ) : projects.length === 0 ? (
            <p className="p-8 text-sm" style={{ color: "#888" }}>No projects yet.</p>
          ) : (
            <div className="grid grid-cols-3" style={{ gap: "2px" }}>
              {projects.map((project) => (
                <a
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="relative block overflow-hidden group"
                  style={{ aspectRatio: "3/2" }}
                >
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#d4cfc6" }}>
                      <span className="text-sm" style={{ color: "#888" }}>No image</span>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{project.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{project.category}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        )}

        {activeSection === "ICT" && (
          <div className="p-8">
            <p className="text-sm" style={{ color: "#888" }}>ICT projects coming soon.</p>
          </div>
        )}

        {activeSection === "Contact" && (
          <>
          <div className="p-8">
            <p className="text-sm">Contact Info</p>
          </div>
          <div className="p-8">
            <p className="text-sm" style={{ color: "#888" }}>Josh Magdiel K. Villaluz</p>
          </div>
          </>
        )}
      </main>
    </div>
  );
}
