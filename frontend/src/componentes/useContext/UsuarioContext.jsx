import { createContext, useState } from "react";

const UsuarioContext = createContext();

export default function UsuarioProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    return (
        <UsuarioContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </UsuarioContext.Provider>
    );
}

export { UsuarioContext };