// ContactPage.js

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { Rating } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [suggestions, setSuggestions] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'feedback'), {
        name,
        email,
        rating,
        suggestions,
        date: new Date(),
      });

      setSuccessMessage('¡Gracias por tu retroalimentación!');
      setName('');
      setEmail('');
      setRating(0);
      setSuggestions('');
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '50px' }}>
      <Typography variant="h3" gutterBottom color="primary" align="center">
        Retroalimentación
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Tu opinión es muy importante para nosotros. Por favor, déjanos tus comentarios y sugerencias para mejorar tu experiencia en nuestra aplicación.
      </Typography>

      <Grid container spacing={4} style={{ marginTop: '20px' }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Información de Contacto
            </Typography>
            <Typography variant="body1" paragraph>
              Dirección: Av. Principal #123, Ciudad, País
            </Typography>
            <Typography variant="body1" paragraph>
              Teléfono: +591 12345678
            </Typography>
            <Typography variant="body1" paragraph>
              Email: info@mercadoelgallo.com
            </Typography>
            <Typography variant="h6" gutterBottom color="primary" style={{ marginTop: '20px' }}>
              Horario de Atención
            </Typography>
            <Typography variant="body1">Lunes a Viernes: 8:00 AM - 7:00 PM</Typography>
            <Typography variant="body1">Sábado: 9:00 AM - 5:00 PM</Typography>
            <Typography variant="body1">Domingo: 9:00 AM - 2:00 PM</Typography>
            <Box display="flex" justifyContent="center" marginTop="20px">
              <IconButton href="https://www.facebook.com" target="_blank">
                <Facebook fontSize="large" style={{ color: '#4267B2' }} />
              </IconButton>
              <IconButton href="https://www.instagram.com" target="_blank">
                <Instagram fontSize="large" style={{ color: '#E4405F' }} />
              </IconButton>
              <IconButton href="https://www.twitter.com" target="_blank">
                <Twitter fontSize="large" style={{ color: '#1DA1F2' }} />
              </IconButton>
              <IconButton href="https://www.youtube.com" target="_blank">
                <YouTube fontSize="large" style={{ color: '#FF0000' }} />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Envíanos tu Retroalimentación
            </Typography>
            {successMessage && (
              <Typography variant="body1" color="green" gutterBottom>
                {successMessage}
              </Typography>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Nombre"
                fullWidth
                margin="normal"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Box marginTop="16px">
                <Typography variant="h6" gutterBottom>
                  Calificación:
                </Typography>
                <Rating
                  name="simple-controlled"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                />
              </Box>
              <TextField
                label="Comentarios y Sugerencias"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                style={{ marginTop: '10px' }}
              >
                Enviar Retroalimentación
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Box style={{ marginTop: '40px' }}>
        <Typography variant="h5" gutterBottom color="primary" align="center">
          Ubicación del Mercado El Gallo
        </Typography>
        <Box style={{ width: '100%', height: '400px', marginTop: '20px' }}>
          {/* Mapa o Imagen de Ubicación */}
          <img
            src="gallo-locator/src/assets/gallo.png" // Reemplaza con la ruta correcta de tu imagen
            alt="Ubicación Mercado El Gallo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ContactPage;
