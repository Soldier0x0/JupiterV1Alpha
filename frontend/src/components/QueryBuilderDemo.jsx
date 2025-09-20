import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Code, Eye, Download, AlertCircle, CheckCircle } from 'lucide-react';
import QueryBuilder from './QueryBuilder';
import Card from './Card';

const QueryBuilderDemo = () => {
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sample log data for demonstration
  const sampleLogs = [
    {
      id: 1,
      time: '2024-01-15T10:30:00Z',
      activity_name: 'failed_login',
      user_name: 'john.doe',
      src_endpoint_ip: '192.168.1.100',
      severity: 'medium',
      message: 'Failed login attempt for user john.doe from 192.168.1.100'
    },
    {
      id: 2,
      time: '2024-01-15T10:31:15Z',
      activity_name: 'process_started',
      process_name: 'powershell.exe',
      device_name: 'WORKSTATION-01',
      severity: 'low',
      message: 'Process powershell.exe started on WORKSTATION-01'
    },
    {
      id: 3,
      time: '2024-01-15T10:32:30Z',
      activity_name: 'file_created',
      file_name: 'suspicious.exe',
      file_path: 'C:\\temp\\suspicious.exe',
      user_name: 'admin',
      severity: 'high',
      message: 'File suspicious.exe created by admin in C:\\temp\\'
    },
    {
      id: 4,
      time: '2024-01-15T10:33:45Z',
      activity_name: 'network_connection',
      src_endpoint_ip: '192.168.1.50',
      dst_endpoint_ip: '8.8.8.8',
      dst_endpoint_port: 53,
      network_protocol: 'UDP',
      severity: 'low',
      message: 'DNS query from 192.168.1.50 to 8.8.8.8:53'
    },
    {
      id: 5,
      time: '2024-01-15T10:34:20Z',
      activity_name: 'privilege_escalation',
      user_name: 'service_account',
      device_name: 'SERVER-01',
      severity: 'critical',
      message: 'Privilege escalation attempt by service_account on SERVER-01'
    }
  ];

  const handleQueryChange = (query) => {
    setCurrentQuery(query);
  };

  const handleRunQuery = (query) => {
    setLoading(true);
    setCurrentQuery(query);
    
    // Simulate query execution with sample data
    setTimeout(() => {
      let results = [...sampleLogs];
      
      // Simple query parsing for demo purposes
      if (query.includes('failed_login')) {
        results = results.filter(log => log.activity_name === 'failed_login');
      } else if (query.includes('severity:high') || query.includes('severity:critical')) {
        results = results.filter(log => log.severity === 'high' || log.severity === 'critical');
      } else if (query.includes('powershell')) {
        results = results.filter(log => log.process_name === 'powershell.exe');
      } else if (query.includes('192.168.1.100')) {
        results = results.filter(log => log.src_endpoint_ip === '192.168.1.100');
      }
      
      setQueryResults(results);
      setShowResults(true);
      setLoading(false);
    }, 1500);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/30';
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">OCSF Query Builder Demo</h1>
        <p className="text-zinc-400">
          Interactive demonstration of the OCSF-aware query builder for security log analysis
        </p>
      </div>

      {/* Query Builder */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Build Your Query</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              Demo Mode
            </span>
          </div>
          
          <QueryBuilder
            onQueryChange={handleQueryChange}
            onRunQuery={handleRunQuery}
          />
        </div>
      </Card>

      {/* Current Query Display */}
      {currentQuery && (
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Eye className="w-5 h-5 text-yellow-400" />
            <span>Generated Query</span>
          </h2>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
              {currentQuery}
            </pre>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-pulse-glow">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-zinc-400 mt-3">Executing query...</p>
          </div>
        </Card>
      )}

      {/* Query Results */}
      {showResults && !loading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Query Results</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">
                {queryResults.length} result{queryResults.length !== 1 ? 's' : ''}
              </span>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {queryResults.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found</p>
              <p className="text-sm">Try adjusting your query parameters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queryResults.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-zinc-400 font-mono">
                          {new Date(log.time).toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                        <span className="text-sm font-medium text-zinc-200">
                          {log.activity_name}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{log.message}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                        {log.user_name && (
                          <span>User: <span className="text-zinc-300">{log.user_name}</span></span>
                        )}
                        {log.device_name && (
                          <span>Device: <span className="text-zinc-300">{log.device_name}</span></span>
                        )}
                        {log.src_endpoint_ip && (
                          <span>Source: <span className="text-zinc-300">{log.src_endpoint_ip}</span></span>
                        )}
                        {log.dst_endpoint_ip && (
                          <span>Dest: <span className="text-zinc-300">{log.dst_endpoint_ip}</span></span>
                        )}
                        {log.process_name && (
                          <span>Process: <span className="text-zinc-300">{log.process_name}</span></span>
                        )}
                        {log.file_name && (
                          <span>File: <span className="text-zinc-300">{log.file_name}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Sample Data Info */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <span>Sample Data Available</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-200">Authentication Events</h3>
            <ul className="text-zinc-400 space-y-1">
              <li>• failed_login (john.doe)</li>
              <li>• privilege_escalation (service_account)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-200">Process Events</h3>
            <ul className="text-zinc-400 space-y-1">
              <li>• powershell.exe execution</li>
              <li>• Process monitoring</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-zinc-200">Network Events</h3>
            <ul className="text-zinc-400 space-y-1">
              <li>• DNS queries (8.8.8.8)</li>
              <li>• Network connections</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Try these queries:</strong> "failed_login", "severity:high", "powershell", or "192.168.1.100"
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QueryBuilderDemo;
