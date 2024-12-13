// components/Header.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, TextareaAutosize } from '@mui/material';
import { useApiKey} from "../../commos/ApiKeyContext";
import apiKeyService from "../../services/Services/ApiKeyService";

const Header = () => {
    const { apiKey, updateApiKey } = useApiKey(); // Usamos el hook del contexto
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(null);
    const [keyDisplay, setKeyDisplay] = useState('');

    const handleGetSecret = async () => {
        setLoading(true);
        try {
            const data = await apiKeyService.postApiKey();
            console.log('API Key received:', data);
            updateApiKey(data.keyValue); // Actualizamos el apiKey en el contexto
            setKeyDisplay(data.keyValue); // Mantenemos la clave completa temporalmente

            if (timer) clearTimeout(timer);
            const timeout = setTimeout(() => {
                setKeyDisplay(data.keyValue.slice(0, 5) + '...'); // Mostrar solo los primeros 5 caracteres después de un tiempo
            }, 3000);
            setTimer(timeout);
        } catch (error) {
            console.error('Error fetching API key:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppBar position="static" color="inherit" elevation={0} style={{ borderBottom: '1px solid #ddd' }}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGetSecret}
                    style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        textTransform: 'none',
                        width: '150px',
                    }}
                    disabled={loading}
                >
                    Get Secret
                </Button>

                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        paddingLeft: '20px',
                    }}
                >
                    <TextareaAutosize
                        minRows={1}
                        value={keyDisplay || apiKey?.slice(0, 5) + '...'} // Mostramos el apiKey desde el contexto
                        readOnly
                        style={{
                            width: '80%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            textAlign: 'center',
                            backgroundColor: '#f5f5f5',
                            resize: 'none',
                        }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
