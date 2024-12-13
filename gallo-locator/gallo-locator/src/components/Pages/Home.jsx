import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import MapHandler from "../Map/MapHandler";
import StoreService from "../../services/Services/StoreService";
import SearchWithMapService from "../../services/Services/SearchWithMapService";
import SearchBar from '../Components/SearchBar';
import MapService from "../../services/Services/MapService";
import PlaceholderUI from "../Components/ServicePlaceHolder/PlaceholderUI";

const Home = () => {
    const [storeData, setStoreData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchData, setSearchData] = useState(null);
    const [streetsGeoJson, setStreetsGeoJson] = useState(null);
    const [isPlaceholderOpen, setIsPlaceholderOpen] = useState(false); // Track if Placeholder is open

    const fetchStoreData = useCallback(async () => {
        try {
            const data = await StoreService.getStoresMapData();
            setStoreData(data);
        } catch (error) {
            console.error("Error loading store data:", error);
        }
    }, []);

    const fetchStreetsData = useCallback(async () => {
        try {
            const streetsData = await MapService.getMapByName("Streats");
            const parsedMapText = JSON.parse(streetsData.mapText);
            setStreetsGeoJson(parsedMapText);
        } catch (error) {
            console.error("Error loading streets data:", error);
        }
    }, []);

    useEffect(() => {
        fetchStoreData();
        fetchStreetsData();
    }, [fetchStoreData, fetchStreetsData]);

    const normalizeSearchTerm = (term) => term.trim();

    useEffect(() => {
        const normalizedTerm = normalizeSearchTerm(searchTerm);

        if (!normalizedTerm) {
            setSearchData(null);
            console.log("Search term is empty after normalization. Showing default store data.");
            return;
        }

        const fetchSearchData = async () => {
            try {
                const data = await SearchWithMapService.searchWithMap(normalizedTerm);
                console.log("Search data fetched:", data);
                setSearchData(data);
            } catch (error) {
                console.error("Error fetching search data:", error);
            }
        };

        fetchSearchData();
    }, [searchTerm]);

    const geoJsonData = searchData || storeData;

    const handleSearchTermChange = useCallback((value) => {
        const trimmedValue = value.trimStart();
        console.log("Setting search term to:", trimmedValue);
        setSearchTerm(trimmedValue);

        if (!trimmedValue) {
            console.log("Clearing search data because search term is empty.");
            setSearchData(null);
        }
    }, []);

    return (
        <Box position="absolute" top="64px" left={0} height="calc(100vh - 64px)" width="100vw" display="flex">
            {/* PlaceholderUI on the left */}
            <PlaceholderUI
                searchTerm={searchTerm}
                setSearchTerm={handleSearchTermChange}
                searchData={searchData}
                isPlaceholderOpen={isPlaceholderOpen}
                setIsPlaceholderOpen={setIsPlaceholderOpen}
            />

            {/* SearchBar fixed in the top left corner, hidden when PlaceholderUI is open */}
            {!isPlaceholderOpen && (
                <Box position="absolute" top="20px" left="20px" zIndex={1500}>
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={handleSearchTermChange}
                        products={searchData ? searchData.features.map(feature => feature.properties.product) : []}
                    />
                </Box>
            )}

            {/* Map container */}
            <Box flex={1} position="relative">
                {/* MapHandler */}
                {geoJsonData && <MapHandler geoJsonData={geoJsonData} streetsGeoJson={streetsGeoJson} />}
            </Box>
        </Box>
    );
};

Home.propTypes = {
    streetsGeoJson: PropTypes.shape({
        type: PropTypes.string.isRequired,
        features: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                geometry: PropTypes.shape({
                    type: PropTypes.string.isRequired,
                    coordinates: PropTypes.array.isRequired,
                }).isRequired,
                properties: PropTypes.object,
            })
        ).isRequired,
    }),
};

export default Home;
