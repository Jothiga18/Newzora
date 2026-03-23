import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Get all news articles
 */
export const getNews = async () => {
  const response = await api.get('/api/news');
  return response.data;
};

/**
 * Get news by ID
 */
export const getNewsById = async (id) => {
  const response = await api.get(`/api/news/${id}`);
  return response.data;
};

/**
 * Create a new discussion room
 */
export const createRoom = async (data) => {
  const response = await api.post('/api/rooms/create', data);
  return response.data;
};

/**
 * Join an existing room
 */
export const joinRoom = async (data) => {
  const response = await api.post('/api/rooms/join', data);
  return response.data;
};

/**
 * Leave a room
 */
export const leaveRoom = async (data) => {
  const response = await api.post('/api/rooms/leave', data);
  return response.data;
};

/**
 * Get room details
 */
export const getRoom = async (roomId) => {
  const response = await api.get(`/api/rooms/${roomId}`);
  return response.data;
};

/**
 * Get Agora token
 */
export const getAgoraToken = async (roomId, userId, role = 'host') => {
  const response = await api.get('/api/agora/token', {
    params: { roomId, userId, role },
  });
  return response.data;
};

export default api;
