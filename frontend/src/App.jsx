import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';

// Simple components to avoid import issues
const LandingPage = () => (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">Jupiter SIEM</h1>
      <p className="text-zinc-400 mb-8">Security Information and Event Management Platform</p>
      <a href="/login" className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium">
        Login to Dashboard
      </a>
    </div>
  </div>
);

const Login = () => (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center">
    <div className="bg-zinc-800 p-8 rounded-xl max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <p className="text-zinc-400 text-center">Login functionality available in full app</p>
      <div className="mt-6">
        <a href="/dashboard" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg font-medium block text-center">
          Continue to Dashboard
        </a>
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Jupiter SIEM Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">API Rate Limits</h3>
          <p className="text-zinc-400 mb-4">Monitor and manage API rate limits for threat intelligence services</p>
          <a href="/dashboard/api-rate-limits" className="text-yellow-400 hover:text-yellow-300">
            View API Limits →
          </a>
        </div>
        <div className="bg-zinc-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Threat Intelligence</h3>
          <p className="text-zinc-400">Real-time threat data and analytics</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Security Events</h3>
          <p className="text-zinc-400">Monitor security events and incidents</p>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-900 text-zinc-200">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;