// ViewToggleButton.js
import React from 'react';
import { Button } from '@mui/material';

const ViewToggleButton = ({ is3D, onToggle }) => {
    return (
        <Button variant="contained" onClick={onToggle}>
            {is3D ? 'Cambiar a Vista 2D' : 'Cambiar a Vista 3D'}
        </Button>
    );
};

export default ViewToggleButton;
