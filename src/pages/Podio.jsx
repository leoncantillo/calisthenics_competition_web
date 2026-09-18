import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatTiempo } from "../api.js";

export default function Podio() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api("/api/resultados-basicos/posiciones");
      setRows(data.posiciones || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="shell">
      <div className="brand">
        <small>Distrito 58 · Unimagdalena</small>
        <h1>Podio · Bloque de Básicos</h1>
      </div>
      <div className="card">
        <p className="hint">Orden: mayor marca_circuito · empate: menor tiempo.</p>
        {error && <p className="err">{error}</p>}
        {rows.length === 0 && <p className="hint">Aún no hay resultados enviados.</p>}
        {rows.map((r) => (
          <div key={r.inscrito_id} className={`podio-row ${r.puesto <= 3 ? "top" : ""}`}>
            <span className="puesto">{r.puesto}</span>
            <span className="dorsal">#{r.numero_dorsal}</span>
            <span>{r.nombre_completo}</span>
            <strong>{r.marca_circuito_fmt}</strong>
            <span className="hint">{formatTiempo(r.tiempo_segundos)}</span>
          </div>
        ))}
      </div>
      <div className="links">
        <Link to="/">Acceso jueces</Link>
        <button className="btn ghost" type="button" onClick={load}>
          Actualizar
        </button>
      </div>
    </div>
  );
}
