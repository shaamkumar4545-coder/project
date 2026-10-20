import api from '../lib/axios';

export const recurringTransactionService = {
  getAll: async (userId) => {
    const response = await api.get('/recurring-transactions', { params: { userId } });
    return response.data;
  },

  getActive: async (userId) => {
    const response = await api.get('/recurring-transactions/active', { params: { userId } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/recurring-transactions/${id}`);
    return response.data;
  },

  create: async (transaction) => {
    const response = await api.post('/recurring-transactions', transaction);
    return response.data;
  },

  update: async (id, transaction) => {
    const response = await api.put(`/recurring-transactions/${id}`, transaction);
    return response.data;
  },

  pause: async (id) => {
    const response = await api.put(`/recurring-transactions/${id}/pause`);
    return response.data;
  },

  resume: async (id) => {
    const response = await api.put(`/recurring-transactions/${id}/resume`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/recurring-transactions/${id}`);
  }
};

