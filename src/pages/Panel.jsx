import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  bumpControlMarca,
  clearSession,
  desgloseMarca,
  formatearMarca,
  formatTiempo,
  getToken,
  setControlMarca,
} from "../api.js";

const MAX = 150;

function emptyLane() {
  return {
    inscrito: null,
    query: "",
    marca: "0.00",
    running: false,
    elapsed: 0,
    saved: "",
    error: "",
  };
}

export default function Panel() {
  const navigate = useNavigate();
  const [lanesN, setLanesN] = useState(1);
  const [atletas, setAtletas] = useState([]);
  const [lanes, setLanes] = useState([emptyLane()]);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!getToken() || localStorage.getItem("d58_rol") !== "juez") {
      navigate("/");
      return;
    }
    api("/api/inscritos/basicos")
      .then((d) => setAtletas(d.inscritos || []))
      .catch(() => setAtletas([]));
  }, [navigate]);

  useEffect(() => {
    setLanes((prev) => {
      const next = [...prev];
      while (next.length < lanesN) next.push(emptyLane());
      return next.slice(0, lanesN);
    });
  }, [lanesN]);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setLanes((prev) =>
        prev.map((l) => {
          if (!l.running) return l;
          const elapsed = Math.min(MAX, l.elapsed + 1);
          return { ...l, elapsed, running: elapsed < MAX };
        })
      );
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  function patch(i, partial) {
    setLanes((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...partial } : l)));
  }

  function startAll() {
    setLanes((prev) =>
      prev.map((l) => (l.elapsed >= MAX ? l : { ...l, running: true }))
    );
  }

  async function guardar(i) {
    const l = lanes[i];
    if (!l.inscrito) {
      patch(i, { error: "Selecciona un atleta" });
      return;
    }
    patch(i, { error: "", saved: "" });
    try {
      const data = await api("/api/resultados-basicos", {
        method: "PUT",
        body: JSON.stringify({
          inscrito_id: l.inscrito.id,
          marca_circuito: l.marca,
          tiempo_segundos: l.elapsed,
        }),
      });
      patch(i, {
        saved: `Enviado · marca ${data.resultado.marca_circuito_fmt}`,
        running: false,
      });
    } catch (err) {
      patch(i, { error: err.message });
    }
  }

  return (
    <div className="shell">
      <div className="navrow">
        <div>
          <div className="brand">
            <small>Panel en vivo · {localStorage.getItem("d58_nombre")}</small>
            <h1>Circuito 2:30 · Básicos</h1>
          </div>
        </div>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            clearSession();
            navigate("/");
          }}
        >
          Salir
        </button>
      </div>

      <div className="toolbar">
        <label>
          Carriles{" "}
          <select value={lanesN} onChange={(e) => setLanesN(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" type="button" style={{ width: "auto" }} onClick={startAll}>
          Iniciar todos
        </button>
        <Link className="btn secondary" style={{ width: "auto" }} to="/podio">
          Podio
        </Link>
      </div>

      <p className="hint">
        Serie válida: 5 dominadas + 10 fondos + 15 flexiones. Si falla una serie, reinicia las reps
        (la parte decimal vuelve a 0). 3.29 + 1 flexión = 4.00. Pausar un carril no detiene el de al
        lado.
      </p>

      <div className={`lanes n-${lanesN}`}>
        {lanes.map((lane, i) => (
          <Lane
            key={i}
            index={i}
            lane={lane}
            atletas={atletas}
            onPatch={patch}
            onSave={guardar}
          />
        ))}
      </div>
    </div>
  );
}

function Stepper({ label, value, onBump, onType }) {
  return (
    <div className="counter">
      <span>{label}</span>
      <div className="stepper">
        <button type="button" onClick={() => onBump(-1)}>
          −
        </button>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onType(e.target.value)}
        />
        <button type="button" onClick={() => onBump(1)}>
          +
        </button>
      </div>
    </div>
  );
}

function Lane({ index, lane, atletas, onPatch, onSave }) {
  const filtrados = useMemo(() => {
    const q = lane.query.trim().toLowerCase();
    if (!q) return atletas;
    return atletas.filter(
      (a) =>
        a.numero_dorsal.includes(q) ||
        a.nombre_completo.toLowerCase().includes(q)
    );
  }, [atletas, lane.query]);

  const d = desgloseMarca(lane.marca);

  function setMarca(next) {
    onPatch(index, { marca: next });
  }

  return (
    <section className="card">
      <h3>
        Carril {index + 1}
        <span className="dorsal">
          {lane.inscrito ? `#${lane.inscrito.numero_dorsal}` : "sin atleta"}
        </span>
      </h3>
      <input
        placeholder="Buscar dorsal o nombre"
        value={lane.query}
        onChange={(e) => onPatch(index, { query: e.target.value })}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <select
        style={{ width: "100%", marginBottom: 8 }}
        value={lane.inscrito?.id || ""}
        onChange={(e) => {
          const found = atletas.find((a) => String(a.id) === e.target.value) || null;
          onPatch(index, {
            inscrito: found,
            marca: formatearMarca(found?.resultado?.marca_circuito ?? 0),
            elapsed: found?.resultado?.tiempo_segundos || 0,
            saved: "",
          });
        }}
      >
        <option value="">Seleccionar atleta…</option>
        {filtrados.map((a) => (
          <option key={a.id} value={a.id}>
            #{a.numero_dorsal} · {a.nombre_completo}
          </option>
        ))}
      </select>

      <div className={`clock ${lane.elapsed >= 140 ? "warn" : ""}`}>
        {formatTiempo(lane.elapsed)}
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}> / 2:30</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button
          className="btn secondary"
          type="button"
          onClick={() => onPatch(index, { running: !lane.running && lane.elapsed < MAX })}
        >
          {lane.running ? "Pausar / Frenar" : "Reanudar"}
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => onPatch(index, { running: false, elapsed: 0 })}
        >
          Reset tiempo
        </button>
      </div>

      <div className="counters">
        <Stepper
          label="Series completas"
          value={d.series}
          onBump={(delta) => setMarca(bumpControlMarca(lane.marca, "series", delta))}
          onType={(v) => setMarca(setControlMarca(lane.marca, "series", v))}
        />
        <Stepper
          label="Dominadas (5)"
          value={d.dominadas}
          onBump={(delta) => setMarca(bumpControlMarca(lane.marca, "dominadas", delta))}
          onType={(v) => setMarca(setControlMarca(lane.marca, "dominadas", v))}
        />
        <Stepper
          label="Fondos (10)"
          value={d.fondos}
          onBump={(delta) => setMarca(bumpControlMarca(lane.marca, "fondos", delta))}
          onType={(v) => setMarca(setControlMarca(lane.marca, "fondos", v))}
        />
        <Stepper
          label="Flexiones (15 → serie)"
          value={d.flexiones}
          onBump={(delta) => setMarca(bumpControlMarca(lane.marca, "flexiones", delta))}
          onType={(v) => setMarca(setControlMarca(lane.marca, "flexiones", v))}
        />
      </div>

      <div className="marca">{lane.marca}</div>
      <p className="hint" style={{ textAlign: "center" }}>
        marca_circuito (única marca guardada)
      </p>
      <button className="btn" type="button" onClick={() => onSave(index)}>
        Guardar y enviar resultado
      </button>
      {lane.error && <p className="err">{lane.error}</p>}
      {lane.saved && <p className="ok">{lane.saved}</p>}
    </section>
  );
}
