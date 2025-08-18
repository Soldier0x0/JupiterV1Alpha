import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles.css';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-cosmic-black">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;