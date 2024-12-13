import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Slider,
  Tooltip,
} from '@mui/material';
import {
  NearMe,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const PlaceDetails = ({
  place,
  selectedProduct,
  onClose,
  onZoomToPlace,
  onCalculateRoute,
  tabIndex,
  setTabIndex,
  initialSearchTerm,
  setSelectedProductForPopup,
}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState(
    initialSearchTerm || ''
  );
  const [priceOrder, setPriceOrder] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceFilter, setMinPriceFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const [puertas, setPuertas] = useState([]);
  const [puertaSearchTerm, setPuertaSearchTerm] = useState('');
  const [filteredPuertas, setFilteredPuertas] = useState([]);
  const [selectedPuerta, setSelectedPuerta] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (place) {
      if (selectedProduct || initialSearchTerm) {
        setTabIndex(1);
      } else {
        setTabIndex(0);
      }
    }
  }, [place, selectedProduct, initialSearchTerm, setTabIndex]);

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
    const fetchProducts = async () => {
      if (tabIndex === 1 && place) {
        try {
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('userId', '==', place.id));
          const querySnapshot = await getDocs(q);
          const productsData = [];
          querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            productsData.push(data);
          });
          setProducts(productsData);

          if (productsData.length > 0) {
            const prices = productsData.map((p) => parseFloat(p.price));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
            setMinPriceFilter(minPrice);
          }
          setFilteredProducts(productsData);
        } catch (error) {
          console.error('Error al obtener productos:', error);
        }
      }
    };

    fetchProducts();
  }, [tabIndex, place]);

  useEffect(() => {
    let filtered = products;

    if (productSearchTerm) {
      const lowerTerm = productSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerTerm) ||
          product.description.toLowerCase().includes(lowerTerm)
      );
    }

    filtered = filtered.filter((product) => {
      const price = parseFloat(product.price);
      return price >= minPriceFilter;
    });

    if (priceOrder === 'asc') {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
    } else if (priceOrder === 'desc') {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price)
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [productSearchTerm, minPriceFilter, priceOrder, products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    if (tabIndex === 2) {
      fetchPuertas();
    }
  }, [tabIndex]);

  const fetchPuertas = async () => {
    try {
      const puertasRef = collection(db, 'puertas');
      const snapshot = await getDocs(puertasRef);
      const puertasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPuertas(puertasData);
      setFilteredPuertas(puertasData);
    } catch (error) {
      console.error('Error al obtener puertas:', error);
    }
  };

  useEffect(() => {
    if (puertaSearchTerm) {
      const lowerTerm = puertaSearchTerm.toLowerCase();
      setFilteredPuertas(
        puertas.filter((puerta) =>
          puerta.name.toLowerCase().includes(lowerTerm)
        )
      );
    } else {
      setFilteredPuertas(puertas);
    }
  }, [puertaSearchTerm, puertas]);

  const handleSelectPuerta = (puerta) => {
    setSelectedPuerta(puerta);
  };

  const calculateRoute = async () => {
    setCalculatingRoute(true);
    try {
      await onCalculateRoute(selectedPuerta, place);
    } catch (error) {
      console.error('Error al calcular la ruta:', error);
      alert(error.message || 'Ocurrió un error al calcular la ruta.');
    } finally {
      setCalculatingRoute(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!place) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: { xs: '100%', md: '400px' },
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Descripción General" />
            <Tab label="Productos" />
            <Tab label="Localización" />
          </Tabs>
          <IconButton onClick={onClose} sx={{ marginRight: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {tabIndex === 0 && (
        <Box sx={{ padding: 2 }}>
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <Avatar
              src={place.imageUrl || 'https://via.placeholder.com/150'}
              alt={place.businessName}
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
            <Typography variant="h5" gutterBottom sx={{ marginTop: 2 }}>
              {place.businessName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {place.description}
            </Typography>
          </Box>
          <Box>
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon sx={{ marginRight: 1 }} />
              <Typography variant="body1">
                <strong>Teléfono:</strong> {place.phoneNumber || 'No disponible'}
              </Typography>
              {place.phoneNumber && (
                <IconButton onClick={() => handleCopyText(place.phoneNumber)}>
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              )}
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              {place.socialLinks && (
                <>
                  {place.socialLinks.facebook && (
                    <IconButton
                      component="a"
                      href={place.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookIcon sx={{ color: '#4267B2' }} />
                    </IconButton>
                  )}
                  {place.socialLinks.instagram && (
                    <IconButton
                      component="a"
                      href={place.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon sx={{ color: '#E4405F' }} />
                    </IconButton>
                  )}
                  {place.socialLinks.youtube && (
                    <IconButton
                      component="a"
                      href={place.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <YouTubeIcon sx={{ color: '#FF0000' }} />
                    </IconButton>
                  )}
                  {place.socialLinks.tiktok && (
                    <IconButton
                      component="a"
                      href={place.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MusicNoteIcon sx={{ color: '#000000' }} />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
            {place.shopLocation && (
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="body1">
                  <strong>Ubicación:</strong> {place.shopLocation.latitude},{' '}
                  {place.shopLocation.longitude}
                </Typography>
                <Tooltip title="Copiar coordenadas">
                  <IconButton
                    onClick={() =>
                      handleCopyText(
                        `${place.shopLocation.latitude}, ${place.shopLocation.longitude}`
                      )
                    }
                  >
                    {copied ? <CheckIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 2,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<NearMe />}
              sx={{ margin: 0.5 }}
              onClick={() => onZoomToPlace(place.coordinates)}
            >
              Ver en el Mapa
            </Button>
          </Box>
        </Box>
      )}
      {tabIndex === 1 && (
        <Box sx={{ padding: 2, flex: 1, overflowY: 'auto' }}>
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
          <FormControl variant="outlined" fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Ordenar por Precio</InputLabel>
            <Select
              label="Ordenar por Precio"
              value={priceOrder}
              onChange={(e) => setPriceOrder(e.target.value)}
            >
              <MenuItem value="">
                <em>Sin Orden</em>
              </MenuItem>
              <MenuItem value="asc">Menor a Mayor</MenuItem>
              <MenuItem value="desc">Mayor a Menor</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" gutterBottom>
            Rango de precios: Bs {priceRange[0]} - Bs {priceRange[1]}
          </Typography>
          <Typography gutterBottom>Filtrar por precio mínimo (Bs):</Typography>
          <Slider
            value={minPriceFilter}
            onChange={(e, newValue) => setMinPriceFilter(newValue)}
            valueLabelDisplay="auto"
            min={priceRange[0]}
            max={priceRange[1]}
            step={10}
            sx={{ marginBottom: 2 }}
          />
          {currentProducts.length === 0 ? (
            <Typography variant="body1">No se encontraron productos.</Typography>
          ) : (
            <>
              <List>
                {currentProducts.map((product) => (
                  <ListItem
                    key={product.id}
                    alignItems="flex-start"
                    button
                    onClick={() => setSelectedProductForPopup(product)}
                    selected={selectedProduct?.id === product.id}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="square"
                        src={product.imageUrl || 'https://via.placeholder.com/50'}
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
                            Bs {parseFloat(product.price).toLocaleString('es-BO')}
                          </Typography>
                          <Typography variant="body2">
                            Categoría:{' '}
                            {categoriesMap[product.categoryId] || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            Subcategoría:{' '}
                            {subcategoriesMap[product.subcategoryId] || 'N/A'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, value) => setCurrentPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
      {tabIndex === 2 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona una puerta
          </Typography>
          <TextField
            label="Buscar Puerta"
            variant="outlined"
            fullWidth
            value={puertaSearchTerm}
            onChange={(e) => setPuertaSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: puertaSearchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setPuertaSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ marginBottom: 2 }}
          />
          {filteredPuertas.length === 0 ? (
            <Typography>No se encontraron puertas.</Typography>
          ) : (
            <List>
              {filteredPuertas.map((puerta) => (
                <ListItem
                  button
                  key={puerta.id}
                  selected={selectedPuerta?.id === puerta.id}
                  onClick={() => handleSelectPuerta(puerta)}
                  sx={{
                    backgroundColor:
                      selectedPuerta?.id === puerta.id
                        ? 'rgba(0, 123, 255, 0.1)'
                        : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    },
                  }}
                >
                  <ListItemText primary={puerta.name} />
                </ListItem>
              ))}
            </List>
          )}
          {selectedPuerta && (
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={calculateRoute}
                disabled={calculatingRoute}
              >
                {calculatingRoute ? 'Calculando ruta...' : 'Calcular Ruta'}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PlaceDetails;
