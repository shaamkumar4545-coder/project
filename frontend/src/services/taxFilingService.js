import api from '../lib/axios';

export const taxFilingService = {
  // Create a new filing
  createFiling: async (data) => {
    const response = await api.post('/tax-filing', data);
    return response.data;
  },

  // Get all filings for the logged-in user
  getFilings: async () => {
    const response = await api.get('/tax-filing');
    return response.data;
  },

  // Get a single filing by ID
  getFilingById: async (id) => {
    const response = await api.get(`/tax-filing/${id}`);
    return response.data;
  },

  // Update a filing
  updateFiling: async (id, data) => {
    const response = await api.put(`/tax-filing/${id}`, data);
    return response.data;
  },

  // Delete a filing
  deleteFiling: async (id) => {
    const response = await api.delete(`/tax-filing/${id}`);
    return response.data;
  },

  // Auto-populate income from transactions
  autoPopulate: async (financialYear) => {
    const response = await api.get('/tax-filing/auto-populate', {
      params: { financialYear }
    });
    return response.data;
  },

  // Compute tax for a filing
  computeTax: async (id) => {
    const response = await api.post(`/tax-filing/${id}/compute`);
    return response.data;
  },

  // Get filing summary
  getSummary: async (id) => {
    const response = await api.get(`/tax-filing/${id}/summary`);
    return response.data;
  },

  // Submit filing
  submitFiling: async (id) => {
    const response = await api.post(`/tax-filing/${id}/submit`);
    return response.data;
  }
};
