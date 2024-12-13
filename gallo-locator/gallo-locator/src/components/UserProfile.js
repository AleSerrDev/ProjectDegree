import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
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

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (auth.currentUser) {
        try {
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('userId', '==', auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          const productsData = [];
          querySnapshot.forEach((docSnap) => {
            productsData.push({ id: docSnap.id, ...docSnap.data() });
          });
          setProducts(productsData);
        } catch (error) {
          console.error('Error al obtener los productos del usuario:', error);
        }
      }
      setIsLoading(false);
    };

    fetchUserProducts();
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleAddProduct = () => {
    navigate('/upload-product');
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCopyLocation = () => {
    if (userData && userData.shopLocation) {
      const locationText = `${userData.shopLocation.latitude}, ${userData.shopLocation.longitude}`;
      navigator.clipboard.writeText(locationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPhoneNumber = () => {
    if (userData && userData.phoneNumber) {
      navigator.clipboard.writeText(userData.phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ marginTop: '50px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ marginTop: '50px' }}>
        <Typography variant="h5" align="center">
          No se encontró información del usuario.
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        marginTop: '30px',
        marginBottom: '30px',
      }}
    >
      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '40px' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={userData.imageUrl || 'https://via.placeholder.com/150'}
                alt={userData.businessName || 'Usuario'}
                sx={{ width: 150, height: 150, marginBottom: 2 }}
              />
              <Typography variant="h5">{userData.businessName || 'Nombre del Negocio'}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {userData.email || 'correo@ejemplo.com'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                sx={{ marginTop: 2 }}
              >
                Editar Perfil
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom color="primary">
              Información del Negocio
            </Typography>
            <Typography variant="body1" paragraph>
              {userData.description || 'Descripción del negocio.'}
            </Typography>
            <Box display="flex" alignItems="center">
              <PhoneIcon sx={{ marginRight: 1 }} />
              <Typography variant="body1">
                <strong>Teléfono:</strong> {userData.phoneNumber || 'No disponible'}
              </Typography>
              {userData.phoneNumber && (
                <IconButton onClick={handleCopyPhoneNumber}>
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              )}
            </Box>
            <Box display="flex" alignItems="center" mt={2}>
              {userData.socialLinks && (
                <>
                  {userData.socialLinks.facebook && (
                    <IconButton
                      component="a"
                      href={userData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookIcon sx={{ color: '#4267B2' }} />
                    </IconButton>
                  )}
                  {userData.socialLinks.instagram && (
                    <IconButton
                      component="a"
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon sx={{ color: '#E4405F' }} />
                    </IconButton>
                  )}
                  {userData.socialLinks.youtube && (
                    <IconButton
                      component="a"
                      href={userData.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <YouTubeIcon sx={{ color: '#FF0000' }} />
                    </IconButton>
                  )}
                  {userData.socialLinks.tiktok && (
                    <IconButton
                      component="a"
                      href={userData.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MusicNoteIcon sx={{ color: '#000000' }} />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
            {userData.shopLocation && (
              <Box display="flex" alignItems="center" mt={2}>
                <Typography variant="body1">
                  <strong>Ubicación:</strong> {userData.shopLocation.latitude}, {userData.shopLocation.longitude}
                </Typography>
                <Tooltip title="Copiar coordenadas">
                  <IconButton onClick={handleCopyLocation}>
                    {copied ? <CheckIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="h5" gutterBottom color="primary">
        Tus Productos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddProduct}
        sx={{ marginBottom: 2 }}
      >
        Agregar Producto
      </Button>
      {products.length === 0 ? (
        <Typography variant="body1">No tienes productos agregados.</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl || 'https://via.placeholder.com/200?text=Sin+Imagen'}
                  alt={product.title}
                  onClick={() => handleViewProduct(product.id)}
                  sx={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography variant="h6">{product.title}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    Bs {Number(product.price).toLocaleString('es-BO')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.description ? `${product.description.substring(0, 60)}...` : 'Sin descripción'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditProduct(product.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserProfile;
