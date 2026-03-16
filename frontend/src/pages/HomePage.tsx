import { useEffect, useRef, useState } from "react";

const BANNER_KEY = "projects_uploading_dismissed";
import { getProjectsPromise, cloudinaryOpt, fetchAPI } from "../lib/api";

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  client: string | null;
  year: string | null;
  tags: string[];
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  github_url: string | null;
  is_featured: boolean;
}

type Section = "Design" | "ICT" | "Videos" | "Contact";

const NAV_ITEMS: Section[] = ["Design", "ICT", "Videos", "Contact"];

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 0C5.5 0 1.1 4.2.8 10c-.3 5.4 3.2 10.2 8.4 11.5l.3.1v2.2c0 .1.1.2.2.2h.1l2.4-2c5.5-.4 9.8-4.8 9.8-10.3C22 5.2 17.3 0 11.4 0zm5.3 15.4c-.3.8-.8 1.4-1.6 1.7-.4.2-.8.3-1.2.3-.5 0-1-.1-1.5-.3-2.4-.9-4.4-2.5-5.8-4.8-.7-1.1-1.2-2.3-1.3-3.6 0-.7.2-1.4.6-1.9.3-.4.7-.7 1.2-.8h.4c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4 0 .6l-.6.8c-.1.1-.1.3 0 .4.8 1.4 2 2.5 3.5 3.2.2.1.4 0 .5-.1l.7-.7c.1-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.5v.4c0 .4-.1.7-.2 1.3z" />
    </svg>
  );
}

