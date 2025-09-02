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
    // Simulate loading dashboard data
    setTimeout(() => {
      setDashboardData({
        alerts: {
          total: 247,
          high: 23,
          medium: 156,
          low: 68,
          trend: [
            { time: '00:00', alerts: 12 },
            { time: '04:00', alerts: 8 },
            { time: '08:00', alerts: 24 },
            { time: '12:00', alerts: 18 },
            { time: '16:00', alerts: 32 },
            { time: '20:00', alerts: 15 }
          ]
        },
        threats: {
          blocked: 1247,
          total: 1523,
          sources: [
            { name: 'Malware', value: 45, color: '#ef4444' },
            { name: 'Phishing', value: 28, color: '#f97316' },
            { name: 'DDoS', value: 15, color: '#eab308' },
            { name: 'Intrusion', value: 12, color: '#8b5cf6' }
          ]
        },
        system: {
          uptime: '99.9%',
          cpu: 45,
          memory: 62,
          network: 78
        },
        activity: [
          { time: '1h', events: 156, threats: 23, alerts: 12 },
          { time: '2h', events: 203, threats: 18, alerts: 15 },
          { time: '3h', events: 178, threats: 31, alerts: 8 },
          { time: '4h', events: 234, threats: 25, alerts: 19 },
          { time: '5h', events: 189, threats: 14, alerts: 11 },
          { time: '6h', events: 267, threats: 29, alerts: 16 }
        ]
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alert Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span>Alert Trend (24h)</span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.alerts.trend}>
              <defs>
                <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="alerts" 
                stroke="#eab308" 
                fillOpacity={1} 
                fill="url(#alertGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Threat Sources Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-400" />
              <span>Threat Sources</span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.threats.sources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.threats.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* System Performance and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>System Performance</span>
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">CPU Usage</span>
                <span className="text-sm font-medium">{dashboardData.system.cpu}%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData.system.cpu}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">Memory Usage</span>
                <span className="text-sm font-medium">{dashboardData.system.memory}%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData.system.memory}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">Network Usage</span>
                <span className="text-sm font-medium">{dashboardData.system.network}%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData.system.network}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-400" />
              <span>Activity Overview (6h)</span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardData.activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="events" fill="#3b82f6" name="Events" />
              <Bar dataKey="threats" fill="#ef4444" name="Threats" />
              <Bar dataKey="alerts" fill="#eab308" name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;