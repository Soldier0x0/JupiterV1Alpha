import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Download, Database, Activity } from 'lucide-react';
import Card from '../components/Card';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [logSource, setLogSource] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock log data
  const mockLogs = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      source: 'nginx',
      level: 'info',
      message: 'GET /api/alerts 200 - 45ms',
      host: 'web-server-01',
      raw: '{"timestamp":"2025-01-27T18:37:42.123Z","level":"info","message":"GET /api/alerts 200 - 45ms","host":"web-server-01"}'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      source: 'syslog',
      level: 'warning',
      message: 'Failed authentication attempt for user admin',
      host: 'auth-server-01',
      raw: '{"timestamp":"2025-01-27T18:36:42.123Z","level":"warning","message":"Failed authentication attempt for user admin","host":"auth-server-01"}'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      source: 'firewall',
      level: 'error',
      message: 'Blocked connection from 192.168.1.100 to 10.0.0.5:22',
      host: 'firewall-01',
      raw: '{"timestamp":"2025-01-27T18:35:42.123Z","level":"error","message":"Blocked connection from 192.168.1.100 to 10.0.0.5:22","host":"firewall-01"}'
    }
  ];

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = mockLogs;
      
      if (searchQuery) {
        filtered = filtered.filter(log => 
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.host.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (logSource !== 'all') {
        filtered = filtered.filter(log => log.source === logSource);
      }
      
      setResults(filtered);
      setLoading(false);
    }, 1000);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-jupiter-danger bg-jupiter-danger/20';
      case 'warning': return 'text-jupiter-warning bg-jupiter-warning/20';
      case 'info': return 'text-jupiter-secondary bg-jupiter-secondary/20';
      case 'debug': return 'text-zinc-400 bg-zinc-400/20';
      default: return 'text-zinc-400 bg-zinc-400/20';
    }
  };

  const exportResults = () => {
    const jsonData = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jupiter-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
          <h1 className="text-3xl font-bold text-gradient">Log Exploration</h1>
          <p className="text-zinc-400 mt-1">Search and analyze security logs across your infrastructure</p>
        </div>
        {results.length > 0 && (
          <motion.button
            onClick={exportResults}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </motion.button>
        )}
      </div>

      {/* Search Interface */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-jupiter-secondary" />
            <h2 className="text-lg font-semibold">Query Builder</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2 text-zinc-300">Search Query</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                  placeholder="error, failed login, 192.168.1.100..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input-field"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Log Source</label>
              <select
                value={logSource}
                onChange={(e) => setLogSource(e.target.value)}
                className="input-field"
              >
                <option value="all">All Sources</option>
                <option value="nginx">Nginx</option>
                <option value="syslog">Syslog</option>
                <option value="firewall">Firewall</option>
                <option value="auth">Authentication</option>
                <option value="endpoint">Endpoint</option>
              </select>
            </div>
          </div>
          
          <motion.button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{loading ? 'Searching...' : 'Search Logs'}</span>
          </motion.button>
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Activity className="w-5 h-5 text-jupiter-secondary" />
              <span>Search Results</span>
              <span className="text-sm text-zinc-500">({results.length} logs)</span>
            </h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((log, index) => (
              <motion.div
                key={log.id}
                className="bg-cosmic-gray/30 border border-cosmic-border rounded-xl p-4 hover:bg-cosmic-gray/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full">
                      {log.source}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{log.host}</span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm text-zinc-200 mb-2 font-mono">{log.message}</p>
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400">
                    Raw Log Data
                  </summary>
                  <pre className="mt-2 p-3 bg-cosmic-black/50 rounded-lg text-zinc-400 overflow-x-auto">
                    {log.raw}
                  </pre>
                </details>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Search Templates */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-jupiter-secondary" />
          <span>Quick Searches</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Failed Logins', query: 'failed authentication' },
            { label: 'Error Logs', query: 'level:error' },
            { label: 'Network Blocks', query: 'blocked connection' },
            { label: 'Admin Actions', query: 'user:admin' },
            { label: 'High Severity', query: 'severity:high OR severity:critical' },
            { label: 'External IPs', query: 'src:!10.0.0.0/8 AND src:!192.168.0.0/16' }
          ].map((template, index) => (
            <motion.button
              key={index}
              onClick={() => setSearchQuery(template.query)}
              className="text-left p-3 bg-cosmic-gray/30 hover:bg-cosmic-gray/50 rounded-xl border border-cosmic-border hover:border-jupiter-secondary/50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-medium text-zinc-200 text-sm">{template.label}</p>
              <p className="text-xs text-zinc-500 mt-1 font-mono">{template.query}</p>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default Explore;