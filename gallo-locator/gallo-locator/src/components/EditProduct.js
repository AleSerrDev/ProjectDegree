import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EditProduct = () => {
  const { productId } = useParams();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filters, setFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== auth.currentUser.uid) {
          navigate('/home');
        }
        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setCurrentImageUrl(data.imageUrl);
        setSelectedCategory(data.categoryId || '');
        setSelectedSubcategory(data.subcategoryId || '');
        setFilterValues(data.filters || {});

        if (data.categoryId) {
          fetchSubcategoriesAndFilters(data.categoryId);
        }
      } else {
        navigate('/home');
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const fetchSubcategoriesAndFilters = async (categoryId) => {
    const subcategoriesRef = collection(db, 'categories', categoryId, 'subcategories');
    const subcategoriesSnapshot = await getDocs(subcategoriesRef);
    const subcategoriesData = subcategoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubcategories(subcategoriesData);
    const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
    if (categoryDoc.exists()) {
      const categoryData = categoryDoc.data();
      setFilters(categoryData.filters || {});
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategoriesAndFilters(selectedCategory);
    } else {
      setSubcategories([]);
      setFilters({});
      setSelectedSubcategory('');
      setFilterValues({});
    }
  }, [selectedCategory]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setNewImage(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFilterChange = (filterName, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [filterName]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = currentImageUrl;

    if (newImage) {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${auth.currentUser.uid}/${newImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, newImage);
      await uploadTask;
      imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
    }

    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      title,
      price,
      description,
      imageUrl,
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      filters: filterValues,
    });

    navigate('/profile');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '30px' }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Editar Producto
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Título del Producto"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Precio (en Bolivianos)"
            fullWidth
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Categoría"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {subcategories.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="subcategory-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategory-label"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                label="Subcategoría"
                required
              >
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {Object.entries(filters).map(([filterName, options]) => {
            if (options.length === 1 && options[0].includes('opciones')) {
              return (
                <TextField
                  key={filterName}
                  label={filterName}
                  fullWidth
                  margin="normal"
                  value={filterValues[filterName] || ''}
                  onChange={(e) => handleFilterChange(filterName, e.target.value)}
                  required
                />
              );
            } else {
              return (
                <FormControl key={filterName} fullWidth margin="normal">
                  <InputLabel id={`${filterName}-label`}>{filterName}</InputLabel>
                  <Select
                    labelId={`${filterName}-label`}
                    value={filterValues[filterName] || ''}
                    onChange={(e) => handleFilterChange(filterName, e.target.value)}
                    label={filterName}
                    required
                  >
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }
          })}

          <Box mt={2}>
            <Typography variant="body1">Imagen Actual:</Typography>
            <img
              src={currentImageUrl}
              alt="Producto Actual"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </Box>
          <Box mt={2}>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {preview && (
              <Box mt={2}>
                <Typography variant="body1">Nueva Imagen:</Typography>
                <img
                  src={preview}
                  alt="Nueva Imagen"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            style={{ marginTop: '20px' }}
          >
            Actualizar Producto
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProduct;
