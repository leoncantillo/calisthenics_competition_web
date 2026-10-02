import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ChooseBlock from "./pages/ChooseBlock.jsx"; // block selection page
import BasicsPanel from "./pages/BasicsPanel.jsx";
import BasicsPodio from "./pages/BasicsPodio.jsx";
import Admin from "./pages/Admin.jsx"; // organization admin
import StreetPodio from "./pages/StreetPodio.jsx";
import StreetAttempt from "./pages/StreetAttempt.jsx";
import StreetPanel from "./pages/StreetPanel.jsx";
import StreetParticipantAttempts from "./pages/StreetParticipantAttempt.jsx";

export default function App() {
  return (
    <Routes>
      {/* Judge login */}
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      {/* After login, select block */}
      <Route path="/chooseblock" element={<ChooseBlock />} />
      {/* Básicos block */}
      <Route path="/basicos/panel" element={<BasicsPanel />} />
      <Route path="/basicos/podio" element={<BasicsPodio />} />
      {/* Street Lifting */}
      <Route path="/street/podio" element={<StreetPodio />} />
      <Route path="/street/intento/:inscritoId" element={<StreetAttempt />} />
      <Route path="/street/intentos/:inscritoId" element={<StreetParticipantAttempts />} />
      <Route path="/street/panel/" element={<StreetPanel />} />
      <Route path="/street/panel/:vista" element={<StreetPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
