import axios from 'axios';

// Base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
console.log("SimpleAPI: Using API URL:", API_URL);

// Simple API functions without interceptors
const simpleApi = {
  // Auth functions
  login: async (credentials) => {
    console.log("SimpleAPI: login called with:", credentials);
    try {
      const response = await axios.post(`${API_URL}/api/user/login`, credentials);
      console.log("SimpleAPI: login response:", response.data);
      return response;
    } catch (error) {
      console.error("SimpleAPI: login error:", error);
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    console.log("SimpleAPI: forgotPassword called with email:", email);
    try {
      const response = await axios.post(`${API_URL}/api/user/forgot-password`, { email });
      console.log("SimpleAPI: forgotPassword response:", response.data);
      return response;
    } catch (error) {
      console.error("SimpleAPI: forgotPassword error:", error);
      throw error;
    }
  },
  
  // Direct fetch version (no axios)
  forgotPasswordFetch: async (email) => {
    console.log("SimpleAPI: forgotPasswordFetch called with email:", email);
    try {
      const response = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log("SimpleAPI: forgotPasswordFetch response:", data);
      
      return { 
        data,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      console.error("SimpleAPI: forgotPasswordFetch error:", error);
      throw error;
    }
  }
};

export default simpleApi;
