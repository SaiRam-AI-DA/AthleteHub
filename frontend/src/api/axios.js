import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 60000, // Global timeout of 60 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors and 401s
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized globally
      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Dispatch a custom event so the AuthContext can listen and update state
        window.dispatchEvent(new Event('auth:unauthorized'));
        
        // If we are not already on the login page, redirect
        if (window.location.pathname !== '/login') {
            window.location.href = '/login?session_expired=true';
        }
      }
    }
    
    // Standardize error message throwing
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
