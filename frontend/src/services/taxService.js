import api from '../lib/axios';

export const taxService = {
  calculateOldRegime: async (annualIncome, deductions) => {
    const response = await api.post('/tax/calculate/old-regime', deductions, {
      params: { annualIncome }
    });
    return response.data;
  },

  calculateNewRegime: async (annualIncome) => {
    const response = await api.post('/tax/calculate/new-regime', null, {
      params: { annualIncome }
    });
    return response.data;
  },

  compareRegimes: async (annualIncome, deductions) => {
    const response = await api.post('/tax/compare', deductions, {
      params: { annualIncome }
    });
    return response.data;
  }
};

