import api from '../lib/axios';

export const reportService = {
  getYearWiseComparison: async (userId, startYear, endYear) => {
    const response = await api.get('/reports/year-wise-comparison', {
      params: { userId, startYear, endYear }
    });
    return response.data;
  },

  getNetWorthGrowth: async (userId, startYear, endYear) => {
    const response = await api.get('/reports/net-worth-growth', {
      params: { userId, startYear, endYear }
    });
    return response.data;
  },

  getTaxHistory: async (userId, startYear, endYear) => {
    const response = await api.get('/reports/tax-history', {
      params: { userId, startYear, endYear }
    });
    return response.data;
  },

  getComprehensiveReport: async (userId, year) => {
    const response = await api.get('/reports/comprehensive', {
      params: { userId, year }
    });
    return response.data;
  }
};

