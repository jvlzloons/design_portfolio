import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { fetchAPI, fetchAuthAPI } from "../lib/api";
import ProjectForm from "../components/ProjectForm";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
    setLoading(true);
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const token = await getToken();
    if (!token) return;
    await fetchAuthAPI(`/admin/projects/${id}`, token, {
      method: "DELETE",
    });
    setLoading(true);
    await loadData();
  }

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

        {/* Create form or button */}
        {showForm ? (
          <div className="mb-8 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">New Project</h2>
            <ProjectForm
              categories={categories}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            + New Project
          </button>
        )}

        {/* Project list */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">
              Projects ({projects.length})
            </h2>
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects yet. Create your first one!</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center rounded-lg border border-gray-800 p-4"
                >
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-gray-400">{project.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
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