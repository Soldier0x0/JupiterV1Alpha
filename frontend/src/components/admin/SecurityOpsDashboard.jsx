import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Settings, 
  Key, 
  Eye, 
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle as Panic,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  Server,
  Lock,
  Unlock
} from 'lucide-react';
import EnhancedCard from '../ui/EnhancedCard';
import { SkeletonCard, EmptyState, ErrorState } from '../ui/LoadingStates';

const SecurityOpsDashboard = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditResults, setAuditResults] = useState(null);
  const [segregationResults, setSegregationResults] = useState(null);
  const [driftResults, setDriftResults] = useState(null);
  const [tenantHealth, setTenantHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadRBACAudit(),
        loadSegregationAudit(),
        loadConfigDrift(),
        loadTenantHealth()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRBACAudit = async () => {
    try {
      const response = await fetch('/api/security-ops/admin/rbac-audit', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditResults(data.results);
      }
    } catch (error) {
      console.error('Error loading RBAC audit:', error);
    }
  };

  const loadSegregationAudit = async () => {
    try {
      const response = await fetch('/api/security-ops/admin/tenant-segregation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSegregationResults(data.segregation_results);
      }
    } catch (error) {
      console.error('Error loading segregation audit:', error);
    }
  };

  const loadConfigDrift = async () => {
    try {
      const response = await fetch('/api/security-ops/admin/config-drift', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDriftResults(data.results);
      }
    } catch (error) {
      console.error('Error loading config drift:', error);
    }
  };

  const loadTenantHealth = async () => {
    try {
      const response = await fetch('/api/security-ops/tenants/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenantHealth(data.health_data);
      }
    } catch (error) {
      console.error('Error loading tenant health:', error);
    }
  };

  const rotateKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security-ops/admin/rotate-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Show success message
        console.log('Keys rotated successfully:', data);
      }
    } catch (error) {
      console.error('Error rotating keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const activatePanicMode = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security-ops/admin/panic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPanicMode(data.panic_mode);
        // Show success message
        console.log('Panic mode activated:', data);
      }
    } catch (error) {
      console.error('Error activating panic mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'audit', label: 'Security Audit', icon: Shield },
    { id: 'segregation', label: 'Tenant Segregation', icon: Database },
    { id: 'drift', label: 'Config Drift', icon: Settings },
    { id: 'health', label: 'System Health', icon: TrendingUp },
    { id: 'ops', label: 'Operations', icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Operations Dashboard</h1>
          <p className="text-zinc-400 mt-1">Admin controls and security monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadInitialData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Panic Mode Alert */}
      {panicMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Panic className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">Panic Mode Active</h3>
              <p className="text-sm text-red-300">Emergency protocols are in effect</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-zinc-800 border-b-2 border-yellow-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <EnhancedCard
                title="RBAC Audit Results"
                subtitle="Role-based access control analysis"
                priority="high"
                count={auditResults?.issues?.length || 0}
              >
                {loading ? (
                  <SkeletonCard lines={4} />
                ) : auditResults ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{auditResults.user_count}</div>
                        <div className="text-sm text-zinc-400">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{auditResults.role_count}</div>
                        <div className="text-sm text-zinc-400">Roles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{auditResults.permission_count}</div>
                        <div className="text-sm text-zinc-400">Permissions</div>
                      </div>
                    </div>

                    {auditResults.issues.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Issues Found</h4>
                        {auditResults.issues.map((issue, index) => (
                          <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-medium text-red-400">{issue.type}</span>
                            </div>
                            <p className="text-sm text-zinc-300 mt-1">{issue.description}</p>
                            <p className="text-xs text-zinc-400 mt-1">User: {issue.user}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {auditResults.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Recommendations</h4>
                        {auditResults.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-blue-400">{rec}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={Shield}
                    title="No Audit Data"
                    description="Run RBAC audit to see results"
                  />
                )}
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'segregation' && (
            <div className="space-y-6">
              <EnhancedCard
                title="Tenant Segregation Audit"
                subtitle="Multi-tenant data isolation verification"
                priority="critical"
                count={segregationResults?.segregation_violations || 0}
              >
                {loading ? (
                  <SkeletonCard lines={3} />
                ) : segregationResults ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{segregationResults.tenants_checked}</div>
                        <div className="text-sm text-zinc-400">Tenants Checked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{segregationResults.segregation_violations}</div>
                        <div className="text-sm text-zinc-400">Violations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{segregationResults.data_leaks}</div>
                        <div className="text-sm text-zinc-400">Data Leaks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{segregationResults.cross_tenant_access}</div>
                        <div className="text-sm text-zinc-400">Cross Access</div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      segregationResults.status === 'compliant' 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {segregationResults.status === 'compliant' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`font-medium ${
                          segregationResults.status === 'compliant' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          Status: {segregationResults.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Database}
                    title="No Segregation Data"
                    description="Run segregation audit to see results"
                  />
                )}
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'drift' && (
            <div className="space-y-6">
              <EnhancedCard
                title="Configuration Drift Detection"
                subtitle="Monitor configuration changes"
                priority="medium"
                count={driftResults?.drift_count || 0}
              >
                {loading ? (
                  <SkeletonCard lines={3} />
                ) : driftResults ? (
                  <div className="space-y-4">
                    {driftResults.drifts.length > 0 ? (
                      <div className="space-y-3">
                        {driftResults.drifts.map((drift, index) => (
                          <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-yellow-400">{drift.component}</h4>
                                <p className="text-sm text-zinc-300">
                                  Expected: {drift.expected} → Actual: {drift.actual}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                drift.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                drift.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {drift.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">No Configuration Drift</h3>
                        <p className="text-zinc-400">All configurations are in sync</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={Settings}
                    title="No Drift Data"
                    description="Run config drift detection to see results"
                  />
                )}
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <EnhancedCard
                title="System Health Overview"
                subtitle="Real-time system metrics"
                priority="medium"
              >
                {loading ? (
                  <SkeletonCard lines={4} />
                ) : tenantHealth ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-white mb-3">Severity Distribution</h4>
                        <div className="space-y-2">
                          {Object.entries(tenantHealth.severity_counts).map(([severity, count]) => (
                            <div key={severity} className="flex items-center justify-between">
                              <span className="text-sm text-zinc-300 capitalize">{severity}</span>
                              <span className="text-sm font-medium text-white">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-3">Load Metrics</h4>
                        <div className="space-y-2">
                          {Object.entries(tenantHealth.load_metrics).map(([metric, value]) => (
                            <div key={metric} className="flex items-center justify-between">
                              <span className="text-sm text-zinc-300 capitalize">{metric.replace('_', ' ')}</span>
                              <span className="text-sm font-medium text-white">{value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Health Score</span>
                        <span className="text-sm font-medium text-white">
                          {(tenantHealth.health_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            tenantHealth.health_score > 0.8 ? 'bg-green-400' :
                            tenantHealth.health_score > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${tenantHealth.health_score * 100}%` }}
                        />
                      </div>
                    </div>

                    {tenantHealth.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-3">Recommendations</h4>
                        <div className="space-y-2">
                          {tenantHealth.recommendations.map((rec, index) => (
                            <div key={index} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-300">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title="No Health Data"
                    description="System health metrics not available"
                  />
                )}
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'ops' && (
            <div className="space-y-6">
              <EnhancedCard
                title="Security Operations"
                subtitle="Critical security controls"
                priority="high"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Key Management</h4>
                    <button
                      onClick={rotateKeys}
                      disabled={loading}
                      className="w-full p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3">
                        <RotateCcw className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="font-medium text-white">Rotate Encryption Keys</div>
                          <div className="text-sm text-zinc-400">Generate new encryption keys</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Emergency Controls</h4>
                    <button
                      onClick={activatePanicMode}
                      disabled={loading || panicMode}
                      className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Panic className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="font-medium text-white">Activate Panic Mode</div>
                          <div className="text-sm text-zinc-400">Emergency security protocols</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard
                title="System Status"
                subtitle="Service health and readiness"
                priority="medium"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Health Check</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Database</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Healthy</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Redis</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Healthy</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">External APIs</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Readiness Check</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Services Ready</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Ready</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Config Loaded</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SecurityOpsDashboard;
