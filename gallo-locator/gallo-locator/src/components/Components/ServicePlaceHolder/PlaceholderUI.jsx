import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
} from '@mui/material';
import { ChevronRight, ChevronLeft, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import MapsMenu from './MapsMenu';
import StoresSection from './StoresSection';

const styles = {
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '500px',
        backgroundColor: '#fff',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
        transition: 'transform 0.3s ease-in-out',
    },
    hidden: {
        transform: 'translateX(-100%)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 15px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: '15px',
        flexGrow: 1,
        overflowY: 'auto',
    },
    searchContainer: {
        marginTop: '20px',
    },
    showMoreButton: {
        textAlign: 'center',
        marginTop: '10px',
    },
};

const PlaceholderUI = ({ searchTerm, setSearchTerm, searchData, isPlaceholderOpen, setIsPlaceholderOpen }) => {
    const [storesOpen, setStoresOpen] = useState(false);

    const productsToShow = searchData?.features || [3];

    return (
        <>
            {/* Toggle button */}
            <IconButton
                onClick={() => setIsPlaceholderOpen((prev) => !prev)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: isPlaceholderOpen ? '500px' : '10px',
                    zIndex: 2000,
                    transition: 'left 0.3s ease-in-out',
                    backgroundColor: '#fff',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                }}
            >
                {isPlaceholderOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>

            {/* Placeholder */}
            <Box
                sx={{
                    ...styles.container,
                    ...(isPlaceholderOpen ? {} : styles.hidden),
                }}
            >
                {/* Header */}
                <Box sx={styles.header}>
                    <Typography variant="h6">API Tester UI</Typography>
                </Box>

                {/* Content */}
                <Box sx={styles.content}>
                    {/* MAPS MENU */}
                    <MapsMenu />

                    {/* STORES */}
                    <StoresSection
                        isOpen={storesOpen}
                        setIsOpen={setStoresOpen}
                        onClose={() => setStoresOpen(false)}
                    />

                    {/* SEARCH */}
                    <Box sx={styles.searchContainer}>
                        <Typography variant="body1" fontWeight="bold" marginBottom="10px">
                            SEARCH
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Buscar productos"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setSearchTerm('')}>
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {searchData && searchData.features.length > 0 ? (
                            <List>
                                {productsToShow.map((feature, index) => (
                                    <ListItem key={index} button>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="square"
                                                src={feature.properties.product?.productImg || ''}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={feature.properties.product?.productName || 'Sin Nombre'}
                                            secondary={`Bs ${feature.properties.product?.price || '0.00'}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary" mt="10px">
                                No se encontraron resultados
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

PlaceholderUI.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    searchData: PropTypes.object,
    isPlaceholderOpen: PropTypes.bool.isRequired,
    setIsPlaceholderOpen: PropTypes.func.isRequired,
};

export default PlaceholderUI;
