import { Outlet } from "react-router-dom";
import { StreetProvider } from "../context/StreetContext.jsx";
import BlockGuard from "../components/blocks/security/BlockGuard.jsx";

export default function StreetLayout() {

    return (
        <StreetProvider>
            <BlockGuard bloque="street">
                <Outlet />
            </BlockGuard>
        </StreetProvider>
    );
}