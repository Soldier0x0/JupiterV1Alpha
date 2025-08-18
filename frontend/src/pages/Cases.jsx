import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Clock, User, Flag, Search, Filter } from 'lucide-react';
import Card from '../components/Card';
import { casesAPI } from '../utils/api';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await casesAPI.getCases();
      setCases(response.data.cases || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
      // Mock data fallback
      setCases([
        {
          _id: '1',
          title: 'Suspicious Network Activity Investigation',
          description: 'Multiple failed login attempts from external IP',
          severity: 'high',
          status: 'open',
          created_at: new Date().toISOString(),
          created_by: 'automation',
          assigned_to: null,
          related_alerts: ['alert-1', 'alert-2']
        },
        {
          _id: '2',
          title: 'Malware Detection Follow-up',
          description: 'Endpoint protection detected potential malware',
          severity: 'critical',
          status: 'investigating',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          created_by: 'john.doe@company.com',
          assigned_to: 'security-team',
          related_alerts: ['alert-3']
        }
      ]);
    } finally {
      setLoading(false);
    }
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
      case 'closed': return 'text-zinc-400 bg-zinc-400/20';
      default: return 'text-zinc-400 bg-zinc-400/20';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gradient">Case Management</h1>
          <p className="text-zinc-400 mt-1">Track and manage security investigations</p>
        </div>
        <motion.button
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>New Case</span>
        </motion.button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <span>Total Cases:</span>
            <span className="font-medium text-jupiter-secondary">{filteredCases.length}</span>
          </div>
        </div>
      </Card>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-glow">
            <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-zinc-400 mt-3">Loading cases...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 mb-2">No cases found</p>
            <p className="text-sm text-zinc-500">Create your first security investigation case</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCases.map((caseItem, index) => (
            <motion.div
              key={caseItem._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-card-hover transition-all duration-300 cursor-pointer">
                <div className="space-y-4">
                  {/* Case Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-200 mb-2">{caseItem.title}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2">{caseItem.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ml-3 ${getSeverityColor(caseItem.severity)}`}>
                      {caseItem.severity}
                    </span>
                  </div>

                  {/* Case Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(caseItem.status).includes('jupiter-success') ? 'bg-jupiter-success' : 
                        getStatusColor(caseItem.status).includes('jupiter-warning') ? 'bg-jupiter-warning' : 'bg-jupiter-danger'}`}></span>
                      <span className="text-zinc-400">Status:</span>
                      <span className="text-zinc-300 capitalize">{caseItem.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">Created:</span>
                      <span className="text-zinc-300">{new Date(caseItem.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">Creator:</span>
                      <span className="text-zinc-300">{caseItem.created_by}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flag className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">Alerts:</span>
                      <span className="text-zinc-300">{caseItem.related_alerts?.length || 0}</span>
                    </div>
                  </div>

                  {/* Case Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-cosmic-border">
                    <div className="flex items-center space-x-2">
                      {caseItem.assigned_to && (
                        <span className="text-xs bg-jupiter-secondary/20 text-jupiter-secondary px-2 py-1 rounded-full">
                          Assigned: {caseItem.assigned_to}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        className="btn-ghost text-xs py-2 px-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Details
                      </motion.button>
                      <motion.button
                        className="btn-primary text-xs py-2 px-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Investigate
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Cases;