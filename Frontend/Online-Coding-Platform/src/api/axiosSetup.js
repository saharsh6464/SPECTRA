import axios from 'axios';

// Default to local Spring Boot server (port 8080) or custom environment variable
const baseURL = 'https://96vznzfx-8080.inc1.devtunnels.ms/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;