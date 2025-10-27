import apiClient from './client';

export const moviesAPI = {
  search: async (query, page = 1) => {
    const response = await apiClient.get('/movies/search', {
      params: { q: query, page },
    });
    return response.data.data;
  },

  getDetails: async (tmdbId) => {
    const response = await apiClient.get(`/movies/${tmdbId}`);
    return response.data.data;
  },

  getPopular: async (page = 1) => {
    const response = await apiClient.get('/movies/popular', {
      params: { page },
    });
    return response.data.data;
  },

  getTrending: async (timeWindow = 'week', page = 1) => {
    const response = await apiClient.get('/movies/trending', {
      params: { timeWindow, page },
    });
    return response.data.data;
  },

  getTopRated: async (page = 1) => {
    const response = await apiClient.get('/movies/top-rated', {
      params: { page },
    });
    return response.data.data;
  },
};
