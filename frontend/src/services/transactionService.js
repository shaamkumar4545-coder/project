import api from '../lib/axios';

export const transactionService = {
    // Get all transactions with optional filters
    getAll: async (userId = null, accountId = null, page = 0, size = 50) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (accountId) params.append('accountId', accountId);
        if (page) params.append('page', page);
        if (size) params.append('size', size);
        
        const queryString = params.toString();
        const url = `/transactions${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Get transaction by ID
    getById: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    // Create a new transaction
    create: async (transaction) => {
        const response = await api.post('/transactions', transaction);
        return response.data;
    },

    // Update an existing transaction
    update: async (id, transaction) => {
        const response = await api.put(`/transactions/${id}`, transaction);
        return response.data;
    },

    // Delete a transaction
    delete: async (id) => {
        await api.delete(`/transactions/${id}`);
        return true;
    },

    // Get statistics
    getStats: async (userId = null) => {
        const params = userId ? `?userId=${userId}` : '';
        const response = await api.get(`/transactions/stats${params}`);
        return response.data;
    }
};

