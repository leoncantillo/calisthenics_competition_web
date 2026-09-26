import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";

export default function StreetAttempt() {
  const { inscritoId } = useParams();
  const [searchParams] = useSearchParams();
  const movActivo = searchParams.get("movimiento");

  const [inscrito, setInscrito] = useState(null);
  const [peso, setPeso] = useState("");
  const [esValido, setEsValido] = useState(true);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [pesoEditable, setPesoEditable] = useState(true);

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
      setPesoEditable(false);
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (error) return <p className="err">{error}</p>;
  if (!inscrito) return <div className="loader">Cargando participante…</div>;

  return (
    <div className="street-page attempt">
      <h1>Intento – {inscrito.nombre_completo}</h1>

      <p>Dorsal: #{inscrito.numero_dorsal}</p>
      <p>Peso corporal: {inscrito.peso_corporal ?? "-"} kg</p>

      <div className="field">
        <label>Peso a cargar (kg)</label>
        <input
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="0.00"
          disabled={!pesoEditable}
        />

        {!pesoEditable && (
          <button
            className="btn ghost"
            onClick={() => setPesoEditable(true)}
          >
            Editar intento peso
          </button>
        )}
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={esValido}
            onChange={(e) => setEsValido(e.target.checked)}
          />
          Intento válido
        </label>
      </div>

      <button
        className="btn"
        onClick={registrarIntento}
        disabled={!peso}
      >
        Registrar intento
      </button>

      {msg && <p className="err">{msg}</p>}

      <Link className="btn ghost" to="/street/registro">
        Volver al registro
      </Link>
    </div>
  );
}
