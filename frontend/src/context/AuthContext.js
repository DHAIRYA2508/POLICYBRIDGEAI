import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, removeAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false since we don't auto-login

  // Check if user is logged in on app start (but don't auto-login)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      // Only set the token and user if they exist, but don't validate with server
      if (token && userData) {
        try {
          setAuthToken(token);
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          removeAuthToken();
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Add event listener for tab close/refresh to auto-logout
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear authentication data when tab is closed or refreshed
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      removeAuthToken();
    };

    const handleVisibilityChange = () => {
      // Only clear authentication data when tab becomes hidden AND user is not actively logged in
      // This prevents clearing data during normal app usage
      if (document.hidden && !user) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        removeAuthToken();
        setUser(null);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]); // Add user as dependency to prevent stale closure

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      const { access, user: userData } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(access);
      setUser(userData);
      
      toast.success('Welcome back! Login successful.');
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Get the most specific error message available
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.status === 401) {
        errorMessage = 'Wrong email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid login information. Please check your email and password.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Function to validate existing token with server
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      setAuthToken(token);
      const response = await authAPI.getProfile();
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid token
      removeAuthToken();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return false;
    }
  };

  // Function to check if user should be redirected to login
  const requireAuth = async () => {
    if (!user) {
      const isValid = await validateToken();
      if (!isValid) {
        // Redirect to login if no valid token
        window.location.href = '/login';
        return false;
      }
    }
    return true;
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { access, user: newUser } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(newUser));
      setAuthToken(access);
      setUser(newUser);
      
      toast.success('Account created successfully! Welcome to PolicyBridge AI.');
      return { success: true };
    } catch (error) {
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Get the most specific error message available
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.email && Array.isArray(error.response.data.email)) {
        errorMessage = error.response.data.email[0];
      } else if (error.response?.data?.username && Array.isArray(error.response.data.username)) {
        errorMessage = error.response.data.username[0];
      } else if (error.response?.data?.password && Array.isArray(error.response.data.password)) {
        errorMessage = error.response.data.password[0];
      } else if (error.response?.data?.password_confirm && Array.isArray(error.response.data.password_confirm)) {
        errorMessage = error.response.data.password_confirm[0];
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid registration information. Please check your details and try again.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (user) {
        await authAPI.logout();
      }
    } catch (error) {
      // Logout error handled silently
    } finally {
      setUser(null);
      removeAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully.');
      
      // Force redirect to home page
      window.location.href = '/';
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const response = await authAPI.updateProfile(updatedUser);
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    validateToken,
    requireAuth,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
