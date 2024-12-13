import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = {};
      const subcategoriesData = {};

      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data();
        categoriesData[categoryDoc.id] = categoryData.name;

        if (categoryData.subcategories) {
          for (const subcat of categoryData.subcategories) {
            subcategoriesData[subcat.id] = subcat.name;
          }
        }
      }

      setCategoriesMap(categoriesData);
      setSubcategoriesMap(subcategoriesData);
    };

    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({ id: productDoc.id, ...productData });

          if (auth.currentUser && productData.userId === auth.currentUser.uid) {
            setIsOwner(true);
          }

          const ownerDoc = await getDoc(doc(db, 'users', productData.userId));
          if (ownerDoc.exists()) {
            setOwnerData({ id: ownerDoc.id, ...ownerDoc.data() });
          }
        } else {
          navigate('/home');
        }
      } catch (error) {
        console.error('Error al obtener los datos del producto:', error);
        navigate('/home');
      }
    };

    fetchProductData();
  }, [productId, navigate]);

  const handleEdit = () => {
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      navigate(`/profile`);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!product || !ownerData) {
    return (
      <Container maxWidth="md" style={{ marginTop: '50px' }}>
        <Typography variant="h5" align="center">
          Cargando datos del producto...
        </Typography>
      </Container>
    );
  }

  const filteredFilters = Object.entries(product.filters || {}).filter(
    ([key, value]) =>
      !key.endsWith('_custom') && value !== false && value !== '' && value !== null
  );

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Box display="flex" alignItems="center" marginBottom="20px">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" style={{ marginLeft: '10px', flexGrow: 1 }}>
            {product.title}
          </Typography>
          {isOwner && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                style={{ marginRight: '10px' }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            </Box>
          )}
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.imageUrl}
              alt={product.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary">
              Precio: Bs {Number(product.price).toLocaleString('es-BO')}
            </Typography>
            <Typography variant="body1" paragraph style={{ marginTop: '20px' }}>
              {product.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Categoría:</strong> {categoriesMap[product.categoryId] || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Subcategoría:</strong> {subcategoriesMap[product.subcategoryId] || 'N/A'}
            </Typography>
            {filteredFilters.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Detalles del Producto
                </Typography>
                <List>
                  {filteredFilters.map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemText primary={`${key}: ${value}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {!isOwner && (
              <Box display="flex" alignItems="center" marginTop="20px">
                <Avatar
                  src={ownerData.imageUrl || ''}
                  alt={ownerData.businessName}
                  style={{ marginRight: '10px' }}
                />
                <Box>
                  <Typography variant="body1">
                    Ofrecido por:{' '}
                    <Link
                      to={`/merchant/${ownerData.id}`}
                      style={{ textDecoration: 'none', color: '#EF4444' }}
                    >
                      {ownerData.businessName}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contacto: {ownerData.phoneNumber}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetail;
