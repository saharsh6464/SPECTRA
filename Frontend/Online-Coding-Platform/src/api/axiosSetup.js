import axios from 'axios';

// Create instance
const axiosInstance = axios.create({
  baseURL: 'https://96vznzfx-8080.inc1.devtunnels.ms/api', // Replace with your real backend API
  timeout: 10000,
  withCredentials: true, // Allow cookies / auth headers to be sent cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;