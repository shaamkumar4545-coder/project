import axios from 'axios';

const API_URL = 'http://localhost:8081/api/subscriptions';

export const subscriptionService = {
    getAudit: async (userId) => {
        const response = await axios.get(`${API_URL}/intelligence/${userId}`);
        return response.data;
    },
    exorciseAll: async (userId) => {
        await axios.post(`${API_URL}/exorcise/all/${userId}`);
    },
    exorcise: async (userId, title) => {
        await axios.post(`${API_URL}/exorcise/${userId}?title=${encodeURIComponent(title)}`);
    }
};

export default subscriptionService;
