import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Link } from "react-router-dom";

export default function StreetPanel() {
  const [participantes, setParticipantes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [activo, setActivo] = useState("");
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
          api("/api/resultados-street/movimiento-activo"),
        ]);
        setParticipantes(pRes.participantes || []);
        setMovimientos(mRes.movimientos || []);
        setActivo(mRes.movimiento_activo);
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

  const cambiarActivo = async (mov) => {
    try {
      const resp = await api("/api/resultados-street/movimiento-activo", {
        method: "PATCH",
        body: JSON.stringify({ movimiento: mov }),
      });
      setActivo(resp.movimiento_activo || mov);
      setMsg("Movimiento activo actualizado");
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loader">Cargando...</div>;
  if (error) return <p className="err">{error}</p>;

  const esto = () => (
    <input
      type="number"
      defaultValue={p.peso_corporal ?? ""}
      min="0"
      step="0.01"
      onBlur={(e) => {
        const val = e.target.value;
        if (val && Number(val) !== p.peso_corporal) {
          actualizarPeso(p.id, val);
        }
      }}
    />
  );

  return (
    <div className="street-page admin">
      <h1>Administración Street Lifting</h1>

      <section className="card">
        <h2>Movimiento activo</h2>
        <select
          value={activo}
          onChange={(e) => cambiarActivo(e.target.value)}
        >
          {movimientos.map((m) => (
            <option key={m.movimiento} value={m.movimiento}>
              {m.nombre}
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2>Participantes</h2>
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
                  <td>#{p.numero_dorsal}</td>
                  <td>{p.nombre_completo}</td>
                  <td>
                    {editing ? (
                      <input
                        type="number"
                        value={editingWeight}
                        min="0"
                        step="0.01"
                        onChange={(e) => setEditingWeight(e.target.value)}
                      />
                    ) : (
                      p.peso_corporal ?? "-"
                    )}
                  </td>

                  <td>
                    {editing ? (
                      <form
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
                        <button type="submit">Guardar</button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(p.id);
                          setEditingWeight(p.peso_corporal ?? "");
                        }}
                      >
                        Editar
                      </button>
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
