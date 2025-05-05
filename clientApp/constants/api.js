import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = "http://172.20.10.6:1010";
console.log('api.js: API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    if (error.message.includes('Network Error')) {
      console.error('API Network Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      });
    }
    return Promise.reject(error);
  }
);

export const signup = (email, password, confirmPassword, phoneNumber) =>
  api.post('/api/auth/signup', { email, password, confirmPassword, phoneNumber });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getProfile = (token) =>
  api.get('/api/auth/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (token, updates) =>
  api.put('/api/auth/dashboard', updates, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;