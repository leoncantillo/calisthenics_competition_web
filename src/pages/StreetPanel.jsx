import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Link, Navigate, useParams } from "react-router-dom";
import ParticipantsTable from "../components/blocks/streetlifting/ParticipantsTable.jsx";
import StreetRegistration from "../components/blocks/streetlifting/StreetRegistration.jsx";

export default function StreetPanel() {
  const { vista = "registro_peso" } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [movimiento, setMovimiento] = useState("muscle_up");

  // Load participants and movement state
  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, mRes] = await Promise.all([
          api("/api/resultados-street/participantes"),
        ]);
        setParticipantes(pRes.participantes || []);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const actualizarPesoLocal = (id, nuevoPeso) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, peso_corporal: nuevoPeso } : p))
    );
  };

  if (loading) return <div className="loader">Cargando Participantes...</div>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="street-page admin shell">
      <h1>1RM * Street Lifting</h1>

      <div className="toolbar">
        {vista === "registro_peso" && (
          <Link className="btn" to="/street/panel/registro_intentos">
            Registrar Intentos
          </Link>
        )}
        {vista === "registro_intentos" && (
          <Link className="btn" to="/street/panel/registro_peso">
            Registrar Peso Corporal
          </Link>
        )}
        <Link className="btn secondary" to="/street/podio">
          Ver Podio
        </Link>
        {vista === "registro_intentos" && (
          <div className="field" style={{ display: "block" }}>
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
        )}
      </div>

      <section className="card">
        {(vista === "registro_peso" || vista === "registro_intentos") && (
          <StreetRegistration
            participantes={participantes}
            movimiento={movimiento}
            vista={vista}
            onPesoActualizado={actualizarPesoLocal}
          />
        )}
      </section>

      {msg && <p className="ok">{msg}</p>}
      <Link className="btn ghost" to="/">
        Volver a la página principal
      </Link>
    </div>
  );
}
