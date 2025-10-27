import apiClient from './client';

export const authAPI = {
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (updates) => {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data.data;
  },
};
