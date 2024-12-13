import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  InputLabel,
  Avatar,
} from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const EditProfile = () => {
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+591');
  const [description, setDescription] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setBusinessName(data.businessName || '');
            setPhoneNumber(data.phoneNumber || '+591');
            setDescription(data.description || '');
            setCurrentImageUrl(data.imageUrl || '');
            if (data.socialLinks) {
              setFacebookLink(data.socialLinks.facebook || '');
              setInstagramLink(data.socialLinks.instagram || '');
              setYoutubeLink(data.socialLinks.youtube || '');
              setTiktokLink(data.socialLinks.tiktok || '');
            }
          }
        } catch (error) {
          console.error('Error al obtener los datos del usuario:', error);
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setNewImage(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = currentImageUrl;

      if (newImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `businessImages/${auth.currentUser.uid}/${newImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newImage);
        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        businessName,
        phoneNumber,
        description,
        imageUrl,
        socialLinks: {
          facebook: facebookLink || null,
          instagram: instagramLink || null,
          youtube: youtubeLink || null,
          tiktok: tiktokLink || null,
        },
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError('Error al actualizar el perfil. Intenta nuevamente.');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '30px' }}>
        <Typography variant="h4" gutterBottom color="primary" align="center">
          Editar Perfil
        </Typography>
        {error && (
          <Typography color="error" variant="body1" align="center" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleUpdateProfile}>
          <TextField
            label="Nombre del Negocio"
            fullWidth
            margin="normal"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <TextField
            label="Número de Teléfono"
            fullWidth
            margin="normal"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            InputProps={{
              startAdornment: <PhoneIcon sx={{ marginRight: 1 }} />,
            }}
          />
          <TextField
            label="Descripción del Negocio"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            label="Facebook (opcional)"
            fullWidth
            margin="normal"
            value={facebookLink}
            onChange={(e) => setFacebookLink(e.target.value)}
            InputProps={{
              startAdornment: <FacebookIcon sx={{ color: '#4267B2', marginRight: 1 }} />,
            }}
          />
          <TextField
            label="Instagram (opcional)"
            fullWidth
            margin="normal"
            value={instagramLink}
            onChange={(e) => setInstagramLink(e.target.value)}
            InputProps={{
              startAdornment: <InstagramIcon sx={{ color: '#E4405F', marginRight: 1 }} />,
            }}
          />
          <TextField
            label="YouTube (opcional)"
            fullWidth
            margin="normal"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            InputProps={{
              startAdornment: <YouTubeIcon sx={{ color: '#FF0000', marginRight: 1 }} />,
            }}
          />
          <TextField
            label="TikTok (opcional)"
            fullWidth
            margin="normal"
            value={tiktokLink}
            onChange={(e) => setTiktokLink(e.target.value)}
            InputProps={{
              startAdornment: <MusicNoteIcon sx={{ color: '#000000', marginRight: 1 }} />,
            }}
          />
          <Box mt={2}>
            <Typography variant="body1">Imagen Actual:</Typography>
            <Avatar
              src={currentImageUrl || 'https://via.placeholder.com/150'}
              alt="Imagen Actual"
              sx={{ width: 200, height: 200, margin: '0 auto' }}
            />
          </Box>
          <Box mt={2}>
            <InputLabel>Nueva Imagen del Negocio</InputLabel>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {preview && (
              <Box mt={2} textAlign="center">
                <Avatar
                  src={preview}
                  alt="Vista previa"
                  sx={{ width: 200, height: 200, margin: '0 auto' }}
                />
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{ marginTop: '20px' }}
          >
            Actualizar Perfil
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile;
