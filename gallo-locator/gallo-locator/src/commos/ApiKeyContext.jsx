// contexts/ApiKeyContext.js
import React, { createContext, useContext, useState } from 'react';

// Crear el contexto para el apiKey
const ApiKeyContext = createContext();

// Proveedor del contexto para envolver la app
export const ApiKeyProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState(null); // Aquí gestionamos el apiKey

    const updateApiKey = (key) => {
        setApiKey(key);
    };

    return (
        <ApiKeyContext.Provider value={{ apiKey, updateApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

// Hook para acceder al contexto
export const useApiKey = () => {
    return useContext(ApiKeyContext);
};
