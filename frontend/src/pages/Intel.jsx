import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Plus, AlertTriangle, Eye, Globe, Hash, Link, Edit, Trash2, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/Card';
import { threatIntelAPI } from '../utils/api';

const Intel = () => {
  const [iocs, setIocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIOC, setSelectedIOC] = useState(null);
  const [lookupResults, setLookupResults] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIOC, setNewIOC] = useState({
    ioc_type: 'ip',
    value: '',
    threat_level: 'medium',
    tags: [],
    description: ''
  });

  useEffect(() => {
    loadIOCs();
  }, []);

  const loadIOCs = async () => {
    try {
      const response = await threatIntelAPI.getIOCs();
      setIocs(response.data.iocs || []);
    } catch (error) {
      console.error('Failed to load IOCs:', error);
    }
  };

  const handleLookup = async (indicator, type) => {
    setLoading(true);
    setLookupResults(null);
    setSelectedIOC({ value: indicator, type });

    try {
      const response = await threatIntelAPI.lookupThreat(indicator, type);
      setLookupResults(response.data.results);
    } catch (error) {
      console.error('Threat lookup failed:', error);
      setLookupResults({ error: 'Lookup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIOC = async (e) => {
    e.preventDefault();
    try {
      await threatIntelAPI.createIOC(newIOC);
      setNewIOC({ ioc_type: 'ip', value: '', threat_level: 'medium', tags: [], description: '' });
      setShowAddForm(false);
      await loadIOCs();
    } catch (error) {
      console.error('Failed to add IOC:', error);
    }
  };

  const deleteIOC = async (iocId, event) => {
    event.stopPropagation(); // Prevent triggering the lookup
    
    if (!confirm('Are you sure you want to delete this IOC? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIocs(prev => prev.filter(ioc => ioc._id !== iocId));
    } catch (error) {
      console.error('Error deleting IOC:', error);
    }
  };

  const editIOC = async (ioc, event) => {
    event.stopPropagation(); // Prevent triggering the lookup
    
    setNewIOC({
      ioc_type: ioc.ioc_type,
      value: ioc.value,
      threat_level: ioc.threat_level,
      tags: ioc.tags,
      description: ioc.description
    });
    setShowAddForm(true);
  };

  const getIOCIcon = (type) => {
    switch (type) {
      case 'ip': return Globe;
      case 'domain': return Globe;
      case 'hash': return Hash;
      case 'url': return Link;
      default: return Shield;
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-jupiter-danger bg-jupiter-danger/20 border-jupiter-danger/30';
      case 'high': return 'text-jupiter-warning bg-jupiter-warning/20 border-jupiter-warning/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-jupiter-success bg-jupiter-success/20 border-jupiter-success/30';
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30';
    }
  };

  const filteredIOCs = iocs.filter(ioc => 
    ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-gradient">Threat Intelligence</h1>
          <p className="text-zinc-400 mt-1">Manage IOCs and query threat intelligence feeds</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add IOC</span>
        </motion.button>
      </div>

      {/* Search & Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IOC Search */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-jupiter-secondary" />
            <span>IOC Database</span>
          </h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search IOCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredIOCs.map((ioc, index) => {
              const IconComponent = getIOCIcon(ioc.ioc_type);
              return (
                <motion.div
                  key={ioc._id}
                  className="flex items-center justify-between p-3 bg-cosmic-gray/30 rounded-xl hover:bg-cosmic-gray/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLookup(ioc.value, ioc.ioc_type)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <IconComponent className="w-4 h-4 text-jupiter-secondary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-200 truncate">{ioc.value}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getThreatLevelColor(ioc.threat_level)}`}>
                          {ioc.threat_level}
                        </span>
                        {ioc.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => editIOC(ioc, e)}
                      className="p-2 hover:bg-blue-600/20 rounded-lg transition-colors"
                      title="Edit IOC"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={(e) => deleteIOC(ioc._id, e)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                      title="Delete IOC"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <Eye className="w-4 h-4 text-zinc-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Threat Lookup Results */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-jupiter-secondary" />
            <span>Threat Lookup</span>
          </h2>

          {!selectedIOC && !loading && (
            <div className="text-center py-12 text-zinc-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Click on an IOC to query threat intelligence</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-pulse-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-zinc-400 mt-3">Querying threat intelligence feeds...</p>
            </div>
          )}

          {selectedIOC && lookupResults && (
            <div className="space-y-4">
              <div className="bg-cosmic-gray/50 rounded-xl p-4">
                <p className="text-sm text-zinc-400">Indicator</p>
                <p className="font-mono text-jupiter-secondary">{selectedIOC.value}</p>
                <p className="text-xs text-zinc-500 mt-1">Type: {selectedIOC.type}</p>
              </div>

              {Object.entries(lookupResults).map(([source, result]) => (
                <div key={source} className="bg-cosmic-gray/30 rounded-xl p-4">
                  <h3 className="font-medium text-zinc-200 mb-2 capitalize">{source}</h3>
                  {result.error ? (
                    <p className="text-jupiter-danger text-sm">{result.error}</p>
                  ) : (
                    <div className="text-sm text-zinc-400">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add IOC Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-6">Add New IOC</h2>
            <form onSubmit={handleAddIOC} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">IOC Type</label>
                  <select
                    value={newIOC.ioc_type}
                    onChange={(e) => setNewIOC(prev => ({ ...prev, ioc_type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="ip">IP Address</option>
                    <option value="domain">Domain</option>
                    <option value="hash">File Hash</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Threat Level</label>
                  <select
                    value={newIOC.threat_level}
                    onChange={(e) => setNewIOC(prev => ({ ...prev, threat_level: e.target.value }))}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">IOC Value</label>
                <input
                  type="text"
                  value={newIOC.value}
                  onChange={(e) => setNewIOC(prev => ({ ...prev, value: e.target.value }))}
                  className="input-field"
                  placeholder="192.168.1.100 or malicious.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Description</label>
                <textarea
                  value={newIOC.description}
                  onChange={(e) => setNewIOC(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-20 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add IOC
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Intel;