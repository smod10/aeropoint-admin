import axios from 'axios';

// Create a centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.aeropoint.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Automatically attach the Auth Token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aeropoint_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear storage and force re-login
      localStorage.removeItem('aeropoint_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/* 
  Example Usage in your components when ready for real data:
  
  import apiClient from '../../services/apiClient';
  
  const fetchFlights = async () => {
    try {
      const response = await apiClient.get('/flights');
      setFlights(response.data);
    } catch (error) {
      console.error("Failed to fetch flights", error);
    }
  }
*/