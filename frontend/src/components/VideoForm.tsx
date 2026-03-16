import { useRef, useState } from "react";
import { uploadToCloudinary } from "../lib/api";

function isVideo(src: string): boolean {
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "webm", "avi", "mkv"].includes(ext ?? "");
}

function isYouTube(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface ImageCaption {
  title: string;
  subtitle: string;
  poster: string;
}

interface VideoFormData {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  video_url: string;
  thumbnail_url: string;
  images: string[];
  image_captions: ImageCaption[];
  tags: string;
  client: string;
  year: string;
  is_published: boolean;
  sort_order: number;
}

interface VideoFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<VideoFormData>;
  mode?: "create" | "edit";
}

export default function VideoForm({
  onSubmit,
  onCancel,
  initialValues = {},
  mode = "create",
}: VideoFormProps) {
  const [form, setForm] = useState<VideoFormData>({
    title: initialValues.title ?? "",
    slug: initialValues.slug ?? "",
    description: initialValues.description ?? "",
    long_description: initialValues.long_description ?? "",
    video_url: initialValues.video_url ?? "",
    thumbnail_url: initialValues.thumbnail_url ?? "",
    images: initialValues.images ?? [],
    image_captions: initialValues.image_captions ?? [],
    tags: initialValues.tags ?? "",
    client: initialValues.client ?? "",
    year: initialValues.year ?? "",
    is_published: initialValues.is_published ?? false,
    sort_order: initialValues.sort_order ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialValues.thumbnail_url ?? "");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    if (mode === "create") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setForm({ ...form, title: value, slug });
    } else {
      setForm({ ...form, title: value });
    }
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, thumbnail_url: url }));
      setThumbnailPreview(url);
    } catch {
      setUploadError("Thumbnail upload failed. Try again.");
    } finally {
      setUploading(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  }

  function handleClearThumb() {
    setForm((prev) => ({ ...prev, thumbnail_url: "" }));
    setThumbnailPreview("");
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        image_captions: [...prev.image_captions, ...urls.map(() => ({ title: "", subtitle: "", poster: "" }))],
      }));
    } catch {
      setUploadError("One or more uploads failed. Try again.");
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      image_captions: prev.image_captions.filter((_, i) => i !== index),
    }));
  }

  function moveGalleryImage(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    setForm((prev) => {
      const images = [...prev.images];
      const captions = [...prev.image_captions];
      [images[index], images[swapIndex]] = [images[swapIndex], images[index]];
      [captions[index], captions[swapIndex]] = [captions[swapIndex], captions[index]];
      return { ...prev, images, image_captions: captions };
    });
  }

  function updateCaption(index: number, field: keyof ImageCaption, value: string) {
    setForm((prev) => {
      const captions = [...prev.image_captions];
      while (captions.length <= index) captions.push({ title: "", subtitle: "", poster: "" });
      captions[index] = { ...captions[index], [field]: value };
      return { ...prev, image_captions: captions };
    });
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    if (!form.title) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        long_description: form.long_description || null,
        video_url: form.video_url || null,
        thumbnail_url: form.thumbnail_url || null,
        images: form.images,
        image_captions: form.image_captions,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        client: form.client || null,
        year: form.year || null,
        is_published: form.is_published,
        sort_order: form.sort_order,
      });
    } catch {
      setError(mode === "edit" ? "Failed to update video. Try again." : "Failed to create video. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-3 text-red-300 text-sm">{error}</div>
      )}

      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Thumbnail Image</label>
        <div className="space-y-3">
          {thumbnailPreview && (
            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-700">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              <button type="button" onClick={handleClearThumb} className="absolute top-1 right-1 rounded-full bg-gray-900/80 text-gray-300 hover:text-white w-6 h-6 flex items-center justify-center text-xs">✕</button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbUpload} className="hidden" id="video-thumb-upload" disabled={uploading} />
            <label htmlFor="video-thumb-upload" className={`cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? "Uploading..." : thumbnailPreview ? "Change image" : "Upload image"}
            </label>
            <span className="text-xs text-gray-500">or paste a URL below</span>
          </div>
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          <input
            type="text"
            value={form.thumbnail_url}
            onChange={(e) => { setForm({ ...form, thumbnail_url: e.target.value }); setThumbnailPreview(e.target.value); }}
            placeholder="https://res.cloudinary.com/..."
            className={inputClass}
          />
        </div>
      </div>

      {/* Gallery Images */}
      <div>
        <label className={labelClass}>Gallery Images</label>
        <div className="space-y-3">
          {form.images.length > 0 && (
            <div className="space-y-2">
              {form.images.map((src, i) => (
                <div key={i} className="flex gap-3 items-start rounded-lg border border-gray-700 p-3">
                  <div className="flex flex-col gap-0.5 flex-shrink-0 justify-center pt-1">
                    <button type="button" onClick={() => moveGalleryImage(i, "up")} disabled={i === 0} className="text-gray-600 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors text-xs" title="Move up">▲</button>
                    <button type="button" onClick={() => moveGalleryImage(i, "down")} disabled={i === form.images.length - 1} className="text-gray-600 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors text-xs" title="Move down">▼</button>
                  </div>
                  <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden border border-gray-600 bg-gray-900">
                    {isYouTube(src) ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeId(src)}/mqdefault.jpg`}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : isVideo(src) ? (
                      <video src={src} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={src}
                      onChange={(e) => {
                        const newImages = [...form.images];
                        newImages[i] = e.target.value;
                        setForm((prev) => ({ ...prev, images: newImages }));
                      }}
                      placeholder="https://res.cloudinary.com/..."
                      className={inputClass}
                    />
                    <input type="text" value={form.image_captions[i]?.title ?? ""} onChange={(e) => updateCaption(i, "title", e.target.value)} placeholder="Caption title (optional)" className={inputClass} />
                    <input type="text" value={form.image_captions[i]?.subtitle ?? ""} onChange={(e) => updateCaption(i, "subtitle", e.target.value)} placeholder="Caption subtitle (optional)" className={inputClass} />
                    {(isVideo(src) || isYouTube(src)) && (
                      <input type="text" value={form.image_captions[i]?.poster ?? ""} onChange={(e) => updateCaption(i, "poster", e.target.value)} placeholder="Video poster/thumbnail URL (optional)" className={inputClass} />
                    )}
                  </div>
                  <button type="button" onClick={() => removeGalleryImage(i)} className="text-gray-500 hover:text-white transition-colors p-1 flex-shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input ref={galleryInputRef} type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} className="hidden" id="video-gallery-upload" disabled={uploading} />
              <label htmlFor="video-gallery-upload" className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <span>+</span>
                <span>{uploading ? "Uploading..." : "Upload images / videos"}</span>
              </label>
              <span className="text-xs text-gray-500">or paste a URL:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={galleryUrlInput}
                onChange={(e) => setGalleryUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (galleryUrlInput.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        images: [...prev.images, galleryUrlInput.trim()],
                        image_captions: [...prev.image_captions, { title: "", subtitle: "", poster: "" }],
                      }));
                      setGalleryUrlInput("");
                    }
                  }
                }}
                placeholder="https://res.cloudinary.com/... (press Enter to add)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  if (galleryUrlInput.trim()) {
                    setForm((prev) => ({
                      ...prev,
                      images: [...prev.images, galleryUrlInput.trim()],
                      image_captions: [...prev.image_captions, { title: "", subtitle: "", poster: "" }],
                    }));
                    setGalleryUrlInput("");
                  }
                }}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors whitespace-nowrap"
              >
                Add URL
              </button>
            </div>
            <p className="text-xs text-gray-500">Images appear in order below the main video on the video page.</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Video title" className={inputClass} />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>Slug</label>
        <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="video-slug" className={inputClass} />
        <p className="mt-1 text-xs text-gray-500">
          {mode === "create" ? "Auto-generated from title. Edit if needed." : "Changing the slug will break existing links."}
        </p>
      </div>

      {/* Video URL */}
      <div>
        <label className={labelClass}>Video URL</label>
        <input type="text" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://res.cloudinary.com/... or YouTube URL" className={inputClass} />
        <p className="mt-1 text-xs text-gray-500">Supports Cloudinary-hosted videos and YouTube links.</p>
      </div>

      {/* Short Description */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary" rows={2} className={inputClass} />
      </div>

      {/* Long Description */}
      <div>
        <label className={labelClass}>Long Description</label>
        <textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} placeholder="Detailed write-up about the video" rows={5} className={inputClass} />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Motion Graphics, After Effects (comma separated)" className={inputClass} />
      </div>

      {/* Year + Client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Year</label>
          <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Client</label>
          <input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" className={inputClass} />
        </div>
      </div>

      {/* Published toggle */}
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-700" />
        Published
      </label>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {submitting
            ? mode === "edit" ? "Saving..." : "Creating..."
            : mode === "edit" ? "Save Changes" : "Create Video"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-700 px-6 py-2 text-sm font-medium text-gray-300 hover:border-gray-500 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
