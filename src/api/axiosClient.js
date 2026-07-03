import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://omg-temple-service-966169042016.asia-south1.run.app';

// Create temple client
export const templeClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
