import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from '@mui/material';
import { NearMe, Clear as ClearIcon, Search as SearchIcon, Phone as PhoneIcon } from '@mui/icons-material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getStore } from '../../services/Services/StoreService';

const styles = {
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: { xs: '100%', md: '400px' },
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    tabContent: {
        padding: 2,
        flex: 1,
        overflowY: 'auto',
    },
    centeredBox: {
        textAlign: 'center',
        marginBottom: 2,
    },
    avatar: {
        width: 150,
        height: 150,
        margin: '0 auto',
    },
    flexBox: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 1,
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 2,
        flexWrap: 'wrap',
    },
    list: {
        marginBottom: 2,
    },
};

const PlaceDetailsSkeleton = ({ storeId, onClose }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [storeData, setStoreData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setLoading(true);
                const data = await getStore.getStoreById(storeId);
                setStoreData(data);
            } catch (error) {
                console.error('Error fetching store data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId]);

    if (loading) {
        return (
            <Box sx={styles.container}>
                <Typography variant="h6" sx={{ textAlign: 'center', padding: 2 }}>
                    Cargando datos del negocio...
                </Typography>
            </Box>
        );
    }

    if (!storeData) {
        return (
            <Box sx={styles.container}>
                <Typography variant="h6" sx={{ textAlign: 'center', padding: 2 }}>
                    No se encontraron datos para el negocio.
                </Typography>
            </Box>
        );
    }

    const { storeName = 'Negocio Genérico', icon } = storeData;

    return (
        <Box sx={styles.container}>
            <Box sx={styles.stickyHeader}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" sx={{ flexGrow: 1 }}>
                        <Tab label="Descripción General" />
                        <Tab label="Productos" />
                    </Tabs>
                    <IconButton onClick={onClose} sx={{ marginRight: 1 }}>
                        <ClearIcon />
                    </IconButton>
                </Box>
            </Box>

            {tabIndex === 0 && (
                <Box sx={styles.tabContent}>
                    <Box sx={styles.centeredBox}>
                        <Avatar src={icon || 'https://via.placeholder.com/150'} alt={storeName} sx={styles.avatar} />
                        <Typography variant="h5" gutterBottom sx={{ marginTop: 2 }}>
                            {storeName}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            ¡Bienvenido a nuestro negocio! Aquí encontrarás los mejores productos.
                        </Typography>
                    </Box>
                    <Box>
                        <Box sx={styles.flexBox}>
                            <PhoneIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body1">
                                <strong>Teléfono:</strong> No disponible
                            </Typography>
                        </Box>
                        <Box sx={styles.flexBox}>
                            <IconButton>
                                <FacebookIcon sx={{ color: '#4267B2' }} />
                            </IconButton>
                            <IconButton>
                                <InstagramIcon sx={{ color: '#E4405F' }} />
                            </IconButton>
                            <IconButton>
                                <YouTubeIcon sx={{ color: '#FF0000' }} />
                            </IconButton>
                            <IconButton>
                                <WhatsAppIcon sx={{ color: '#25D366' }} />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box sx={styles.buttonGroup}>
                        <Button variant="contained" color="primary" startIcon={<NearMe />}>
                            Ver en el Mapa
                        </Button>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={styles.tabContent}>
                    <TextField
                        label="Buscar Productos"
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={styles.list}
                    />
                    <List>
                        {(storeData.products || []).map((product) => (
                            <ListItem key={product.productId} alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar
                                        variant="square"
                                        src={product.productImage || 'https://via.placeholder.com/50'}
                                        sx={{ width: 60, height: 60, marginRight: 2 }}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography variant="h6">{product.productName}</Typography>}
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="textSecondary">
                                                {product.description || 'Sin descripción'}
                                            </Typography>
                                            <Typography variant="body1" color="primary">
                                                Bs {product.price?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
};

PlaceDetailsSkeleton.propTypes = {
    storeId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PlaceDetailsSkeleton;
