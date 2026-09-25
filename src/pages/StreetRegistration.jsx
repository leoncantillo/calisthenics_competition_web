import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Link } from "react-router-dom";

export default function StreetRegistration() {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/api/resultados-street/participantes")
      .then((data) => {
        setParticipantes(data.participantes || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader">Cargando participantes…</div>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="street-page registration">
      <h1>Registro Street Lifting</h1>
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
                <td>#{p.numero_dorsal}</td>
                <td>{p.nombre_completo}</td>
                <td>{p.peso_corporal ?? "-"}</td>
                <td>
                  <Link className="btn secondary" to={`/street/intento/${p.id}`}>
                    Registrar intento
                  </Link>
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
