import axios from '../lib/axios';

const financialHealthService = {
  getScore: async (userId) => {
    try {
      const response = await axios.get('/analytics/financial-health', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching financial health score:", error);
      throw error;
    }
  }
};

export default financialHealthService;
