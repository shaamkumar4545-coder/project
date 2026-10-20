import api from '../lib/axios';

export const analyticsService = {
  getExpenseTrend: async (userId, months = 6) => {
    const response = await api.get('/analytics/expense-trend', { params: { userId, months } });
    return response.data;
  },

  getIncomeExpenseComparison: async (userId, year, month = null) => {
    const params = { userId, year };
    if (month) params.month = month;
    const response = await api.get('/analytics/income-expense-comparison', { params });
    return response.data;
  },

  getCategoryGrowth: async (userId, months = 6) => {
    const response = await api.get('/analytics/category-growth', { params: { userId, months } });
    return response.data;
  },

  getSavingsRate: async (userId, year, month = null) => {
    const params = { userId, year };
    if (month) params.month = month;
    const response = await api.get('/analytics/savings-rate', { params });
    return response.data;
  },

  getDashboard: async (userId, months = 6, year = 2024) => {
    const response = await api.get('/analytics/dashboard', { params: { userId, months, year } });
    return response.data;
  },
  
  getBudgetInsights: async (userId) => {
    const response = await api.get('/analytics/budget-insights', { params: { userId } });
    return response.data;
  }
};

