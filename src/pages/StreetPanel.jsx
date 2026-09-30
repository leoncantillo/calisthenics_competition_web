import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Link } from "react-router-dom";

export default function StreetPanel() {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingWeight, setEditingWeight] = useState("");

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

      setParticipantes((prev) =>
        prev.map((p) =>
          p.id === inscritoId
            ? { ...p, peso_corporal: peso }
            : p
        )
      );

      setMsg("Peso actualizado correctamente");
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loader">Cargando...</div>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="street-page admin shell">
      <h1>Administración Street Lifting</h1>

      <section className="card">
        <h2>Registro de peso corporal</h2>
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
            {participantes.map((p) => {
              const editing = editingId === p.id;

              return (
                <tr key={p.id}>
                  <td data-label="Dorsal">#{p.numero_dorsal}</td>
                  <td data-label="Nombre">{p.nombre_completo}</td>
                  <td data-label="Peso (kg)">
                    {editing ? (
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
                    )}
                  </td>

                  <td className="actions" data-label="Acciones">
                    {editing ? (
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
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <br />
        <Link
          className="btn primary"
          to={"/street/registro"}
        >
          Registrar intentos
        </Link>
      </section>

      {msg && <p className="ok">{msg}</p>}
      <Link className="btn ghost" to="/">
        Volver a la página principal
      </Link>
    </div>
  );
}
