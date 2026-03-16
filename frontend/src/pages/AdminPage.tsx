import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { fetchAPI, fetchAuthAPI } from "../lib/api";
import ProjectForm from "../components/ProjectForm";
import VideoForm from "../components/VideoForm";

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
  image_captions: { title: string; subtitle: string; poster: string }[];
  year: string | null;
  client: string | null;
  role: string | null;
  github_url: string | null;
  client_instagram: string | null;
  client_website: string | null;
  client_x: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  client: string | null;
  year: string | null;
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

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoOrderDirty, setVideoOrderDirty] = useState(false);
  const [savingVideoOrder, setSavingVideoOrder] = useState(false);
  const [videoOrderError, setVideoOrderError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const [projectsData, categoriesData, videosData] = await Promise.all([
        fetchAuthAPI("/admin/projects", token),
        fetchAPI("/categories"),
        fetchAuthAPI("/admin/videos", token),
      ]);
      setProjects(projectsData);
      setCategories(categoriesData);
      setVideos(videosData ?? []);
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

  function handleMove(id: string, direction: "up" | "down") {
    const isICT = (p: Project) => p.category.toLowerCase() === "ict";
    const project = projects.find((p) => p.id === id)!;
    // Get the indices in the full projects array that belong to this group
    const groupIndices = projects.reduce<number[]>((acc, p, i) => {
      if (isICT(p) === isICT(project)) acc.push(i);
      return acc;
    }, []);
    const posInGroup = groupIndices.findIndex((gi) => projects[gi].id === id);
    const swapPosInGroup = direction === "up" ? posInGroup - 1 : posInGroup + 1;
    if (swapPosInGroup < 0 || swapPosInGroup >= groupIndices.length) return;
    // Swap actual positions in the array
    const newProjects = [...projects];
    const aIdx = groupIndices[posInGroup];
    const bIdx = groupIndices[swapPosInGroup];
    [newProjects[aIdx], newProjects[bIdx]] = [newProjects[bIdx], newProjects[aIdx]];
    // Re-index sort_order within the group
    groupIndices.forEach((gi, i) => {
      newProjects[gi] = { ...newProjects[gi], sort_order: i };
    });
    setProjects(newProjects);
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

  async function handleCreateVideo(data: Record<string, unknown>) {
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI("/admin/videos", token, { method: "POST", body: JSON.stringify(data) });
    setShowCreateVideo(false);
    await loadData();
  }

  async function handleUpdateVideo(data: Record<string, unknown>) {
    if (!editingVideo) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/videos/${editingVideo.id}`, token, { method: "PUT", body: JSON.stringify(data) });
    setEditingVideo(null);
    await loadData();
  }

  async function handleDeleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/videos/${id}`, token, { method: "DELETE" });
    await loadData();
  }

  function handleMoveVideo(id: string, direction: "up" | "down") {
    const idx = videos.findIndex((v) => v.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= videos.length) return;
    const newVideos = [...videos];
    [newVideos[idx], newVideos[swapIdx]] = [newVideos[swapIdx], newVideos[idx]];
    newVideos.forEach((v, i) => { newVideos[i] = { ...v, sort_order: i }; });
    setVideos(newVideos);
    setVideoOrderDirty(true);
  }

  async function handleSaveVideoOrder() {
    setSavingVideoOrder(true);
    setVideoOrderError("");
    try {
      const token = await getToken();
      if (!token) return;
      await fetchAuthAPI("/admin/videos/reorder", token, {
        method: "POST",
        body: JSON.stringify({ items: videos.map((v) => ({ id: v.id, sort_order: v.sort_order })) }),
      });
      setVideoOrderDirty(false);
    } catch (err) {
      setVideoOrderError(err instanceof Error ? err.message : "Failed to save order.");
    } finally {
      setSavingVideoOrder(false);
    }
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
                client_instagram: editingProject.client_instagram ?? "",
                client_website: editingProject.client_website ?? "",
                client_x: editingProject.client_x ?? "",
                thumbnail_url: editingProject.thumbnail_url ?? "",
                images: editingProject.images ?? [],
                image_captions: editingProject.image_captions ?? [],
                is_featured: editingProject.is_featured,
                is_published: editingProject.is_published,
                sort_order: editingProject.sort_order,
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
        ) : (() => {
          const designProjects = projects.filter((p) => p.category.toLowerCase() !== "ict");
          const ictProjects = projects.filter((p) => p.category.toLowerCase() === "ict");

          const renderGroup = (group: Project[], label: string) => (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{label} <span className="text-gray-500 text-base font-normal">({group.length})</span></h2>
                {(orderDirty || orderError) && (
                  <div className="flex items-center gap-3">
                    {orderError && <span className="text-xs text-red-400">{orderError}</span>}
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
              {group.length === 0 ? (
                <p className="text-sm text-gray-500 rounded-lg border border-gray-800 p-4">No {label} projects yet.</p>
              ) : (
                <div className="space-y-2">
                  {group.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-800 p-4"
                    >
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{project.title}</h3>
                        <p className="text-sm text-gray-400">{project.category}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMove(project.id, "up")}
                            disabled={index === 0}
                            className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                            title="Move up"
                          >▲</button>
                          <button
                            onClick={() => handleMove(project.id, "down")}
                            disabled={index === group.length - 1}
                            className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                            title="Move down"
                          >▼</button>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${project.is_published ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                          {project.is_published ? "Published" : "Draft"}
                        </span>
                        <button
                          onClick={() => { setShowCreateForm(false); setEditingProject(project); }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

          return (
            <div>
              {projects.length === 0 ? (
                <p className="text-gray-400">No projects yet. Create your first one!</p>
              ) : (
                <>
                  {renderGroup(designProjects, "Design")}
                  {renderGroup(ictProjects, "ICT")}
                </>
              )}
            </div>
          );
        })()}
        {/* Videos section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">
              Videos <span className="text-gray-500 text-base font-normal">({videos.length})</span>
            </h2>
            {(videoOrderDirty || videoOrderError) && (
              <div className="flex items-center gap-3">
                {videoOrderError && <span className="text-xs text-red-400">{videoOrderError}</span>}
                {videoOrderDirty && (
                  <button
                    onClick={handleSaveVideoOrder}
                    disabled={savingVideoOrder}
                    className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    {savingVideoOrder ? "Saving..." : "Save Order"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Create video form */}
          {showCreateVideo && (
            <div className="mb-6 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">New Video</h3>
              <VideoForm
                onSubmit={handleCreateVideo}
                onCancel={() => setShowCreateVideo(false)}
                mode="create"
              />
            </div>
          )}

          {/* Edit video form */}
          {editingVideo && (
            <div className="mb-6 rounded-lg border border-blue-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Edit: {editingVideo.title}</h3>
              <VideoForm
                onSubmit={handleUpdateVideo}
                onCancel={() => setEditingVideo(null)}
                mode="edit"
                initialValues={{
                  title: editingVideo.title,
                  slug: editingVideo.slug,
                  description: editingVideo.description ?? "",
                  video_url: editingVideo.video_url ?? "",
                  thumbnail_url: editingVideo.thumbnail_url ?? "",
                  tags: (editingVideo.tags ?? []).join(", "),
                  client: editingVideo.client ?? "",
                  year: editingVideo.year ?? "",
                  is_published: editingVideo.is_published,
                  sort_order: editingVideo.sort_order,
                }}
              />
            </div>
          )}

          {/* Add video button */}
          {!showCreateVideo && !editingVideo && (
            <button
              onClick={() => setShowCreateVideo(true)}
              className="mb-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              + New Video
            </button>
          )}

          {/* Video list */}
          {videos.length === 0 ? (
            <p className="text-sm text-gray-500 rounded-lg border border-gray-800 p-4">No videos yet.</p>
          ) : (
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={video.id} className="flex items-center gap-4 rounded-lg border border-gray-800 p-4">
                  <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{video.title}</h3>
                    {video.client && <p className="text-sm text-gray-400">{video.client}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveVideo(video.id, "up")}
                        disabled={index === 0}
                        className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                        title="Move up"
                      >▲</button>
                      <button
                        onClick={() => handleMoveVideo(video.id, "down")}
                        disabled={index === videos.length - 1}
                        className="text-gray-500 hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none transition-colors"
                        title="Move down"
                      >▼</button>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${video.is_published ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                      {video.is_published ? "Published" : "Draft"}
                    </span>
                    <button
                      onClick={() => { setShowCreateVideo(false); setEditingVideo(video); }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >Edit</button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
