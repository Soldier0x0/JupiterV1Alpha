import React, { useState, useEffect } from 'react';
import APIRateLimitsSimple from './pages/APIRateLimitsSimple';

const SimpleApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Simple client-side routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPage(hash || 'home');
    };
    
    handleHashChange(); // Set initial page
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'api-rate-limits':
        return <APIRateLimitsSimple />;
      case 'dashboard':
        return <Dashboard />;
      case 'login':
        return <Login />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200">
      {renderPage()}
    </div>
  );
};

const Home = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">Jupiter SIEM</h1>
      <p className="text-zinc-400 mb-8">Security Information and Event Management Platform</p>
      <div className="space-x-4">
        <a href="#login" className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium">
          Login
        </a>
        <a href="#dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium">
          Dashboard
        </a>
      </div>
    </div>
  </div>
);

const Login = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-zinc-800 p-8 rounded-xl max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <div className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg"
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg"
        />
        <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-medium">
          Login
        </button>
      </div>
      <div className="mt-6 text-center">
        <a href="#dashboard" className="text-yellow-400 hover:text-yellow-300">
          Continue to Dashboard →
        </a>
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="min-h-screen p-8">
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">Jupiter SIEM Dashboard</h1>
        <nav className="space-x-4">
          <a href="#dashboard" className="text-zinc-300 hover:text-white">Home</a>
          <a href="#api-rate-limits" className="text-zinc-300 hover:text-white">API Limits</a>
        </nav>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-2 text-yellow-400">API Rate Limits</h3>
          <p className="text-zinc-400 mb-4">Monitor and manage API rate limits for threat intelligence services</p>
          <a href="#api-rate-limits" className="text-yellow-400 hover:text-yellow-300 font-medium">
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

export default SimpleApp;