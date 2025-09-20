import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Clock,
  Globe,
  Zap,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    alerts: { total: 0, high: 0, medium: 0, low: 0, trend: [] },
    threats: { blocked: 0, total: 0, sources: [] },
    system: { uptime: '99.9%', cpu: 45, memory: 62, network: 78 },
    activity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls
    setTimeout(() => {
      setDashboardData({
        alerts: { total: 0, high: 0, medium: 0, low: 0, trend: [] },
        threats: { blocked: 0, total: 0, sources: [] },
        system: { uptime: '0%', cpu: 0, memory: 0, network: 0 },
        activity: []
      });
      setLoading(false);
    }, 1000);
  }, []);

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-zinc-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
          <p className="text-zinc-400">Real-time security monitoring and threat intelligence</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-zinc-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-red-400">{dashboardData.alerts.total}</span>
          </div>
          <h3 className="font-semibold mb-1">Active Alerts</h3>
          <div className="flex items-center space-x-4 text-sm text-zinc-400">
            <span className="text-red-400">High: {dashboardData.alerts.high}</span>
            <span className="text-yellow-400">Med: {dashboardData.alerts.medium}</span>
            <span className="text-green-400">Low: {dashboardData.alerts.low}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-green-400">{dashboardData.threats.blocked}</span>
          </div>
          <h3 className="font-semibold mb-1">Threats Blocked</h3>
          <p className="text-sm text-zinc-400">
            {((dashboardData.threats.blocked / dashboardData.threats.total) * 100).toFixed(1)}% success rate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-blue-400">{dashboardData.system.uptime}</span>
          </div>
          <h3 className="font-semibold mb-1">System Uptime</h3>
          <p className="text-sm text-zinc-400">All systems operational</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400">24/7</span>
          </div>
          <h3 className="font-semibold mb-1">Monitoring</h3>
          <p className="text-sm text-zinc-400">Global threat detection</p>
        </motion.div>
      </div>

      {/* Empty State - No Data Yet */}
      {dashboardData.alerts.total === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Start monitoring by setting up log collection and configuring your first data sources.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="btn-primary flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Setup Log Collection</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Configure Alerts</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;