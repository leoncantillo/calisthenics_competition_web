import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, clearSession, getToken } from "../api.js";

const BLOQUES = ["Basicos", "Street Lifting", "Estaticos"];

export default function Admin() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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

  return (
    <div className="shell">
      <div className="navrow">
        <div className="brand">
          <small>Organización</small>
          <h1>Alertas de exclusión</h1>
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
      <div className="links">
        <Link to="/podio">Podio</Link>
      </div>
    </div>
  );
}
