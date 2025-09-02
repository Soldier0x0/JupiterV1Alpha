import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles.css';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-900 text-zinc-200">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;