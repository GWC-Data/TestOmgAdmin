import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://omg-temple-service-966169042016.asia-south1.run.app';
const IDENTITY_URL = import.meta.env.VITE_IDENTITY_URL || 'https://omg-identity-service-966169042016.asia-south1.run.app';

// Create temple client
export const templeClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create identity client
export const identityClient = axios.create({
  baseURL: IDENTITY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to attach interceptors
const setupInterceptors = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear auth tokens and reload page (routing will redirect to login page)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(templeClient);
setupInterceptors(identityClient);
