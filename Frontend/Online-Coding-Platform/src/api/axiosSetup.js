import axios from 'axios';

// Default to local Spring Boot server (port 8080) or custom environment variable
export const API_BASE_URL = 'https://td5g7npg-8080.inc1.devtunnels.ms/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;