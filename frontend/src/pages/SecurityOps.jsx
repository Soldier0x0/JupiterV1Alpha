import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Settings, 
  Database, 
  TrendingUp,
  Key,
  Webhook,
  Play,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import EnhancedCard from '../components/ui/EnhancedCard';
import EnhancedTabs from '../components/ui/EnhancedTabs';
import SecurityOpsDashboard from '../components/admin/SecurityOpsDashboard';

const SecurityOps = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Security Dashboard',
      icon: Shield,
      badge: 'Core'
    },
    {
      id: 'webhooks',
      label: 'Webhook Config',
      icon: Webhook,
      badge: 'Integration'
    },
    {
      id: 'replay',
      label: 'Incident Replay',
      icon: Play,
      badge: 'Analysis'
    },
    {
      id: 'simulation',
      label: 'Attack Simulation',
      icon: AlertTriangle,
      badge: 'Testing'
    },
    {
      id: 'compliance',
      label: 'Compliance Reports',
      icon: FileText,
      badge: 'Enterprise'
    }
  ];

  const systemStatus = {
    overall: 'healthy',
    services: [
      { name: 'Database', status: 'healthy', icon: Database },
      { name: 'Redis Cache', status: 'healthy', icon: Database },
      { name: 'External APIs', status: 'healthy', icon: Webhook },
      { name: 'File Storage', status: 'healthy', icon: Database }
    ]
  };

  const recentActivities = [
    {
      id: 1,
      type: 'audit',
      message: 'RBAC audit completed',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: 2,
      type: 'drift',
      message: 'Configuration drift detected',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'warning'
    },
    {
      id: 3,
      type: 'key_rotation',
      message: 'Encryption keys rotated',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: 4,
      type: 'segregation',
      message: 'Tenant segregation audit passed',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'success'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SecurityOpsDashboard />;
      case 'webhooks':
        return (
          <div className="space-y-6">
            <EnhancedCard
              title="Webhook Configuration"
              subtitle="Configure alert notifications"
              priority="medium"
            >
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Webhook className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Slack Integration</h4>
                        <p className="text-sm text-zinc-400">Send alerts to Slack channels</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Status: Connected</span>
                      <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                        Active
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Webhook className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Discord Integration</h4>
                        <p className="text-sm text-zinc-400">Send alerts to Discord servers</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Status: Not configured</span>
                      <button className="px-3 py-1 bg-zinc-500/20 text-zinc-400 rounded-lg text-sm">
                        Setup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        );
      case 'replay':
        return (
          <div className="space-y-6">
            <EnhancedCard
              title="Incident Replay"
              subtitle="Replay security incidents in sequence"
              priority="medium"
            >
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <Play className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">Recent Incidents</h4>
                      <p className="text-sm text-zinc-400">Select an incident to replay</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'inc_001', name: 'SQL Injection Attack', timestamp: '2 hours ago', logs: 45 },
                      { id: 'inc_002', name: 'Brute Force Attempt', timestamp: '4 hours ago', logs: 23 },
                      { id: 'inc_003', name: 'Port Scan Detection', timestamp: '6 hours ago', logs: 12 }
                    ].map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <div>
                          <h5 className="font-medium text-white">{incident.name}</h5>
                          <p className="text-sm text-zinc-400">{incident.timestamp} • {incident.logs} logs</p>
                        </div>
                        <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors">
                          Replay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        );
      case 'simulation':
        return (
          <div className="space-y-6">
            <EnhancedCard
              title="Attack Simulation"
              subtitle="Simulate attacks for testing"
              priority="high"
            >
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'SQL Injection', type: 'injection', severity: 'high' },
                    { name: 'Brute Force', type: 'brute_force', severity: 'medium' },
                    { name: 'Port Scan', type: 'reconnaissance', severity: 'low' },
                    { name: 'Malware Download', type: 'malware', severity: 'critical' }
                  ].map((simulation) => (
                    <div key={simulation.type} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{simulation.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          simulation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          simulation.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          simulation.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {simulation.severity}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        Simulate {simulation.name.toLowerCase()} attack patterns
                      </p>
                      <button className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                        Simulate Attack
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </EnhancedCard>
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-6">
            <EnhancedCard
              title="Compliance Reports"
              subtitle="Generate enterprise compliance reports"
              priority="medium"
            >
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'ISO 27001', description: 'Information security management', status: 'compliant' },
                    { name: 'SOC 2', description: 'Security, availability, and confidentiality', status: 'compliant' },
                    { name: 'PCI DSS', description: 'Payment card industry standards', status: 'partial' }
                  ].map((standard) => (
                    <div key={standard.name} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{standard.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${
                          standard.status === 'compliant' ? 'bg-green-400' :
                          standard.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">{standard.description}</p>
                      <button className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors">
                        Generate Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </EnhancedCard>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Operations</h1>
          <p className="text-zinc-400 mt-1">Advanced security controls and monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.overall === 'healthy' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm text-zinc-400 capitalize">{systemStatus.overall}</span>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <EnhancedCard
        title="System Status"
        subtitle="Real-time system health"
        priority="medium"
      >
        <div className="grid md:grid-cols-4 gap-4">
          {systemStatus.services.map((service) => (
            <div key={service.name} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
              <service.icon className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{service.name}</div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 capitalize">{service.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard>

      {/* Recent Activities */}
      <EnhancedCard
        title="Recent Activities"
        subtitle="Latest security operations"
        priority="low"
        count={recentActivities.length}
      >
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-400' :
                activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{activity.message}</div>
                <div className="text-xs text-zinc-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-zinc-500 capitalize">{activity.type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </EnhancedCard>

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        className="mb-6"
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SecurityOps;
