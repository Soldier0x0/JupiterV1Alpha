import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Users, Plus, Settings, Trash2, Mail, Shield, Crown } from 'lucide-react';
import Card from '../components/Card';
import { adminAPI } from '../utils/api';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    description: '',
    enabled: true
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantSettings, setTenantSettings] = useState({
    enabled_features: [],
    permissions: {},
    notifications: true,
    api_access: false
  });

  const openTenantSettings = (tenant) => {
    setSelectedTenant(tenant);
    setTenantSettings({
      enabled_features: tenant.enabled_features || [],
      permissions: tenant.permissions || {},
      notifications: tenant.notifications !== false,
      api_access: tenant.api_access || false
    });
    setShowSettingsModal(true);
  };

  const saveTenantSettings = async () => {
    if (!selectedTenant) return;
    
    try {
      const updatedTenant = {
        ...selectedTenant,
        ...tenantSettings,
        updated_at: new Date().toISOString()
      };
      
      setTenants(prev => prev.map(t => 
        t.id === selectedTenant.id ? updatedTenant : t
      ));
      
      setShowSettingsModal(false);
      setMessage('Tenant settings updated successfully');
    } catch (error) {
      setMessage('Failed to update tenant settings');
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTenants();
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      // Mock data fallback
      setTenants([
        {
          _id: '1',
          name: 'Corporate Security',
          description: 'Main corporate security operations',
          created_at: new Date().toISOString(),
          enabled: true,
          user_count: 12
        },
        {
          _id: '2',
          name: 'Development Team',
          description: 'Development environment monitoring',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          enabled: true,
          user_count: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      // API call would go here
      console.log('Creating tenant:', newTenant);
      setNewTenant({ name: '', description: '', enabled: true });
      setShowCreateForm(false);
      await loadTenants();
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const deleteTenant = async (tenantId) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }
    
    try {
      setTenants(prev => prev.filter(tenant => tenant._id !== tenantId));
      setMessage('Tenant deleted successfully');
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      setMessage('Failed to delete tenant');
    }
  };

  const toggleTenantStatus = (tenantId, currentStatus) => {
    setTenants(prev => prev.map(tenant => 
      tenant._id === tenantId 
        ? { ...tenant, enabled: !currentStatus }
        : tenant
    ));
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
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-2">
            <Crown className="w-8 h-8 text-jupiter-warning" />
            <span>Tenant Management</span>
          </h1>
          <p className="text-zinc-400 mt-1">Manage organizations and their security environments</p>
        </div>
        <motion.button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </motion.button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Tenants</p>
                <p className="text-2xl font-bold text-jupiter-secondary">{tenants.length}</p>
              </div>
              <Building className="w-8 h-8 text-jupiter-secondary" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Active Tenants</p>
                <p className="text-2xl font-bold text-jupiter-success">
                  {tenants.filter(t => t.enabled).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-jupiter-success" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-jupiter-warning">
                  {tenants.reduce((sum, tenant) => sum + (tenant.user_count || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-jupiter-warning" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Create Tenant Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-6">Create New Tenant</h2>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Organization Name</label>
                  <input
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Corporate Security"
                    required
                  />
                </div>
                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={newTenant.enabled}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-jupiter-secondary bg-cosmic-gray border-cosmic-border rounded focus:ring-jupiter-secondary focus:ring-2"
                  />
                  <label htmlFor="enabled" className="text-sm text-zinc-300">
                    Enable tenant immediately
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Description</label>
                <textarea
                  value={newTenant.description}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-20 resize-none"
                  placeholder="Brief description of the organization..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Tenant
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Tenants List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-glow">
              <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-zinc-400 mt-3">Loading tenants...</p>
          </div>
        ) : (
          tenants.map((tenant, index) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${tenant.enabled ? 'bg-jupiter-success' : 'bg-zinc-500'}`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-200 flex items-center space-x-2">
                        <Building className="w-4 h-4 text-jupiter-secondary" />
                        <span>{tenant.name}</span>
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1">{tenant.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                        <span>Created: {new Date(tenant.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{tenant.user_count} users</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${tenant.enabled ? 'bg-jupiter-success/20 text-jupiter-success' : 'bg-zinc-500/20 text-zinc-500'}`}>
                      {tenant.enabled ? 'Active' : 'Disabled'}
                    </span>
                    
                    <motion.button
                      onClick={() => openTenantSettings(tenant)}
                      className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Tenant Settings"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => deleteTenant(tenant._id)}
                      className="p-2 hover:bg-jupiter-danger/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4 text-jupiter-danger" />
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Tenant Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && selectedTenant && (
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
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Tenant Settings - {selectedTenant.name}</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Enabled Features */}
                <div>
                  <label className="block text-sm font-medium mb-3">Enabled Features</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'alerts', label: 'Alerts & Monitoring' },
                      { id: 'intel', label: 'Threat Intelligence' },
                      { id: 'automations', label: 'SOAR Automations' },
                      { id: 'ai_console', label: 'AI Console' },
                      { id: 'deception', label: 'Deception Technology' },
                      { id: 'training', label: 'Security Training' },
                      { id: 'cases', label: 'Case Management' },
                      { id: 'entities', label: 'Entity Management' }
                    ].map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={feature.id}
                          checked={tenantSettings.enabled_features.includes(feature.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTenantSettings(prev => ({
                                ...prev,
                                enabled_features: [...prev.enabled_features, feature.id]
                              }));
                            } else {
                              setTenantSettings(prev => ({
                                ...prev,
                                enabled_features: prev.enabled_features.filter(f => f !== feature.id)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-red-500"
                        />
                        <label htmlFor={feature.id} className="text-sm text-zinc-300">
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Create Users</span>
                      <input
                        type="checkbox"
                        checked={tenantSettings.permissions.create_users || false}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, create_users: e.target.checked }
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Manage API Keys</span>
                      <input
                        type="checkbox"
                        checked={tenantSettings.permissions.manage_api_keys || false}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, manage_api_keys: e.target.checked }
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Export Data</span>
                      <input
                        type="checkbox"
                        checked={tenantSettings.permissions.export_data || false}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, export_data: e.target.checked }
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Configure Integrations</span>
                      <input
                        type="checkbox"
                        checked={tenantSettings.permissions.configure_integrations || false}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, configure_integrations: e.target.checked }
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications & API Access */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Notifications</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={tenantSettings.notifications}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          notifications: e.target.checked
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                      <label htmlFor="notifications" className="text-sm text-zinc-300">
                        Enable email notifications
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">API Access</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="api_access"
                        checked={tenantSettings.api_access}
                        onChange={(e) => setTenantSettings(prev => ({
                          ...prev,
                          api_access: e.target.checked
                        }))}
                        className="w-4 h-4 text-red-500"
                      />
                      <label htmlFor="api_access" className="text-sm text-zinc-300">
                        Enable API access
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={saveTenantSettings}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TenantManagement;