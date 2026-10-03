import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

const MOVIMIENTOS = [
    { key: "MUSCLE_UP", nombre: "Muscle Up" },
    { key: "DOMINADA", nombre: "Dominada" },
    { key: "FONDOS", nombre: "Fondos" },
];

const MAX_INTENTOS = 3;

export default function StreetParticipantAttempts() {
    const { inscritoId } = useParams();

    const [inscrito, setInscrito] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingPeso, setEditingPeso] = useState("");
    const [editingValido, setEditingValido] = useState(true);
    const [saving, setSaving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const cargar = useCallback(async () => {
        const data = await api(
            `/api/resultados-street/participantes/${inscritoId}`
        );
        setInscrito(data.inscrito);
    }, [inscritoId]);

    useEffect(() => {
        cargar()
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [cargar]);

    const iniciarEdicion = (intento) => {
        setMsg(null);
        setError(null);
        setEditingId(intento.id);
        setEditingPeso(intento.peso ?? "");
        setEditingValido(intento.es_valido);
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditingPeso("");
        setEditingValido(true);
    };

    const guardarIntento = async (intento) => {
        setMsg(null);
        setError(null);

        if (editingPeso === "") {
            setError("El peso es obligatorio");
            return;
        }

        try {
            setSaving(true);

            const peso = Number(editingPeso);

            await api(`/api/resultados-street/intento/${intento.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    peso,
                    es_valido: editingValido,
                }),
            });

            // Se recarga el participante en vez de parchear el estado a mano: así
            // el mejor peso, el puntaje y el total quedan recalculados por el backend.
            await cargar();

            setMsg("Intento actualizado correctamente");
            cancelarEdicion();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loader">Cargando intentos…</div>;
    }

    if (error && !inscrito) {
        return <p className="err">{error}</p>;
    }

    if (!inscrito) {
        return <p className="err">Participante no encontrado</p>;
    }

    const movimientosParticipante = inscrito.movimientos || [];

    return (
        <div className="street-page attempts shell">
            <h1>Intentos – {inscrito.nombre_completo}</h1>

            <p>Dorsal: #{inscrito.numero_dorsal}</p>
            <p>
                Peso corporal: {inscrito.peso_corporal ?? "-"} kg
            </p>

            {msg && <p className="ok">{msg}</p>}
            {error && <p className="err">{error}</p>}

            {MOVIMIENTOS.map((movimiento) => {
                const mP = movimientosParticipante[movimiento.key] ? movimientosParticipante[movimiento.key] : null;

                return (
                    <section className="card" key={movimiento.key}>
                        <h2>{movimiento.nombre}</h2>

                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Intento</th>
                                    <th>Peso (kg)</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.from({ length: MAX_INTENTOS }, (_, index) => {
                                    const numeroIntento = index + 1;

                                    const intento = mP?.intentos?.find(
                                        (item) => item.numero_intento === numeroIntento
                                    );

                                    const editing = intento && editingId === intento.id;

                                    return (
                                        <tr key={numeroIntento}>
                                            <td data-label="Intento">{numeroIntento}</td>

                                            <td data-label="Peso (kg)">
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        min="0"
                                                        step="0.01"
                                                        aria-label={`Peso del intento ${numeroIntento}`}
                                                        value={editingPeso}
                                                        onChange={(e) =>
                                                            setEditingPeso(e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    intento?.peso ?? "-"
                                                )}
                                            </td>

                                            <td data-label="Estado">
                                                {editing ? (
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={editingValido}
                                                            onChange={(e) =>
                                                                setEditingValido(e.target.checked)
                                                            }
                                                        />
                                                        Válido
                                                    </label>
                                                ) : intento ? (
                                                    intento.es_valido ? (
                                                        "Válido"
                                                    ) : (
                                                        "Nulo"
                                                    )
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="actions" data-label="Acciones">
                                                {intento ? (
                                                    <div className="row-actions">
                                                        {editing ? (
                                                            <>
                                                                <button
                                                                    className="btn"
                                                                    type="button"
                                                                    onClick={() => guardarIntento(intento)}
                                                                    disabled={saving}
                                                                >
                                                                    {saving ? "Guardando…" : "Guardar"}
                                                                </button>

                                                                <button
                                                                    className="btn secondary"
                                                                    type="button"
                                                                    onClick={cancelarEdicion}
                                                                    disabled={saving}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                className="btn secondary"
                                                                type="button"
                                                                onClick={() => iniciarEdicion(intento)}
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                );
            })}

            <Link className="btn ghost" to="/street/panel/registro_intentos">
                Volver al registro
            </Link>
        </div>
    );
}