import { Link, useNavigate } from "react-router-dom";
import { clearSession } from "../api.js";

export default function ChooseBlock() {
  const navigate = useNavigate();
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
        <Link className="btn secondary" to="/basicos/panel">Básicos – Panel</Link>
        <Link className="btn secondary" to="/street/panel">Street Lifting – Registro</Link>
      </div>
    </div>
  );
}