import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api.js";
import { MOV_LABEL, MAX_INTENTOS } from "../../../utils/streetlifting/constants.js";

/**
 * Vista de historial de intentos de un participante.
 * No lee params ni contexto: todo llega por props para poder testearlo/reusarlo.
 */
export default function AttemptsHistory({
    inscrito,
    onRecargar,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editingPeso, setEditingPeso] = useState("");
    const [editingValido, setEditingValido] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const movimientosParticipante = inscrito.movimientos || {};

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

            await api(`/api/resultados-street/intento/${intento.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    peso: Number(editingPeso),
                    es_valido: editingValido,
                }),
            });

            await onRecargar();

            setMsg("Intento actualizado correctamente");
            cancelarEdicion();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="history">
            <p className="attempt-meta">
                <span>Dorsal #{inscrito.numero_dorsal}</span>
                <span>Peso corporal: {inscrito.peso_corporal} kg</span>
            </p>

            {MOV_LABEL.map((movimiento) => {
                const mUpper = movimiento.key.toUpperCase();
                const mP = movimientosParticipante[mUpper] ?? null;

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
                                                        onChange={(e) => setEditingPeso(e.target.value)}
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
                                                            onChange={(e) => setEditingValido(e.target.checked)}
                                                        />
                                                        Válido
                                                    </label>
                                                ) : intento ? (
                                                    intento.es_valido ? "Válido" : "Nulo"
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

            {msg && <p className="ok">{msg}</p>}
            {error && <p className="err">{error}</p>}

            <Link className="btn ghost" to="/street/panel/registro_intentos">
                Volver al registro
            </Link>
        </div>
    );
}