export default function ParticipantsTable({ participantes, renderPeso, renderAcciones }) {
    return (
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
                    return (
                        <tr key={p.id}>
                            <td data-label="Dorsal">#{p.numero_dorsal}</td>
                            <td data-label="Nombre">{p.nombre_completo}</td>
                            <td data-label="Peso (kg)">
                                {renderPeso(p)}
                            </td>

                            <td className="actions" data-label="Acciones">
                                {renderAcciones(p)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}