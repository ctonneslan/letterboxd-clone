import apiClient from './client';

export const reviewsAPI = {
  create: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  getById: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  },

  update: async (reviewId, updates) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, updates);
    return response.data;
  },

  delete: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  getByMovie: async (movieId, limit = 20, offset = 0) => {
    const response = await apiClient.get(`/reviews/movie/${movieId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  getByUser: async (username, limit = 20, offset = 0) => {
    const response = await apiClient.get(`/reviews/user/${username}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  like: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/like`);
    return response.data;
  },

  unlike: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}/like`);
    return response.data;
  },
};
