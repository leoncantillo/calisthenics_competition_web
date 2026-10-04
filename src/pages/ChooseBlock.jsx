import { Link, useNavigate } from "react-router-dom";
import { clearSession, getBloques, getBloquesNormalizados, slugBloque } from "../api.js";
import { rutaDeBloque } from "../utils/navigation.js";

export default function ChooseBlock() {
  const navigate = useNavigate();
  const bloques = getBloquesNormalizados();

  return (
    <div className="shell">
      <div className="navrow">
        <div>
          <div className="brand">
            <h1>Calisthenics Competition</h1>
            <p>Elige el bloque que deseas gestionar:</p>
          </div>
        </div>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            clearSession();
            navigate("/");
          }}
        >
          Salir
        </button>
      </div>
      <div className="toolbar">
        {bloques.map((b) => {
          const bloque = getBloques().find((item) => slugBloque(item) === b);

          return (
            <Link key={b} className="btn secondary" to={rutaDeBloque(b)}>
              {bloque || b}
            </Link>
          );
        })}
      </div>
    </div>
  );
}