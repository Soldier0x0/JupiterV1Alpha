import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Link, 
  Activity, 
  Settings, 
  Play, 
  Square, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  Search,
  Network,
  Code,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader,
  Info,
  Monitor
} from 'lucide-react';
import Card from '../components/Card';

const MCP = () => {
  const [mcpServers, setMcpServers] = useState([]);
  const [connectedServers, setConnectedServers] = useState([]);
  const [serverMetrics, setServerMetrics] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [isConnecting, setIsConnecting] = useState({});
  
  const [newServer, setNewServer] = useState({
    name: '',
    type: 'threat-intel',
    endpoint: '',
    auth_config: {},
    enabled: true
  });

  // Available MCP server types
  const serverTypes = [
    {
      type: 'threat-intel',
      name: 'Threat Intelligence',
      icon: Shield,
      description: 'Connect to threat intelligence feeds and IOC databases',
      color: 'text-red-400',
      examples: ['VirusTotal API', 'AlienVault OTX', 'AbuseIPDB']
    },
    {
      type: 'siem',
      name: 'SIEM Integration',
      icon: Database,
      description: 'Connect to SIEM platforms for log analysis',
      color: 'text-blue-400',
      examples: ['Splunk', 'Elasticsearch', 'QRadar']
    },
    {
      type: 'vulnerability',
      name: 'Vulnerability Scanners',
      icon: Search,
      description: 'Integrate with vulnerability management tools',
      color: 'text-orange-400',
      examples: ['Nessus', 'OpenVAS', 'Qualys']
    },
    {
      type: 'network',
      name: 'Network Security',
      icon: Network,
      description: 'Connect to firewalls and network security tools',
      color: 'text-green-400',
      examples: ['Cisco ASA', 'pfSense', 'FortiGate']
    },
    {
      type: 'endpoint',
      name: 'Endpoint Detection',
      icon: Monitor,
      description: 'Integrate with EDR/XDR platforms',
      color: 'text-purple-400',
      examples: ['CrowdStrike', 'SentinelOne', 'Microsoft Defender']
    },
    {
      type: 'custom',
      name: 'Custom Integration',
      icon: Code,
      description: 'Build custom MCP servers for specific tools',
      color: 'text-cyan-400',
      examples: ['Custom APIs', 'Internal Tools', 'Legacy Systems']
    }
  ];

  // Mock MCP servers data
  useEffect(() => {
    loadMCPServers();
    loadServerMetrics();
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadMCPServers = () => {
    const mockServers = [
      {
        id: '1',
        name: 'VirusTotal Intelligence',
        type: 'threat-intel',
        endpoint: 'https://www.virustotal.com/api/v3',
        status: 'connected',
        last_sync: '2024-01-15T14:30:00Z',
        requests_today: 847,
        success_rate: 99.2,
        latency_avg: 145,
        enabled: true,
        auth_config: { api_key_configured: true }
      },
      {
        id: '2',
        name: 'Splunk Enterprise',
        type: 'siem',
        endpoint: 'https://splunk.internal:8089',
        status: 'connected',
        last_sync: '2024-01-15T14:25:00Z',
        requests_today: 1205,
        success_rate: 98.7,
        latency_avg: 320,
        enabled: true,
        auth_config: { token_configured: true }
      },
      {
        id: '3',
        name: 'Nessus Scanner',
        type: 'vulnerability',
        endpoint: 'https://nessus.internal:8834',
        status: 'disconnected',
        last_sync: '2024-01-15T12:15:00Z',
        requests_today: 0,
        success_rate: 0,
        latency_avg: 0,
        enabled: false,
        auth_config: { api_key_configured: false },
        error: 'Authentication failed'
      },
      {
        id: '4',
        name: 'CrowdStrike Falcon',
        type: 'endpoint',
        endpoint: 'https://api.crowdstrike.com',
        status: 'connecting',
        last_sync: null,
        requests_today: 0,
        success_rate: 0,
        latency_avg: 0,
        enabled: true,
        auth_config: { oauth_configured: true }
      }
    ];
    
    setMcpServers(mockServers);
    setConnectedServers(mockServers.filter(s => s.status === 'connected'));
  };

  const loadServerMetrics = () => {
    setServerMetrics({
      total_servers: 4,
      connected: 2,
      failed: 1,
      total_requests_today: 2052,
      avg_latency: 232,
      success_rate: 98.9
    });
  };

  const updateMetrics = () => {
    // Simulate real-time metric updates
    setServerMetrics(prev => ({
      ...prev,
      total_requests_today: prev.total_requests_today + Math.floor(Math.random() * 5),
      avg_latency: Math.max(100, prev.avg_latency + (Math.random() - 0.5) * 20),
      success_rate: Math.max(95, Math.min(100, prev.success_rate + (Math.random() - 0.5) * 0.5))
    }));

    // Update server-specific metrics
    setMcpServers(prev => prev.map(server => ({
      ...server,
      requests_today: server.status === 'connected' 
        ? server.requests_today + Math.floor(Math.random() * 3)
        : server.requests_today,
      latency_avg: server.status === 'connected'
        ? Math.max(50, server.latency_avg + (Math.random() - 0.5) * 10)
        : server.latency_avg
    })));
  };

  const connectToServer = async (serverId) => {
    setIsConnecting(prev => ({ ...prev, [serverId]: true }));
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMcpServers(prev => prev.map(server => 
        server.id === serverId 
          ? { 
              ...server, 
              status: 'connected', 
              last_sync: new Date().toISOString(),
              error: null 
            }
          : server
      ));
      
    } catch (error) {
      setMcpServers(prev => prev.map(server => 
        server.id === serverId 
          ? { ...server, status: 'disconnected', error: 'Connection failed' }
          : server
      ));
    } finally {
      setIsConnecting(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const disconnectServer = async (serverId) => {
    setMcpServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'disconnected' }
        : server
    ));
  };

  const addMCPServer = async (e) => {
    e.preventDefault();
    
    const newServerData = {
      id: Date.now().toString(),
      ...newServer,
      status: 'disconnected',
      last_sync: null,
      requests_today: 0,
      success_rate: 0,
      latency_avg: 0,
      auth_config: { configured: false }
    };
    
    setMcpServers(prev => [...prev, newServerData]);
    setNewServer({
      name: '',
      type: 'threat-intel',
      endpoint: '',
      auth_config: {},
      enabled: true
    });
    setShowAddModal(false);
  };

  const getServerTypeInfo = (type) => {
    return serverTypes.find(t => t.type === type) || serverTypes[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'connecting': return Loader;
      case 'disconnected': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <span>Model Context Protocol</span>
          </h1>
          <p className="body-text text-zinc-400">Real-time connections to security tools and data sources</p>
        </div>
        
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add MCP Server</span>
        </motion.button>
      </div>

      {/* Metrics Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-yellow-400">Total Servers</h3>
              <Link className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{serverMetrics.total_servers}</div>
            <p className="text-sm text-zinc-400">
              {serverMetrics.connected} connected, {serverMetrics.failed} failed
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-400">Requests Today</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {serverMetrics.total_requests_today?.toLocaleString()}
            </div>
            <p className="text-sm text-zinc-400">Across all servers</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-400">Avg Latency</h3>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round(serverMetrics.avg_latency)}ms
            </div>
            <p className="text-sm text-zinc-400">Response time</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-400">Success Rate</h3>
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {serverMetrics.success_rate?.toFixed(1)}%
            </div>
            <p className="text-sm text-zinc-400">Overall reliability</p>
          </div>
        </Card>
      </div>

      {/* Server Types */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-6">Available Server Types</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serverTypes.map((serverType, index) => {
              const Icon = serverType.icon;
              return (
                <motion.div
                  key={serverType.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`w-6 h-6 ${serverType.color}`} />
                    <h4 className="font-medium">{serverType.name}</h4>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{serverType.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {serverType.examples.slice(0, 2).map(example => (
                      <span key={example} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                        {example}
                      </span>
                    ))}
                    {serverType.examples.length > 2 && (
                      <span className="text-xs text-zinc-500">+{serverType.examples.length - 2}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active MCP Servers */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-6 flex items-center space-x-2">
            <Network className="w-5 h-5 text-blue-400" />
            <span>MCP Servers</span>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
              {mcpServers.length}
            </span>
          </h3>
          
          <div className="space-y-4">
            {mcpServers.map((server, index) => {
              const typeInfo = getServerTypeInfo(server.type);
              const StatusIcon = getStatusIcon(server.status);
              const TypeIcon = typeInfo.icon;
              
              return (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <TypeIcon className={`w-8 h-8 ${typeInfo.color} mt-1`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-zinc-200">{server.name}</h4>
                          <span className={`flex items-center space-x-1 text-sm ${getStatusColor(server.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="capitalize">{server.status}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-zinc-400 mb-2">
                          <span>{typeInfo.name}</span>
                          <span>•</span>
                          <span className="font-mono">{server.endpoint}</span>
                        </div>
                        
                        {server.error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-2">
                            <div className="flex items-center space-x-2 text-sm text-red-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{server.error}</span>
                            </div>
                          </div>
                        )}
                        
                        {server.status === 'connected' && (
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-zinc-500">Requests Today</span>
                              <div className="font-medium text-green-400">{server.requests_today}</div>
                            </div>
                            <div>
                              <span className="text-zinc-500">Success Rate</span>
                              <div className="font-medium text-blue-400">{server.success_rate}%</div>
                            </div>
                            <div>
                              <span className="text-zinc-500">Avg Latency</span>
                              <div className="font-medium text-purple-400">{Math.round(server.latency_avg)}ms</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {server.status === 'disconnected' && (
                        <motion.button
                          onClick={() => connectToServer(server.id)}
                          disabled={isConnecting[server.id]}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-zinc-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isConnecting[server.id] ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>{isConnecting[server.id] ? 'Connecting...' : 'Connect'}</span>
                        </motion.button>
                      )}
                      
                      {server.status === 'connected' && (
                        <button
                          onClick={() => disconnectServer(server.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                        >
                          <Square className="w-3 h-3" />
                          <span>Disconnect</span>
                        </button>
                      )}
                      
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-zinc-400" />
                      </button>
                      
                      <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Add MCP Server Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-lg w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add MCP Server</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={addMCPServer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Server Name</label>
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., My Threat Intel Feed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Server Type</label>
                  <select
                    value={newServer.type}
                    onChange={(e) => setNewServer({...newServer, type: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                  >
                    {serverTypes.map(type => (
                      <option key={type.type} value={type.type}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    value={newServer.endpoint}
                    onChange={(e) => setNewServer({...newServer, endpoint: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="https://api.example.com"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={newServer.enabled}
                    onChange={(e) => setNewServer({...newServer, enabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="enabled" className="text-sm">Enable server immediately</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Server
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCP;