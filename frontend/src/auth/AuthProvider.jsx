import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('JWT');
    const tenantId = localStorage.getItem('TENANT_ID');
    const userData = localStorage.getItem('USER_DATA');

    if (token && tenantId && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setTenant(tenantId);
      console.log('User authenticated from localStorage:', parsedUser);
    }

    setLoading(false);
  }, []);

  // ✅ Password-based login (matches backend)
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;

      // Save auth info
      localStorage.setItem('JWT', data.access_token);
      localStorage.setItem('TENANT_ID', data.tenant_id);
      localStorage.setItem('USER_DATA', JSON.stringify(data.user));

      setUser(data.user);
      setTenant(data.tenant_id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  };

  const register = async (email, tenantName, isOwner = false) => {
    try {
      await authAPI.register({
        email,
        tenant_name: tenantName,
        is_owner: isOwner,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('JWT');
    localStorage.removeItem('TENANT_ID');
    localStorage.removeItem('USER_DATA');
    setUser(null);
    setTenant(null);
    window.location.href = '/';
  };

  const value = {
    user,
    tenant,
    loading,
    login,          // ✅ only one login
    logout,
    register,
    isAuthenticated: !!user,
    isOwner: user?.is_owner || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
