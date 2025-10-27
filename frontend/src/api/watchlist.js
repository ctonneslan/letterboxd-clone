import apiClient from './client';

export const watchlistAPI = {
  add: async (movieId) => {
    const response = await apiClient.post('/watchlist', { movieId });
    return response.data.data;
  },

  remove: async (movieId) => {
    const response = await apiClient.delete(`/watchlist/${movieId}`);
    return response.data.data;
  },

  getAll: async (limit = 50, offset = 0) => {
    const response = await apiClient.get('/watchlist', {
      params: { limit, offset },
    });
    return response.data.data;
  },

  check: async (movieId) => {
    const response = await apiClient.get(`/watchlist/check/${movieId}`);
    return response.data.data;
  },
};
