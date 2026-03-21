export function getApiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL as string) || `${window.location.protocol}//${window.location.hostname}:3000`
  return `${base.replace(/\/$/, "")}${path}`
}

export function getAuthHeaders() {
  const token = localStorage.getItem("azis_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}
