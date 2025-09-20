import apiClient from './client.js';

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: () => apiClient.get('/dashboard/overview'),
  
  // Get system metrics
  getMetrics: (timeRange = '24h') => apiClient.get('/dashboard/metrics', { timeRange }),
  
  // Get recent activity
  getActivity: (limit = 10) => apiClient.get('/dashboard/activity', { limit }),
};

// Alerts API
export const alertsAPI = {
  // Get alerts with filtering
  getAlerts: (params = {}) => apiClient.get('/alerts', params),
  
  // Get alert by ID
  getAlert: (id) => apiClient.get(`/alerts/${id}`),
  
  // Update alert status
  updateAlert: (id, data) => apiClient.patch(`/alerts/${id}`, data),
  
  // Resolve alert
  resolveAlert: (id) => apiClient.patch(`/alerts/${id}`, { status: 'resolved' }),
  
  // Create test alert
  createTestAlert: (data) => apiClient.post('/alerts/test', data),
  
  // Get alert statistics
  getStats: (timeRange = '24h') => apiClient.get('/alerts/stats', { timeRange }),
};

// Logs API
export const logsAPI = {
  // Search logs
  search: (query, params = {}) => apiClient.post('/logs/search', { query, ...params }),
  
  // Get log sources
  getSources: () => apiClient.get('/logs/sources'),
  
  // Get log statistics
  getStats: (timeRange = '24h') => apiClient.get('/logs/stats', { timeRange }),
  
  // Export logs
  export: (query, format = 'json') => apiClient.post('/logs/export', { query, format }),
};

// Entities API
export const entitiesAPI = {
  // Get entities
  getEntities: (params = {}) => apiClient.get('/entities', params),
  
  // Get entity by ID
  getEntity: (id) => apiClient.get(`/entities/${id}`),
  
  // Update entity
  updateEntity: (id, data) => apiClient.patch(`/entities/${id}`, data),
  
  // Get entity statistics
  getStats: () => apiClient.get('/entities/stats'),
};

// Intelligence API
export const intelligenceAPI = {
  // Get IOCs
  getIOCs: (params = {}) => apiClient.get('/intelligence/iocs', params),
  
  // Create IOC
  createIOC: (data) => apiClient.post('/intelligence/iocs', data),
  
  // Update IOC
  updateIOC: (id, data) => apiClient.patch(`/intelligence/iocs/${id}`, data),
  
  // Delete IOC
  deleteIOC: (id) => apiClient.delete(`/intelligence/iocs/${id}`),
  
  // Lookup threat intelligence
  lookupThreat: (indicator, type) => apiClient.post('/intelligence/lookup', { indicator, type }),
  
  // Get threat feeds
  getFeeds: () => apiClient.get('/intelligence/feeds'),
};

// Cases API
export const casesAPI = {
  // Get cases
  getCases: (params = {}) => apiClient.get('/cases', params),
  
  // Get case by ID
  getCase: (id) => apiClient.get(`/cases/${id}`),
  
  // Create case
  createCase: (data) => apiClient.post('/cases', data),
  
  // Update case
  updateCase: (id, data) => apiClient.patch(`/cases/${id}`, data),
  
  // Close case
  closeCase: (id) => apiClient.patch(`/cases/${id}`, { status: 'closed' }),
  
  // Get case statistics
  getStats: () => apiClient.get('/cases/stats'),
};

// Settings API
export const settingsAPI = {
  // Get user settings
  getUserSettings: () => apiClient.get('/settings/user'),
  
  // Update user settings
  updateUserSettings: (data) => apiClient.patch('/settings/user', data),
  
  // Get system settings
  getSystemSettings: () => apiClient.get('/settings/system'),
  
  // Update system settings
  updateSystemSettings: (data) => apiClient.patch('/settings/system', data),
  
  // Get log collection settings
  getLogCollection: () => apiClient.get('/settings/log-collection'),
  
  // Update log collection settings
  updateLogCollection: (data) => apiClient.patch('/settings/log-collection', data),
};

// Authentication API
export const authAPI = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Refresh token
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  // Get current user
  getCurrentUser: () => apiClient.get('/auth/me'),
  
  // Change password
  changePassword: (data) => apiClient.patch('/auth/password', data),
};
