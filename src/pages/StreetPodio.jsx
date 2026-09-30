import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getToken } from "../api.js";

export default function StreetPodio() {
  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState("");
  const hasSession = Boolean(getToken());

  async function load() {
    try {
      const data = await api("/api/resultados-street/ranking");
      setRanking(data.posiciones || []);
      setMsg("");
    } catch (err) {
      setMsg(err.message);
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
        <h1>Podio · Street Lifting</h1>
      </div>

      <div className="card">
        <p className="hint">Orden: mayor puntaje total.</p>

        {msg && <p className="err">{msg}</p>}

        {ranking.length === 0 && !msg && (
          <p className="hint">Aún no hay resultados enviados.</p>
        )}

        {ranking.length > 0 && (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Puesto</th>
                <th>Dorsal</th>
                <th>Nombre</th>
                <th>Peso (kg)</th>
                <th>Muscle Up</th>
                <th>Dominada</th>
                <th>Fondos</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((p) => (
                <tr 
                  key={p.inscrito_id}
                  className={p.puesto <= 3 ? "top" : ""}
                >
                  <td data-label="Puesto">{p.puesto}</td>
                  <td data-label="Dorsal">#{p.numero_dorsal}</td>
                  <td data-label="Nombre">{p.nombre_completo}</td>
                  <td data-label="Peso (kg)">{p.peso_corporal ?? "-"}</td>
                  <td className="mov" data-label="Muscle Up">
                    {p.muscle_up?.mejor_peso ?? "-"}
                  </td>
                  <td className="mov" data-label="Dominada">
                    {p.dominada?.mejor_peso ?? "-"}
                  </td>
                  <td className="mov" data-label="Fondos">
                    {p.fondos?.mejor_peso ?? "-"}
                  </td>
                  <td data-label="Total">
                    <strong>{p.total_puntaje ?? "-"}</strong>
                  </td>
                  <td className="actions" data-label="Acciones">
                    <div className="row-actions">
                      <Link
                        className="btn secondary"
                        to={`/street/intentos/${p.inscrito_id}`}
                      >
                        Ver intentos
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="links">
        <Link to={hasSession ? "/street/panel" : "/"}>
          {hasSession ? "Volver al panel" : "Acceso jueces"}
        </Link>

        <button className="btn ghost" type="button" onClick={load}>
          Actualizar
        </button>
      </div>
    </div>
  );
}
