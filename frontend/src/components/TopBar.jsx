import React, { useState, useEffect } from 'react';
import { Bell, Search, Command, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from './JupiterIcon';
import GlobalSearch from './GlobalSearch';
import ConnectionStatus from './ConnectionStatus';

const TopBar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTestAlert = async () => {
    try {
      // This will be connected to the actual API
      console.log('Creating test alert...');
      
      // Create a test alert in localStorage for demonstration
      const testAlert = {
        _id: Date.now().toString(),
        severity: 'high',
        source: 'Manual Test',
        entity: 'Test Entity',
        message: 'Manual test alert generated from UI',
        timestamp: new Date().toISOString(),
        status: 'open'
      };
      
      // Store in localStorage to simulate API call
      const existingAlerts = JSON.parse(localStorage.getItem('test_alerts') || '[]');
      existingAlerts.unshift(testAlert);
      localStorage.setItem('test_alerts', JSON.stringify(existingAlerts));
      
      // Show success message
      alert('Test alert created successfully!');
      
      // In a real app, you would call the API here
      // await alertsAPI.createAlert({
      //   severity: 'high',
      //   source: 'Manual Test',
      //   entity: 'Test Entity',
      //   message: 'Manual test alert generated from UI'
      // });
    } catch (error) {
      console.error('Failed to create test alert:', error);
      alert('Failed to create test alert');
    }
  };

  return (
    <>
      <div className="bg-background-secondary border-b border-neutral-800 p-4 flex justify-between items-center">
        {/* Left Side - Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center space-x-3 bg-background-primary px-4 py-2.5 rounded-lg border border-neutral-700 max-w-md hover:border-neutral-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label="Open global search (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-neutral-500 group-hover:text-neutral-400" aria-hidden="true" />
            <span className="text-neutral-500 group-hover:text-neutral-400">Search everything...</span>
            <div className="flex items-center space-x-1 text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded" aria-hidden="true">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Center - Connection Status */}
        <div className="hidden md:flex items-center space-x-6">
          <ConnectionStatus showDetails={false} />
        </div>

        {/* Right Side - Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Test Alert Button */}
          <button
            onClick={handleTestAlert}
            className="bg-warning-500/10 hover:bg-warning-500/20 text-warning-500 px-4 py-2 rounded-lg border border-warning-500/30 hover:border-warning-500/50 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
          >
            <JupiterIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Test Alert</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-neutral-800 rounded-lg transition-all duration-200">
            <Bell className="w-5 h-5 text-neutral-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full border-2 border-background-secondary"></div>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded-lg transition-all duration-200"
            >
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email[0].toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-neutral-200">{user?.email}</p>
                <p className="text-xs text-neutral-500">
                  {user?.is_owner ? 'Administrator' : 'User'}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-background-secondary border border-neutral-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                <div className="p-2">
                  <button 
                    onClick={() => {
                      // Navigate to profile settings or open modal
                      console.log('Profile settings clicked');
                      alert('Profile settings functionality coming soon!');
                    }}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-neutral-800 rounded-lg transition-all duration-200 text-left"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300 text-sm">Profile Settings</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-danger-500/10 rounded-lg transition-all duration-200 text-left text-danger-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </>
  );
};

export default TopBar;