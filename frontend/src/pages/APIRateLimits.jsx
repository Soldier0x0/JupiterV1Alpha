import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
  Settings,
  Globe,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
// Simple card component replacement
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#111214] border border-zinc-700 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const APIRateLimits = () => {
  const [rateLimitData, setRateLimitData] = useState(null);
  const [availableAPIs, setAvailableAPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [usageHistory, setUsageHistory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [newCustomAPI, setNewCustomAPI] = useState({
    name: '',
    api_key: '',
    rate_limits: { per_day: '', per_month: '', notes: '' }
  });

  useEffect(() => {
    fetchRateLimitData();
    fetchAvailableAPIs();
  }, []);

  const fetchRateLimitData = async () => {
    try {
      const response = await fetch('/api/rate-limits/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRateLimitData(data);
      } else {
        throw new Error('Failed to fetch rate limit data');
      }
    } catch (err) {
      console.error('Error fetching rate limit data:', err);
      setError('Failed to load rate limit data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableAPIs = async () => {
    try {
      const response = await fetch('/api/rate-limits/available-apis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAPIs(data.available_apis);
      }
    } catch (err) {
      console.error('Error fetching available APIs:', err);
    }
  };

  const fetchUsageHistory = async (apiName) => {
    try {
      const response = await fetch(`/api/rate-limits/usage/${apiName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageHistory(data);
        setShowUsageModal(true);
      }
    } catch (err) {
      console.error('Error fetching usage history:', err);
      setError('Failed to load usage history');
    }
  };

  const addCustomAPI = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rate-limits/custom-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newCustomAPI.name,
          api_key: newCustomAPI.api_key,
          rate_limits: {
            per_day: parseInt(newCustomAPI.rate_limits.per_day) || null,
            per_month: parseInt(newCustomAPI.rate_limits.per_month) || null,
            notes: newCustomAPI.rate_limits.notes || 'Custom API'
          }
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewCustomAPI({
          name: '',
          api_key: '',
          rate_limits: { per_day: '', per_month: '', notes: '' }
        });
        await fetchRateLimitData();
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to add custom API');
      }
    } catch (err) {
      setError('Failed to add custom API');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRateLimitData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'rate_limited': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'rate_limited': return XCircle;
      default: return AlertTriangle;
    }
  };

  const parseLimit = (limitStr) => {
    if (!limitStr) return { current: 0, max: 0 };
    const [current, max] = limitStr.split('/').map(s => parseInt(s.trim()));
    return { current: current || 0, max: max || 0 };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-zinc-400 mt-3">Loading API rate limits...</p>
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
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Activity className="w-8 h-8 text-yellow-400" />
            <span>API Rate Limits</span>
          </h1>
          <p className="body-text text-zinc-400">
            Monitor and manage API rate limits for threat intelligence services
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom API</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 text-red-400 border border-red-500/30 p-4 rounded-xl flex items-center space-x-2"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Summary Stats */}
      {rateLimitData && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-400">Total APIs</h3>
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {rateLimitData.summary.total_apis}
              </div>
              <p className="text-sm text-zinc-400">
                {rateLimitData.summary.configured_apis} configured
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-400">Available</h3>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {rateLimitData.summary.available_apis}
              </div>
              <p className="text-sm text-zinc-400">Ready for use</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-red-400">Rate Limited</h3>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">
                {rateLimitData.summary.rate_limited_apis}
              </div>
              <p className="text-sm text-zinc-400">Need attention</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-purple-400">Last Updated</h3>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-400 mb-2">
                {new Date(rateLimitData.timestamp).toLocaleTimeString()}
              </div>
              <p className="text-sm text-zinc-400">
                {new Date(rateLimitData.timestamp).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* API Status Cards */}
      {rateLimitData && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              <span>API Status & Usage</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(rateLimitData.apis).map(([apiKey, apiData]) => {
                const StatusIcon = getStatusIcon(apiData.status);
                
                return (
                  <motion.div
                    key={apiKey}
                    className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <StatusIcon className={`w-6 h-6 ${getStatusColor(apiData.status)} mt-1`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-zinc-200">{apiData.name}</h4>
                            <span className={`text-sm capitalize ${getStatusColor(apiData.status)}`}>
                              {apiData.status.replace('_', ' ')}
                            </span>
                            {apiData.config.has_key && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                                Configured
                              </span>
                            )}
                          </div>
                          
                          {apiData.config.notes && (
                            <p className="text-sm text-zinc-400 mb-3">{apiData.config.notes}</p>
                          )}
                          
                          {apiData.error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3">
                              <div className="flex items-center space-x-2 text-sm text-red-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{apiData.error}</span>
                              </div>
                            </div>
                          )}

                          {/* Rate Limit Progress Bars */}
                          {apiData.limits && Object.keys(apiData.limits).length > 0 && (
                            <div className="space-y-2">
                              {Object.entries(apiData.limits).map(([limitType, limitStr]) => {
                                const { current, max } = parseLimit(limitStr);
                                const percentage = max > 0 ? (current / max) * 100 : 0;
                                
                                return (
                                  <div key={limitType} className="space-y-1">
                                    <div className="flex justify-between text-xs text-zinc-400">
                                      <span className="capitalize">{limitType.replace('_', ' ')}</span>
                                      <span>{current}/{max}</span>
                                    </div>
                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Next Reset Times */}
                          {apiData.next_reset && Object.keys(apiData.next_reset).length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                              {Object.entries(apiData.next_reset).map(([resetType, resetTime]) => (
                                <div key={resetType}>
                                  <span className="capitalize">{resetType} reset: </span>
                                  <span>{new Date(resetTime).toLocaleTimeString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => fetchUsageHistory(apiKey)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Usage History"
                        >
                          <TrendingUp className="w-4 h-4 text-zinc-400" />
                        </motion.button>
                        {apiKey.startsWith('custom_') && (
                          <motion.button
                            className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Remove Custom API"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Available APIs for Configuration */}
      {availableAPIs.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span>Available API Templates</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAPIs.map((api) => (
                <motion.div
                  key={api.key}
                  className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-zinc-200">{api.name}</h4>
                    <a
                      href={api.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{api.description}</p>
                  
                  {/* Rate Limits Info */}
                  <div className="space-y-2 text-xs">
                    {api.default_limits.free_tier && (
                      <div className="bg-zinc-700/50 rounded p-2">
                        <div className="font-medium text-zinc-300 mb-1">Free Tier:</div>
                        {Object.entries(api.default_limits.free_tier).map(([key, value]) => (
                          <div key={key} className="text-zinc-400">
                            {key.replace('_', ' ')}: {value}
                          </div>
                        ))}
                      </div>
                    )}
                    {api.default_limits.note && (
                      <div className="text-zinc-500">{api.default_limits.note}</div>
                    )}
                  </div>
                  
                  {/* Environment Variables */}
                  <div className="mt-3 pt-3 border-t border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">Required Environment Variables:</div>
                    <div className="flex flex-wrap gap-1">
                      {api.env_vars.slice(0, 2).map((envVar) => (
                        <span key={envVar} className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs">
                          {envVar}
                        </span>
                      ))}
                      {api.env_vars.length > 2 && (
                        <span className="text-zinc-500 text-xs">+{api.env_vars.length - 2}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Add Custom API Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add Custom API</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={addCustomAPI} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Name</label>
                  <input
                    type="text"
                    value={newCustomAPI.name}
                    onChange={(e) => setNewCustomAPI({...newCustomAPI, name: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., My Threat Intel Feed"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={newCustomAPI.api_key}
                    onChange={(e) => setNewCustomAPI({...newCustomAPI, api_key: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="Enter your API key"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Limit</label>
                    <input
                      type="number"
                      value={newCustomAPI.rate_limits.per_day}
                      onChange={(e) => setNewCustomAPI({
                        ...newCustomAPI, 
                        rate_limits: {...newCustomAPI.rate_limits, per_day: e.target.value}
                      })}
                      className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Limit</label>
                    <input
                      type="number"
                      value={newCustomAPI.rate_limits.per_month}
                      onChange={(e) => setNewCustomAPI({
                        ...newCustomAPI, 
                        rate_limits: {...newCustomAPI.rate_limits, per_month: e.target.value}
                      })}
                      className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                      placeholder="30000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <input
                    type="text"
                    value={newCustomAPI.rate_limits.notes}
                    onChange={(e) => setNewCustomAPI({
                      ...newCustomAPI, 
                      rate_limits: {...newCustomAPI.rate_limits, notes: e.target.value}
                    })}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="Custom threat intel API"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Add API
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage History Modal */}
      <AnimatePresence>
        {showUsageModal && usageHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Usage History - {usageHistory.api_name}</h3>
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0b0c10] rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{usageHistory.total_requests}</div>
                  <div className="text-sm text-zinc-400">Total Requests</div>
                </div>
                <div className="bg-[#0b0c10] rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {Object.values(usageHistory.hourly_aggregation).reduce((sum, hour) => sum + hour.successful, 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Successful</div>
                </div>
                <div className="bg-[#0b0c10] rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">
                    {Object.values(usageHistory.hourly_aggregation).reduce((sum, hour) => sum + hour.failed, 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Failed</div>
                </div>
              </div>
              
              {/* Recent Usage Records */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-zinc-300 mb-2">Recent Requests</h4>
                {usageHistory.usage_records.slice(0, 10).map((record, index) => (
                  <div key={index} className="bg-[#0b0c10] rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${record.response_code < 400 ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-sm text-zinc-300">{record.request_type}</span>
                      <span className="text-xs text-zinc-500">{new Date(record.timestamp).toLocaleString()}</span>
                    </div>
                    <span className={`text-sm ${record.response_code < 400 ? 'text-green-400' : 'text-red-400'}`}>
                      {record.response_code}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default APIRateLimits;