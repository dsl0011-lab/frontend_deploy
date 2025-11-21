import { createContext, useState } from "react";

const LoadingContext = createContext();

export default function LoadingProvider({ children }) {
    const [ Loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ Loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export { LoadingContext };