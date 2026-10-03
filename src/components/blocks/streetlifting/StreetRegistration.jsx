import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api.js";
import ParticipantsTable from "./ParticipantsTable.jsx";

export default function StreetRegistration({ participantes, movimiento, vista, onPesoActualizado }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingWeight, setEditingWeight] = useState("");

  const actualizarPeso = async (inscritoId, nuevoPeso) => {
    try {
      const peso = Number(nuevoPeso);

      await api("/api/resultados-street/peso", {
        method: "PUT",
        body: JSON.stringify({
          inscrito_id: inscritoId,
          peso_corporal: peso,
        }),
      });

      onPesoActualizado(inscritoId, peso);

      setMsg("Peso actualizado correctamente");
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <p className="err">{error}</p>;

  return (
    <>
      {vista === "registro_peso" && (
        <>
          <h2>Registro de peso corporal</h2>

          {msg && <p className="ok">{msg}</p>}

          <ParticipantsTable
            participantes={participantes}
            renderPeso={(p) => {
              return editingId === p.id ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={editingWeight}
                  min="0"
                  step="0.01"
                  aria-label={`Peso corporal de ${p.nombre_completo}`}
                  onChange={(e) => setEditingWeight(e.target.value)}
                />
              ) : (
                p.peso_corporal ?? "-"
              )
            }}
            renderAcciones={(p) => {
              return editingId === p.id ? (
                <form
                  className="row-actions"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (
                      editingWeight !== "" &&
                      Number(editingWeight) !== p.peso_corporal
                    ) {
                      await actualizarPeso(p.id, editingWeight);
                    }

                    setEditingId(null);
                  }}
                >
                  <button className="btn" type="submit">
                    Guardar
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditingWeight(p.peso_corporal ?? "");
                    }}
                  >
                    Editar
                  </button>
                </div>
              )
            }}
          />
        </>
      )}

      {vista === "registro_intentos" && (
        <>
          <h2>Registro de intentos</h2>

          <ParticipantsTable
            participantes={participantes}
            renderPeso={(p) => <span>{p.peso_corporal || "No registrado"}</span>}
            renderAcciones={(p) => (
              <div className="row-actions">
                <Link
                  className="btn secondary"
                  to={`/street/intentos/${p.id}`}
                >
                  Registrar intento
                </Link>
                <Link
                  className="btn secondary"
                  to={`/street/intentos/${p.id}?modo=historial`}
                >
                  Ver intentos
                </Link>
              </div>
            )}
          />
        </>
      )}
    </>
  );
}
