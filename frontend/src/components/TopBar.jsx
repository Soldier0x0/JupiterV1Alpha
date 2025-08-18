import React, { useState, useEffect } from 'react';
import { Bell, Search, Command, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from './JupiterIcon';
import GlobalSearch from './GlobalSearch';

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
      // await alertsAPI.createAlert({
      //   severity: 'high',
      //   source: 'Manual Test',
      //   entity: 'Test Entity',
      //   message: 'Manual test alert generated from UI'
      // });
    } catch (error) {
      console.error('Failed to create test alert:', error);
    }
  };

  return (
    <div className="bg-[#111214] border-b border-red-600/20 p-4 flex justify-between items-center">
      {/* Left Side - Search */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-[#0b0c10] px-4 py-2 rounded-lg border border-zinc-700 max-w-md hover:border-zinc-600 transition-colors duration-200">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search logs, alerts, IOCs..."
            className="bg-transparent flex-1 text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
          <div className="flex items-center space-x-1 text-xs text-zinc-500">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Center - System Status */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-zinc-400">System Healthy</span>
        </div>
      </div>

      {/* Right Side - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Test Alert Button */}
        <button
          onClick={handleTestAlert}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center space-x-2"
        >
          <JupiterIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Test Alert</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-zinc-700 rounded-lg transition-colors duration-200">
          <Bell className="w-5 h-5 text-zinc-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 hover:bg-zinc-700 rounded-lg transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.email[0].toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-zinc-200">{user?.email}</p>
              <p className="text-xs text-zinc-500">
                {user?.is_owner ? 'Owner' : 'Member'}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111214] border border-zinc-700 rounded-lg shadow-lg overflow-hidden">
              <div className="p-2">
                <button className="flex items-center space-x-3 w-full p-2 hover:bg-zinc-700 rounded-lg transition-colors duration-200 text-left">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-300">Profile</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 text-left text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;