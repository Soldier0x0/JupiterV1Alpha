import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Command, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const TopBar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

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
    <motion.div 
      className="bg-cosmic-dark/90 backdrop-blur-sm shadow-card border-b border-cosmic-border p-4 flex justify-between items-center relative z-20"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Side - Search */}
      <div className="flex items-center space-x-4">
        <motion.div 
          className="flex items-center space-x-3 bg-cosmic-gray/50 px-4 py-2 rounded-xl border border-cosmic-border max-w-md"
          whileFocus={{ scale: 1.02 }}
        >
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
        </motion.div>
      </div>

      {/* Center - System Status */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-jupiter-success rounded-full animate-pulse"></div>
          <span className="text-zinc-400">System Healthy</span>
        </div>
      </div>

      {/* Right Side - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Test Alert Button */}
        <motion.button
          onClick={handleTestAlert}
          className="bg-jupiter-primary/20 hover:bg-jupiter-primary/30 text-jupiter-primary px-4 py-2 rounded-xl border border-jupiter-primary/30 hover:border-jupiter-primary/50 transition-all duration-200 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Test Alert</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          className="relative p-2 hover:bg-cosmic-gray rounded-xl transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-zinc-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-jupiter-primary rounded-full"></div>
        </motion.button>

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 hover:bg-cosmic-gray rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-jupiter-secondary rounded-lg flex items-center justify-center">
              <span className="text-cosmic-black text-sm font-bold">
                {user?.email[0].toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-zinc-200">{user?.email}</p>
              <p className="text-xs text-zinc-500">
                {user?.is_owner ? 'Owner' : 'Member'}
              </p>
            </div>
          </motion.button>

          {/* Dropdown Menu */}
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-cosmic-dark border border-cosmic-border rounded-xl shadow-card-hover overflow-hidden"
            >
              <div className="p-2">
                <button className="flex items-center space-x-3 w-full p-2 hover:bg-cosmic-gray rounded-lg transition-colors text-left">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-300">Profile</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full p-2 hover:bg-jupiter-danger/20 rounded-lg transition-colors text-left text-jupiter-danger"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;