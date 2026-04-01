import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 120000, // Increased to 2 minutes for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple token storage
let authToken = null;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add token for authentication requests
    if (!config.url?.includes('/auth/login/') && !config.url?.includes('/auth/register/')) {
      const token = authToken || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401) {
      removeAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // User registration
  register: (userData) => api.post('/api/users/auth/register/', userData),
  
  // User login
  login: (credentials) => api.post('/api/users/auth/login/', credentials),
  
  // User logout
  logout: () => api.post('/api/users/auth/logout/'),
  
  // Get user profile
  getProfile: () => api.get('/api/users/profile/'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/api/users/profile/', userData),
  
  // Get user statistics
  getUserStats: () => api.get('/api/users/stats/'),
};

// Policy API
export const policyAPI = {
  // Get all policies
  getPolicies: (params) => api.get('/api/policies/', { params }),
  
  // Get single policy
  getPolicy: (id) => api.get(`/api/policies/${id}/`),
  
  // Upload new policy
  uploadPolicy: (formData) => {
    return api.post('/api/policies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Create new policy
  createPolicy: (policyData) => {
    const formData = new FormData();
    
    // Add file if present
    if (policyData.document) {
      formData.append('document', policyData.document);
    }
    
    // Add other fields
    Object.keys(policyData).forEach(key => {
      if (key !== 'document' && policyData[key] !== undefined && policyData[key] !== null) {
        formData.append(key, policyData[key]);
      }
    });
    
    return api.post('/api/policies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update policy
  updatePolicy: (id, policyData) => {
    // For text-only updates (name, provider, policy_type), use JSON
    if (!policyData.document) {
      return api.put(`/api/policies/${id}/`, policyData);
    }
    
    // For updates with files, use FormData
    const formData = new FormData();
    
    // Add file if present
    if (policyData.document) {
      formData.append('document', policyData.document);
    }
    
    // Add other fields
    Object.keys(policyData).forEach(key => {
      if (key !== 'document' && policyData[key] !== undefined && policyData[key] !== null) {
        formData.append(key, policyData[key]);
      }
    });
    
    return api.put(`/api/policies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete policy
  deletePolicy: (id) => api.delete(`/api/policies/${id}/`),
  
  // Search policies
  searchPolicies: (params) => api.get('/api/policies/search/', { params }),
  
  // Get policy statistics
  getPolicyStats: () => api.get('/api/policies/stats/'),
  
  // Bulk delete policies
  bulkDeletePolicies: (policyIds) => api.post('/api/policies/bulk-delete/', { policy_ids: policyIds }),
};

// AI API endpoints
export const aiAPI = {
  // Extract policy details from uploaded document
  extractPolicyDetails: async (policyId) => {
    try {
      const response = await api.post(`/api/ai/extract-policy-details/${policyId}/`);
      return response.data;
    } catch (error) {
      console.error('Error extracting policy details:', error);
      throw error;
    }
  },

  // Compare two policies using AI
  comparePolicies: async (policy1Id, policy2Id) => {
    try {
      const response = await api.post('/api/ai/compare/', {
        policy1_id: policy1Id,
        policy2_id: policy2Id
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing policies:', error);
      throw error;
    }
  },

  // Get policy extraction text
  getPolicyExtraction: async (policyId) => {
    try {
      const response = await api.get(`/api/ai/policy-extraction/${policyId}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting policy extraction:', error);
      throw error;
    }
  },



  // Query specific policy
  queryPolicy: async (queryData) => {
    try {
      const response = await api.post('/api/ai/query-policy/', queryData);
      return response.data;
    } catch (error) {
      console.error('Error querying policy:', error);
      throw error;
    }
  },

  // General insurance chat
  generalChat: async (question) => {
    try {
      const response = await api.post('/api/ai/general-chat/', { question });
      return response.data;
    } catch (error) {
      console.error('Error in general chat:', error);
      throw error;
    }
  },
  
  // Get all conversations
  getConversations: async () => {
    try {
      const response = await api.get('/api/ai/conversations/');
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },
  
  // Get conversation messages
  getConversationMessages: async (conversationId) => {
    try {
      const response = await api.get(`/api/ai/conversations/${conversationId}/messages/`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  },
  
  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/api/ai/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    authToken = token;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    authToken = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = () => {
  authToken = null;
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export default api;
