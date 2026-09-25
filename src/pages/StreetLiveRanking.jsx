import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Link } from "react-router-dom";

export default function StreetLiveRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/api/resultados-street/ranking")
      .then((data) => {
        setRanking(data.posiciones || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader">Cargando ranking…</div>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="street-page ranking">
      <h1>Ranking Street Lifting</h1>
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
            <tr key={p.inscrito_id}>
              <td>{p.puesto}</td>
              <td>#{p.numero_dorsal}</td>
              <td>{p.nombre_completo}</td>
              <td>{p.peso_corporal ?? "-"}</td>
              <td>{p.muscle_up ?? "-"}</td>
              <td>{p.dominada ?? "-"}</td>
              <td>{p.fondos ?? "-"}</td>
              <td>{p.total_puntaje ?? "-"}</td>
              <td>
                <Link className="btn secondary" to={`/street/intento/${p.inscrito_id}`}>
                  Ver intentos
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
