// Legacy API compatibility - redirect to new API services
import { 
  authAPI as newAuthAPI, 
  dashboardAPI as newDashboardAPI,
  alertsAPI,
  logsAPI,
  entitiesAPI,
  intelligenceAPI,
  casesAPI,
  settingsAPI
} from '../api/services.js';

// Legacy auth API with additional methods
export const authAPI = {
  ...newAuthAPI,
  register: (data) => newAuthAPI.login(data), // Map register to login for now
  requestOTP: (data) => newAuthAPI.login(data), // Map OTP to login for now
  getTenantByName: (tenantName) => newAuthAPI.getCurrentUser(), // Map tenant lookup to current user
};

// Legacy dashboard API
export const dashboardAPI = {
  ...newDashboardAPI,
  getSystemHealth: () => newDashboardAPI.getMetrics(),
};

// Export all API services
export { 
  alertsAPI,
  logsAPI,
  entitiesAPI,
  intelligenceAPI,
  casesAPI,
  settingsAPI
};

// Legacy API compatibility
export const threatIntelAPI = intelligenceAPI;
export const automationAPI = {
  getRules: () => Promise.resolve({ data: [] }),
  createRule: (data) => Promise.resolve({ data }),
};
export const adminAPI = {
  getTenants: () => Promise.resolve({ data: [] }),
};
export const rbacAPI = {
  getRoles: () => Promise.resolve({ data: [] }),
  createRole: (data) => Promise.resolve({ data }),
  updateRole: (roleId, data) => Promise.resolve({ data }),
  deleteRole: (roleId) => Promise.resolve({ data: { id: roleId } }),
  assignUserRole: (userId, assignment) => Promise.resolve({ data: assignment }),
  getUsers: () => Promise.resolve({ data: [] }),
  getPermissions: () => Promise.resolve({ data: [] }),
};