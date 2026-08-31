import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { profilePlaceholder } from '../lib/profilePlaceholder';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial state from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        // Merge placeholder data for profile completeness until backend is fully integrated
        const enrichedUser = { ...profilePlaceholder, ...user };
        setCurrentUser(enrichedUser);
        setCurrentRole(user.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        logout();
      }
    }
    
    setIsLoading(false);

    // Listen for global unauthorized events from Axios
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      // Because we use the custom api, standard error handling is already managed
      const response = await api.post('/auth/login', { email, password });
      const result = response.data;
      
      const { access_token, refresh_token, user } = result.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      const enrichedUser = { ...profilePlaceholder, ...user };
      setCurrentUser(enrichedUser);
      setCurrentRole(user.role);
      setIsAuthenticated(true);
      
      return { success: true, user: enrichedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Clear context state
    setCurrentUser(null);
    setCurrentRole(null);
    setIsAuthenticated(false);
    
    // NOTE: If React Query or permissions cache is used, clear them here.
    // Example: queryClient.clear();
    
    // Redirect preventing back navigation
    navigate('/login', { replace: true });
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      const enrichedUser = { ...profilePlaceholder, ...user };
      
      setCurrentUser(enrichedUser);
      return { success: true, user: enrichedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    currentRole,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
