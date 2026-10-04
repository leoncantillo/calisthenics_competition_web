// BlockGuard.jsx
import { Navigate } from "react-router-dom";
import { getToken, getBloques, slugBloque } from "../../../api.js";

export default function BlockGuard({ bloque, children }) {
  const token = getToken();
  const rol = localStorage.getItem("d58_rol");

  if (!token) return <Navigate to="/" replace />;
  if (rol === "admin") return children;

  const bloques = getBloques().map(slugBloque);
  if (!bloques.includes(bloque)) return <Navigate to="/chooseblock" replace />;

  return children;
}