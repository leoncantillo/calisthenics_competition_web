import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const StreetContext = createContext();

export function StreetProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const MAX_INTENTOS = 3;
    const [participantes, setParticipantes] = useState([]);

    const [movimiento, setMovimiento] = useState(
        () => localStorage.getItem("street_movimiento") || "muscle_up"
    );

    const cargarParticipantes = async () => {
        try {
            const res = await api("/api/resultados-street/participantes");

            setParticipantes(res.participantes || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarParticipantes();
    }, []);

    useEffect(() => {
        localStorage.setItem("street_movimiento", movimiento);
    }, [movimiento]);

    return (
        <StreetContext.Provider
            value={{
                loading,
                error,
                participantes,
                movimiento,
                setMovimiento,
                setParticipantes,
                cargarParticipantes,
                maxIntentos: MAX_INTENTOS,
            }}
        >
            {children}
        </ StreetContext.Provider>
    );
}

export function useStreet() {
    const context = useContext(StreetContext);

    if (!context) {
        throw new Error("useStreet debe ser usado dentro de StreetProvider");
    }

    return context;
}