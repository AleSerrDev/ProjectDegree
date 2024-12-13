import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  InputLabel,
  Avatar,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDocs, collection, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxlamFuZHJvc2VycmFubzAzMTIiLCJhIjoiY2x4c3k5YWlvMHlrNjJrcG4xN3JiazVpMSJ9._dEWKUcIDKMXriCiA9WTRQ';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+591');
  const [description, setDescription] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [selectedShopName, setSelectedShopName] = useState('');
  const [occupiedShopIDs, setOccupiedShopIDs] = useState(new Set());
  const [shopsData, setShopsData] = useState(null);

  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      if (map.current) return;

      if (!mapContainer.current) {
        console.error('El contenedor del mapa no está disponible');
        return;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/alejandroserrano0312/cm2kkwnzn008v01pe0fbhfxph',
        center: [-66.1547, -17.4074],
        zoom: 19,
        minZoom: 19,
        maxZoom: 22,
        maxBounds: [
          [-66.1554, -17.4079],
          [-66.1545, -17.4067],
        ],
        dragPan: true,
      });

      map.current.doubleClickZoom.disable();

      map.current.on('load', () => {
        fetchData();
      });
    };

    const fetchData = async () => {
      try {
        const shopsSnapshot = await getDocs(collection(db, 'shops'));
        const shopsFeatures = [];
        const allShopIDs = new Set();

        shopsSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          allShopIDs.add(docSnap.id);

          const puntos = Object.keys(data)
            .filter((key) => key.startsWith('punto'))
            .sort((a, b) => {
              const numA = parseInt(a.substring(5));
              const numB = parseInt(b.substring(5));
              return numA - numB;
            })
            .map((key) => data[key]);

          if (data.name && puntos.length >= 3) {
            const coordinates = [
              puntos.map((punto) => [punto.longitude, punto.latitude]),
            ];

            const firstPoint = coordinates[0][0];
            const lastPoint = coordinates[0][coordinates[0].length - 1];
            if (
              firstPoint[0] !== lastPoint[0] ||
              firstPoint[1] !== lastPoint[1]
            ) {
              coordinates[0].push(firstPoint);
            }

            shopsFeatures.push({
              type: 'Feature',
              id: docSnap.id,
              properties: {
                name: data.name,
                shopID: docSnap.id,
              },
              geometry: {
                type: 'Polygon',
                coordinates: coordinates,
              },
            });
          }
        });

        const shopsGeoJSON = {
          type: 'FeatureCollection',
          features: shopsFeatures,
        };

        setShopsData(shopsGeoJSON);
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const occupiedIDs = new Set();

        usersSnapshot.forEach((docSnap) => {
          const userData = docSnap.data();
          if (userData.shopID) {
            occupiedIDs.add(userData.shopID);
          }
        });

        setOccupiedShopIDs(occupiedIDs);

        if (occupiedIDs.size >= allShopIDs.size) {
          setError(
            'Todas las casetas están ocupadas. No es posible registrarse en este momento.'
          );
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('Error al obtener datos. Inténtalo más tarde.');
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!map.current || !shopsData) return;

    if (map.current.isStyleLoaded()) {
      addMapLayers();
    } else {
      map.current.on('load', addMapLayers);
    }

    function addMapLayers() {
      if (map.current.getSource('shops')) {
        map.current.getSource('shops').setData(shopsData);
      } else {
        map.current.addSource('shops', {
          type: 'geojson',
          data: shopsData,
        });

        map.current.addLayer({
          id: 'shopsLayer',
          type: 'fill',
          source: 'shops',
          paint: {
            'fill-color': [
              'case',
              ['in', ['get', 'shopID'], ['literal', Array.from(occupiedShopIDs)]],
              '#FF4D4D',
              '#4CAF50',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.8,
              0.5,
            ],
          },
        });

        map.current.addLayer({
          id: 'shopsOutline',
          type: 'line',
          source: 'shops',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 1,
          },
        });

        let selectedStateId = null;

        map.current.on('click', 'shopsLayer', (e) => {
          const feature = e.features[0];
          const properties = feature.properties;
          const shopId = properties.shopID;
          const shopName = properties.name;

          if (occupiedShopIDs.has(shopId)) {
            setError('Esta caseta ya está ocupada. Selecciona otra.');
            return;
          }

          if (selectedStateId) {
            map.current.setFeatureState(
              { source: 'shops', id: selectedStateId },
              { selected: false }
            );
          }

          selectedStateId = feature.id;
          setSelectedShopId(shopId);
          setSelectedShopName(shopName);
          map.current.setFeatureState(
            { source: 'shops', id: selectedStateId },
            { selected: true }
          );

          setError('');

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${shopName}</strong>`)
            .addTo(map.current);
        });

        map.current.on('mousemove', 'shopsLayer', (e) => {
          if (e.features.length > 0) {
            const feature = e.features[0];
            const properties = feature.properties;

            if (!occupiedShopIDs.has(properties.shopID)) {
              map.current.getCanvas().style.cursor = 'pointer';
            } else {
              map.current.getCanvas().style.cursor = '';
            }
          }
        });

        map.current.on('mouseleave', 'shopsLayer', () => {
          map.current.getCanvas().style.cursor = '';
        });
      }
    }
  }, [shopsData, occupiedShopIDs]);
  useEffect(() => {
    if (map.current && map.current.getLayer('shopsLayer')) {
      map.current.setPaintProperty('shopsLayer', 'fill-color', [
        'case',
        ['in', ['get', 'shopID'], ['literal', Array.from(occupiedShopIDs)]],
        '#FF4D4D',
        '#4CAF50',
      ]);
    }
  }, [occupiedShopIDs]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!selectedShopId) {
      setError('Selecciona una caseta disponible en el mapa.');
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const occupiedIDs = new Set();

      usersSnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (userData.shopID) {
          occupiedIDs.add(userData.shopID);
        }
      });

      if (occupiedIDs.has(selectedShopId)) {
        setError('La caseta seleccionada ya ha sido ocupada. Selecciona otra.');
        return;
      }

      const shopDoc = await getDoc(doc(db, 'shops', selectedShopId));
      if (!shopDoc.exists()) {
        setError('La caseta seleccionada no existe.');
        return;
      }

      const shopData = shopDoc.data();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let imageUrl = '';
      if (image) {
        const storage = getStorage();
        const imageRef = storageRef(
          storage,
          `businessImages/${user.uid}/${image.name}`
        );
        const uploadTask = uploadBytesResumable(imageRef, image);
        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      await setDoc(doc(db, 'users', user.uid), {
        email,
        businessName,
        phoneNumber,
        description,
        imageUrl,
        shopID: selectedShopId,
        shopLocation: shopData.location,
        standID: shopData.standID,
        socialLinks: {
          facebook: facebookLink || null,
          instagram: instagramLink || null,
          youtube: youtubeLink || null,
          tiktok: tiktokLink || null,
        },
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error durante el registro:', error);
      setError('Error durante el registro. Intenta nuevamente.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', padding: 0 }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{ height: '100%', overflowY: 'auto', padding: { xs: 2, md: 4 } }}
          >
            <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 } }}>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                align="center"
              >
                Registro de Comerciante
              </Typography>
              {error && (
                <Typography
                  color="error"
                  variant="body1"
                  align="center"
                  gutterBottom
                >
                  {error}
                </Typography>
              )}
              <form onSubmit={handleSignUp}>
                <TextField
                  label="Correo Electrónico"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                    startAdornment: (
                      <FacebookIcon sx={{ color: '#4267B2', marginRight: 1 }} />
                    ),
                  }}
                />
                <TextField
                  label="Instagram (opcional)"
                  fullWidth
                  margin="normal"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InstagramIcon sx={{ color: '#E4405F', marginRight: 1 }} />
                    ),
                  }}
                />
                <TextField
                  label="YouTube (opcional)"
                  fullWidth
                  margin="normal"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <YouTubeIcon sx={{ color: '#FF0000', marginRight: 1 }} />
                    ),
                  }}
                />
                <TextField
                  label="TikTok (opcional)"
                  fullWidth
                  margin="normal"
                  value={tiktokLink}
                  onChange={(e) => setTiktokLink(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <MusicNoteIcon
                        sx={{ color: '#000000', marginRight: 1 }}
                      />
                    ),
                  }}
                />
                <Box mt={2}>
                  <InputLabel>Imagen del Negocio</InputLabel>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
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
                  disabled={error !== ''}
                >
                  Registrarse
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ marginTop: '10px' }}
                >
                  ¿Ya tienes una cuenta? Inicia Sesión
                </Button>
              </form>
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', position: 'relative' }}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{ padding: '20px' }}
            >
              Selecciona tu Caseta en el Mapa
            </Typography>
            {selectedShopName && (
              <Typography variant="body1" sx={{ paddingLeft: '20px' }}>
                Caseta Seleccionada: {selectedShopName}
              </Typography>
            )}
            <Box
              ref={mapContainer}
              sx={{
                width: '100%',
                height: { xs: 'calc(100% - 100px)', md: 'calc(100% - 80px)' },
                marginTop: '10px',
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUp;
