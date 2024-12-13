import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Collapse,
    CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';

const styles = {
    formContainer: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
        marginBottom: '10px',
    },
    inputGroup: {
        marginBottom: '10px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    filePreview: {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#e3f2fd', // Light blue
        borderRadius: '5px',
        border: '1px solid #90caf9',
        fontFamily: 'monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap', // Preserve line breaks
        overflowY: 'auto',
        maxHeight: '200px',
    },
    loadingOverlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 10,
    },
};

const AddMapForm = ({ showNameField, showFileInput, onSave, onCancel, mapText }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);

        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContent(event.target.result);
            };
            reader.readAsText(uploadedFile);
        }
    };

    const handleSave = async () => {
        if (file || (showNameField && name)) {
            const formData = new FormData();
            if (file) {
                formData.append('mapFile', file);
            }
            if (showNameField && name) {
                formData.append('mapName', name);
            }

            setIsLoading(true);

            try {
                await onSave(formData);
            } catch (error) {
                console.error('Save error:', error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);

                }, 500);
            }
        } else {
            alert('Please provide the required inputs before saving.');
        }
    };

    const handleCancel = () => {
        setName(''); // Clear name field
        setFile(null); // Clear file field
        setFileContent(null); // Clear file content preview
        setIsFilePreviewOpen(false); // Close file preview
        onCancel(); // Notify parent to close the form
    };

    return (
        <Box sx={styles.formContainer} position="relative">
            {isLoading && (
                <Box sx={styles.loadingOverlay}>
                    <CircularProgress />
                </Box>
            )}
            {showNameField && (
                <Box sx={styles.inputGroup}>
                    <TextField
                        fullWidth
                        label="Name (optional)"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Box>
            )}
            {showFileInput && (
                <Box sx={styles.inputGroup}>
                    <Typography variant="body1" gutterBottom>
                        Upload GeoJSON File
                    </Typography>
                    <TextField
                        type="file"
                        fullWidth
                        inputProps={{ accept: '.geojson,.json' }}
                        onChange={handleFileChange}
                    />
                </Box>
            )}
            {file && (
                <Box sx={styles.inputGroup}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => setIsFilePreviewOpen((prev) => !prev)}
                    >
                        {isFilePreviewOpen ? 'Hide File Content' : 'Preview File Content'}
                    </Button>
                </Box>
            )}
            <Collapse in={isFilePreviewOpen}>
                <Box sx={styles.filePreview}>
                    {fileContent ? fileContent : 'No file content available.'}
                </Box>
            </Collapse>
            <Box sx={styles.buttonGroup}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    {mapText || 'Cancel'} {/* Display mapText or 'Cancel' */}
                </Button>
            </Box>
        </Box>
    );
};

AddMapForm.propTypes = {
    showNameField: PropTypes.bool,
    showFileInput: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    mapText: PropTypes.string, // New prop for dynamic text
};

export default AddMapForm;
