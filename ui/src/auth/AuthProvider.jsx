import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('JWT');
    const tenantId = localStorage.getItem('TENANT_ID');

    if (token && tenantId) {
      setUser({ token });
      setTenant(tenantId);
    }
  }, []);

  const login = (token, tenantId) => {
    localStorage.setItem('JWT', token);
    localStorage.setItem('TENANT_ID', tenantId);
    setUser({ token });
    setTenant(tenantId);
  };

  const logout = () => {
    localStorage.removeItem('JWT');
    localStorage.removeItem('TENANT_ID');
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
