import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Paper, Box } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (error) {
      setError('Correo electrónico o contraseña incorrectos.');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '30px' }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Iniciar Sesión
        </Typography>
        {error && (
          <Typography color="error" variant="body1" align="center">
            {error}
          </Typography>
        )}
        <Box mt={2}>
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            style={{ marginTop: '20px' }}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            onClick={() => navigate('/signup')}
            style={{ marginTop: '10px' }}
          >
            ¿No tienes una cuenta? Regístrate
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
