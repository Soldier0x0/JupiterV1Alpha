import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('JWT');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('JWT');
      localStorage.removeItem('TENANT_ID');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  requestOTP: (data) => api.post('/auth/request-otp', data),
  login: (data) => api.post('/auth/login', data),
};

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getSystemHealth: () => api.get('/system/health'),
};

export const alertsAPI = {
  getAlerts: (params = {}) => api.get('/alerts', { params }),
  createAlert: (data) => api.post('/alerts', data),
};

export const threatIntelAPI = {
  getIOCs: () => api.get('/threat-intel/iocs'),
  createIOC: (data) => api.post('/threat-intel/iocs', data),
  lookupThreat: (indicator, type) => api.post('/threat-intel/lookup', { indicator, ioc_type: type }),
};

export const automationAPI = {
  getRules: () => api.get('/automations'),
  createRule: (data) => api.post('/automations', data),
};

export const settingsAPI = {
  getAPIKeys: () => api.get('/settings/api-keys'),
  saveAPIKey: (data) => api.post('/settings/api-keys', data),
};

export const adminAPI = {
  getTenants: () => api.get('/admin/tenants'),
};

export const casesAPI = {
  getCases: () => api.get('/cases'),
};

export default api;