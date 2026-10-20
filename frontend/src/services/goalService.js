import axios from 'axios';

const API_URL = 'http://localhost:8081/api/goals';

export const goalService = {
    getGoals: async (userId) => {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
    },
    create: async (goal) => {
        const response = await axios.post(API_URL, goal);
        return response.data;
    },
    getProjection: async (id, extraMonthly = 0, lumpSum = 0) => {
        const response = await axios.get(`${API_URL}/${id}/projection`, {
            params: { extraMonthly, lumpSum }
        });
        return response.data;
    },
    delete: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};

export default goalService;
