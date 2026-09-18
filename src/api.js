const API = import.meta.env.VITE_API_URL || "";

export function getToken() {
  return localStorage.getItem("d58_token") || "";
}

export function setSession(data) {
  localStorage.setItem("d58_token", data.token);
  localStorage.setItem("d58_rol", data.rol);
  localStorage.setItem("d58_nombre", data.nombre || "");
}

export function clearSession() {
  localStorage.removeItem("d58_token");
  localStorage.removeItem("d58_rol");
  localStorage.removeItem("d58_nombre");
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Error de red");
  }
  return json;
}

export const CAPS = { Dominadas: 5, Fondos: 10, Flexiones: 15 };

export function calcularMarca(series, ejercicio, reps) {
  let acum = 0;
  if (ejercicio === "Dominadas") acum = Math.min(reps, CAPS.Dominadas);
  else if (ejercicio === "Fondos") acum = 5 + Math.min(reps, CAPS.Fondos);
  else if (ejercicio === "Flexiones") acum = 15 + Math.min(reps, CAPS.Flexiones);
  return (Number(series || 0) + acum / 100).toFixed(2);
}

export function formatTiempo(seg) {
  const s = Math.max(0, Math.min(150, Number(seg) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
