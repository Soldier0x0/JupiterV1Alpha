import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Trash2, Plus, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Code, Brain, Cpu, Monitor } from 'lucide-react';
import Card from '../components/Card';
import { settingsAPI } from '../utils/api';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [aiConfigs, setAiConfigs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAIForm, setShowAddAIForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    api_key: '',
    endpoint: '',
    enabled: true
  });
  const [newAIConfig, setNewAIConfig] = useState({
    provider: '',
    api_key: '',
    model_name: 'gpt-4o-mini',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [showKeys, setShowKeys] = useState({});
  const [showAIKeys, setShowAIKeys] = useState({});

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

  // AI Model Services
  const aiModelServices = [
    {
      name: 'OpenAI',
      description: 'GPT-4, GPT-4o, GPT-4o-mini models',
      icon: Brain,
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'o1-mini'],
      website: 'https://platform.openai.com/api-keys'
    },
    {
      name: 'Anthropic',
      description: 'Claude 3.5 Sonnet, Claude 3.5 Haiku models',
      icon: Brain,
      models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
      website: 'https://console.anthropic.com/keys'
    },
    {
      name: 'Google',
      description: 'Gemini 2.0 Flash, Gemini 1.5 Pro models',
      icon: Brain,
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      website: 'https://aistudio.google.com/app/apikey'
    },
    {
      name: 'Emergent',
      description: 'Universal key for all LLM providers',
      icon: Cpu,
      models: ['Universal Access'],
      website: '/profile#universal-key',
      isUniversal: true
    }
  ];

  useEffect(() => {
    loadApiKeys();
    loadAIConfigurations();
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

  const loadAIConfigurations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiConfigs(data.ai_configurations);
      }
    } catch (error) {
      console.error('Error loading AI configurations:', error);
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

  const handleAddAIConfig = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/config/api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAIConfig)
      });

      if (response.ok) {
        const data = await response.json();
        setAiMessage(data.message);
        setShowAddAIForm(false);
        setNewAIConfig({
          provider: '',
          api_key: '',
          model_name: 'gpt-4o-mini',
          enabled: true
        });
        loadAIConfigurations();
      } else {
        const error = await response.json();
        setAiMessage(error.detail || 'Failed to save AI configuration');
      }
    } catch (error) {
      setAiMessage('Failed to save AI configuration');
    } finally {
      setAiLoading(false);
    }
  };

  const selectAIService = (service) => {
    setNewAIConfig(prev => ({
      ...prev,
      provider: service.name.toLowerCase(),
      model_name: service.models[0] || 'gpt-4o-mini'
    }));
  };

  const toggleShowAIKey = (configId) => {
    setShowAIKeys(prev => ({
      ...prev,
      [configId]: !prev[configId]
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
          <h1 className="display-text text-3xl text-gradient">Settings</h1>
          <p className="body-text text-zinc-400 mt-1">Manage API keys, integrations, and system configuration</p>
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

      {/* Typography Demonstration */}
      <Card>
        <div className="mb-6">
          <h2 className="display-text text-xl mb-4 flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Typography System Demo</span>
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Display Font (Space Grotesk)</h3>
              <p className="font-display text-2xl">Project Jupiter Security Platform</p>
            </div>
            <div>
              <h3 className="font-sans text-lg font-semibold mb-2">Body Font (Inter)</h3>
              <p className="font-sans">This is the primary UI font used for navigation, buttons, forms, and general interface elements.</p>
            </div>
            <div>
              <h3 className="font-mono text-lg font-semibold mb-2">Monospace Font (JetBrains Mono)</h3>
              <div className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4">
                <pre className="font-mono text-sm text-green-400">
{`{
  "alert_id": "alert_2025_001",
  "severity": "critical", 
  "source": "192.168.1.100",
  "timestamp": "2025-01-18T19:42:15Z",
  "message": "Unauthorized access detected",
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "attempts": 15,
    "blocked": true
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add API Key Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h2 className="display-text text-xl mb-6 flex items-center space-x-2">
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
                    className="input-field font-mono text-sm"
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
                  className="input-field font-mono"
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
        <h2 className="display-text text-xl mb-6 flex items-center space-x-2">
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
                      <p className="text-sm text-zinc-500 font-mono">{keyData.endpoint}</p>
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

      {/* Interface Customization */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="display-text text-xl flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Interface & Appearance</span>
          </h2>
        </div>

        <div className="space-y-6">
          {/* Font Settings */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Font Settings</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">UI Font Family</label>
                <select className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>Inter (Default)</option>
                  <option>System Font</option>
                  <option>Arial</option>
                  <option>Helvetica</option>
                  <option>Roboto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Monospace Font</label>
                <select className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>JetBrains Mono (Default)</option>
                  <option>Monaco</option>
                  <option>Consolas</option>
                  <option>Source Code Pro</option>
                  <option>Courier New</option>
                </select>
              </div>
            </div>
          </div>

          {/* Font Sizes */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Font Sizes</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Base Font Size</label>
                <select className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>Small</option>
                  <option>Medium (Default)</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Code Font Size</label>
                <select className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>Small</option>
                  <option>Medium (Default)</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Heading Scale</label>
                <select className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option>Compact</option>
                  <option>Normal (Default)</option>
                  <option>Comfortable</option>
                  <option>Spacious</option>
                </select>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Color Theme</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Jupiter Dark', colors: ['bg-red-500', 'bg-zinc-800'], active: true },
                { name: 'Ocean Blue', colors: ['bg-blue-500', 'bg-blue-900'] },
                { name: 'Forest Green', colors: ['bg-green-500', 'bg-green-900'] },
                { name: 'Purple Night', colors: ['bg-purple-500', 'bg-purple-900'] },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    theme.active 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {theme.colors.map((color, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full ${color}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300">{theme.name}</p>
                  {theme.active && <CheckCircle className="w-3 h-3 text-red-400 mt-1" />}
                </div>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Display Options</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">Reduce Motion</label>
                <input type="checkbox" className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">High Contrast</label>
                <input type="checkbox" className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">Compact Mode</label>
                <input type="checkbox" className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">Show Grid Lines</label>
                <input type="checkbox" className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* AI Model Configuration */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="display-text text-xl flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>AI Model Configuration</span>
          </h2>
          <motion.button
            onClick={() => setShowAddAIForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Add AI Key</span>
          </motion.button>
        </div>

        {/* AI Service Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {aiModelServices.map((service, index) => (
            <motion.div
              key={service.name}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                service.isUniversal 
                  ? 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
              onClick={() => selectAIService(service)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start space-x-3">
                <service.icon className={`w-8 h-8 mt-1 ${
                  service.isUniversal ? 'text-amber-400' : 'text-purple-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-zinc-200">{service.name}</h3>
                    {service.isUniversal && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                        Universal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.models.slice(0, 2).map((model) => (
                      <span key={model} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                        {model}
                      </span>
                    ))}
                    {service.models.length > 2 && (
                      <span className="text-xs text-zinc-500">+{service.models.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Configured AI Models */}
        {aiConfigs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-zinc-300 mb-3">Configured Models</h3>
            {aiConfigs.map((config, index) => (
              <motion.div
                key={config._id}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-green-400' : 'bg-zinc-500'}`}></div>
                    <div>
                      <h4 className="font-medium text-zinc-200 capitalize">{config.provider}</h4>
                      <p className="text-sm text-zinc-400">{config.model_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      config.api_key_configured 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {config.api_key_configured ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {aiMessage && (
          <div className={`mt-4 p-3 rounded-lg border ${
            aiMessage.includes('success') || aiMessage.includes('saved')
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center space-x-2">
              {aiMessage.includes('success') || aiMessage.includes('saved') ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{aiMessage}</span>
            </div>
          </div>
        )}
      </Card>

      {/* AI Configuration Form Modal */}
      {showAddAIForm && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add AI Model</h3>
              <button
                onClick={() => setShowAddAIForm(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAIConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Provider</label>
                <select
                  value={newAIConfig.provider}
                  onChange={(e) => setNewAIConfig({...newAIConfig, provider: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="emergent">Emergent (Universal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Model Name</label>
                <input
                  type="text"
                  value={newAIConfig.model_name}
                  onChange={(e) => setNewAIConfig({...newAIConfig, model_name: e.target.value})}
                  className="input-field"
                  placeholder="e.g., gpt-4o-mini"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">API Key</label>
                <input
                  type="password"
                  value={newAIConfig.api_key}
                  onChange={(e) => setNewAIConfig({...newAIConfig, api_key: e.target.value})}
                  className="input-field font-mono"
                  placeholder="Enter your API key"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ai-enabled"
                  checked={newAIConfig.enabled}
                  onChange={(e) => setNewAIConfig({...newAIConfig, enabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="ai-enabled" className="text-sm text-zinc-300">Enable this configuration</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAIForm(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={aiLoading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {aiLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

        <Card>
          <h2 className="display-text text-xl mb-6">System Configuration</h2>
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
          <h2 className="display-text text-xl mb-6">Backup Configuration</h2>
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