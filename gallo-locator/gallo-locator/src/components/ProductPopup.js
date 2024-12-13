import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ProductPopup = ({ product, onClose, categoriesMap, subcategoriesMap }) => {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');

  useEffect(() => {
    const fetchCategoryAndSubcategoryNames = async () => {
      if (!product) return;

      if (categoriesMap && categoriesMap[product.categoryId]) {
        setCategoryName(categoriesMap[product.categoryId]);
      } else {
        try {
          const categoryDoc = await getDoc(doc(db, 'categories', product.categoryId));
          if (categoryDoc.exists()) {
            setCategoryName(categoryDoc.data().name || 'N/A');
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setCategoryName('N/A');
        }
      }

      if (subcategoriesMap && subcategoriesMap[product.subcategoryId]) {
        setSubcategoryName(subcategoriesMap[product.subcategoryId]);
      } else {
        try {
          const subcategoryDoc = await getDoc(doc(db, 'categories', product.categoryId, 'subcategories', product.subcategoryId));
          if (subcategoryDoc.exists()) {
            setSubcategoryName(subcategoryDoc.data().name || 'N/A');
          }
        } catch (error) {
          console.error("Error fetching subcategory:", error);
          setSubcategoryName('N/A');
        }
      }
    };

    fetchCategoryAndSubcategoryNames();
  }, [product, categoriesMap, subcategoriesMap]);

  if (!product) return null;

  const filteredFilters = Object.entries(product.filters || {}).filter(
    ([key, value]) =>
      !key.endsWith('_custom') && value !== false && value !== '' && value !== null
  );

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
          <Box
            component="img"
            src={product.imageUrl || 'https://via.placeholder.com/200'}
            alt={product.title}
            sx={{
              width: { xs: '100%', md: '50%' },
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginRight: { md: 2 },
            }}
          />
          <Box mt={{ xs: 2, md: 0 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Precio: Bs {Number(product.price).toLocaleString('es-BO')}
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Categoría:</strong> {categoryName || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Subcategoría:</strong> {subcategoryName || 'N/A'}
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
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPopup;
