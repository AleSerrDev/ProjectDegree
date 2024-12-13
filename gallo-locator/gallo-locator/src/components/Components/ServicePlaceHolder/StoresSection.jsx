import React, { useState } from 'react';
import { Box, Typography, Collapse, TextareaAutosize, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import PropTypes from 'prop-types';
import StoreService from "../../../services/Services/StoreService";

const DEFAULT_USER_ID = 'defaultUser123'; // Default user ID

const StoresSection = ({ isOpen, setIsOpen, onClose }) => {
    const [rawBody, setRawBody] = useState(`{
        "storeId": 0,
        "storeName": "",
        "location": "",
        "icon": "",
        "userId": "${DEFAULT_USER_ID}"
    }`);

    const handleAddStore = async () => {
        try {
            // Parse the raw JSON input into an object
            const newStore = JSON.parse(rawBody);

            // Validating the parsed object
            if (!newStore.storeName || !newStore.location || !newStore.icon) {
                throw new Error('All fields (storeName, location, and icon) must be provided.');
            }

            // Call the service to create the store
            const response = await StoreService.createStore(newStore);
            console.log('Store created successfully:', response);

            // Clear the raw body and collapse the section after successful addition
            handleCancel();
        } catch (error) {
            console.error('Error creating store:', error);
            alert('Error: ' + error.message);  // Notify the user in case of error
        }
    };

    const handleCancel = () => {
        setRawBody(`{
            "storeId": 0,
            "storeName": "",
            "location": "",
            "icon": "",
            "userId": "${DEFAULT_USER_ID}"
        }`);
        onClose();
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '10px 0',
                    fontWeight: 'bold',
                    color: '#333',
                }}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <Typography>STORES</Typography>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>

            {/* Raw JSON Body */}
            <Collapse in={isOpen}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <Typography variant="body1" fontWeight="bold" mb={2}>Body (Raw JSON)</Typography>

                    <TextareaAutosize
                        minRows={8}
                        maxRows={12}
                        value={rawBody}
                        onChange={(e) => setRawBody(e.target.value)}
                        style={{
                            width: '100%',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Button fullWidth variant="contained" color="primary" onClick={handleAddStore}>
                            Add Store
                        </Button>
                        <Button fullWidth variant="outlined" color="error" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

StoresSection.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default StoresSection;
