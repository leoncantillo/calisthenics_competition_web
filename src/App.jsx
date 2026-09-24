import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import BasicsPanel from "./pages/BasicsPanel.jsx";
import BasicsPodio from "./pages/BasicsPodio.jsx";
import Admin from "./pages/Admin.jsx"; // organization admin

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/podio" element={<Podio />} />
      <Route path="/admin" element={<Admin />} />
      {/* Básicos block */}
      <Route path="/basicos/panel" element={<BasicsPanel />} />
      <Route path="/basicos/podio" element={<BasicsPodio />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
