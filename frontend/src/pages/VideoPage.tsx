import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAPI, cloudinaryOpt } from "../lib/api";

function isVideo(src: string): boolean {
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "webm", "avi", "mkv"].includes(ext ?? "");
}

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeEmbed(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  images: string[];
  image_captions: { title: string; subtitle: string; poster: string }[];
  tags: string[];
  client: string | null;
  year: string | null;
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

export default function VideoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchAPI(`/videos/${slug}`)
      .then(setVideo)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const lightboxPrev = useCallback(() => {
    if (!video || lightboxIndex === null) return;
    setLightboxIndex((i) => (i! > 0 ? i! - 1 : video.images.length - 1));
  }, [video, lightboxIndex]);

  const lightboxNext = useCallback(() => {
    if (!video || lightboxIndex === null) return;
    setLightboxIndex((i) => (i! < video.images.length - 1 ? i! + 1 : 0));
  }, [video, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, lightboxPrev, lightboxNext]);

  const pageStyle = { backgroundColor: "#FBF7F5", fontFamily: "'Space Grotesk', sans-serif" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <p className="text-sm" style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={pageStyle}>
        <p className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Video not found</p>
        <a href="/" className="mt-4 text-sm underline" style={{ color: "#888" }}>← Back to portfolio</a>
      </div>
    );
  }

  const description = video.long_description || video.description;

  return (
    <div className="min-h-screen" style={pageStyle}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #d4cfc6" }} className="flex items-center px-8 py-4 relative">
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" style={{ color: "#4a4a4a" }}>
          <a href="/" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>Design</a>
          <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>
          <a href="/#ict" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>ICT</a>
          <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>
          <a href="/#videos" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>Videos</a>
          <span style={{ color: "#c4bfb6", padding: "0 2px" }}>|</span>
          <a href="/#contact" className="px-2 py-0.5 hover:text-black transition-colors" style={{ borderBottom: "1.5px solid transparent" }}>Contact</a>
        </nav>

        <a href="/" className="absolute left-1/2 -translate-x-1/2">
          <img
            src="https://res.cloudinary.com/dgdtee5ls/image/upload/v1772827247/Logo_copy_o1icuq.png"
            alt="JV"
            style={{ height: "2rem", width: "auto", display: "block" }}
          />
        </a>

        <div className="hidden md:flex items-center gap-4 ml-auto" style={{ color: "#4a4a4a" }}>
          <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="X / Twitter"><XIcon /></a>
          <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="Instagram"><InstagramIcon /></a>
          <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
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
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #d4cfc6" }}>
          <img src="https://res.cloudinary.com/dgdtee5ls/image/upload/v1772827247/Logo_copy_o1icuq.png" alt="JV" style={{ height: "1.75rem", width: "auto" }} />
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ color: "#4a4a4a" }} className="hover:text-black transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-6 pt-8 gap-1 text-sm font-medium">
          {[{ label: "Design", href: "/" }, { label: "ICT", href: "/#ict" }, { label: "Videos", href: "/#videos" }, { label: "Contact", href: "/#contact" }].map(({ label, href }) => (
            <a key={label} href={href} className="hover:text-black transition-colors py-2" style={{ color: "#6a6a6a", fontSize: "1rem", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-5 px-6 pb-10 pt-8" style={{ borderTop: "1px solid #d4cfc6", marginTop: "auto" }}>
          <a href="https://x.com/jvlzloona" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-black transition-colors" style={{ color: "#4a4a4a", textDecoration: "none" }}><XIcon /><span className="text-sm font-medium">X</span></a>
          <a href="https://www.instagram.com/jvloons/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-black transition-colors" style={{ color: "#4a4a4a", textDecoration: "none" }}><InstagramIcon /><span className="text-sm font-medium">Instagram</span></a>
          <a href="https://www.linkedin.com/in/jvlz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-black transition-colors" style={{ color: "#4a4a4a", textDecoration: "none" }}><LinkedInIcon /><span className="text-sm font-medium">LinkedIn</span></a>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Back */}
        <a href="/" className="inline-flex items-center gap-1 text-sm mb-12 transition-colors hover:text-black" style={{ color: "#888" }}>
          <span>←</span>
          <span>Back</span>
        </a>

        {/* Title */}
        <h1
          className="font-bold leading-none mb-4"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#1a1a1a", letterSpacing: "-0.03em" }}
        >
          {video.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-10" style={{ color: "#888" }}>
          {video.year && <span className="text-sm">{video.year}</span>}
          {video.client && (
            <>
              {video.year && <span style={{ color: "#d4cfc6" }}>·</span>}
              <span className="text-sm">Client: {video.client}</span>
            </>
          )}
          {video.tags && video.tags.length > 0 && (
            <>
              {(video.year || video.client) && <span style={{ color: "#d4cfc6" }}>·</span>}
              <span className="text-sm">{video.tags.join(", ")}</span>
            </>
          )}
        </div>

        {/* Main video */}
        {video.video_url && (
          <div className="mb-16 w-full overflow-hidden rounded-sm" style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
            {isYouTube(video.video_url) ? (
              <iframe
                src={getYouTubeEmbed(video.video_url)}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.video_url}
                controls
                playsInline
                poster={video.thumbnail_url ?? undefined}
                className="w-full h-full"
                style={{ display: "block" }}
              />
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="leading-relaxed mb-16" style={{ fontSize: "1.1rem", color: "#3a3a3a", maxWidth: "65ch" }}>
            {description}
          </p>
        )}

        {/* Gallery */}
        {video.images && video.images.length > 0 && (
          <div className="space-y-10">
            {video.images.map((src, i) => {
              const caption = video.image_captions?.[i];
              return (
                <div key={i}>
                  <div
                    className="w-full overflow-hidden rounded-sm cursor-zoom-in relative"
                    onClick={() => setLightboxIndex(i)}
                  >
                    {isVideo(src) ? (
                      <>
                        <video
                          src={src}
                          poster={caption?.poster || undefined}
                          className="w-full h-auto block"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.18)" }}>
                          <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "rgba(255,255,255,0.92)" }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="#1a1a1a"><polygon points="6,3 21,12 6,21" /></svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={cloudinaryOpt(src, 1200) ?? src}
                        alt={`${video.title} — image ${i + 1}`}
                        className="w-full h-auto block"
                      />
                    )}
                  </div>
                  {(caption?.title || caption?.subtitle) && (
                    <div className="mt-3" style={{ maxWidth: "65ch" }}>
                      {caption.title && <p className="font-semibold" style={{ color: "#1a1a1a", fontSize: "1rem" }}>{caption.title}</p>}
                      {caption.subtitle && <p className="mt-1" style={{ color: "#6a6a6a", fontSize: "0.9rem", lineHeight: "1.5" }}>{caption.subtitle}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && video.images[lightboxIndex] && (() => {
        const caption = video.image_captions?.[lightboxIndex];
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.92)", animation: "fadeIn 0.2s ease both" }}
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-5 right-6 text-white/60 hover:text-white transition-colors text-3xl leading-none" aria-label="Close" style={{ fontFamily: "sans-serif" }}>×</button>

            {video.images.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2" aria-label="Previous">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            )}

            <div className="flex flex-col items-center px-16 max-h-screen" style={{ maxWidth: "min(90vw, 1100px)" }} onClick={(e) => e.stopPropagation()}>
              {isVideo(video.images[lightboxIndex]) ? (
                <video
                  key={lightboxIndex}
                  src={video.images[lightboxIndex]}
                  poster={video.image_captions?.[lightboxIndex]?.poster || undefined}
                  controls
                  autoPlay
                  playsInline
                  style={{ maxHeight: "75vh", maxWidth: "100%", display: "block" }}
                />
              ) : (
                <img
                  src={video.images[lightboxIndex]}
                  alt={`${video.title} — image ${lightboxIndex + 1}`}
                  style={{ maxHeight: "75vh", maxWidth: "100%", objectFit: "contain", display: "block" }}
                />
              )}
              {(caption?.title || caption?.subtitle) && (
                <div className="mt-4 text-center" style={{ maxWidth: "60ch" }}>
                  {caption?.title && <p className="font-semibold text-white" style={{ fontSize: "1rem" }}>{caption.title}</p>}
                  {caption?.subtitle && <p className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: "1.5" }}>{caption.subtitle}</p>}
                </div>
              )}
              {video.images.length > 1 && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: "1rem" }}>
                  {lightboxIndex + 1} / {video.images.length}
                </p>
              )}
            </div>

            {video.images.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2" aria-label="Next">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}
