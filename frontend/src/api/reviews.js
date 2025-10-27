import apiClient from './client';

export const reviewsAPI = {
  create: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data.data;
  },

  getById: async (reviewId) => {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data.data;
  },

  update: async (reviewId, updates) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, updates);
    return response.data.data;
  },

  delete: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data.data;
  },

  getByMovie: async (movieId, limit = 20, offset = 0) => {
    const response = await apiClient.get(`/reviews/movie/${movieId}`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  getByUser: async (username, limit = 20, offset = 0) => {
    const response = await apiClient.get(`/reviews/user/${username}`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  like: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/like`);
    return response.data.data;
  },

  unlike: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}/like`);
    return response.data.data;
  },

  getMyMovieReview: async (movieId) => {
    const response = await apiClient.get(`/reviews/my-review/${movieId}`);
    return response.data.data;
  },
};
