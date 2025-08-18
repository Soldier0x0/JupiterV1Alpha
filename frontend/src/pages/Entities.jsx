import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Server, Globe, Shield, Search, Filter, Eye, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';

const Entities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');

  // Mock entity data
  const entities = [
    {
      id: '1',
      type: 'user',
      name: 'john.doe@company.com',
      risk_score: 85,
      risk_level: 'high',
      last_seen: new Date().toISOString(),
      alerts: 12,
      details: {
        failed_logins: 5,
        successful_logins: 23,
        devices: 3,
        locations: ['New York', 'London']
      }
    },
    {
      id: '2',
      type: 'host',
      name: 'web-server-01',
      risk_score: 35,
      risk_level: 'low',
      last_seen: new Date(Date.now() - 300000).toISOString(),
      alerts: 2,
      details: {
        ip_address: '10.0.1.50',
        os: 'Ubuntu 22.04',
        services: ['nginx', 'ssh'],
        vulnerabilities: 0
      }
    },
    {
      id: '3',
      type: 'ip',
      name: '192.168.1.100',
      risk_score: 92,
      risk_level: 'critical',
      last_seen: new Date(Date.now() - 600000).toISOString(),
      alerts: 25,
      details: {
        geolocation: 'Unknown',
        organization: 'Unknown',
        reputation: 'Malicious',
        first_seen: '2025-01-25T10:30:00Z'
      }
    }
  ];

  const getEntityIcon = (type) => {
    switch (type) {
      case 'user': return Users;
      case 'host': return Server;
      case 'ip': return Globe;
      default: return Shield;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-jupiter-danger bg-jupiter-danger/20 border-jupiter-danger/30';
      case 'high': return 'text-jupiter-warning bg-jupiter-warning/20 border-jupiter-warning/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-jupiter-success bg-jupiter-success/20 border-jupiter-success/30';
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-jupiter-danger';
    if (score >= 60) return 'text-jupiter-warning';
    if (score >= 40) return 'text-yellow-500';
    return 'text-jupiter-success';
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = entityType === 'all' || entity.type === entityType;
    const matchesRisk = riskLevel === 'all' || entity.risk_level === riskLevel;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Entity Management</h1>
        <p className="text-zinc-400 mt-1">Monitor and analyze users, hosts, and network entities</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="user">Users</option>
            <option value="host">Hosts</option>
            <option value="ip">IP Addresses</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="input-field"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEntities.map((entity, index) => {
          const EntityIcon = getEntityIcon(entity.type);
          return (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-card-hover transition-all duration-300">
                <div className="space-y-4">
                  {/* Entity Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-jupiter-secondary/20 rounded-xl flex items-center justify-center">
                        <EntityIcon className="w-5 h-5 text-jupiter-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-200">{entity.name}</h3>
                        <p className="text-sm text-zinc-400 capitalize">{entity.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(entity.risk_level)}`}>
                      {entity.risk_level}
                    </span>
                  </div>

                  {/* Risk Score */}
                  <div className="bg-cosmic-gray/30 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Risk Score</span>
                      <span className={`text-sm font-bold ${getRiskScoreColor(entity.risk_score)}`}>
                        {entity.risk_score}/100
                      </span>
                    </div>
                    <div className="w-full bg-cosmic-gray rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          entity.risk_score >= 80 ? 'bg-jupiter-danger' :
                          entity.risk_score >= 60 ? 'bg-jupiter-warning' :
                          entity.risk_score >= 40 ? 'bg-yellow-500' :
                          'bg-jupiter-success'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${entity.risk_score}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      ></motion.div>
                    </div>
                  </div>

                  {/* Entity Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Alerts</span>
                      <span className="text-zinc-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{entity.alerts}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Last Seen</span>
                      <span className="text-zinc-200 text-xs">
                        {new Date(entity.last_seen).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Specific Details */}
                  <div className="border-t border-cosmic-border pt-3">
                    {entity.type === 'user' && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500">Failed Logins:</span>
                          <span className="text-jupiter-danger ml-1">{entity.details.failed_logins}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Devices:</span>
                          <span className="text-zinc-300 ml-1">{entity.details.devices}</span>
                        </div>
                      </div>
                    )}
                    
                    {entity.type === 'host' && (
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-zinc-500">IP:</span>
                          <span className="text-zinc-300 ml-1 font-mono">{entity.details.ip_address}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">OS:</span>
                          <span className="text-zinc-300 ml-1">{entity.details.os}</span>
                        </div>
                      </div>
                    )}
                    
                    {entity.type === 'ip' && (
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-zinc-500">Reputation:</span>
                          <span className={`ml-1 ${entity.details.reputation === 'Malicious' ? 'text-jupiter-danger' : 'text-jupiter-success'}`}>
                            {entity.details.reputation}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">First Seen:</span>
                          <span className="text-zinc-300 ml-1">{new Date(entity.details.first_seen).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <motion.button
                      className="btn-ghost text-xs py-2 px-3 flex-1 flex items-center justify-center space-x-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </motion.button>
                    <motion.button
                      className="btn-primary text-xs py-2 px-3 flex-1 flex items-center justify-center space-x-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Investigate</span>
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredEntities.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 mb-2">No entities found</p>
            <p className="text-sm text-zinc-500">Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Entities;