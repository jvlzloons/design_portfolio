import { useEffect, useState } from "react";
import { fetchAPI } from "../lib/api";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  is_featured: boolean;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/projects")
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="p-8">
        <h1 className="text-5xl font-bold tracking-tight">Portfolio</h1>
        <p className="mt-2 text-gray-400">Graphic Design Work</p>
      </header>
      <main className="p-8">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <a 
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block rounded-lg border border-gray-800 p-6 hover:border-gray-600 transition-colors"
              >
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <p className="mt-1 text-sm text-gray-400">{project.category}</p>
                {project.description && (
                  <p className="mt-2 text-gray-300">{project.description}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}