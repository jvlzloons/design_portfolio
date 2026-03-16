import { useState } from "react";
import { uploadToCloudinary } from "../lib/api";

interface VideoFormValues {
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  tags: string;
  client: string;
  year: string;
  is_published: boolean;
  sort_order: number;
}

const DEFAULT: VideoFormValues = {
  title: "",
  slug: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  tags: "",
  client: "",
  year: "",
  is_published: false,
  sort_order: 0,
};

interface Props {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
  initialValues?: Partial<VideoFormValues>;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function VideoForm({ onSubmit, onCancel, mode, initialValues }: Props) {
  const [form, setForm] = useState<VideoFormValues>({ ...DEFAULT, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none";

  function set(field: keyof VideoFormValues, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: mode === "create" ? slugify(title) : prev.slug,
    }));
  }

  async function handleThumbFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadToCloudinary(file);
      set("thumbnail_url", url);
    } catch {
      setError("Thumbnail upload failed.");
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadToCloudinary(file);
      set("video_url", url);
    } catch {
      setError("Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        video_url: form.video_url.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        client: form.client.trim() || null,
        year: form.year.trim() || null,
        is_published: form.is_published,
        sort_order: form.sort_order,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Title + Slug */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Title *</label>
          <input type="text" value={form.title} onChange={handleTitleChange} placeholder="Video title" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Slug *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated"
            readOnly={mode === "edit"}
            className={`${inputClass} ${mode === "edit" ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short description"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Thumbnail</label>
        {form.thumbnail_url && (
          <img src={form.thumbnail_url} alt="thumbnail" className="w-32 h-20 object-cover rounded mb-2" />
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={form.thumbnail_url}
            onChange={(e) => set("thumbnail_url", e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className={`${inputClass} flex-1`}
          />
          <label className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap">
            {uploadingThumb ? "Uploading…" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleThumbFile} disabled={uploadingThumb} />
          </label>
        </div>
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Video URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.video_url}
            onChange={(e) => set("video_url", e.target.value)}
            placeholder="https://res.cloudinary.com/... or YouTube URL"
            className={`${inputClass} flex-1`}
          />
          <label className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-colors whitespace-nowrap">
            {uploadingVideo ? "Uploading…" : "Upload"}
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoFile} disabled={uploadingVideo} />
          </label>
        </div>
      </div>

      {/* Client + Year */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Client</label>
          <input type="text" value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="Client name" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Year</label>
          <input type="text" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" className={inputClass} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
        <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Motion Graphics, After Effects" className={inputClass} />
      </div>

      {/* Published toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => set("is_published", !form.is_published)}
          className={`relative w-9 h-5 rounded-full transition-colors ${form.is_published ? "bg-blue-600" : "bg-gray-700"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published ? "translate-x-4" : "translate-x-0"}`}
          />
        </div>
        <span className="text-sm text-gray-300">Published</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploadingThumb || uploadingVideo}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-40 transition-colors"
        >
          {submitting ? "Saving…" : mode === "create" ? "Create Video" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
