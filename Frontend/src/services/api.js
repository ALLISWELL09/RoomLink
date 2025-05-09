import axios from 'axios';

// Base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
console.log("API Service: Using API URL:", API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000, // 10 seconds
});

// Add request interceptor to include auth token when needed
api.interceptors.request.use(
  (config) => {
    console.log("API Service: Request interceptor - URL:", config.url);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Service: Added auth token to request");
    }

    console.log("API Service: Request config:", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error("API Service: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Service: Response interceptor - Success:", {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Service: Response interceptor - Error:', error);

    // You can add global error handling here
    if (error.response) {
      // Server responded with an error status
      console.error('API Service: Server Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Service: Network Error:', {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      // Something else happened
      console.error('API Service: Other Error:', {
        message: error.message,
        config: error.config
      });
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => {
    console.log("authAPI.login called with:", credentials);
    return api.post('/api/user/login', credentials);
  },

  register: (userData) => {
    console.log("authAPI.register called");
    return api.post('/api/user/register', userData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  forgotPassword: (email) => {
    console.log("authAPI.forgotPassword called with email:", email);
    return api.post('/api/user/forgot-password', { email });
  },

  resetPassword: (token, password) => {
    console.log("authAPI.resetPassword called with token:", token);
    return api.post(`/api/user/reset-password/${token}`, { password });
  },

  logout: () => {
    console.log("authAPI.logout called");
    return api.get('/api/user/logout');
  },
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (userData) => api.put('/api/user/profile/update', userData),
  getBookedRooms: () => api.get('/api/user/booked'),
};

// Room API calls
export const roomAPI = {
  getAllRooms: () => api.post('/api/room/getRooms'),
  getRoomById: (id) => api.get(`/api/room/getRoomsById/${id}`),
};

// Payment API calls
export const paymentAPI = {
  createOrder: (data) => api.post('/api/payment/order', data),
};

export default api;
