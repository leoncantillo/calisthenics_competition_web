import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, clearSession, getToken } from "../api.js";

const BLOQUES = ["Basicos", "Street Lifting", "Estaticos"];

export default function Admin() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // CSV Sync states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    if (!getToken() || localStorage.getItem("d58_rol") !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  async function load() {
    try {
      const data = await api("/api/admin/alertas");
      setRows(data.inscritos || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function asignar(id, bloque) {
    setOk("");
    try {
      await api(`/api/admin/inscritos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ bloque_asignado: bloque, limpiar_alerta: true }),
      });
      setOk("Bloque actualizado");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCsvUpload(e) {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un archivo CSV");
      return;
    }

    setUploading(true);
    setError("");
    setOk("");
    setSyncResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api("/api/sync/inscripciones", {
        method: "POST",
        body: formData,
      });

      setSyncResult(res);
      setOk(`Sincronización completada: ${res.creados} nuevos creados, ${res.actualizados} actualizados.`);
      load(); // Recargar alertas por si aparecieron nuevos conflictos
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="shell">
      <div className="navrow">
        <div className="brand">
          <small>Organización</small>
          <h1>Panel de Administración</h1>
        </div>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            clearSession();
            navigate("/");
          }}
        >
          Salir
        </button>
      </div>

      {/* Sección Carga CSV */}
      <section className="card" style={{ marginBottom: 20 }}>
        <h3>Sincronizar Inscripciones (CSV)</h3>
        <p className="hint">
          Sube el archivo CSV con las respuestas del formulario. El sistema creará los nuevos
          inscritos o actualizará los existentes manteniendo su número de dorsal.
        </p>

        <form onSubmit={handleCsvUpload} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0] || null)}
            style={{ padding: "8px", background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: "8px" }}
          />
          <button className="btn" type="submit" disabled={uploading || !file}>
            {uploading ? "Procesando CSV..." : "Subir y Sincronizar CSV"}
          </button>
        </form>

        {syncResult && (
          <div style={{ marginTop: 16, padding: 12, background: "var(--bg-elev)", borderRadius: 10, border: "1px solid var(--line)" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Resultado de la sincronización</h4>
            <p className="hint" style={{ margin: "2px 0" }}>✅ Creados: <strong>{syncResult.creados}</strong></p>
            <p className="hint" style={{ margin: "2px 0" }}>🔄 Actualizados: <strong>{syncResult.actualizados}</strong></p>

            {syncResult.errores && syncResult.errores.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <h5 style={{ color: "var(--danger)", margin: "4px 0" }}>Advertencias / Errores ({syncResult.errores.length}):</h5>
                <ul style={{ paddingLeft: 20, margin: "4px 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  {syncResult.errores.map((err, idx) => (
                    <li key={idx}>
                      <strong>Fila {err.fila} ({err.nombre}):</strong> {err.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección Alertas de Exclusión */}
      <section>
        <h2>Alertas de exclusión</h2>
        <p className="hint">
          Quienes marcaron Básicos junto a Street Lifting o Estáticos quedan en Pendiente hasta que
          definas el bloque definitivo.
        </p>

        {error && <p className="err">{error}</p>}
        {ok && <p className="ok">{ok}</p>}
        {rows.length === 0 && <p className="hint">No hay alertas abiertas.</p>}

        {rows.map((r) => (
          <article className="card alert-item" key={r.id}>
            <strong>
              #{r.numero_dorsal} · {r.nombre_completo}
            </strong>
            <p>Solicitó: {r.bloque_solicitado}</p>
            <p>Asignado ahora: {r.bloque_asignado}</p>
            <div className="toolbar">
              {BLOQUES.map((b) => (
                <button key={b} className="btn secondary" type="button" style={{ width: "auto" }} onClick={() => asignar(r.id, b)}>
                  {b}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <div className="links">
        <Link to="/podio">Ver Podio Público</Link>
      </div>
    </div>
  );
}
