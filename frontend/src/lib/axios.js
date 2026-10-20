import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Log API base URL for debugging (only in development)
if (import.meta.env.DEV) {
    console.log('🔗 API Base URL:', apiBaseUrl);
}

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


// Add request interceptor for logging and adding auth token
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (import.meta.env.DEV) {
            console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging and handling auth errors
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log('📥 API Response:', response.status, response.config.url);
        }
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
        });
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
