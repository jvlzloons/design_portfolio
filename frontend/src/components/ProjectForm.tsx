import { useRef, useState } from "react";

function isVideo(src: string): boolean {
  if (src.startsWith("data:video/")) return true;
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "webm", "avi", "mkv"].includes(ext ?? "");
}

interface ImageCaption {
  title: string;
  subtitle: string;
  poster: string;
}

interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  tags: string;
  year: string;
  client: string;
  role: string;
  github_url: string;
  client_instagram: string;
  client_website: string;
  client_x: string;
  thumbnail_url: string;
  images: string[];
  image_captions: ImageCaption[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

interface ProjectFormProps {
  categories: { id: string; name: string; slug: string }[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<ProjectFormData>;
  mode?: "create" | "edit";
}

export default function ProjectForm({
  categories,
  onSubmit,
  onCancel,
  initialValues = {},
  mode = "create",
}: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: initialValues.title ?? "",
    slug: initialValues.slug ?? "",
    description: initialValues.description ?? "",
    long_description: initialValues.long_description ?? "",
    category: initialValues.category ?? "",
    tags: initialValues.tags ?? "",
    year: initialValues.year ?? "",
    client: initialValues.client ?? "",
    role: initialValues.role ?? "",
    github_url: initialValues.github_url ?? "",
    client_instagram: initialValues.client_instagram ?? "",
    client_website: initialValues.client_website ?? "",
    client_x: initialValues.client_x ?? "",
    thumbnail_url: initialValues.thumbnail_url ?? "",
    images: initialValues.images ?? [],
    image_captions: initialValues.image_captions ?? [],
    is_featured: initialValues.is_featured ?? false,
    is_published: initialValues.is_published ?? false,
    sort_order: initialValues.sort_order ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialValues.thumbnail_url ?? "");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    if (mode === "create") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm({ ...form, title: value, slug });
    } else {
      setForm({ ...form, title: value });
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setForm((prev) => ({ ...prev, thumbnail_url: dataUrl }));
      setThumbnailPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    setForm((prev) => ({ ...prev, thumbnail_url: "" }));
    setThumbnailPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, dataUrl],
          image_captions: [...prev.image_captions, { title: "", subtitle: "", poster: "" }],
        }));
      };
      reader.readAsDataURL(file);
    });
    if (galleryInputRef.current) galleryInputRef.current.value = "";
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

    if (!form.title || !form.category) {
      setError("Title and category are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        long_description: form.long_description || null,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        images: form.images,
        image_captions: form.image_captions,
        thumbnail_url: form.thumbnail_url || null,
        year: form.year || null,
        client: form.client || null,
        role: form.role || null,
        github_url: form.github_url || null,
        client_instagram: form.client_instagram || null,
        client_website: form.client_website || null,
        client_x: form.client_x || null,
        is_featured: form.is_featured,
        is_published: form.is_published,
        sort_order: form.sort_order,
      });
    } catch {
      setError(mode === "edit" ? "Failed to update project. Try again." : "Failed to create project. Try again.");
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
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Thumbnail Image</label>
        <div className="space-y-3">
          {thumbnailPreview && (
            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-700">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-1 right-1 rounded-full bg-gray-900/80 text-gray-300 hover:text-white w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="thumbnail-upload" />
            <label htmlFor="thumbnail-upload" className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors">
              {thumbnailPreview ? "Change image" : "Upload image"}
            </label>
            <span className="text-xs text-gray-500">or paste a URL below</span>
          </div>
          <input
            type="text"
            value={form.thumbnail_url.startsWith("data:") ? "" : form.thumbnail_url}
            onChange={(e) => { setForm({ ...form, thumbnail_url: e.target.value }); setThumbnailPreview(e.target.value); }}
            placeholder="https://example.com/image.jpg"
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
                    <button
                      type="button"
                      onClick={() => moveGalleryImage(i, "up")}
                      disabled={i === 0}
                      className="text-gray-600 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors text-xs"
                      title="Move up"
                    >▲</button>
                    <button
                      type="button"
                      onClick={() => moveGalleryImage(i, "down")}
                      disabled={i === form.images.length - 1}
                      className="text-gray-600 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors text-xs"
                      title="Move down"
                    >▼</button>
                  </div>
                  <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden border border-gray-600 bg-gray-900">
                    {isVideo(src) ? (
                      <video src={src} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.image_captions[i]?.title ?? ""}
                      onChange={(e) => updateCaption(i, "title", e.target.value)}
                      placeholder="Caption title (optional)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={form.image_captions[i]?.subtitle ?? ""}
                      onChange={(e) => updateCaption(i, "subtitle", e.target.value)}
                      placeholder="Caption subtitle (optional)"
                      className={inputClass}
                    />
                    {isVideo(src) && (
                      <input
                        type="text"
                        value={form.image_captions[i]?.poster ?? ""}
                        onChange={(e) => updateCaption(i, "poster", e.target.value)}
                        placeholder="Video poster/thumbnail URL (optional)"
                        className={inputClass}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="text-gray-500 hover:text-white transition-colors p-1 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input ref={galleryInputRef} type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
              <label htmlFor="gallery-upload" className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors">
                <span>+</span>
                <span>Upload images / videos</span>
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
            <p className="text-xs text-gray-500">Images appear in order on the project page.</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Project title" className={inputClass} />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>Slug</label>
        <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="project-slug" className={inputClass} />
        <p className="mt-1 text-xs text-gray-500">
          {mode === "create" ? "Auto-generated from title. Edit if needed." : "Changing the slug will break existing links."}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category *</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of the project" rows={2} className={inputClass} />
      </div>

      {/* Long Description */}
      <div>
        <label className={labelClass}>Long Description</label>
        <textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} placeholder="Detailed write-up about the project" rows={5} className={inputClass} />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="logo, identity, vector (comma separated)" className={inputClass} />
      </div>

      {/* Year, Client, Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Year</label>
          <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024 – present" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Client</label>
          <input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Lead Designer" className={inputClass} />
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label className={labelClass}>GitHub URL</label>
        <input type="text" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/username/repo" className={inputClass} />
      </div>

      {/* Client Links */}
      <div>
        <label className={labelClass}>Client Links <span className="text-gray-500 font-normal">(optional)</span></label>
        <div className="space-y-2">
          <input type="text" value={form.client_instagram} onChange={(e) => setForm({ ...form, client_instagram: e.target.value })} placeholder="Client Instagram URL" className={inputClass} />
          <input type="text" value={form.client_website} onChange={(e) => setForm({ ...form, client_website: e.target.value })} placeholder="Client Website URL" className={inputClass} />
          <input type="text" value={form.client_x} onChange={(e) => setForm({ ...form, client_x: e.target.value })} placeholder="Client X / Twitter URL" className={inputClass} />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded border-gray-700" />
          Featured project
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-700" />
          Published
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {submitting
            ? mode === "edit" ? "Saving..." : "Creating..."
            : mode === "edit" ? "Save Changes" : "Create Project"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-700 px-6 py-2 text-sm font-medium text-gray-300 hover:border-gray-500 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
