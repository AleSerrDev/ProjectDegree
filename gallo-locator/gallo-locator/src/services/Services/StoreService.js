// StoreService.js
import apiService from "../ApiConections/apiService";
import PropTypes from 'prop-types';
import {MAP_URL, STORE_MAP_URL} from '../../commos/conections';
import { STORE_URL } from '../../commos/conections';
import {apiKey} from "../../commos/default";

const StoreService = {
    getStoresMapData: async () => {
        try {
            const response = await apiService(STORE_MAP_URL,apiKey).getAll();
            PropTypes.checkPropTypes(
                { data: GeoJsonPropTypes },
                { data: response },
                'prop',
                'getStoresMapData'
            );
            return response;
        } catch (error) {
            console.error("Error fetching store map data:", error);
            throw error;
        }
    },

    createStore: async (storeData) => {
        try {
            const response = await apiService(STORE_URL, apiKey).post(storeData);
            PropTypes.checkPropTypes(
                StorePropTypes,
                response,
                'prop',
                'createStore'
            );
            return response;
        } catch (error) {
            console.error("Error creating store:", error);
            throw error;
        }
    },
};


export const getStore = {
    getStoreById: async (storeId) => {
        try {
            const response = await apiService(STORE_URL, apiKey).getById(storeId);

            PropTypes.checkPropTypes(
                StorePropTypes,
                response,
                'prop',
                'getStoreById'
            );

            return response;
        } catch (error) {
            console.error(`Error fetching store data for storeId ${storeId}:`, error);
            throw error;
        }
    },
};

const StorePropTypes = PropTypes.shape({
    storeId: PropTypes.number.isRequired,
    storeName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    icon: PropTypes.string,
    userId: PropTypes.string.isRequired,
}).isRequired;

const GeoJsonPropTypes = PropTypes.shape({
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
                    center: PropTypes.arrayOf(PropTypes.number).isRequired,
                }).isRequired,
                style: PropTypes.any,
            }).isRequired,
        })
    ).isRequired,
}).isRequired;

export default StoreService;
