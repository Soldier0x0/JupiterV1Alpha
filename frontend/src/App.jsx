import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles.css';

// Import tests in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/clickTest');
  import('./utils/connectionTest');
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-[#0b0c10]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;