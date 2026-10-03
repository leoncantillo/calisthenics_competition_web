import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../../../api.js";
import "../../../styles/StreetAttempt.css";

export default function StreetAttempt({ movimientoActual, movLabel, inscrito, resumenIntentos, maxIntentos, onRegistro, cargarParticipantes }) {
  const [peso, setPeso] = useState("");
  const [esValido, setEsValido] = useState(true);
  const [ok, setOk] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const { intentos, proximo, completado, pesoMinimo } = resumenIntentos;

  const registrarIntento = async () => {
    setOk(null);
    setError(null);
    setGuardando(true);

    try {
      const resp = await api("/api/resultados-street/intento", {
        method: "POST",
        body: JSON.stringify({
          inscrito_id: Number(inscrito.id),
          movimiento: movimientoActual.toUpperCase(),
          peso: Number(peso),
          es_valido: esValido,
        }),
      });

      setOk(
        `Intento ${resp.intento.numero_intento} registrado: ${resp.intento.peso} kg · ` +
        `${resp.intento.es_valido ? "VÁLIDO" : "NULO"}`
      );
      // Sin recargar, el contador se quedaría clavado en el intento anterior.
      await cargarParticipantes();
      setEsValido(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };


  return (
    <>
      <h1>{inscrito.nombre_completo}</h1>

      <p className="attempt-meta">
        <span>Dorsal #{inscrito.numero_dorsal}</span>
        <span>Peso corporal: {inscrito.peso_corporal} kg</span>
      </p>

      <div className="card attempt-form">
        <div className="attempt-head">
          <span className="attempt-mov">{movLabel.nombre}</span>

          {completado ? (
            <p className="attempt-n done">
              Los {maxIntentos} intentos ya están registrados
            </p>
          ) : (
            <p className="attempt-n">
              Intento {proximo} de {maxIntentos}
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
        <Link to={`/street/intentos/${inscrito.id}?modo=historial`}>Ver todos los intentos</Link>
      </div>
    </>
  );
}