function VideoGrid({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return <p className="p-8 text-sm" style={{ color: "#888" }}>No videos yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "2px" }}>
      {videos.map((video) => (
        <a
          key={video.id}
          href={`/videos/${video.slug}`}
          className="relative block overflow-hidden group"
          style={{ aspectRatio: "3/2" }}
        >
          {video.thumbnail_url ? (
            <img
              src={cloudinaryOpt(video.thumbnail_url, 600) ?? video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#d4cfc6" }}>
              <span className="text-sm" style={{ color: "#888" }}>No thumbnail</span>
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ width: 52, height: 52, backgroundColor: "rgba(255,255,255,0.85)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a1a1a" style={{ marginLeft: 3 }}>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          {/* Title overlay on hover */}
          <div
            className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
          >
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{video.title}</p>
              {video.client && (
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{video.client}</p>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "2px" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ aspectRatio: "3/2" }} />
      ))}
    </div>
  );
}

function ProjectGrid({ filtered, showGithub = false }: { filtered: Project[]; showGithub?: boolean }) {
  const [imagesReady, setImagesReady] = useState(false);
  const totalRef = useRef(0);
  const stateRef = useRef({ loaded: 0, counted: new Set<number>() });

  // Set synchronously during render so ref callbacks see the correct total immediately
  totalRef.current = filtered.filter((p) => p.thumbnail_url).length;

  function countImage(i: number) {
    if (stateRef.current.counted.has(i)) return;
    stateRef.current.counted.add(i);
    stateRef.current.loaded += 1;
    if (stateRef.current.loaded >= totalRef.current) setImagesReady(true);
  }

  useEffect(() => {
    if (totalRef.current === 0) { setImagesReady(true); return; }
    const timer = setTimeout(() => setImagesReady(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "2px" }}>
      {filtered.map((project, i) => (
        <a
          key={project.id}
          href={`/projects/${project.slug}`}
          className="relative block overflow-hidden group"
          style={imagesReady
            ? { aspectRatio: "3/2", animation: "fadeInUp 0.45s ease both", animationDelay: `${i * 0.07}s` }
            : { aspectRatio: "3/2", opacity: 0 }}
        >
          {project.thumbnail_url ? (
            <img
              src={cloudinaryOpt(project.thumbnail_url, 600) ?? project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              ref={(el) => { if (el?.complete) countImage(i); }}
              onLoad={() => countImage(i)}
              onError={() => countImage(i)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#d4cfc6" }}>
              <span className="text-sm" style={{ color: "#888" }}>No image</span>
            </div>
          )}
          <div
            className="absolute inset-0 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
          >
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{project.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{project.category}</p>
            </div>
            {showGithub && project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}
                aria-label="View on GitHub"
              >
                <GitHubIcon />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const hash = window.location.hash.slice(1).toLowerCase();
    if (hash === "ict") return "ICT";
    if (hash === "videos") return "Videos";
    if (hash === "contact") return "Contact";
    return "Design";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(() => {
    return localStorage.getItem(BANNER_KEY) !== "1";
  });
  const [bannerDismissing, setBannerDismissing] = useState(false);

  function dismissBanner() {
    setBannerDismissing(true);
    setTimeout(() => {
      localStorage.setItem(BANNER_KEY, "1");
      setBannerVisible(false);
      setBannerDismissing(false);
    }, 320);
  }

  useEffect(() => {
    getProjectsPromise()
      .then((data) => { if (data) setProjects(data as Project[]); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeSection !== "Videos" || videos.length > 0) return;
    setVideosLoading(true);
    fetchAPI("/videos")
      .then((data) => { if (data) setVideos(data as Video[]); })
      .catch(console.error)
      .finally(() => setVideosLoading(false));
  }, [activeSection]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FBF7F5", fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #d4cfc6", padding: "2rem"}} className="flex items-center px-8 py-4 relative">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" style={{ color: "#4a4a4a" }}>
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
          <img
            src="https://res.cloudinary.com/dgdtee5ls/image/upload/v1772827247/Logo_copy_o1icuq.png"
            alt="JV"
            style={{ height: "8rem", width: "auto", display: "block"}}
          />
        </a>

        {/* Right social icons - desktop only */}
        <div className="hidden md:flex items-center gap-4 ml-auto" style={{ color: "#4a4a4a" }}>
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

        {/* Hamburger button - mobile only */}
        <button
          className="md:hidden ml-auto p-1"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ color: "#4a4a4a" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Drawer overlay */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(0,0,0,0.35)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Side drawer */}
      <div
        className="md:hidden fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "272px",
          backgroundColor: "#FBF7F5",
          borderLeft: "1px solid #d4cfc6",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #d4cfc6" }}>
          <img
            src="https://res.cloudinary.com/dgdtee5ls/image/upload/v1772827247/Logo_copy_o1icuq.png"
            alt="JV"
            style={{ height: "1.75rem", width: "auto" }}
          />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ color: "#4a4a4a" }}
            className="hover:text-black transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col px-6 pt-8 gap-1 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => { setActiveSection(item); setMenuOpen(false); }}
              className="text-left bg-transparent border-0 cursor-pointer transition-colors hover:text-black py-2"
              style={{
                color: activeSection === item ? "#1a1a1a" : "#6a6a6a",
                fontFamily: "inherit",
                fontSize: "1rem",
                fontWeight: activeSection === item ? 600 : 400,
                borderBottom: activeSection === item ? "1.5px solid #1a1a1a" : "1.5px solid transparent",
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Social icons - stacked */}
        <div className="flex flex-col gap-5 px-6 mt-auto pb-10 pt-8" style={{ borderTop: "1px solid #d4cfc6", marginTop: "auto" }}>
          <a
            href="https://x.com/jvlzloona"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-black transition-colors"
            style={{ color: "#4a4a4a", textDecoration: "none" }}
          >
            <XIcon />
            <span className="text-sm font-medium">X</span>
          </a>
          <a
            href="https://www.instagram.com/jvloons/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-black transition-colors"
            style={{ color: "#4a4a4a", textDecoration: "none" }}
          >
            <InstagramIcon />
            <span className="text-sm font-medium">Instagram</span>
          </a>
          <a
            href="https://www.linkedin.com/in/jvlz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-black transition-colors"
            style={{ color: "#4a4a4a", textDecoration: "none" }}
          >
            <LinkedInIcon />
            <span className="text-sm font-medium">LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Main content */}
      <main key={activeSection} style={{ animation: "fadeIn 0.25s ease both" }}>
        {activeSection === "Design" && (
          loading ? (
            <SkeletonGrid />
          ) : (() => {
            const filtered = projects.filter((p) => p.category.toLowerCase() !== "ict");
            return filtered.length === 0
              ? <p className="p-8 text-sm" style={{ color: "#888" }}>No projects yet.</p>
              : <ProjectGrid key="design" filtered={filtered} />;
          })()
        )}

        {activeSection === "ICT" && (
          loading ? (
            <SkeletonGrid />
          ) : (() => {
            const filtered = projects.filter((p) => p.category.toLowerCase() === "ict");
            return filtered.length === 0
              ? <p className="p-8 text-sm" style={{ color: "#888" }}>No ICT projects yet.</p>
              : <ProjectGrid key="ict" filtered={filtered} showGithub />;
          })()
        )}

        {activeSection === "Videos" && (
          videosLoading ? (
            <SkeletonGrid />
          ) : (
            <VideoGrid key="videos" videos={videos} />
          )
        )}

        {activeSection === "Contact" && (
          <div className="flex flex-col items-center px-6 py-16" style={{ minHeight: "70vh" }}>
            {/* Name block */}
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#a09a90", letterSpacing: "0.18em" }}>Get in touch</p>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Josh Magdiel K.<br />Villaluz
              </h1>
            </div>

            {/* Divider */}
            <div style={{ width: "40px", height: "1.5px", backgroundColor: "#c4bfb6", marginBottom: "2.5rem" }} />

            {/* Contact rows */}
            <div className="w-full" style={{ maxWidth: "420px" }}>
              {/* Email */}
              <a
                href="mailto:jvlzloona@gmail.com"
                className="flex items-center gap-4 py-4 group"
                style={{ borderBottom: "1px solid #e4dfd6", color: "#1a1a1a", textDecoration: "none" }}
              >
                <span style={{ color: "#a09a90" }} className="group-hover:text-black transition-colors flex-shrink-0"><EmailIcon /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#a09a90", letterSpacing: "0.12em" }}>Email</p>
                  <p className="text-sm font-medium group-hover:underline" style={{ color: "#1a1a1a" }}>jvlzloona@gmail.com</p>
                </div>
              </a>

              {/* Discord */}
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid #e4dfd6" }}>
                <span style={{ color: "#a09a90" }} className="flex-shrink-0"><DiscordIcon /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#a09a90", letterSpacing: "0.12em" }}>Discord</p>
                  <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>jvlzloona</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid #e4dfd6" }}>
                <span style={{ color: "#a09a90" }} className="flex-shrink-0"><WhatsAppIcon /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#a09a90", letterSpacing: "0.12em" }}>WhatsApp</p>
                  <p className="text-sm font-medium" style={{ color: "#888" }}>Email to get number</p>
                </div>
              </div>

              {/* Viber */}
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid #e4dfd6" }}>
                <span style={{ color: "#a09a90" }} className="flex-shrink-0"><ViberIcon /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#a09a90", letterSpacing: "0.12em" }}>Viber</p>
                  <p className="text-sm font-medium" style={{ color: "#888" }}>Email to get number</p>
                </div>
              </div>

              {/* GitHub */}
              <a
                href="https://github.com/jvlzloons"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-4 group"
                style={{ borderBottom: "1px solid #e4dfd6", color: "#1a1a1a", textDecoration: "none" }}
              >
                <span style={{ color: "#a09a90" }} className="group-hover:text-black transition-colors flex-shrink-0"><GitHubIcon /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#a09a90", letterSpacing: "0.12em" }}>GitHub</p>
                  <p className="text-sm font-medium group-hover:underline" style={{ color: "#1a1a1a" }}>github.com/jvlzloons</p>
                </div>
              </a>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-6 mt-10" style={{ color: "#a09a90" }}>
              <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn">
                <LinkedInIcon size={22} />
              </a>
              <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram">
                <InstagramIcon size={22} />
              </a>
              <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter">
                <XIcon size={22} />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Uploading banner */}
      {bannerVisible && (
        <div
          className="fixed bottom-6 left-1/2 z-40 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl"
          style={{
            animation: bannerDismissing
              ? "bannerOut 0.32s cubic-bezier(0.4,0,1,1) forwards"
              : "bannerIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
            backgroundColor: "#1a1a1a",
            color: "#f5f0ea",
            maxWidth: "min(92vw, 460px)",
            width: "100%",
            fontFamily: "'Space Grotesk', sans-serif",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Caution icon */}
          <div className="flex-shrink-0" style={{ color: "#f0c040" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: "#f5f0ea" }}>
              More projects are being uploaded
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,234,0.5)" }}>
              Check back soon for new work.
            </p>
          </div>
          {/* Dismiss */}
          <button
            onClick={dismissBanner}
            className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(245,240,234,0.7)" }}
            aria-label="Dismiss"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
