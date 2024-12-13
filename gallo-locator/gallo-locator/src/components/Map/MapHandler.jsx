import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ViewToggleButton from "../Components/ViewToggleButton";
import PropTypes from 'prop-types';
import StoreMarker from '../Components/StoreMarker';
import PlaceDetailsSkeleton from '../Components/PlaceDetailsSkeleton';
import { Button } from '@mui/material';
import MapService from "../../services/Services/MapService";

const MapHandler = ({ geoJsonData, streetsGeoJson }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const [is3D, setIs3D] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [skStoresGeoJson, setSkStoresGeoJson] = useState(null);
    const [skStreetsGeoJson, setSkStreetsGeoJson] = useState(null);

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxlamFuZHJvc2VycmFubzAzMTIiLCJhIjoiY2x4c3k5YWlvMHlrNjJrcG4xN3JiazVpMSJ9._dEWKUcIDKMXriCiA9WTRQ';

    const calculatePolygonCenter = (coordinates) => {
        const [longSum, latSum] = coordinates[0].reduce(
            (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
            [0, 0]
        );
        return [longSum / coordinates[0].length, latSum / coordinates[0].length];
    };

    const clearMapLayers = () => {
        const layersToRemove = [
            'store-polygons', 'store-borders', 'store-extrusion', 'street-layer', 'street-names',
            'skstores-extrusion', 'skstreets-fill'
        ];
        layersToRemove.forEach(layerId => {
            if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
        });

        const sourcesToRemove = ['stores', 'streets', 'skstores', 'skstreets'];
        sourcesToRemove.forEach(sourceId => {
            if (map.current.getSource(sourceId)) {
                map.current.removeSource(sourceId);
            }
        });

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    const fetchStreetsData = useCallback(async () => {
        try {
            const streetsData = await MapService.getMapByName("SKStreats");
            const parsedMapText = JSON.parse(streetsData.mapText);
            setSkStreetsGeoJson(parsedMapText);
            console.log("SKStreets data loaded:", parsedMapText);
        } catch (error) {
            console.error("Error loading SKStreets data:", error);
        }
    }, []);

    const fetchStoresData = useCallback(async () => {
        try {
            const storesData = await MapService.getMapByName("SKStores");
            const parsedMapText = JSON.parse(storesData.mapText);
            setSkStoresGeoJson(parsedMapText);
        } catch (error) {
            console.error("Error loading SKStores data:", error);
        }
    }, []);

    const addDataToMap = () => {
        clearMapLayers();

        // Add SKStreets layer first
        if (skStreetsGeoJson) {
            map.current.addSource('skstreets', {
                type: 'geojson',
                data: skStreetsGeoJson,
            });

            map.current.addLayer({
                id: 'skstreets-fill',
                type: 'fill',
                source: 'skstreets',
                paint: {
                    'fill-color': 'hsl(47, 74%, 92%)',
                    'fill-opacity': 0.9,
                },
            });
        }

        // Add SKStores layer second
        if (skStoresGeoJson) {
            map.current.addSource('skstores', {
                type: 'geojson',
                data: skStoresGeoJson,
            });

            map.current.addLayer({
                id: 'skstores-extrusion',
                type: 'fill-extrusion',
                source: 'skstores',
                paint: {
                    'fill-extrusion-color': 'hsl(114, 58%, 87%)',
                    'fill-extrusion-height': 1,
                    'fill-extrusion-opacity': 0.8,
                },
            });
        }

        if (streetsGeoJson) {
            map.current.addSource('streets', {
                type: 'geojson',
                data: streetsGeoJson,
            });

            map.current.addLayer({
                id: 'street-layer',
                type: 'line',
                source: 'streets',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#808080',
                    'line-width': 2,
                    'line-opacity': 0.3,
                    'line-dasharray': [2, 4],
                },
            });

            map.current.addLayer({
                id: 'street-names',
                type: 'symbol',
                source: 'streets',
                layout: {
                    'symbol-placement': 'line',
                    'text-field': [
                        'case',
                        ['all', ['has', 'Por'], ['==', ['typeof', ['get', 'Por']], 'string']],
                        ['concat', 'Pasillo ', ['get', 'Por']],
                        ['all', ['has', 'A'], ['!', ['has', 'Por']]],
                        ['concat', 'Pasillo ', ['to-string', ['get', 'A']]],
                        ''
                    ],
                    'text-size': 16,
                },
                paint: {
                    'text-color': '#5a5a5a',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 1,
                    'text-opacity': 0.7,
                },
            });
        }

        // Add Stores layer last (to ensure it appears on top)
        map.current.addSource('stores', {
            type: 'geojson',
            data: geoJsonData,
        });

        map.current.addLayer({
            id: 'store-borders',
            type: 'line',
            source: 'stores',
            filter: ['all', ['has', 'style'], ['!=', ['get', 'style'], null]],
            paint: {
                'line-color': ['get', 'stroke', ['get', 'style']],
                'line-width': ['get', 'stroke-width', ['get', 'style']],
            },
        });

        map.current.addLayer({
            id: 'store-extrusion',
            type: 'fill-extrusion',
            source: 'stores',
            filter: ['all', ['has', 'style'], ['!=', ['get', 'style'], null]],
            paint: {
                'fill-extrusion-color': ['get', 'fill', ['get', 'style']],
                'fill-extrusion-height': 5,
                'fill-extrusion-opacity': 0.6, // Slight transparency for emphasis
            },
        });

        geoJsonData.features.forEach((feature) => {
            const { properties, geometry } = feature;
            const { store } = properties;
            const coordinates = properties.center || calculatePolygonCenter(geometry.coordinates);
            const markerContainer = document.createElement('div');

            if(skStoresGeoJson) {
                ReactDOM.render(
                    <StoreMarker
                        imageUrl={store.icon}
                        onClick={() => {
                            setSelectedStoreId(store.storeId);
                            map.current.flyTo({center: coordinates, zoom: 19});
                        }}
                        businessName={store.storeName}
                        storeId={store.storeId}
                    />,
                    markerContainer
                );
            }

            const marker = new mapboxgl.Marker(markerContainer)
                .setLngLat(coordinates)
                .addTo(map.current);

            markersRef.current.push(marker);
        });
    };

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/alejandroserrano0312/cm3suvg8q000j01qq0pwyb0ty',
                center: [-66.1549, -17.4071],
                zoom: 19.5,
                pitch: 60,
                bearing: -17,
                antialias: true,
            });

            map.current.scrollZoom.enable();
            map.current.addControl(new mapboxgl.NavigationControl());
        }

        if (map.current.isStyleLoaded()) {
            addDataToMap();
        } else {
            map.current.once('load', addDataToMap);
        }
    }, [geoJsonData, streetsGeoJson, skStoresGeoJson, skStreetsGeoJson]);

    useEffect(() => {
        fetchStreetsData();
        fetchStoresData();
    }, []);

    useEffect(() => {
        if (map.current) {
            if (is3D) {
                map.current.easeTo({ pitch: 60, bearing: -17, duration: 1000 });
            } else {
                map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
            }
        }
    }, [is3D]);

    const handleToggleView = () => {
        setIs3D((prevIs3D) => !prevIs3D);
    };

    const handleRefresh = async () => {
        window.location.reload();
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
            <div style={{ position: 'absolute', top: 18, right: 42, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ViewToggleButton is3D={is3D} onToggle={handleToggleView} />
                <Button variant="contained" color="primary" onClick={handleRefresh}>
                    Refresh
                </Button>
            </div>
            {selectedStoreId && (
                <PlaceDetailsSkeleton storeId={selectedStoreId} onClose={() => setSelectedStoreId(null)} />
            )}
        </div>
    );
};

MapHandler.propTypes = {
    geoJsonData: PropTypes.shape({
        type: PropTypes.string.isRequired,
        features: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                geometry: PropTypes.shape({
                    type: PropTypes.string.isRequired,
                    coordinates: PropTypes.array.isRequired,
                }).isRequired,
                properties: PropTypes.shape({
                    store: PropTypes.shape({
                        storeId: PropTypes.number.isRequired,
                        storeName: PropTypes.string.isRequired,
                        icon: PropTypes.string,
                        userId: PropTypes.string,
                        center: PropTypes.arrayOf(PropTypes.number),
                    }).isRequired,
                    style: PropTypes.shape({
                        fill: PropTypes.string,
                        stroke: PropTypes.string,
                        'fill-opacity': PropTypes.number,
                        'stroke-width': PropTypes.number,
                    }),
                }).isRequired,
            })
        ).isRequired,
    }).isRequired,
    streetsGeoJson: PropTypes.object,
};

export default MapHandler;
