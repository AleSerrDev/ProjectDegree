// SearchWithMapService.js
import apiService from "../ApiConections/apiService";
import PropTypes from 'prop-types';
import { SEARCH_WITH_MAP_URL } from '../../commos/conections';
import {apiKey} from "../../commos/default";

const SearchWithMapService = {
    searchWithMap: async (query) => {
        try {
            const response = await apiService(SEARCH_WITH_MAP_URL,apiKey).getAll({ query });
            PropTypes.checkPropTypes(
                { data: GeoJsonPropTypes },
                { data: response },
                'prop',
                'searchWithMap'
            );
            return response;
        } catch (error) {
            console.error("Error fetching search with map data:", error);
            throw error;
        }
    },
};

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
                }).isRequired,
                product: PropTypes.shape({
                    productName: PropTypes.string.isRequired,
                    description: PropTypes.string,
                    category: PropTypes.string,
                    price: PropTypes.string,
                }),
                style: PropTypes.shape({
                    fill: PropTypes.string,
                    stroke: PropTypes.string,
                    'fill-opacity': PropTypes.number,
                    'stroke-width': PropTypes.number,
                }),
            }).isRequired,
        })
    ).isRequired,
}).isRequired;

export default SearchWithMapService;
