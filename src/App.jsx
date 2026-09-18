import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Panel from "./pages/Panel.jsx";
import Podio from "./pages/Podio.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/podio" element={<Podio />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
