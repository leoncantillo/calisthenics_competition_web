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
  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error("Error de conexión con el servidor. Verifica tu red.");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      json.error || `Error ${res.status}: ${res.statusText || "Respuesta no válida del servidor"}`
    );
  }
  return json;
}

export const CAPS = { Dominadas: 5, Fondos: 10, Flexiones: 15 };
const REPS_SERIE = 30;
const MAX_PARCIAL = 29;

export function formatearMarca(valor) {
  const n = Number(valor);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

function parseMarca(raw) {
  const asNumber = Number(raw);
  if (!Number.isFinite(asNumber) || asNumber < 0) {
    return { marca: "0.00", series: 0, parcial: 0 };
  }
  const fmt = asNumber.toFixed(2);
  const [enteroStr, decimalStr] = fmt.split(".");
  const parcial = Number(decimalStr);
  if (parcial > MAX_PARCIAL) {
    return { marca: `${Number(enteroStr) + 1}.00`, series: Number(enteroStr) + 1, parcial: 0 };
  }
  return { marca: `${Number(enteroStr)}.${decimalStr}`, series: Number(enteroStr), parcial };
}

function componerMarca(series, parcial) {
  let s = Number(series) || 0;
  let p = Number(parcial) || 0;
  while (p >= REPS_SERIE) {
    s += 1;
    p -= REPS_SERIE;
  }
  while (p < 0) {
    if (s <= 0) {
      p = 0;
      break;
    }
    s -= 1;
    p += REPS_SERIE;
  }
  s = Math.max(0, Math.min(999, s));
  p = Math.max(0, Math.min(MAX_PARCIAL, p));
  return `${s}.${String(p).padStart(2, "0")}`;
}

export function desgloseMarca(marca) {
  const { series, parcial } = parseMarca(marca);
  return {
    series,
    parcial,
    dominadas: Math.min(parcial, CAPS.Dominadas),
    fondos: parcial < CAPS.Dominadas ? 0 : Math.min(parcial - CAPS.Dominadas, CAPS.Fondos),
    flexiones:
      parcial < CAPS.Dominadas + CAPS.Fondos
        ? 0
        : Math.min(parcial - CAPS.Dominadas - CAPS.Fondos, CAPS.Flexiones - 1),
  };
}

export function setControlMarca(marca, campo, valor) {
  const cur = desgloseMarca(marca);
  const v = Math.max(0, parseInt(valor, 10) || 0);
  if (campo === "series") return componerMarca(Math.min(999, v), cur.parcial);
  if (campo === "dominadas") return componerMarca(cur.series, Math.min(CAPS.Dominadas, v));
  if (campo === "fondos") return componerMarca(cur.series, CAPS.Dominadas + Math.min(CAPS.Fondos, v));
  if (campo === "flexiones") {
    if (v >= CAPS.Flexiones) return componerMarca(cur.series + 1, 0);
    return componerMarca(cur.series, CAPS.Dominadas + CAPS.Fondos + Math.min(14, v));
  }
  return formatearMarca(marca);
}

export function bumpControlMarca(marca, campo, delta) {
  const cur = desgloseMarca(marca);
  if (campo === "series") return setControlMarca(marca, "series", cur.series + delta);
  if (campo === "dominadas") {
    if (delta > 0 && cur.parcial >= CAPS.Dominadas) {
      return setControlMarca(marca, "fondos", cur.fondos + 1);
    }
    return setControlMarca(marca, "dominadas", cur.dominadas + delta);
  }
  if (campo === "fondos") {
    if (delta < 0 && cur.fondos === 0) {
      return setControlMarca(marca, "dominadas", Math.max(0, cur.dominadas - 1));
    }
    if (delta > 0 && cur.fondos >= CAPS.Fondos) {
      return setControlMarca(marca, "flexiones", cur.flexiones + 1);
    }
    return setControlMarca(marca, "fondos", cur.fondos + delta);
  }
  if (campo === "flexiones") {
    if (delta < 0 && cur.flexiones === 0) {
      return setControlMarca(marca, "fondos", Math.max(0, cur.fondos - 1));
    }
    return setControlMarca(marca, "flexiones", cur.flexiones + delta);
  }
  return formatearMarca(marca);
}

export function formatTiempo(seg) {
  const s = Math.max(0, Math.min(150, Number(seg) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
