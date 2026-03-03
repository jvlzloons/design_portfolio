import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { fetchAPI, fetchAuthAPI } from "../lib/api";
import ProjectForm from "../components/ProjectForm";

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
  github_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const [projectsData, categoriesData] = await Promise.all([
        fetchAuthAPI("/admin/projects", token),
        fetchAPI("/categories"),
      ]);
      setProjects(projectsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(data: Record<string, unknown>) {
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI("/admin/projects", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    setShowCreateForm(false);
    setLoading(true);
    await loadData();
  }

  async function handleUpdate(data: Record<string, unknown>) {
    if (!editingProject) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/projects/${editingProject.id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    setEditingProject(null);
    setLoading(true);
    await loadData();
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newProjects = [...projects];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newProjects[index], newProjects[swapIndex]] = [newProjects[swapIndex], newProjects[index]];
    const reordered = newProjects.map((p, i) => ({ ...p, sort_order: i }));
    setProjects(reordered);
    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    setOrderError("");
    try {
      const token = await getToken();
      if (!token) return;
      await fetchAuthAPI("/admin/projects/reorder", token, {
        method: "POST",
        body: JSON.stringify({
          items: projects.map((p) => ({ id: p.id, sort_order: p.sort_order })),
        }),
      });
      setOrderDirty(false);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to save order. Is the backend running?");
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/projects/${id}`, token, { method: "DELETE" });
    setLoading(true);
    await loadData();
  }

  async function handleAddCategory(e: { preventDefault(): void }) {
    e.preventDefault();
    setCategoryError("");
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const token = await getToken();
      if (!token) return;
      await fetchAuthAPI("/admin/categories", token, {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName.trim(), sort_order: categories.length }),
      });
      setNewCategoryName("");
      await loadData();
    } catch {
      setCategoryError("Failed to create category.");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? Projects using it won't be affected.")) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/categories/${id}`, token, { method: "DELETE" });
    await loadData();
  }

  const activeForm = showCreateForm || editingProject !== null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← View site
            </a>
            <UserButton />
          </div>
        </div>

        {/* Categories section */}
        <div className="mb-10 rounded-lg border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">No categories yet. Add one to start creating projects.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1 text-sm"
                >
                  {cat.name}
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                    aria-label={`Delete ${cat.name}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <form onSubmit={handleAddCategory} className="flex items-center gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name (e.g. Design, ICT)"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addingCategory || !newCategoryName.trim()}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 disabled:opacity-40 transition-colors"
            >
              {addingCategory ? "Adding..." : "Add"}
            </button>
          </form>
          {categoryError && (
            <p className="mt-2 text-xs text-red-400">{categoryError}</p>
          )}
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="mb-8 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">New Project</h2>
            <ProjectForm
              categories={categories}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              mode="create"
            />
          </div>
        )}

        {/* Edit form */}
        {editingProject && (
          <div className="mb-8 rounded-lg border border-blue-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Edit: {editingProject.title}</h2>
            <ProjectForm
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProject(null)}
              mode="edit"
              initialValues={{
                title: editingProject.title,
                slug: editingProject.slug,
                description: editingProject.description ?? "",
                long_description: editingProject.long_description ?? "",
                category: editingProject.category,
                tags: (editingProject.tags ?? []).join(", "),
                year: editingProject.year?.toString() ?? "",
                client: editingProject.client ?? "",
                role: editingProject.role ?? "",
                github_url: editingProject.github_url ?? "",
                thumbnail_url: editingProject.thumbnail_url ?? "",
                images: editingProject.images ?? [],
                is_featured: editingProject.is_featured,
                is_published: editingProject.is_published,
              }}
            />
          </div>
        )}

        {/* New Project button */}
        {!activeForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a category first" : undefined}
            className="mb-8 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + New Project
          </button>
        )}

        {/* Project list */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Projects ({projects.length})
              </h2>
              {(orderDirty || orderError) && (
                <div className="flex items-center gap-3">
                  {orderError && (
                    <span className="text-xs text-red-400">{orderError}</span>
                  )}
                  {orderDirty && (
                    <button
                      onClick={handleSaveOrder}
                      disabled={savingOrder}
                      className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
                    >
                      {savingOrder ? "Saving..." : "Save Order"}
                    </button>
                  )}
                </div>
              )}
            </div>
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects yet. Create your first one!</p>
            ) : (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-800 p-4"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{project.title}</h3>
                    <p className="text-sm text-gray-400">{project.category}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Sort order buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === projects.length - 1}
                        className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        project.is_published
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </span>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingProject(project);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
