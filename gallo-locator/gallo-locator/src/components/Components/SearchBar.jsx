import React, { useCallback } from 'react';
import {
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Paper,
    InputAdornment,
    IconButton,
    Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { productImgDef } from '../../commos/default';
import Draggable from 'react-draggable';

const SearchBar = ({ products, searchTerm, setSearchTerm }) => {
    const handleClear = useCallback(() => {
        setSearchTerm('');
        console.log("Cleared search term");
    }, [setSearchTerm]);

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value.trimStart();
        setSearchTerm(value);
        console.log("Search term changed:", value);
    }, [setSearchTerm, searchTerm]);

    console.log("serchTerm...", searchTerm);
    return (
        <Draggable>
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1500, width: '300px' }}>
                <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '10px' }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar productos"
                        variant="standard"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClear}>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {products.length > 0 && (
                        <Paper
                            style={{
                                position: 'relative',
                                top: '10px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                            }}
                        >
                            <List>
                                {products.map((product, index) => (
                                    <ListItem key={index} button>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="square"
                                                src={product.productImg || productImgDef}
                                                alt="Product icon"
                                                onError={(e) => e.target.src = productImgDef}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.productName || 'Producto sin nombre'}
                                            secondary={`Producto - Bs ${product.price || 'N/A'}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                    {searchTerm.length > 0 && products.length === 0 && (
                        <Paper style={{ position: 'relative', top: '10px' }}>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                style={{ padding: '10px' }}
                            >
                                No se encontraron resultados
                            </Typography>
                        </Paper>
                    )}
                </Paper>
            </div>
        </Draggable>
    );
};

SearchBar.propTypes = {
    products: PropTypes.arrayOf(
        PropTypes.shape({
            productName: PropTypes.string.isRequired,
            description: PropTypes.string,
            category: PropTypes.string,
            price: PropTypes.string,
            productImg: PropTypes.string,
        })
    ).isRequired,
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
};

export default SearchBar;
