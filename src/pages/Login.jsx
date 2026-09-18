import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../api.js";

export default function Login() {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const navigate = useNavigate();

  function onChange(i, value) {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 3) refs[i + 1].current?.focus();
  }

  function onKey(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  }

  async function submit(e) {
    e.preventDefault();
    const pin = digits.join("");
    if (pin.length !== 4) {
      setError("Ingresa el PIN de 4 dígitos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      setSession(data);
      navigate(data.rol === "admin" ? "/admin" : "/panel");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <div className="brand">
        <small>Universidad del Magdalena</small>
        <h1>Distrito 58 · Bloque de Básicos</h1>
      </div>
      <form className="card" onSubmit={submit}>
        <p className="hint">PIN del juez (solo Básicos) o de organización.</p>
        <div className="pin-row">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>
        <p className="err">{error}</p>
        <button className="btn" disabled={loading}>
          {loading ? "Validando…" : "Entrar"}
        </button>
      </form>
      <div className="links">
        <Link to="/podio">Ver podio público</Link>
      </div>
    </div>
  );
}
