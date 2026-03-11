const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

// Fire immediately at module load (before React mounts) to eliminate cold-start delay
let _projectsPromise: Promise<unknown> | null = null;
export function getProjectsPromise(): Promise<unknown> {
  if (!_projectsPromise) {
    _projectsPromise = fetch(`${API_URL}/projects`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => { _projectsPromise = null; return null; });
  }
  return _projectsPromise;
}
// Kick it off immediately
getProjectsPromise();

// Transform a Cloudinary URL to serve auto-format, auto-quality, width-capped images.
// Cuts thumbnail file sizes by 70-90% with no visible quality loss for grid use.
export function cloudinaryOpt(url: string | null | undefined, width = 800): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function fetchAuthAPI(
  endpoint: string,
  token: string,
  options?: RequestInit
) {
  return fetchAPI(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}