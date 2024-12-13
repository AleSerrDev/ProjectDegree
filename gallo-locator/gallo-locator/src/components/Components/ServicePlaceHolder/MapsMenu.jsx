import React, { useEffect, useState } from 'react';
import { Box, Typography, Collapse, CircularProgress } from '@mui/material';
import AddMapForm from "./AddMapForm";
import MapService from '../../../services/Services/MapService';
import PropTypes from 'prop-types';
import { useApiKey } from "../../../commos/ApiKeyContext";

const styles = {
    menuGroup: {
        marginBottom: '15px',
        border: '1px solid #f44336',
        borderRadius: '5px',
        padding: '10px',
    },
    menuHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: '10px 0',
        fontWeight: 'bold',
        color: '#333',
    },
    mapTextContainer: {
        paddingTop: '10px',
        paddingBottom: '10px',
        backgroundColor: '#e3f2fd',
        marginTop: '10px',
    },
    mapText: {
        whiteSpace: 'pre-wrap', // Mantiene los saltos de línea si los hay
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxHeight: '150px',
        lineHeight: '1.5',
    },
};

const MapsMenu = ({ onClose }) => {
    const [openStores, setOpenStores] = useState(false);
    const [openStreets, setOpenStreets] = useState(false);
    const [openOthers, setOpenOthers] = useState(false);
    const [openODel, setOpenDel] = useState(false);
    const [openGetByName, setOpenGetByName] = useState(false); // Estado para el "Get By Name"
    const [mapText, setMapText] = useState(''); // Estado para mostrar el texto "mapText"
    const [loading, setLoading] = useState(false); // Estado de carga
    const { apiKey } = useApiKey();

    useEffect(() => {
        if (apiKey) {
            console.log('API Key from Context:', apiKey);
        }
    }, [apiKey]);

    const handleSaveSkeletonStores = async (formData) => {
        try {
            await MapService.postSkeletonStores(formData, apiKey);
            alert('Skeleton Stores saved successfully!');
            setOpenStores(false);
            onClose();
        } catch (error) {
            console.error('Error saving Skeleton Stores:', error);
        }
    };

    const handleSaveMaps = async (formData) => {
        try {
            await MapService.postMaps(formData, apiKey);
            alert('Streets saved successfully!');
            setOpenStores(false);
            onClose();
        } catch (error) {
            console.error('Error saving Maps:', error);
        }
    };

    const handleDelete = async (formData) => {
        try {
            console.log(formData.get('mapName'))
            await MapService.delMapByName(formData.get('mapName'), apiKey);
            alert('Map deleted successfully!');
            setOpenStores(false);
        } catch (error) {
            console.error('Error deleting the map:', error);
        }
    };

    const handleGetByName = async (formData) => {
        setLoading(true); // Mostrar el spinner
        try {
            const mapName = formData.get('mapName');
            const mapData = await MapService.getMapByName(mapName, "application/vnd.google-earth.kml+xml");
            setMapText(mapData.mapText || 'No map text available'); // Actualizamos solo el mapText
            setOpenGetByName(false);
        } catch (error) {
            console.error('Error getting map by name:', error);
            setMapText('Error fetching map data'); // En caso de error
        } finally {
            setLoading(false); // Ocultar el spinner
        }
    };

    const handleCancel = () => {
        console.log('Action canceled');
        setMapText(''); // Eliminar el resultado cuando se cancela
    };

    const truncatedMapText = mapText.length > 200 ? `${mapText.substring(0, 200)}...` : mapText; // Truncar el texto

    return (
        <Box>
            {/* Add Skeleton Stores */}
            <Box sx={styles.menuGroup}>
                <Typography
                    sx={styles.menuHeader}
                    onClick={() => setOpenStores((prev) => !prev)}
                >
                    Add Skeleton Stores
                </Typography>
                <Collapse in={openStores}>
                    <AddMapForm
                        showNameField={false}
                        showFileInput
                        onSave={handleSaveSkeletonStores}
                        onCancel={handleCancel}
                    />
                </Collapse>
            </Box>

            {/* Add Others Maps */}
            <Box sx={styles.menuGroup}>
                <Typography
                    sx={styles.menuHeader}
                    onClick={() => setOpenOthers((prev) => !prev)}
                >
                    Add Others Maps
                </Typography>
                <Collapse in={openOthers}>
                    <AddMapForm
                        showNameField
                        showFileInput
                        onSave={handleSaveMaps}
                        onCancel={handleCancel}
                    />
                </Collapse>
            </Box>

            {/* Delete Map */}
            <Box sx={styles.menuGroup}>
                <Typography
                    sx={styles.menuHeader}
                    onClick={() => setOpenDel((prev) => !prev)}
                >
                    Delete Maps by Name
                </Typography>
                <Collapse in={openODel}>
                    <AddMapForm
                        showNameField
                        showFileInput={false}
                        onSave={handleDelete}
                        onCancel={handleCancel}
                    />
                </Collapse>
            </Box>

            {/* Get Map by Name */}
            <Box sx={styles.menuGroup}>
                <Typography
                    sx={styles.menuHeader}
                    onClick={() => setOpenGetByName((prev) => !prev)}
                >
                    Get By Name
                </Typography>
                <Collapse in={openGetByName}>
                    <AddMapForm
                        showNameField
                        showFileInput={false}
                        onSave={handleGetByName}
                        onCancel={handleCancel}
                    />
                </Collapse>

                {/* Mostrar el texto del mapa */}
                {loading ? (
                    <Box sx={styles.mapTextContainer}>
                        <CircularProgress />
                    </Box>
                ) : (
                    mapText && (
                        <Box sx={styles.mapTextContainer}>
                            <Typography variant="body1" sx={styles.mapText}>
                                {truncatedMapText}
                            </Typography>
                        </Box>
                    )
                )}
            </Box>
        </Box>
    );
};

MapsMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default MapsMenu;
