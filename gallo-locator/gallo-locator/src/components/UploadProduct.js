import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const UploadProduct = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (selectedCategory) {
      fetchSubcategoriesAndFilters(selectedCategory);
    } else {
      setSubcategories([]);
      setFilters({});
      setSelectedSubcategory('');
      setFilterValues({});
    }
  }, [selectedCategory]);

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

  const validateForm = () => {
    let tempErrors = {};
    if (!title) tempErrors.title = 'El título es obligatorio';
    if (!price || isNaN(price)) tempErrors.price = 'El precio debe ser un número válido';
    if (!description) tempErrors.description = 'La descripción es obligatoria';
    if (!image) tempErrors.image = 'La imagen es obligatoria';
    if (!selectedCategory) tempErrors.category = 'La categoría es obligatoria';
    if (!selectedSubcategory) tempErrors.subcategory = 'La subcategoría es obligatoria';
    Object.entries(filters).forEach(([filterName, options]) => {
      if (!filterValues[filterName]) {
        tempErrors[filterName] = `El campo ${filterName} es obligatorio`;
      }
    });
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFilterChange = (filterName, value) => {
    if (value === 'Otro') {
      setFilterValues((prevValues) => ({
        ...prevValues,
        [filterName]: '',
        [`${filterName}_custom`]: true,
      }));
    } else {
      setFilterValues((prevValues) => ({
        ...prevValues,
        [filterName]: value,
        [`${filterName}_custom`]: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!auth.currentUser) {
      alert('Debes iniciar sesión para subir productos.');
      return;
    }

    setUploading(true);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${auth.currentUser.uid}/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, 'products'), {
        title,
        price,
        description,
        imageUrl: downloadURL,
        userId: auth.currentUser.uid,
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory,
        filters: filterValues,
      });

      setUploading(false);
      navigate('/profile');
    } catch (error) {
      console.error('Error al subir el producto:', error);
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '30px' }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Agregar Producto
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Título del Producto"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
          <TextField
            label="Precio (en Bolivianos)"
            fullWidth
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
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
            error={!!errors.description}
            helperText={errors.description}
            required
          />
          <FormControl fullWidth margin="normal" error={!!errors.category}>
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
            {errors.category && (
              <Typography color="error" variant="body2">
                {errors.category}
              </Typography>
            )}
          </FormControl>
          {subcategories.length > 0 && (
            <FormControl fullWidth margin="normal" error={!!errors.subcategory}>
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
              {errors.subcategory && (
                <Typography color="error" variant="body2">
                  {errors.subcategory}
                </Typography>
              )}
            </FormControl>
          )}
          {Object.entries(filters).map(([filterName, options]) => {
            const isCustom = filterValues[`${filterName}_custom`];
            return (
              <div key={filterName}>
                <FormControl fullWidth margin="normal" error={!!errors[filterName]}>
                  <InputLabel id={`${filterName}-label`}>{filterName}</InputLabel>
                  <Select
                    labelId={`${filterName}-label`}
                    value={isCustom ? 'Otro' : filterValues[filterName] || ''}
                    onChange={(e) => handleFilterChange(filterName, e.target.value)}
                    label={filterName}
                    required
                  >
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                  {errors[filterName] && (
                    <Typography color="error" variant="body2">
                      {errors[filterName]}
                    </Typography>
                  )}
                </FormControl>
                {isCustom && (
                  <TextField
                    label={`Especifique ${filterName}`}
                    fullWidth
                    margin="normal"
                    value={filterValues[filterName] || ''}
                    onChange={(e) =>
                      setFilterValues((prevValues) => ({
                        ...prevValues,
                        [filterName]: e.target.value,
                      }))
                    }
                    required
                    error={!!errors[filterName]}
                  />
                )}
              </div>
            );
          })}

          <Box mt={2}>
            <InputLabel>Imagen del Producto</InputLabel>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {errors.image && (
              <Typography color="error" variant="body2">
                {errors.image}
              </Typography>
            )}
            {preview && (
              <Box mt={2}>
                <Typography variant="body2">Vista previa:</Typography>
                <img
                  src={preview}
                  alt="Vista previa"
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
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Agregar Producto'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadProduct;
