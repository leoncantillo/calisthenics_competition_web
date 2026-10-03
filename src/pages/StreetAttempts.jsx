import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useStreet } from "../context/StreetContext.jsx";
import StreetAttempt from "../components/blocks/streetlifting/StreetAttempt.jsx";
import PanelHeader from "../components/PanelHeader.jsx";

const MOV_LABEL = [
    { key: "muscle_up", nombre: "Muscle Up" },
    { key: "dominada", nombre: "Dominada" },
    { key: "fondos", nombre: "Fondos" },
];

/**
 * Deriva por cuál intento va el participante en un movimiento.
 * El backend ya asigna el número solo (intentos.length + 1) y solo avisa cuando
 * los tres están usados, así que acá se calcula lo mismo para mostrarlo antes.
 */
export function resumenIntentos(inscrito, movimientoKey, maxIntentos) {
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
        completado: Boolean(mov?.completado) || intentos.length >= maxIntentos,
        // El backend rechaza cargar menos que el intento anterior.
        pesoMinimo: ultimo ? Number(ultimo.peso) : null,
    };
}


export default function StreetAttempts() {
    const { inscritoId } = useParams();
    const [searchParams] = useSearchParams();
    const modoHistorial = searchParams.get("modo") === "historial";
    const {
        loading,
        movimiento: movimientoActual,
        participantes,
        cargarParticipantes,
        maxIntentos,
    } = useStreet();

    const inscrito = participantes.find(
        (p) => p.id === Number(inscritoId)
    ) || null;

    const [editingId, setEditingId] = useState(null);
    const [editingPeso, setEditingPeso] = useState("");
    const [editingValido, setEditingValido] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

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
            await cargarParticipantes();

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

    if (!inscrito) {
        return <p className="err">No se encontró el participante</p>;
    }

    if (error) {
        return <p className="err">{error}</p>;
    }

    if (!MOV_LABEL.some(
        (movimiento) => movimiento.key === movimientoActual)) {
        return (
            <div className="street-page attempt shell">
                <p className="err">No se indicó qué movimiento se está juzgando.</p>
                <Link className="btn secondary" to="/street/registro">
                    Volver al registro
                </Link>
            </div>
        );
    }

    const movimientosParticipante = inscrito.movimientos || {};
    const resumen = resumenIntentos(inscrito, movimientoActual, maxIntentos);

    return (
        <div className="street-page attempts shell">
            <PanelHeader>
                {modoHistorial ? "Historial de intentos" : "Registro de intento"}
            </PanelHeader>

            {!modoHistorial && (
                <StreetAttempt
                    inscrito={inscrito}
                    movimientoActual={movimientoActual}
                    movLabel={MOV_LABEL}
                    resumenIntentos={resumen}
                    maxIntentos={maxIntentos}
                    onRegistro={guardarIntento}
                    cargarParticipantes={cargarParticipantes}
                />
            )}

            {modoHistorial && (
                <div className="history">

                    <p className="attempt-meta">
                        <span>Dorsal #{inscrito.numero_dorsal}</span>
                        <span>Peso corporal: {inscrito.peso_corporal} kg</span>
                    </p>

                    {msg && <p className="ok">{msg}</p>}
                    {error && <p className="err">{error}</p>}

                    {MOV_LABEL.map((movimiento) => {
                        const mUpper = movimiento.key.toUpperCase();
                        const mP = movimientosParticipante[mUpper] ? movimientosParticipante[mUpper] : null;

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
                                        {Array.from({ length: maxIntentos }, (_, index) => {
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
            )}
        </div>
    );
}