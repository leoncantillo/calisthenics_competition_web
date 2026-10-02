import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import "../styles/StreetAttempt.css";

const MAX_INTENTOS = 3;

const MOV_LABEL = {
  muscle_up: "Muscle Up",
  dominada: "Dominada",
  fondos: "Fondos",
};

/**
 * Deriva por cuál intento va el participante en un movimiento.
 * El backend ya asigna el número solo (intentos.length + 1) y solo avisa cuando
 * los tres están usados, así que acá se calcula lo mismo para mostrarlo antes.
 */
export function resumenIntentos(inscrito, movimientoKey) {
  // El backend guarda los movimientos en mayúsculas, pero la URL los pasa en minúsculas.
  const mov = inscrito?.movimientos?.[movimientoKey.toUpperCase()] || null;
  const intentos = [...(mov?.intentos ?? [])].sort(
    (a, b) => a.numero_intento - b.numero_intento
  );
  const ultimo = intentos.length > 0 ? intentos[intentos.length - 1] : null;

  return {
    intentos,
    usados: intentos.length,
    proximo: intentos.length + 1,
    completado: Boolean(mov?.completado) || intentos.length >= MAX_INTENTOS,
    // El backend rechaza cargar menos que el intento anterior.
    pesoMinimo: ultimo ? Number(ultimo.peso) : null,
  };
}

export default function StreetAttempt() {
  const { inscritoId } = useParams();
  const [searchParams] = useSearchParams();
  const movKey = String(searchParams.get("movimiento") || "")

  const [inscrito, setInscrito] = useState(null);
  const [peso, setPeso] = useState("");
  const [esValido, setEsValido] = useState(true);
  const [ok, setOk] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    const data = await api(`/api/resultados-street/participantes/${inscritoId}`);
    setInscrito(data.inscrito);
    // El siguiente intento no puede pesar menos que el anterior: se precarga.
    const { pesoMinimo } = resumenIntentos(data.inscrito, movKey);
    setPeso(pesoMinimo !== null ? String(pesoMinimo) : "");
  }, [inscritoId, movKey]);

  useEffect(() => {
    cargar().catch((e) => setError(e.message));
  }, [cargar]);

  const registrarIntento = async () => {
    setOk(null);
    setError(null);
    setGuardando(true);

    try {
      const resp = await api("/api/resultados-street/intento", {
        method: "POST",
        body: JSON.stringify({
          inscrito_id: Number(inscritoId),
          movimiento: movKey,
          peso: Number(peso),
          es_valido: esValido,
        }),
      });

      setOk(
        `Intento ${resp.intento.numero_intento} registrado: ${resp.intento.peso} kg · ` +
          `${resp.intento.es_valido ? "VÁLIDO" : "NULO"}`
      );
      // Sin recargar, el contador se quedaría clavado en el intento anterior.
      await cargar();
      setEsValido(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (error && !inscrito) return <p className="err">{error}</p>;
  if (!inscrito) return <div className="loader">Cargando participante…</div>;

  if (!MOV_LABEL[movKey]) {
    return (
      <div className="street-page attempt shell">
        <p className="err">No se indicó qué movimiento se está juzgando.</p>
        <Link className="btn secondary" to="/street/registro">
          Volver al registro
        </Link>
      </div>
    );
  }

  // El backend exige el pesaje antes de cualquier intento.
  if (!inscrito.peso_corporal) {
    return (
      <div className="street-page attempt shell">
        <p className="err">Debe registrar el peso corporal antes de registrar intentos.</p>
        <Link className="btn secondary" to="/street/panel">
          Ir al panel de peso
        </Link>
      </div>
    );
  }

  const { intentos, proximo, completado, pesoMinimo } = resumenIntentos(inscrito, movKey);

  return (
    <div className="street-page attempt shell">
      <h1>{inscrito.nombre_completo}</h1>

      <p className="attempt-meta">
        <span>Dorsal #{inscrito.numero_dorsal}</span>
        <span>Peso corporal: {inscrito.peso_corporal} kg</span>
      </p>

      <div className="card attempt-form">
        <div className="attempt-head">
          <span className="attempt-mov">{MOV_LABEL[movKey]}</span>

          {completado ? (
            <p className="attempt-n done">
              Los {MAX_INTENTOS} intentos ya están registrados
            </p>
          ) : (
            <p className="attempt-n">
              Intento {proximo} de {MAX_INTENTOS}
            </p>
          )}

          {intentos.length > 0 && (
            <div className="attempt-chips">
              {intentos.map((i) => (
                <span
                  key={i.id}
                  className={`attempt-chip ${i.es_valido ? "valid" : "invalid"}`}
                >
                  <span className="n">{i.numero_intento}</span>
                  <span>{i.peso} kg</span>
                  <span className="estado">{i.es_valido ? "VÁLIDO" : "NULO"}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="peso-intento">Peso a cargar (kg)</label>
          <input
            id="peso-intento"
            type="number"
            inputMode="decimal"
            min={pesoMinimo ?? 0}
            step="0.01"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="0.00"
            disabled={completado}
          />
          {pesoMinimo !== null && !completado && (
            <span className="hint">
              Mínimo {pesoMinimo} kg: no puede ser menor al intento anterior.
            </span>
          )}
        </div>

        <div className="field">
          <label>Resultado del intento</label>

          <div className="attempt-status">
            <button
              type="button"
              className={`attempt-status-btn ${esValido ? "selected valid" : ""}`}
              onClick={() => setEsValido(true)}
              disabled={completado}
            >
              VÁLIDO
            </button>

            <button
              type="button"
              className={`attempt-status-btn ${!esValido ? "selected invalid" : ""}`}
              onClick={() => setEsValido(false)}
              disabled={completado}
            >
              NULO
            </button>
          </div>
        </div>

        <button
          className="btn btn-register"
          onClick={registrarIntento}
          disabled={completado || guardando || peso === ""}
        >
          {guardando
            ? "Registrando…"
            : completado
              ? "Sin intentos disponibles"
              : `Registrar intento ${proximo}`}
        </button>
      </div>

      {ok && <p className="ok">{ok}</p>}
      {error && <p className="err">{error}</p>}

      <div className="links">
        <Link to="/street/panel/registro_intentos">Volver al registro</Link>
        <Link to={`/street/intentos/${inscritoId}`}>Ver todos los intentos</Link>
      </div>
    </div>
  );
}
