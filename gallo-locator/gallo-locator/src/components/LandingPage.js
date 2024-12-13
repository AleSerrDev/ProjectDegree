import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import backgroundImage from '../assets/market-background.jpg';
import mapImage from '../assets/map-image.jpg';
import productsImage from '../assets/products-image.jpg';
import joinUsImage from '../assets/join-us-image.jpg';

const LandingPage = () => {
  const [randomFeedback, setRandomFeedback] = useState([]);

  useEffect(() => {
    const fetchRandomFeedback = async () => {
      try {
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
        const feedbackArray = feedbackSnapshot.docs.map((doc) => doc.data());

        if (feedbackArray.length > 0) {
          const shuffled = feedbackArray.sort(() => 0.5 - Math.random());
          const selectedFeedback = shuffled.slice(0, 2);
          setRandomFeedback(selectedFeedback);
        }
      } catch (error) {
        console.error('Error al obtener retroalimentación:', error);
      }
    };

    fetchRandomFeedback();
  }, []);

  return (
    <Box
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <Container maxWidth="md" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Typography variant="h2" gutterBottom>
          Bienvenido a Gallo Locator
        </Typography>
        <Typography variant="h5" gutterBottom style={{ marginBottom: '40px' }}>
          La aplicación web con mapa interactivo para encontrar productos en el <strong>Mercado El Gallo</strong>.
          Una plataforma diseñada para facilitar la búsqueda y localización de productos en el <strong>Mercado El Gallo</strong>.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/login"
          style={{ fontSize: '18px', padding: '10px 30px', marginRight: '20px' }}
        >
          Iniciar Sesión
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          component={Link}
          to="/home"
          style={{ fontSize: '18px', padding: '10px 30px' }}
        >
          Explorar
        </Button>
      </Container>

      <Container maxWidth="lg" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <img src={mapImage} alt="Mapa Interactivo" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <Typography variant="h5" gutterBottom color="primary" style={{ marginTop: '10px' }}>
                Mapa Interactivo
              </Typography>
              <Typography variant="body1">
                Navega por nuestro mapa interactivo para encontrar fácilmente los comercios y productos que buscas en el Mercado El Gallo.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <img src={productsImage} alt="Productos" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <Typography variant="h5" gutterBottom color="primary" style={{ marginTop: '10px' }}>
                Amplia Variedad
              </Typography>
              <Typography variant="body1">
                Descubre una gran selección de productos y servicios ofrecidos por nuestros comerciantes locales.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <img src={joinUsImage} alt="Únete a Nosotros" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <Typography variant="h5" gutterBottom color="primary" style={{ marginTop: '10px' }}>
                Únete Como Comerciante
              </Typography>
              <Typography variant="body1">
                Regístrate y muestra tus productos a una audiencia más amplia. ¡Es fácil y rápido!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <Typography variant="h4" gutterBottom color="secondary" align="center">
          Opiniones de Nuestros Usuarios
        </Typography>
        <Grid container spacing={4}>
          {randomFeedback.map((feedback, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                elevation={3}
                style={{
                  padding: '20px',
                  color: '#d32f2f',
                  borderRadius: '10px',
                }}
              >
                <Box display="flex" alignItems="center" marginBottom="10px">
                  <Avatar style={{ backgroundColor: '#d32f2f', color: '#fff' }}>
                    {feedback.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" style={{ marginLeft: '10px', color: '#d32f2f' }}>
                    {feedback.name}
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom style={{ fontStyle: 'italic' }}>
                  "{feedback.suggestions}"
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Calificación: {feedback.rating} / 5
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
