import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

export default function StreetAttempt() {
  const { inscritoId } = useParams();
  const [inscrito, setInscrito] = useState(null);
  const [movActivo, setMovActivo] = useState(null);
  const [peso, setPeso] = useState("");
  const [esValido, setEsValido] = useState(true);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [pesoEditable, setPesoEditable] = useState(true);


  // Load participant details and movement data
  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, mRes] = await Promise.all([
          api(`/api/resultados-street/participantes/${inscritoId}`),
          api("/api/resultados-street/movimiento-activo"),
        ]);
        setInscrito(pRes.inscrito);
        setMovimientos(mRes.movimientos || []);
        setMovActivo(mRes.movimiento_activo);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchData();
  }, [inscritoId]);

  const actualizarPesoCorporal = async (inscritoId, nuevoPeso) => {
    try {
      await api("/api/resultados-street/peso", {
        method: "PUT",
        body: JSON.stringify({ inscrito_id: inscritoId, peso_corporal: Number(nuevoPeso) }),
      });
      setMsg("Peso corporal actualizado");
    } catch (e) {
      setError(e.message);
    }
  };

  const registrarIntento = async () => {
    setMsg(null);
    setError(null);
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
      setError(err.message);
    }
  };

  if (error) return <p className="err">{error}</p>;
  if (!inscrito) return <div className="loader">Cargando participante…</div>;

  return (
    <div className="street-page attempt">
      <h1>Intento – {inscrito.nombre_completo}</h1>
      <p>Dorsal: #{inscrito.numero_dorsal}</p>
      <p>Peso corporal: {inscrito.resultadoStreet?.peso_corporal ?? "-"} kg
        {inscrito.resultadoStreet?.peso_corporal != null && (
          pesoEditable ? (
            <button className="btn ghost" onClick={() => setPesoEditable(true)}>
              Editar peso
            </button>
          ) : (
            <button className="btn ghost" onClick={() => actualizarPesoCorporal(inscrito.id, prompt('Nuevo peso corporal'))}>
              Cambiar peso
            </button>
          )
        )}
      </p>
      <p>Movimiento activo: {movActivo}</p>

      <div className="field">
        <label>Movimiento</label>
        <select value={movActivo} onChange={(e) => setMovActivo(e.target.value)}>
          {movimientos.map((m) => (
            <option key={m.movimiento} value={m.movimiento}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

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
          <button className="btn ghost" onClick={() => setPesoEditable(true)}>
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
      <button className="btn" onClick={registrarIntento} disabled={!peso}>
        Registrar intento
      </button>
      {msg && <p className="ok">{msg}</p>}
      <Link className="btn ghost" to="/street/registro">
        Volver al registro
      </Link>
    </div>
  );
}
