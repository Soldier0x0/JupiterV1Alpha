import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './styles/globals.css';

function App() {
  // Simple auth check - in production, this would be more sophisticated
  const isAuthenticated = localStorage.getItem('jupiter_token');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;