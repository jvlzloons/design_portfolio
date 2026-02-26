import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { fetchAuthAPI } from "../lib/api";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await fetchAuthAPI("/admin/projects", token);
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
          </div>
          {projects.length === 0 ? (
            <p className="text-gray-400">No projects yet. Create your first one!</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center rounded-lg border border-gray-800 p-4"
                >
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-gray-400">{project.category}</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}