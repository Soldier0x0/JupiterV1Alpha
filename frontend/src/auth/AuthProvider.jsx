import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

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
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setTenant(tenantId);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, otp, tenantId) => {
    try {
      const response = await authAPI.login({ email, otp, tenant_id: tenantId });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('JWT', token);
      localStorage.setItem('TENANT_ID', userData.tenant_id);
      localStorage.setItem('USER_DATA', JSON.stringify(userData));
      
      setUser(userData);
      setTenant(userData.tenant_id);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const requestOTP = async (email, tenantId) => {
    try {
      await authAPI.requestOTP({ email, tenant_id: tenantId });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to send OTP' 
      };
    }
  };

  const register = async (email, tenantName, isOwner = false) => {
    try {
      await authAPI.register({ 
        email, 
        tenant_name: tenantName, 
        is_owner: isOwner 
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
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
    login,
    logout,
    register,
    requestOTP,
    isAuthenticated: !!user,
    isOwner: user?.is_owner || false
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