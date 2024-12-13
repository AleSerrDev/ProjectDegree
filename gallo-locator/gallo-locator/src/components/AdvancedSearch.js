import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const AdvancedSearch = ({ onClose, onSelectProduct }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            subcategories: data.subcategories || [],
            filters: data.filters || {},
          };
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory
      );
    }

    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSubcategories.includes(product.subcategoryId)
      );
    }

    Object.keys(selectedFilters).forEach((filterName) => {
      const selectedValues = selectedFilters[filterName];
      if (selectedValues.length > 0) {
        filtered = filtered.filter((product) => {
          const productValue = product.filters?.[filterName];
          return selectedValues.includes(productValue);
        });
      }
    });

    if (productSearchTerm) {
      const lowerTerm = productSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerTerm) ||
          product.description.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredProducts(filtered);
  }, [
    selectedCategory,
    selectedSubcategories,
    selectedFilters,
    productSearchTerm,
    products,
  ]);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]);
    setSelectedFilters({});
    const categoryData = categories.find((cat) => cat.id === categoryId);
    if (categoryData) {
      setSubcategories(categoryData.subcategories || []);
      setCategoryFilters(categoryData.filters || {});
    } else {
      setSubcategories([]);
      setCategoryFilters({});
    }
  };

  const handleSubcategoryChange = (event) => {
    const { value } = event.target;
    setSelectedSubcategories(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prevFilters) => {
      const prevValues = prevFilters[filterName] || [];
      let newValues;
      if (prevValues.includes(value)) {
        newValues = prevValues.filter((v) => v !== value);
      } else {
        newValues = [...prevValues, value];
      }
      return { ...prevFilters, [filterName]: newValues };
    });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: { xs: '100%', md: '400px' },
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 1100,
        overflowY: 'auto',
        boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          padding: 2,
          borderBottom: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Búsqueda Personalizada
        </Typography>
        <Button onClick={onClose}>Cerrar</Button>
      </Box>
      <Box sx={{ padding: 2, overflowY: 'auto', flex: 1 }}>
        <TextField
          label="Buscar Productos"
          variant="outlined"
          fullWidth
          value={productSearchTerm}
          onChange={(e) => setProductSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: productSearchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setProductSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Categoría"
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {subcategories.length > 0 && (
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Subcategorías</InputLabel>
            <Select
              multiple
              value={selectedSubcategories}
              onChange={handleSubcategoryChange}
              label="Subcategorías"
            >
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory} value={subcategory}>
                  {subcategory}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {Object.keys(categoryFilters).map((filterName) => (
          <Box key={filterName} sx={{ marginBottom: 2 }}>
            <Typography variant="subtitle1">{filterName}</Typography>
            <FormGroup>
              {categoryFilters[filterName].map((value) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={
                        selectedFilters[filterName]?.includes(value) || false
                      }
                      onChange={() => handleFilterChange(filterName, value)}
                    />
                  }
                  label={value}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <Typography variant="body1">
                No se encontraron productos.
              </Typography>
            ) : (
              <List>
                {filteredProducts.map((product) => (
                  <ListItem
                    key={product.id}
                    alignItems="flex-start"
                    button
                    onClick={() => onSelectProduct(product)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="square"
                        src={
                          product.imageUrl || 'https://via.placeholder.com/50'
                        }
                        sx={{ width: 60, height: 60, marginRight: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6">{product.title}</Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {product.description.substring(0, 100)}...
                          </Typography>
                          <Typography variant="body1" color="primary">
                            Bs{' '}
                            {parseFloat(product.price).toLocaleString('es-BO')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdvancedSearch;
