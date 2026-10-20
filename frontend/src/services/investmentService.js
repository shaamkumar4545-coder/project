import api from '../lib/axios';

export const investmentService = {
  getAll: async (userId) => {
    const response = await api.get('/investments', { params: { userId } });
    return response.data;
  },

  getByType: async (userId, assetType) => {
    const response = await api.get('/investments/type', { params: { userId, assetType } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  getProfitLoss: async (id) => {
    const response = await api.get(`/investments/${id}/profit-loss`);
    return response.data;
  },

  getPortfolioSummary: async (userId) => {
    const response = await api.get('/investments/portfolio/summary', { params: { userId } });
    return response.data;
  },

  create: async (investment) => {
    const response = await api.post('/investments', investment);
    return response.data;
  },

  update: async (id, investment) => {
    const response = await api.put(`/investments/${id}`, investment);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/investments/${id}`);
  },

  getLiveStockPrices: async () => {
    const response = await api.get('/investments/stocks/live-prices');
    return response.data;
  },
  
  buyStock: async (userId, stockSymbol, quantity) => {
    const response = await api.post('/investments/stocks/buy', { userId, stockSymbol, quantity });
    return response.data;
  }
};
