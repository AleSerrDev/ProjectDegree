import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { db } from '../../firebaseConfig';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { CircularProgress, Box, Button, Snackbar } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import PlaceDetails from '../PlaceDetails';
import SearchBar from '../Components/SearchBar';
import { ThreeDRotation, RotateRight, ClearAll } from '@mui/icons-material';
import * as turf from '@turf/turf';
import ProductPopup from '../ProductPopup';
import AdvancedSearch from '../AdvancedSearch';
import { FilterList } from '@mui/icons-material';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [usersData, setUsersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const selectedMarkerRef = useRef(null);
  const [is3D, setIs3D] = useState(true);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const routeLayerId = 'route-layer';
  const routeSourceId = 'route-source';
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [placeDetailTab, setPlaceDetailTab] = useState(0);
  const puertaMarkersRef = useRef([]);
  const pasilloLayersRef = useRef([]);
  const [puertasData, setPuertasData] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [routesData, setRoutesData] = useState([]);
  const [selectedProductForPopup, setSelectedProductForPopup] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  mapboxgl.accessToken = 'pk.eyJ1IjoiYWxlamFuZHJvc2VycmFubzAzMTIiLCJhIjoiY2x4c3k5YWlvMHlrNjJrcG4xN3JiazVpMSJ9._dEWKUcIDKMXriCiA9WTRQ';

  useEffect(() => {
    const savedPlace = localStorage.getItem('selectedPlace');
    const savedProduct = localStorage.getItem('selectedProduct');
    const savedTabIndex = localStorage.getItem('placeDetailTab');
    const savedSearchTerm = localStorage.getItem('searchTerm');

    if (savedPlace) {
      setSelectedPlace(JSON.parse(savedPlace));
    }
    if (savedProduct) {
      setSelectedProduct(JSON.parse(savedProduct));
    }
    if (savedTabIndex !== null) {
      setPlaceDetailTab(Number(savedTabIndex));
    }
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
    }
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      localStorage.setItem('selectedPlace', JSON.stringify(selectedPlace));
    } else {
      localStorage.removeItem('selectedPlace');
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    } else {
      localStorage.removeItem('selectedProduct');
    }
  }, [selectedProduct]);

  useEffect(() => {
    localStorage.setItem('placeDetailTab', placeDetailTab);
  }, [placeDetailTab]);

  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/alejandroserrano0312/cm2kkwnzn008v01pe0fbhfxph',
      center: [-66.1549, -17.4071],
      zoom: 19.5,
      minZoom: 19,
      maxZoom: 22,
      pitch: 60,
      bearing: -17,
      antialias: true,
    });

    map.current.on('load', () => {
      setLoading(false);
      loadPuertas();
      loadPasillos();
    });

    map.current.scrollZoom.enable();
    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  const loadPuertas = () => {
    onSnapshot(
      collection(db, 'puertas'),
      (snapshot) => {
        const puertas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPuertasData(puertas);
        if (puertaMarkersRef.current) {
          puertaMarkersRef.current.forEach((marker) => marker.remove());
        }
        puertaMarkersRef.current = [];
        addPuertasToMap(puertas);
      },
      (error) => {
        console.error('Error al cargar puertas:', error);
      }
    );
  };

  const addPuertasToMap = (puertas) => {
    puertas.forEach((puerta) => {
      const el = document.createElement('div');
      el.className = 'puerta-marker';

      const arrowEl = document.createElement('div');
      arrowEl.className = 'puerta-arrow';

      const labelEl = document.createElement('div');
      labelEl.className = 'puerta-label';
      labelEl.innerText = puerta.name;

      el.appendChild(arrowEl);
      el.appendChild(labelEl);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([puerta.location.longitude, puerta.location.latitude])
        .addTo(map.current);

      puertaMarkersRef.current.push(marker);
    });
  };

  const loadPasillos = () => {
    onSnapshot(
      collection(db, 'pasillos'),
      (snapshot) => {
        const pasillos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (pasilloLayersRef.current) {
          pasilloLayersRef.current.forEach(({ layerId, sourceId, marker }) => {
            if (map.current.getLayer(layerId)) {
              map.current.removeLayer(layerId);
            }
            if (map.current.getSource(sourceId)) {
              map.current.removeSource(sourceId);
            }
            if (marker) {
              marker.remove();
            }
          });
          pasilloLayersRef.current = [];
        }

        addPasillosToMap(pasillos);
      },
      (error) => {
        console.error('Error al cargar pasillos:', error);
      }
    );
  };

  const addPasillosToMap = (pasillos) => {
    pasillos.forEach((pasillo) => {
      const coordinates = pasillo.path.map((point) => [
        point.longitude,
        point.latitude,
      ]);

      if (
        coordinates.length > 0 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
          coordinates[0][1] !== coordinates[coordinates.length - 1][1])
      ) {
        coordinates.push(coordinates[0]);
      }

      const polygonGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };

      const sourceId = `pasillo-${pasillo.id}-source`;
      const layerId = `pasillo-${pasillo.id}-layer`;

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: polygonGeoJSON,
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#F0F0F0',
          'fill-opacity': 0.5,
        },
      });

      const centroid = turf.centroid(polygonGeoJSON).geometry.coordinates;

      const labelEl = createPasilloLabel(pasillo.name);

      const marker = new mapboxgl.Marker({
        element: labelEl,
        anchor: 'center',
      })
        .setLngLat(centroid)
        .addTo(map.current);

      pasilloLayersRef.current.push({ layerId, sourceId, marker });
    });
  };

  const createPasilloLabel = (name) => {
    const el = document.createElement('div');
    el.className = 'pasillo-label';
    el.innerText = `Pasillo ${name}`;
    return el;
  };

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersArray = usersSnapshot.docs
          .map((doc) => {
            const userData = doc.data();
            if (userData.shopLocation) {
              return {
                id: doc.id,
                ...userData,
                coordinates: [
                  userData.shopLocation.longitude,
                  userData.shopLocation.latitude,
                ],
              };
            } else {
              return null;
            }
          })
          .filter((user) => user !== null);
        setUsersData(usersArray);
      } catch (error) {
        console.error('Error al obtener datos de los usuarios:', error);
      }
    };

    fetchUsersData();
  }, []);

  useEffect(() => {
    if (usersData.length === 0) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    usersData.forEach((user) => {
      const el = document.createElement('div');
      el.className = 'user-marker';

      el.style.backgroundImage = `url(${user.imageUrl || 'https://via.placeholder.com/50'})`;
      el.style.backgroundSize = 'cover';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #FF4444';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(user.coordinates)
        .addTo(map.current);

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(user.businessName);
      marker.setPopup(popup);

      el.addEventListener('click', () => {
        map.current.flyTo({
          center: user.coordinates,
          zoom: map.current.getZoom(),
          essential: true,
        });
        setSelectedPlace(user);
        setSelectedProduct(null);
        setPlaceDetailTab(0);
        highlightSelectedMarker(marker);
      });

      markersRef.current.push({ id: user.id, marker, element: el });
    });

    if (selectedPlace) {
      const selectedMarkerData = markersRef.current.find(
        (data) => data.id === selectedPlace.id
      );
      if (selectedMarkerData) {
        highlightSelectedMarker(selectedMarkerData.marker);
      }
    }
  }, [usersData, selectedPlace]);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsArray = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductsData(productsArray);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductsData();
  }, []);

  useEffect(() => {
    if (usersData.length === 0 || productsData.length === 0) return;

    let merchantsWithProducts = usersData.map((user) => ({
      ...user,
      products: productsData.filter((product) => product.userId === user.id),
    }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      merchantsWithProducts = merchantsWithProducts.filter((merchant) =>
        merchant.products.some(
          (product) =>
            product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term)
        )
      );
    }

    setFilteredMerchants(merchantsWithProducts);
  }, [usersData, productsData, searchTerm]);

  useEffect(() => {
    if (!map.current || filteredMerchants.length === 0) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    filteredMerchants.forEach((user) => {
      const el = document.createElement('div');
      el.className = 'user-marker';

      el.style.backgroundImage = `url(${user.imageUrl || 'https://via.placeholder.com/50'})`;
      el.style.backgroundSize = 'cover';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #FF4444';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(user.coordinates)
        .addTo(map.current);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setText(user.businessName);

      marker.setPopup(popup);

      el.addEventListener('click', () => {
        map.current.flyTo({
          center: user.coordinates,
          zoom: map.current.getZoom(),
          essential: true,
        });
        setSelectedPlace(user);
        setSelectedProduct(null);
        setPlaceDetailTab(0);
        highlightSelectedMarker(marker);
        clearRoute();
      });

      markersRef.current.push({ id: user.id, marker, element: el });
    });

    if (selectedPlace) {
      const selectedMarkerData = markersRef.current.find(
        (data) => data.id === selectedPlace.id
      );
      if (selectedMarkerData) {
        highlightSelectedMarker(selectedMarkerData.marker);
      }
    }
  }, [filteredMerchants, selectedPlace]);

  const highlightSelectedMarker = (marker) => {
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.getElement().classList.remove('selected-marker');
    }

    marker.getElement().classList.add('selected-marker');
    selectedMarkerRef.current = marker;
  };

  const handleSelectMerchant = (merchant) => {
    map.current.flyTo({
      center: merchant.coordinates,
      zoom: map.current.getZoom(),
      essential: true,
    });
    setSelectedPlace(merchant);
    setSelectedProduct(null);
    setPlaceDetailTab(0);
    const selectedMarkerData = markersRef.current.find(
      (data) => data.id === merchant.id
    );
    if (selectedMarkerData) {
      highlightSelectedMarker(selectedMarkerData.marker);
    }
    clearRoute();
    setSearchTerm('');
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.title);
    const merchant = usersData.find((user) => user.id === product.userId);
    if (merchant) {
      map.current.flyTo({
        center: merchant.coordinates,
        zoom: map.current.getZoom(),
        essential: true,
      });
      setSelectedPlace(merchant);
      setPlaceDetailTab(1);
      const selectedMarkerData = markersRef.current.find(
        (data) => data.id === merchant.id
      );
      if (selectedMarkerData) {
        highlightSelectedMarker(selectedMarkerData.marker);
      }
      clearRoute();
    }
  };

  const handleZoomToPlace = (coordinates) => {
    if (map.current) {
      map.current.flyTo({ center: coordinates, zoom: 20, essential: true });
    }
  };

  const toggle3D = () => {
    if (map.current) {
      if (is3D) {
        map.current.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000,
        });
      } else {
        map.current.easeTo({
          pitch: 60,
          bearing: -17,
          duration: 1000,
        });
      }
      setIs3D(!is3D);
    }
  };

  useEffect(() => {
    if (!map.current || !routeGeoJSON) return;

    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeSourceId)) {
      map.current.removeSource(routeSourceId);
    }

    map.current.addSource(routeSourceId, {
      type: 'geojson',
      data: routeGeoJSON,
    });

    map.current.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#FF0000',
        'line-width': 4,
      },
    });

    const routeCoordinates = routeGeoJSON.geometry.coordinates;
    const bounds = routeCoordinates.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(routeCoordinates[0], routeCoordinates[0])
    );
    map.current.fitBounds(bounds, { padding: 50 });

    return () => {
      if (map.current.getLayer(routeLayerId)) {
        map.current.removeLayer(routeLayerId);
      }
      if (map.current.getSource(routeSourceId)) {
        map.current.removeSource(routeSourceId);
      }
    };
  }, [routeGeoJSON]);

  const clearRoute = () => {
    setRouteGeoJSON(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    setPlaceDetailTab(0);
  };

  const handleSelectProductFromSearch = (product) => {
    setShowAdvancedSearch(false);
    setSelectedProduct(product);
    setSearchTerm(product.title);
    const merchant = usersData.find((user) => user.id === product.userId);
    if (merchant) {
      map.current.flyTo({
        center: merchant.coordinates,
        zoom: map.current.getZoom(),
        essential: true,
      });
      setSelectedPlace(merchant);
      setPlaceDetailTab(1);
      const selectedMarkerData = markersRef.current.find(
        (data) => data.id === merchant.id
      );
      if (selectedMarkerData) {
        highlightSelectedMarker(selectedMarkerData.marker);
      }
      clearRoute();
    }
  };

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesSnapshot = await getDocs(collection(db, 'rutes'));
        const routesArray = routesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutesData(routesArray);

        const graph = buildGraph(routesArray);
        setGraphData(graph);
      } catch (error) {
        console.error('Error al obtener rutas:', error);
      }
    };
    loadRoutes();
  }, []);

  function buildGraph(features) {
    const graph = {};

    features.forEach((feature) => {
      const geometry = feature.geometry.map((point) => [
        point.longitude,
        point.latitude,
      ]);
      const from = feature.properties.puntoA.toString();
      const to = feature.properties.puntoB.toString();

      if (!graph[from]) {
        graph[from] = [];
      }

      if (!graph[to]) {
        graph[to] = [];
      }

      const point1 = turf.point(geometry[0]);
      const point2 = turf.point(geometry[1]);
      const distance = turf.distance(point1, point2, { units: 'meters' });

      graph[from].push({
        node: to,
        weight: distance,
        geometry: geometry,
      });
      graph[to].push({
        node: from,
        weight: distance,
        geometry: geometry,
      });
    });

    return graph;
  }

  function isPuertaNode(node) {
    return puertasData.some((puerta) => puerta.name === node);
  }

  function haversineDistance(coord1, coord2) {
    const point1 = turf.point([coord1.longitude, coord1.latitude]);
    const point2 = turf.point([coord2.longitude, coord2.latitude]);
    return turf.distance(point1, point2, { units: 'meters' });
  }

  function bestPathSearch(graph, start, targetLocation) {
    let bestPath = null;
    let minDistance = Infinity;
    const visited = new Set();
    const allPaths = [];

    function dfs(currentNode, currentPath, currentDistance) {
      if (currentDistance >= minDistance) {
        return;
      }

      visited.add(currentNode);
      const currentNodeData = graph[currentNode];
      currentPath.push({
        node: currentNode,
        distance: currentDistance,
        geometry: currentNodeData ? currentNodeData[0].geometry : null,
      });

      currentNodeData?.forEach((neighbor) => {
        neighbor.geometry.forEach((point) => {
          const distanceToTarget = haversineDistance(
            { longitude: point[0], latitude: point[1] },
            targetLocation.coordinates
          );

          if (distanceToTarget < minDistance) {
            minDistance = distanceToTarget;
            bestPath = [...currentPath, { node: neighbor.node, distance: currentDistance + neighbor.weight }];
          }
        });
      });

      graph[currentNode]?.forEach((neighbor) => {
        if (!visited.has(neighbor.node) && !isPuertaNode(neighbor.node)) {
          const totalDistance = currentDistance + neighbor.weight;
          dfs(neighbor.node, [...currentPath], totalDistance);
        }
      });

      visited.delete(currentNode);
      currentPath.pop();
    }

    dfs(start, [], 0);
    return bestPath;
  }

  const handleCalculateRoute = async (selectedPuerta, selectedPlace) => {
    if (!graphData || !selectedPuerta || !selectedPlace) {
      setErrorMessage('No se puede calcular la ruta en este momento.');
      return;
    }

    const startNode = selectedPuerta.name;
    const targetLocation = {
      coordinates: {
        longitude: selectedPlace.shopLocation.longitude,
        latitude: selectedPlace.shopLocation.latitude,
      },
      node: 'Destino',
    };

    const bestPath = bestPathSearch(graphData, startNode, targetLocation);
    console.log('Best Path:', bestPath);
    if (bestPath && bestPath.length > 0) {
      const routeCoordinates = [];

      bestPath.forEach((step) => {
        if (step.geometry) {
          step.geometry.forEach((point) => {
            routeCoordinates.push(point);
          });
        }
      });

      const routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      };

      setRouteGeoJSON(routeGeoJSON);
    } else {
      setErrorMessage(
        'No se pudo encontrar una ruta entre la puerta y la tienda.'
      );
    }
  };

  return (
    <Box position="relative" display="flex" height="100vh">
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={is3D ? <RotateRight /> : <ThreeDRotation />}
          onClick={toggle3D}
        >
          Vista {is3D ? '2D' : '3D'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ClearAll />}
          onClick={() => {
            clearRoute();
            resetFilters();
            setSelectedPlace(null);
            if (selectedMarkerRef.current) {
              selectedMarkerRef.current.getElement().classList.remove(
                'selected-marker'
              );
              selectedMarkerRef.current = null;
            }
            localStorage.clear();
          }}
        >
          Limpiar Filtros
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FilterList />}
          onClick={() => setShowAdvancedSearch(true)}
        >
          Búsqueda Avanzada
        </Button>
      </Box>

      {!showAdvancedSearch && (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            left: 10,
            zIndex: 900,
            maxWidth: '500px',
            width: '300px',
            margin: '0 auto',
          }}
        >
          <SearchBar
            merchants={usersData}
            products={productsData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            onSelectMerchant={handleSelectMerchant}
            onSelectProduct={handleSelectProduct}
          />
        </Box>
      )}
      <div ref={mapContainer} style={{ flex: 1, overflow: 'hidden' }} />
      {selectedPlace && (
        <PlaceDetails
          place={selectedPlace}
          selectedProduct={selectedProduct}
          onClose={() => {
            setSelectedPlace(null);
            if (selectedMarkerRef.current) {
              selectedMarkerRef.current.getElement().classList.remove(
                'selected-marker'
              );
              selectedMarkerRef.current = null;
            }
            clearRoute();
          }}
          onZoomToPlace={handleZoomToPlace}
          onCalculateRoute={handleCalculateRoute}
          tabIndex={placeDetailTab}
          setTabIndex={setPlaceDetailTab}
          initialSearchTerm={searchTerm}
          setSelectedProductForPopup={setSelectedProductForPopup}
        />
      )}
      {showAdvancedSearch && (
        <AdvancedSearch
          onClose={() => setShowAdvancedSearch(false)}
          onSelectProduct={handleSelectProductFromSearch}
        />
      )}
      {selectedProductForPopup && (
        <ProductPopup
          product={selectedProductForPopup}
          onClose={() => setSelectedProductForPopup(null)}
        />
      )}

      <style>{`
        .user-marker:hover {
          transform: scale(1.1);
        }
        .selected-marker {
          border-color: blue !important;
          box-shadow: 0 0 10px blue;
        }
        .puerta-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .puerta-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 15px solid red;
        }
        .puerta-label {
          font-size: 18px;
          font-weight: bold;
          color: black;
          text-align: center;
          margin-top: 5px;
        }
        .pasillo-label {
          font-size: 16px;
          font-weight: bold;
          color: black;
          text-align: center;
        }
      `}</style>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Box>
  );
};

export default MapComponent;
