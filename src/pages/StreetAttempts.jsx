import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useStreet } from "../context/StreetContext.jsx";
import Attempt from "../components/blocks/streetlifting/Attempt.jsx";
import PanelHeader from "../components/PanelHeader.jsx";
import { AttemptSummary as resumenIntentos } from "../utils/streetlifting/AttemptSummary.js";
import AttemptsHistory from "../components/blocks/streetlifting/AttemptsHistory.jsx";

export default function StreetAttempts() {
    const { inscritoId } = useParams();
    const [searchParams] = useSearchParams();
    const modoHistorial = searchParams.get("modo") === "historial";
    const {
        loading,
        movimiento: movimientoActual,
        participantes,
        cargarParticipantes,
    } = useStreet();

    const inscrito = participantes.find(
        (p) => p.id === Number(inscritoId)
    ) || null;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const guardarIntento = async (payload) => {
        setMsg(null);
        setError(null);

        try {
            setSaving(true);
            await api(`/api/resultados-street/intento/`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            await cargarParticipantes();

            setMsg("Intento actualizado correctamente");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loader">Cargando intentos…</div>;
    if (!inscrito) return <p className="err">No se encontró el participante</p>;

    if (movimientoActual === null) {
        return (
            <div className="street-page attempt shell">
                <p className="err">No se indicó qué movimiento se está juzgando.</p>
                <Link className="btn secondary" to="/street/registro">
                    Volver al registro
                </Link>
            </div>
        );
    }

    if (error) return <p className="err">{error}</p>;

    return (
        <div className="street-page attempts shell">
            <PanelHeader>
                {modoHistorial ? "Historial de intentos" : "Registro de intento"}
            </PanelHeader>

            {modoHistorial ?
                (
                    <AttemptsHistory
                        inscrito={inscrito}
                        onRecargar={cargarParticipantes}
                    />
                ) : (
                    <Attempt
                        inscrito={inscrito}
                        movimientoActual={movimientoActual}
                        onRegistro={guardarIntento}
                        onRecargar={cargarParticipantes}
                    />
                )}
        </div>
    );
}