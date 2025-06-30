import axios from 'axios';
import { CONFIG } from '../config/global';

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Endpoint não encontrado:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;