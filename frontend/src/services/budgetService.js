import api from '../lib/axios';

export const budgetService = {
  getAll: async (userId) => {
    const response = await api.get('/budgets', { params: { userId } });
    return response.data;
  },

  getByMonth: async (userId, month, year) => {
    const response = await api.get('/budgets/month', { params: { userId, month, year } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  getWithAlerts: async (id) => {
    const response = await api.get(`/budgets/${id}/with-alerts`);
    return response.data;
  },

  getAlerts: async (userId) => {
    const response = await api.get('/budgets/alerts', { params: { userId } });
    return response.data;
  },

  create: async (budget) => {
    const response = await api.post('/budgets', budget);
    return response.data;
  },

  update: async (id, budget) => {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/budgets/${id}`);
  }
};
