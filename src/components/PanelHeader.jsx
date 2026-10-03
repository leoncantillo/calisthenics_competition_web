const PanelHeader = ({ children }) => {
    return (
        <div className="navrow">
            <div>
                <div className="brand">
                    <small>Panel en vivo · {localStorage.getItem("d58_nombre")}</small>
                    <h1>{children}</h1>
                </div>
            </div>
        </div>
    );
};

export default PanelHeader;