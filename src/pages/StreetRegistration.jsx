import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function StreetRegistration() {
  const [movimiento, setMovimiento] = useState("muscle_up");
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api("/api/resultados-street/participantes")
      .then((data) => setParticipantes(data.participantes || []))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Cargando participantes…</div>;
  if (msg) return <p className="err">{msg}</p>;

  return (
    <div className="street-page registration shell">
      <h1>Registro Street Lifting</h1>

      <section className="card">
        <div className="street-toolbar">
          <div className="field">
            <label htmlFor="mov-actual">Movimiento actual</label>
            <select
              id="mov-actual"
              value={movimiento}
              onChange={(e) => setMovimiento(e.target.value)}
            >
              <option value="muscle_up">Muscle Up</option>
              <option value="dominada">Dominada</option>
              <option value="fondos">Fondos</option>
            </select>
          </div>

          <Link className="btn primary" to="/street/podio">
            Ver Podio
          </Link>
        </div>
      </section>

      <section className="card">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Dorsal</th>
              <th>Nombre</th>
              <th>Peso (kg)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => (
              <tr key={p.id}>
                <td data-label="Dorsal">#{p.numero_dorsal}</td>
                <td data-label="Nombre">{p.nombre_completo}</td>
                <td data-label="Peso (kg)">{p.peso_corporal ?? "-"}</td>
                <td className="actions" data-label="Acciones">
                  <div className="row-actions">
                    <Link
                      className="btn secondary"
                      to={`/street/intento/${p.id}?movimiento=${movimiento}`}
                    >
                      Registrar intento
                    </Link>
                    <Link
                      className="btn secondary"
                      to={`/street/intentos/${p.id}`}
                    >
                      Ver intentos
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Link className="btn ghost" to="/street/panel">
        Volver al panel
      </Link>
    </div>
  );
}
