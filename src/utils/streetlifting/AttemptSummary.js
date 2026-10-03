/**
 * Deriva por cuál intento va el participante en un movimiento.
 * El backend ya asigna el número solo (intentos.length + 1) y solo avisa cuando
 * los tres están usados, así que acá se calcula lo mismo para mostrarlo antes.
 */
export function AttemptSummary(inscrito, movimientoKey, maxIntentos) {
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
