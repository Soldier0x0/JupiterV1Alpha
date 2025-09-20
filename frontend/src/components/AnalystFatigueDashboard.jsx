import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  Filter,
  Target,
  Zap
} from 'lucide-react';
import Card from './Card';

const AnalystFatigueDashboard = ({ analystId = null, showDetails = true }) => {
  const [fatigueData, setFatigueData] = useState(null);
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState(analystId);
  const [timeRange, setTimeRange] = useState('24h');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, alerts

  useEffect(() => {
    loadFatigueData();
    loadAnalysts();
  }, [selectedAnalyst, timeRange]);

  const loadFatigueData = async () => {
    if (!selectedAnalyst) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/extended-frameworks/fatigue/status/${selectedAnalyst}`);
      const data = await response.json();
      
      if (data.success) {
        setFatigueData(data.fatigue_status);
      }
    } catch (error) {
      console.error('Error loading fatigue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysts = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const mockAnalysts = [
        { id: 'analyst1', name: 'John Smith', experience: 'senior', status: 'active' },
        { id: 'analyst2', name: 'Sarah Johnson', experience: 'mid', status: 'active' },
        { id: 'analyst3', name: 'Mike Chen', experience: 'junior', status: 'break' },
        { id: 'analyst4', name: 'Emily Davis', experience: 'senior', status: 'active' },
        { id: 'analyst5', name: 'Alex Rodriguez', experience: 'mid', status: 'fatigue' }
      ];
      setAnalysts(mockAnalysts);
    } catch (error) {
      console.error('Error loading analysts:', error);
    }
  };

  const getFatigueColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'break': return 'text-blue-400 bg-blue-500/20';
      case 'fatigue': return 'text-orange-400 bg-orange-500/20';
      case 'offline': return 'text-zinc-400 bg-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getExperienceColor = (experience) => {
    switch (experience?.toLowerCase()) {
      case 'senior': return 'text-purple-400 bg-purple-500/20';
      case 'mid': return 'text-blue-400 bg-blue-500/20';
      case 'junior': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const renderAnalystOverview = () => {
    if (!fatigueData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Main Fatigue Status */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Analyst Fatigue Status</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getFatigueColor(fatigueData.fatigue_level)}`}>
                {fatigueData.fatigue_level} Fatigue
              </span>
              <button
                onClick={loadFatigueData}
                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {(fatigueData.fatigue_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-zinc-400">Fatigue Score</div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    fatigueData.fatigue_score > 0.7 ? 'bg-red-400' :
                    fatigueData.fatigue_score > 0.4 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${fatigueData.fatigue_score * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {fatigueData.session_duration_hours?.toFixed(1)}h
              </div>
              <div className="text-sm text-zinc-400">Session Duration</div>
              <div className="flex items-center justify-center mt-2">
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {fatigueData.alerts_processed}
              </div>
              <div className="text-sm text-zinc-400">Alerts Processed</div>
              <div className="flex items-center justify-center mt-2">
                <Activity className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {fatigueData.decisions_made}
              </div>
              <div className="text-sm text-zinc-400">Decisions Made</div>
              <div className="flex items-center justify-center mt-2">
                <Target className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        {fatigueData.recommendations?.length > 0 && (
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Recommendations</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {fatigueData.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">{rec}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    );
  };

  const renderAnalystList = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Analyst Team Status</h2>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {analysts.map((analyst, index) => (
              <motion.div
                key={analyst.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedAnalyst === analyst.id
                    ? 'bg-zinc-800 border-yellow-500/50'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => setSelectedAnalyst(analyst.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {analyst.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{analyst.name}</div>
                      <div className="text-sm text-zinc-400">ID: {analyst.id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getExperienceColor(analyst.experience)}`}>
                      {analyst.experience}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(analyst.status)}`}>
                      {analyst.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderFatigueTrends = () => {
    // Mock trend data
    const trendData = [
      { time: '00:00', fatigue: 0.2 },
      { time: '04:00', fatigue: 0.3 },
      { time: '08:00', fatigue: 0.1 },
      { time: '12:00', fatigue: 0.4 },
      { time: '16:00', fatigue: 0.6 },
      { time: '20:00', fatigue: 0.8 }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Fatigue Trends</h2>
          </div>

          <div className="space-y-4">
            {trendData.map((point, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-zinc-400">{point.time}</div>
                <div className="flex-1 bg-zinc-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      point.fatigue > 0.7 ? 'bg-red-400' :
                      point.fatigue > 0.4 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${point.fatigue * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-zinc-300 text-right">
                  {(point.fatigue * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">2.3s</div>
              <div className="text-sm text-zinc-400">Avg Response Time</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingDown className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 ml-1">-12%</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">94%</div>
              <div className="text-sm text-zinc-400">Accuracy Rate</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 ml-1">+3%</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">87%</div>
              <div className="text-sm text-zinc-400">Alert Resolution</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 ml-1">+5%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderAlertOptimization = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Alert Optimization</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Current Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Max Alerts/Hour</span>
                  <span className="text-sm font-medium text-white">50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Priority Threshold</span>
                  <span className="text-sm font-medium text-white">0.6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Correlation Enabled</span>
                  <span className="text-sm font-medium text-green-400">Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Auto-Triage</span>
                  <span className="text-sm font-medium text-yellow-400">Partial</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Optimization Suggestions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Enable Smart Filtering</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Reduce noise by 30% with intelligent alert correlation
                  </p>
                </div>
                
                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Adjust Thresholds</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Lower false positive rate by 25%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analysts', label: 'Analysts', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'optimization', label: 'Optimization', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analyst Fatigue Management</h1>
          <p className="text-zinc-400 mt-1">Monitor and optimize analyst performance and well-being</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            {viewModes.map(mode => (
              <option key={mode.id} value={mode.id}>{mode.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-700">
        {viewModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              viewMode === mode.id
                ? 'text-white bg-zinc-800 border-b-2 border-yellow-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <mode.icon className="w-4 h-4" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'overview' && renderAnalystOverview()}
          {viewMode === 'analysts' && renderAnalystList()}
          {viewMode === 'trends' && renderFatigueTrends()}
          {viewMode === 'optimization' && renderAlertOptimization()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnalystFatigueDashboard;
