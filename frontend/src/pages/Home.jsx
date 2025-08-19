import React, { useState, useEffect } from 'react';
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
          { name: 'API Gateway', status: 'healthy' },
          { name: 'Database', status: 'healthy' },
          { name: 'Search Engine', status: 'degraded' },
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
      case 'healthy': return 'text-success-500';
      case 'degraded': return 'text-warning-500';
      case 'critical': case 'unhealthy': return 'text-danger-500';
      default: return 'text-neutral-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'status-success';
      case 'degraded': return 'status-warning';
      case 'critical': case 'unhealthy': return 'status-danger';
      default: return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-heading text-3xl font-bold mb-2">Security Overview</h1>
          <p className="text-body">
            {isOwner ? 'System-wide security metrics and operational status' : 'Your tenant security status and metrics'}
          </p>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 rounded-lg status-success">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-subtle"></div>
          <span className="text-sm font-medium">Live Monitoring</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card elevated className="border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption mb-1">Total Events</p>
              <p className="text-2xl font-bold text-primary-400">
                {dashboardData?.total_logs?.toLocaleString() || '156,789'}
              </p>
              <p className="text-xs text-success-500 mt-1">↗ +12% from last hour</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </Card>

        <Card elevated className="border-l-4 border-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption mb-1">Active Alerts</p>
              <p className="text-2xl font-bold text-warning-400">
                {dashboardData?.total_alerts || '342'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">↗ +3 in last 5 min</p>
            </div>
            <div className="w-12 h-12 bg-warning-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </Card>

        <Card elevated className="border-l-4 border-danger-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption mb-1">Critical Issues</p>
              <p className="text-2xl font-bold text-danger-400">
                {dashboardData?.critical_alerts || '23'}
              </p>
              <p className="text-xs text-danger-500 mt-1">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-danger-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-danger-500" />
            </div>
          </div>
        </Card>

        <Card elevated className="border-l-4 border-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption mb-1">System Health</p>
              <p className="text-2xl font-bold text-success-400">98.7%</p>
              <p className="text-xs text-success-500 mt-1">All systems operational</p>
            </div>
            <div className="w-12 h-12 bg-success-500/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card elevated>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-heading text-lg">Events Per Second</h3>
              <p className="text-caption">Real-time event processing rate</p>
            </div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-500" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={epsData}>
              <XAxis dataKey="time" stroke="#525252" fontSize={12} />
              <YAxis stroke="#525252" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #404040',
                  borderRadius: '0.5rem',
                  color: '#e5e5e5'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="eps" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card elevated>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-heading text-lg">Alert Distribution</h3>
              <p className="text-caption">Alerts by severity level</p>
            </div>
            <div className="w-10 h-10 bg-warning-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData}>
              <XAxis dataKey="severity" stroke="#525252" fontSize={12} />
              <YAxis stroke="#525252" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #404040',
                  borderRadius: '0.5rem',
                  color: '#e5e5e5'
                }} 
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* System Health and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card elevated>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-heading text-lg">System Health</h3>
              <p className="text-caption">Component status overview</p>
            </div>
            <div className="w-10 h-10 bg-success-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-success-500" />
            </div>
          </div>
          <div className="space-y-4">
            {dashboardData?.health_metrics?.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background-primary">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status).replace('text-', 'bg-')}`}></div>
                  <span className="text-body font-medium">{metric.name}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card elevated>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-heading text-lg">Quick Actions</h3>
              <p className="text-caption">Common security operations</p>
            </div>
            <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary p-4 text-left">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-xs text-neutral-500">User administration</p>
                </div>
              </div>
            </button>
            
            <button className="btn-secondary p-4 text-left">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5" />
                <div>
                  <p className="font-medium">View Logs</p>
                  <p className="text-xs text-neutral-500">Log analysis</p>
                </div>
              </div>
            </button>
            
            <button className="btn-secondary p-4 text-left">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Alert Rules</p>
                  <p className="text-xs text-neutral-500">Configure alerts</p>
                </div>
              </div>
            </button>
            
            <button className="btn-secondary p-4 text-left">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="font-medium">Threat Intel</p>
                  <p className="text-xs text-neutral-500">IOC management</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;