import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter, Download, Search, Plus, Eye, CheckCircle, X } from 'lucide-react';
import Card from '../components/Card';
import { alertsAPI } from '../utils/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    source: 'all',
    status: 'all',
    dateRange: '24h'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters, searchTerm]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // Mock data fallback
      setAlerts([
        {
          _id: '1',
          severity: 'critical',
          source: 'Firewall',
          entity: 'Host A',
          message: 'Unauthorized access detected from 192.168.1.100',
          timestamp: new Date().toISOString(),
          status: 'open'
        },
        {
          _id: '2',
          severity: 'high',
          source: 'Endpoint',
          entity: 'User B',
          message: 'Malware detected in downloaded file',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'investigating'
        },
        {
          _id: '3',
          severity: 'medium',
          source: 'Network',
          entity: 'IP C',
          message: 'Suspicious DNS queries detected',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'resolved'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    // Apply source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(alert => alert.source === filters.source);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-jupiter-danger bg-jupiter-danger/20 border-jupiter-danger/30';
      case 'high': return 'text-jupiter-warning bg-jupiter-warning/20 border-jupiter-warning/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-jupiter-success bg-jupiter-success/20 border-jupiter-success/30';
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-jupiter-danger bg-jupiter-danger/20';
      case 'investigating': return 'text-jupiter-warning bg-jupiter-warning/20';
      case 'resolved': return 'text-jupiter-success bg-jupiter-success/20';
      default: return 'text-zinc-400 bg-zinc-400/20';
    }
  };

  const exportAlerts = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Source', 'Entity', 'Message', 'Status'],
      ...filteredAlerts.map(alert => [
        alert.timestamp,
        alert.severity,
        alert.source,
        alert.entity,
        alert.message,
        alert.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jupiter-alerts-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-gradient">Security Alerts</h1>
          <p className="text-zinc-400 mt-1">Monitor and manage security incidents</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={exportAlerts}
            className="btn-ghost flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Test Alert</span>
          </motion.button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="input-field"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="input-field"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-zinc-400 mt-3">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-2">No alerts found</p>
              <p className="text-sm text-zinc-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cosmic-border">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Severity</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Source</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Entity</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Message</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, index) => (
                    <motion.tr
                      key={alert._id}
                      className="border-b border-cosmic-border/50 hover:bg-cosmic-gray/20 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">{alert.source}</td>
                      <td className="py-3 px-4 text-sm text-zinc-300 font-mono">{alert.entity}</td>
                      <td className="py-3 px-4 text-sm text-zinc-300 max-w-xs truncate">{alert.message}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => setSelectedAlert(alert)}
                            className="p-1 hover:bg-cosmic-gray rounded transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-4 h-4 text-zinc-400" />
                          </motion.button>
                          <motion.button
                            className="p-1 hover:bg-jupiter-success/20 rounded transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CheckCircle className="w-4 h-4 text-jupiter-success" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-cosmic-dark border border-cosmic-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-jupiter-warning" />
                <span>Alert Details</span>
              </h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400">Severity</label>
                  <p className={`mt-1 text-sm px-2 py-1 rounded-full border inline-block ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Status</label>
                  <p className={`mt-1 text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Source</label>
                  <p className="mt-1 text-zinc-200">{selectedAlert.source}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Entity</label>
                  <p className="mt-1 text-zinc-200 font-mono">{selectedAlert.entity}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Message</label>
                <p className="mt-1 text-zinc-200 bg-cosmic-gray/30 p-3 rounded-xl">{selectedAlert.message}</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Timestamp</label>
                <p className="mt-1 text-zinc-200 font-mono">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>

              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <label className="text-sm text-zinc-400">Metadata</label>
                  <pre className="mt-1 text-xs text-zinc-300 bg-cosmic-gray/30 p-3 rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button className="btn-ghost flex-1">
                Investigate
              </button>
              <button className="btn-primary flex-1">
                Resolve
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Alerts;