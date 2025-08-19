import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  Shield, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Users,
  Brain,
  Eye,
  Zap,
  Database,
  Plus,
  Settings
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from './JupiterIcon';

const MobileDashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const { user, isOwner } = useAuth();

  const quickStats = [
    { label: 'Active Alerts', value: '12', color: 'text-red-400', icon: AlertTriangle },
    { label: 'Threats Blocked', value: '247', color: 'text-green-400', icon: Shield },
    { label: 'System Health', value: '98%', color: 'text-blue-400', icon: Activity },
    { label: 'AI Analysis', value: '47', color: 'text-purple-400', icon: Brain }
  ];

  const mobileNavItems = [
    { path: '/dashboard', label: 'Overview', icon: Activity },
    { path: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/dashboard/ai-console', label: 'AI Console', icon: Brain },
    { path: '/dashboard/deception', label: 'Deception', icon: Eye },
    { path: '/dashboard/automations', label: 'SOAR', icon: Zap },
    { path: '/dashboard/knowledge', label: 'Knowledge', icon: Database },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings }
  ];

  const recentAlerts = [
    {
      id: 1,
      severity: 'high',
      title: 'Suspicious Network Activity',
      time: '2m ago',
      source: 'Network Monitor'
    },
    {
      id: 2,
      severity: 'medium', 
      title: 'Failed Authentication Attempts',
      time: '8m ago',
      source: 'Auth System'
    },
    {
      id: 3,
      severity: 'low',
      title: 'System Update Available',
      time: '1h ago',
      source: 'System'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  useEffect(() => {
    // Load notifications
    setActiveNotifications(recentAlerts);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] md:hidden">
      {/* Mobile Header */}
      <div className="bg-[#111214] border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-zinc-300" />
            </button>
            
            <div className="flex items-center space-x-2">
              <JupiterIcon className="w-8 h-8" />
              <div>
                <h1 className="font-bold text-white text-lg">Jupiter</h1>
                <p className="text-xs text-zinc-500">Security Hub</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-zinc-300" />
              {activeNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {activeNotifications.length}
                </span>
              )}
            </button>
            
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.email[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111214] border border-zinc-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#111214] border border-zinc-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Alerts</h3>
            <button className="text-sm text-blue-400">View All</button>
          </div>
          
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-[#0b0c10] rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity).split(' ')[1]}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-zinc-500">{alert.source}</span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400">{alert.time}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[60vh]">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed top-0 left-0 w-70 h-full bg-[#111214] border-r border-zinc-700 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <JupiterIcon className="w-8 h-8" />
                    <div>
                      <h2 className="font-bold text-white">Jupiter</h2>
                      <p className="text-xs text-zinc-500">Security Hub</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="bg-[#0b0c10] rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-200 truncate">{user.email}</p>
                        <p className="text-sm text-zinc-500">
                          {isOwner && <span className="text-red-400 mr-1">👑</span>}
                          {isOwner ? 'Owner' : 'Member'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="space-y-2">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.path}
                        href={item.path}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </motion.a>
                    );
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Create Alert</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      <Brain className="w-4 h-4" />
                      <span>AI Analysis</span>
                    </button>
                  </div>
                </div>

                {/* System Status */}
                <div className="mt-8 p-4 bg-[#0b0c10] rounded-lg">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">AI Models</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Threat Intel</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Deception</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-xs text-yellow-400">Monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Alternative mobile nav) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111214] border-t border-zinc-700 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          {mobileNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.path}
                href={item.path}
                className="flex flex-col items-center space-y-1 p-2 text-zinc-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;