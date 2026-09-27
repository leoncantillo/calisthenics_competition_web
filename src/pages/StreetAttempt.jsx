import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import "../styles/StreetAttempt.css";

export default function StreetAttempt() {
  const { inscritoId } = useParams();
  const [searchParams] = useSearchParams();
  const movActivo = searchParams.get("movimiento");

  const [inscrito, setInscrito] = useState(null);
  const [peso, setPeso] = useState("");
  const [esValido, setEsValido] = useState(true);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/api/resultados-street/participantes/${inscritoId}`)
      .then((data) => setInscrito(data.inscrito))
      .catch((e) => setError(e.message));
  }, [inscritoId]);

  const registrarIntento = async () => {
    setMsg(null);

    try {
      const resp = await api("/api/resultados-street/intento", {
        method: "POST",
        body: JSON.stringify({
          inscrito_id: Number(inscritoId),
          movimiento: movActivo,
          peso: Number(peso),
          es_valido: esValido,
        }),
      });

      setMsg(`Intento registrado (peso ${resp.intento.peso} kg)`);
      setPeso("");
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (error) return <p className="err">{error}</p>;
  if (!inscrito) return <div className="loader">Cargando participante…</div>;
  // Prevent attempts if body weight not registered
  if (!inscrito.peso_corporal) {
    return (
      <p className="err">
        Debe registrar el peso corporal antes de registrar intentos.
        <br />
        <Link className="btn secondary" to="/street/panel">Ir al panel de peso</Link>
      </p>
    );
  }

  return (
    <div className="street-page attempt shell">
      <h1>Intento – {inscrito.nombre_completo}</h1>

      <div className="card attempt-form">
        <p>Dorsal: #{inscrito.numero_dorsal}</p>
        <p>Peso corporal: {inscrito.peso_corporal ?? "-"} kg</p>

        <div
          className="field"
          style={{ marginBottom: "1rem" }}
        >
          <label>Peso a cargar (kg)</label>
          <input
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="0.00"
            style={{ marginLeft: "1rem" }}
          />
        </div>

        <div className="field">
          <label>Resultado del intento</label>

          <div className="attempt-status">
            <button
              type="button"
              className={`attempt-status-btn ${esValido ? "selected valid" : ""}`}
              onClick={() => setEsValido(true)}
            >
              VÁLIDO
            </button>

            <button
              type="button"
              className={`attempt-status-btn ${!esValido ? "selected invalid" : ""}`}
              onClick={() => setEsValido(false)}
            >
              NULO
            </button>
          </div>
        </div>

        <button
          className="btn btn-register"
          onClick={registrarIntento}
          disabled={!peso}
        >
          Registrar intento
        </button>
      </div>

      {msg && <p className="err">{msg}</p>}

      <Link className="btn ghost" to="/street/registro">
        Volver al registro
      </Link>
    </div>
  );
}
