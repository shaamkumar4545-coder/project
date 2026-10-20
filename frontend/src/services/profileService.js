import api from '../lib/axios';

export const profileService = {
    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put('/profile', profileData);
        return response.data;
    }
};

