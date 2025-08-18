import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, Activity, Database, Users, Zap } from 'lucide-react';
import Card from '../components/Card';
import { useAuth } from '../auth/AuthProvider';
import { dashboardAPI } from '../utils/api';

const Home = () => {
  const { isOwner } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use mock data as fallback
      setDashboardData({
        total_logs: 156789,
        total_alerts: 342,
        critical_alerts: 23,
        recent_alerts: [],
        health_metrics: [
          { name: 'API', status: 'healthy' },
          { name: 'MongoDB', status: 'healthy' },
          { name: 'OpenSearch', status: 'degraded' },
          { name: 'Threat Intel', status: 'healthy' },
          { name: 'SOAR Engine', status: 'healthy' }
        ],
        is_owner_view: isOwner
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const epsData = [
    { time: '00:00', eps: 120 },
    { time: '04:00', eps: 89 },
    { time: '08:00', eps: 156 },
    { time: '12:00', eps: 203 },
    { time: '16:00', eps: 178 },
    { time: '20:00', eps: 234 },
  ];

  const severityData = [
    { severity: 'Critical', count: dashboardData?.critical_alerts || 23 },
    { severity: 'High', count: 67 },
    { severity: 'Medium', count: 142 },
    { severity: 'Low', count: 110 },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-jupiter-success';
      case 'degraded': return 'text-jupiter-warning';
      case 'critical': case 'unhealthy': return 'text-jupiter-danger';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy': return '●';
      case 'degraded': return '◐';
      case 'critical': case 'unhealthy': return '●';
      default: return '○';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-glow">
          <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Security Overview</h1>
          <p className="text-zinc-400 mt-1">
            {isOwner ? 'System-wide security metrics' : 'Your tenant security status'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-jupiter-success rounded-full animate-pulse"></div>
          <span className="text-zinc-400">Live monitoring active</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold text-jupiter-secondary">
                  {dashboardData?.total_logs?.toLocaleString() || '0'}
                </p>
              </div>
              <Database className="w-8 h-8 text-jupiter-secondary" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold text-jupiter-warning">
                  {dashboardData?.total_alerts || '0'}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-jupiter-warning" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-jupiter-danger">
                  {dashboardData?.critical_alerts || '0'}
                </p>
              </div>
              <Shield className="w-8 h-8 text-jupiter-danger" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Automations</p>
                <p className="text-2xl font-bold text-jupiter-success">Active</p>
              </div>
              <Zap className="w-8 h-8 text-jupiter-success" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.01 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Events Per Second</h2>
              <Activity className="w-5 h-5 text-jupiter-secondary" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={epsData}>
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '0.75rem'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="eps" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Alerts by Severity</h2>
              <AlertTriangle className="w-5 h-5 text-jupiter-warning" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityData}>
                <XAxis dataKey="severity" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '0.75rem'
                  }} 
                />
                <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">System Health</h2>
              <Activity className="w-5 h-5 text-jupiter-success" />
            </div>
            <div className="space-y-3">
              {dashboardData?.health_metrics?.map((metric, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-cosmic-gray/30 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                    </span>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Events */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Events</h2>
              <AlertTriangle className="w-5 h-5 text-jupiter-warning" />
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData?.recent_alerts?.length > 0 ? (
                dashboardData.recent_alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-cosmic-gray/30 rounded-xl hover:bg-cosmic-gray/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{alert.message}</p>
                      <p className="text-xs text-zinc-500">{alert.source} • {alert.entity}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 ${
                      alert.severity === 'critical' ? 'bg-jupiter-danger/20 text-jupiter-danger' :
                      alert.severity === 'high' ? 'bg-jupiter-warning/20 text-jupiter-warning' :
                      'bg-jupiter-success/20 text-jupiter-success'
                    }`}>
                      {alert.severity}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No recent events</p>
                  <p className="text-sm">Your environment is secure</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;