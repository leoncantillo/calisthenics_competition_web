import { Outlet } from "react-router-dom";
import { StreetProvider } from "../context/StreetContext.jsx";
import BlockGuard from "../components/blocks/security/BlockGuard.jsx";

export default function BasicsLayout() {

    return (
            <BlockGuard bloque="basicos">
                <Outlet />
            </BlockGuard>
    );
}