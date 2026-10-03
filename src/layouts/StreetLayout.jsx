import { Outlet } from "react-router-dom";
import { StreetProvider } from "../context/StreetContext.jsx";

export default function StreetLayout() {

    return (
        <StreetProvider>
            <Outlet />
        </StreetProvider>
    );
}