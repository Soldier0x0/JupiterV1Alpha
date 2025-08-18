import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Trash2, Plus, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import { settingsAPI } from '../utils/api';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    api_key: '',
    endpoint: '',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showKeys, setShowKeys] = useState({});

  const threatIntelServices = [
    {
      name: 'AbuseIPDB',
      endpoint: 'https://api.abuseipdb.com/api/v2',
      description: 'IP reputation and abuse checking',
      icon: Shield
    },
    {
      name: 'VirusTotal',
      endpoint: 'https://www.virustotal.com/vtapi/v2',
      description: 'File and URL threat analysis',
      icon: Shield
    },
    {
      name: 'LeakIX',
      endpoint: 'https://leakix.net/api',
      description: 'Exposed services and data leaks',
      icon: Shield
    },
    {
      name: 'DeHashed',
      endpoint: 'https://api.dehashed.com',
      description: 'Breach monitoring and credential leaks',
      icon: Shield
    },
    {
      name: 'HaveIBeenPwned',
      endpoint: 'https://haveibeenpwned.com/api/v3',
      description: 'Breach notification service',
      icon: Shield
    }
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await settingsAPI.getAPIKeys();
      setApiKeys(response.data.api_keys || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setMessage('Failed to load API keys');
    }
  };

  const handleAddApiKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await settingsAPI.saveAPIKey(newApiKey);
      setMessage(response.data.message);
      setNewApiKey({ name: '', api_key: '', endpoint: '', enabled: true });
      setShowAddForm(false);
      await loadApiKeys();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const selectService = (service) => {
    setNewApiKey(prev => ({
      ...prev,
      name: service.name,
      endpoint: service.endpoint
    }));
  };

  const toggleShowKey = (keyId) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
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
          <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your threat intelligence APIs and system settings</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add API Key</span>
        </motion.button>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-2 ${
            message.includes('success') || message.includes('saved')
              ? 'bg-jupiter-success/20 text-jupiter-success border border-jupiter-success/30'
              : 'bg-jupiter-danger/20 text-jupiter-danger border border-jupiter-danger/30'
          }`}
        >
          {message.includes('success') || message.includes('saved') ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message}</span>
        </motion.div>
      )}

      {/* Add API Key Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Key className="w-5 h-5 text-jupiter-secondary" />
              <span>Add Threat Intelligence API</span>
            </h2>

            {/* Service Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-zinc-300">Select Service</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {threatIntelServices.map((service) => (
                  <motion.button
                    key={service.name}
                    type="button"
                    onClick={() => selectService(service)}
                    className={`p-4 border border-cosmic-border rounded-xl text-left hover:border-jupiter-secondary transition-all ${
                      newApiKey.name === service.name ? 'border-jupiter-secondary bg-jupiter-secondary/10' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <service.icon className="w-5 h-5 text-jupiter-secondary" />
                      <div>
                        <p className="font-medium text-zinc-200">{service.name}</p>
                        <p className="text-xs text-zinc-500">{service.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddApiKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Service Name</label>
                  <input
                    type="text"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="AbuseIPDB"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">API Endpoint</label>
                  <input
                    type="url"
                    value={newApiKey.endpoint}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, endpoint: e.target.value }))}
                    className="input-field"
                    placeholder="https://api.service.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">API Key</label>
                <input
                  type="password"
                  value={newApiKey.api_key}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, api_key: e.target.value }))}
                  className="input-field"
                  placeholder="Your API key (will be encrypted)"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newApiKey.enabled}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-jupiter-secondary bg-cosmic-gray border-cosmic-border rounded focus:ring-jupiter-secondary focus:ring-2"
                />
                <label htmlFor="enabled" className="text-sm text-zinc-300">
                  Enable this API key immediately
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save API Key</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Existing API Keys */}
      <Card>
        <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-jupiter-secondary" />
          <span>Configured API Keys</span>
        </h2>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 mb-2">No API keys configured</p>
            <p className="text-sm text-zinc-500">Add your first threat intelligence API key to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((keyData, index) => (
              <motion.div
                key={keyData._id}
                className="bg-cosmic-gray/30 border border-cosmic-border rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${keyData.enabled ? 'bg-jupiter-success' : 'bg-zinc-500'}`}></div>
                    <div>
                      <h3 className="font-medium text-zinc-200">{keyData.name}</h3>
                      <p className="text-sm text-zinc-500">{keyData.endpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      keyData.enabled ? 'bg-jupiter-success/20 text-jupiter-success' : 'bg-zinc-500/20 text-zinc-500'
                    }`}>
                      {keyData.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <motion.button
                      className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Log Retention (days)</label>
              <input type="number" className="input-field" defaultValue="90" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Alert Threshold</label>
              <select className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="realtime" className="w-4 h-4" defaultChecked />
              <label htmlFor="realtime" className="text-sm text-zinc-300">Enable real-time monitoring</label>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Backup Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Backup Location</label>
              <select className="input-field">
                <option value="">Select backup destination</option>
                <option value="onedrive">OneDrive</option>
                <option value="sharepoint">SharePoint</option>
                <option value="s3">Amazon S3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Backup Frequency</label>
              <select className="input-field">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;