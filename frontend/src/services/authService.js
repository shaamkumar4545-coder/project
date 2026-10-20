import api from '../lib/axios';

export const authService = {
    // Register a new user
    register: async (name, email, password) => {
        const response = await api.post('/auth/register', {
            name,
            email,
            password
        });
        return response.data;
    },

    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });
        return response.data;
    },

    // Store token in localStorage
    setToken: (token) => {
        localStorage.setItem('authToken', token);
        // Update axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem('authToken');
    },

    // Remove token from localStorage
    removeToken: () => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    // Initialize auth token if exists
    initAuth: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
};

// Initialize auth on module load
authService.initAuth();

