import axios from 'axios';

const API_URL = 'http://localhost:8081/api/investments/esg-insights';

export const esgService = {
    getESGInsights: async (userId) => {
        const response = await axios.get(`${API_URL}/${userId}`);
        return response.data;
    },
    getGreenFunds: async () => {
        const response = await axios.get(`${API_URL}/green-funds`);
        return response.data;
    }
};

export default esgService;
