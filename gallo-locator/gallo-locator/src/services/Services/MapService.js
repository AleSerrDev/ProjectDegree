
import apiService from "../ApiConections/apiService";
import { MAP_URL } from '../../commos/conections';
import {apiKey} from "../../commos/default";

const MapService = {
    getMapByName: async (mapName,format="application/json") => {
        const response = await apiService(`${MAP_URL}/name/${mapName}`, apiKey, format).getAll();
        return response;
    },

    postSkeletonStores: async (formData, secret) => {
        try {
            console.log('Sending formData:', formData.get('mapFile'));
            const response = await apiService(`${MAP_URL}/SkeletonStores`,secret).postAudio(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading Skeleton Stores:', alert(error.message));
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            throw error;
        }
    },

    postSkeletonStreets: async (formData, secret) => {
        try {
            console.log('Sending formData:', formData.get('mapFile'));
            const response = await apiService(`${MAP_URL}/SkeletonStreats`,secret).postAudio(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading Skeleton Stores:', error.message);
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            throw error;
        }
    },

    postMaps: async (formData, secret) => {
        try {
            console.log('Sending formData:', formData.get('mapFile'));
            const response = await apiService(`${MAP_URL}`,secret).postAudio(formData);
            return response.data;
        } catch (error) {
            console.log(  console.error('Error uploading Skeleton Stores:', error.message))
            console.error('Error uploading Skeleton Stores:', alert(error.message));
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            throw error;
        }
    },

    delMapByName: async (mapName, secret) => {
        try{
            console.log(mapName, secret)
        const response = await apiService(`${MAP_URL}/name`,secret).delete(mapName);
        return response;
        }catch (error) {
            console.log(  console.error('Error uploading Skeleton Stores:', error.message))
            console.error('Error uploading Skeleton Stores:', alert(error.message));
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            throw error;
        }
    },
};

export default MapService;
