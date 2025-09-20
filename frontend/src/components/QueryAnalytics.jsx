import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  Target, 
  Users, 
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from './Card';

const QueryAnalytics = ({ savedQueries = [], queryHistory = [] }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (savedQueries.length > 0 || queryHistory.length > 0) {
      generateAnalytics();
    }
  }, [savedQueries, queryHistory, timeRange]);

  const generateAnalytics = () => {
    setLoading(true);
    
    // Simulate analytics generation (replace with real API call)
    setTimeout(() => {
      const analyticsData = calculateAnalytics();
      setAnalytics(analyticsData);
      setLoading(false);
    }, 1000);
  };

  const calculateAnalytics = () => {
    // Mock data for demonstration
    const queryUsageData = [
      { name: 'Failed Logins', count: 45, avgTime: 0.8, success: 98 },
      { name: 'Process Monitoring', count: 32, avgTime: 1.2, success: 95 },
      { name: 'Network Analysis', count: 28, avgTime: 2.1, success: 92 },
      { name: 'File Activities', count: 19, avgTime: 1.5, success: 96 },
      { name: 'Registry Changes', count: 15, avgTime: 0.9, success: 97 }
    ];

    const performanceTrend = [
      { day: 'Mon', avgTime: 1.2, queries: 23 },
      { day: 'Tue', avgTime: 1.1, queries: 31 },
      { day: 'Wed', avgTime: 1.4, queries: 28 },
      { day: 'Thu', avgTime: 1.0, queries: 35 },
      { day: 'Fri', avgTime: 1.3, queries: 29 },
      { day: 'Sat', avgTime: 0.9, queries: 18 },
      { day: 'Sun', avgTime: 0.8, queries: 12 }
    ];

    const complexityDistribution = [
      { name: 'Simple (1-3)', value: 45, color: '#10b981' },
      { name: 'Medium (4-6)', value: 35, color: '#f59e0b' },
      { name: 'Complex (7-10)', value: 20, color: '#ef4444' }
    ];

    const topFields = [
      { field: 'activity_name', usage: 78, trend: 'up' },
      { field: 'severity', usage: 65, trend: 'up' },
      { field: 'src_endpoint_ip', usage: 52, trend: 'stable' },
      { field: 'user_name', usage: 48, trend: 'down' },
      { field: 'time', usage: 42, trend: 'up' }
    ];

    const queryCategories = [
      { category: 'Authentication', count: 45, percentage: 35 },
      { category: 'Process Monitoring', count: 32, percentage: 25 },
      { category: 'Network Analysis', count: 28, percentage: 22 },
      { category: 'File Monitoring', count: 19, percentage: 15 },
      { category: 'Registry Monitoring', count: 15, percentage: 12 }
    ];

    return {
      totalQueries: 129,
      avgExecutionTime: 1.2,
      successRate: 95.8,
      mostUsedQuery: 'Failed Login Attempts',
      queryUsageData,
      performanceTrend,
      complexityDistribution,
      topFields,
      queryCategories,
      insights: [
        {
          type: 'performance',
          title: 'Query Performance Improved',
          description: 'Average execution time decreased by 15% this week',
          icon: TrendingUp,
          color: 'green'
        },
        {
          type: 'usage',
          title: 'Authentication Queries Popular',
          description: 'Failed login queries are used 3x more than other types',
          icon: Users,
          color: 'blue'
        },
        {
          type: 'optimization',
          title: 'Complexity Optimization Needed',
          description: '20% of queries could benefit from simplification',
          icon: Target,
          color: 'yellow'
        }
      ]
    };
  };

  const getInsightColor = (color) => {
    switch (color) {
      case 'green': return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'blue': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'yellow': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-zinc-500 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-pulse-glow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-zinc-400 mt-3">Generating analytics...</p>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <div className="text-center py-8 text-zinc-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No query data available for analytics</p>
          <p className="text-sm">Start using queries to see analytics</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Query Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm text-zinc-200"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Queries</p>
              <p className="text-2xl font-bold text-white">{analytics.totalQueries}</p>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg Execution Time</p>
              <p className="text-2xl font-bold text-white">{analytics.avgExecutionTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.successRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Most Used</p>
              <p className="text-sm font-medium text-white truncate">{analytics.mostUsedQuery}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span>Key Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightColor(insight.color)}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <insight.icon className="w-5 h-5" />
                <h4 className="font-medium">{insight.title}</h4>
              </div>
              <p className="text-sm opacity-90">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Usage */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Query Usage by Type</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.queryUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e5e7eb'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>Performance Trend</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e5e7eb'
                }}
              />
              <Line type="monotone" dataKey="avgTime" stroke="#10b981" strokeWidth={2} name="Avg Time (s)" />
              <Line type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={2} name="Queries" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complexity Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Target className="w-5 h-5 text-purple-400" />
            <span>Query Complexity Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.complexityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {analytics.complexityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e5e7eb'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Fields */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Activity className="w-5 h-5 text-orange-400" />
            <span>Most Used Fields</span>
          </h3>
          <div className="space-y-3">
            {analytics.topFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-zinc-300">{field.field}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    field.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    field.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {field.trend}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-zinc-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${field.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-zinc-400 w-8 text-right">{field.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Query Categories */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>Query Categories</span>
        </h3>
        <div className="space-y-3">
          {analytics.queryCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-zinc-200 w-32">{category.category}</span>
                <span className="text-sm text-zinc-400">{category.count} queries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-zinc-400 w-12 text-right">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default QueryAnalytics;
