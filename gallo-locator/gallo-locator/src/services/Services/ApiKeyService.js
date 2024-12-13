import { API_KEY_GENERATE_URL } from "../../commos/conections";
import apiService from "../ApiConections/apiService";
import PropTypes from 'prop-types';

const apiKeyResponseShape = PropTypes.shape({
    keyValue: PropTypes.string.isRequired,
    expiresAt: PropTypes.string.isRequired,
});

const apiKeyService = {
    postApiKey: async (body = { UserId: 'user123' }) => {
        try {
            const response = await apiService(API_KEY_GENERATE_URL).post(body);

            PropTypes.checkPropTypes(
                { data: apiKeyResponseShape },
                { data: response },
                'response data',
                'apiKeyService'
            );


            return response;
        } catch (error) {
            console.error('Error generating API key:', error.message);
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            throw error;
        }
    }
};

export default apiKeyService;
