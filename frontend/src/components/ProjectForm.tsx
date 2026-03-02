import { useState } from "react";

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
  is_featured: boolean;
  is_published: boolean;
}

interface ProjectFormProps {
  categories: { id: string; name: string; slug: string }[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ categories, onSubmit, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: "",
    slug: "",
    description: "",
    long_description: "",
    category: "",
    tags: "",
    year: "",
    client: "",
    role: "",
    is_featured: false,
    is_published: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  function handleTitleChange(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm({ ...form, title: value, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
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
        images: [],
        thumbnail_url: null,
        year: form.year ? parseInt(form.year) : null,
        client: form.client || null,
        role: form.role || null,
        is_featured: form.is_featured,
        is_published: form.is_published,
        sort_order: 0,
      });
    } catch {
      setError("Failed to create project. Try again.");
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

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Project title"
          className={inputClass}
        />
      </div>

      {/* Slug (auto-generated) */}
      <div>
        <label className={labelClass}>Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="project-slug"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Auto-generated from title. Edit if needed.</p>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category *</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief summary of the project"
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Long Description */}
      <div>
        <label className={labelClass}>Long Description</label>
        <textarea
          value={form.long_description}
          onChange={(e) => setForm({ ...form, long_description: e.target.value })}
          placeholder="Detailed write-up about the project"
          rows={5}
          className={inputClass}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="logo, identity, vector (comma separated)"
          className={inputClass}
        />
      </div>

      {/* Year, Client, Role — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            placeholder="2025"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Client</label>
          <input
            type="text"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            placeholder="Client name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Lead Designer"
            className={inputClass}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="rounded border-gray-700"
          />
          Featured project
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="rounded border-gray-700"
          />
          Published
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Creating..." : "Create Project"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-700 px-6 py-2 text-sm font-medium text-gray-300 hover:border-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}