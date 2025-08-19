import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Play, Pause, Trash2, Settings, AlertTriangle, Mail, Shield, FileText } from 'lucide-react';
import Card from '../components/Card';
import { automationAPI } from '../utils/api';

const Automations = () => {
  const [rules, setRules] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger_type: 'high_severity_alert',
    trigger_config: {},
    actions: [],
    enabled: true
  });

  const triggerTypes = [
    { value: 'high_severity_alert', label: 'High Severity Alert', icon: AlertTriangle },
    { value: 'ioc_match', label: 'IOC Match', icon: Shield },
    { value: 'regex_match', label: 'Regex Match', icon: FileText },
    { value: 'failed_login', label: 'Failed Login Attempts', icon: Shield },
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'block_ip', label: 'Block IP Address', icon: Shield },
    { value: 'tag_alert', label: 'Tag Alert', icon: FileText },
    { value: 'create_case', label: 'Create Case', icon: FileText },
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await automationAPI.getRules();
      setRules(response.data.automation_rules || []);
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await automationAPI.createRule(newRule);
      setNewRule({
        name: '',
        trigger_type: 'high_severity_alert',
        trigger_config: {},
        actions: [],
        enabled: true
      });
      setShowBuilder(false);
      await loadRules();
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    }
  };

  const addAction = (actionType) => {
    const actionConfig = { type: actionType };
    
    // Add default configuration based on action type
    switch (actionType) {
      case 'send_email':
        actionConfig.subject = 'Security Alert';
        actionConfig.recipients = [];
        break;
      case 'tag_alert':
        actionConfig.tag = 'automated';
        break;
      case 'create_case':
        actionConfig.title = 'Auto-generated case';
        actionConfig.description = 'Automatically created by SOAR automation';
        break;
    }
    
    setNewRule(prev => ({
      ...prev,
      actions: [...prev.actions, actionConfig]
    }));
  };

  const removeAction = (index) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
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
          <h1 className="text-3xl font-bold text-gradient">SOAR Automation</h1>
          <p className="text-zinc-400 mt-1">Build and manage security automation playbooks</p>
        </div>
        <motion.button
          onClick={() => setShowBuilder(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>New Playbook</span>
        </motion.button>
      </div>

      {/* Automation Rules */}
      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, index) => (
          <motion.div
            key={rule._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-jupiter-success' : 'bg-zinc-500'}`}></div>
                  <div>
                    <h3 className="font-semibold text-zinc-200">{rule.name}</h3>
                    <p className="text-sm text-zinc-400">
                      Trigger: {triggerTypes.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {rule.actions.length} actions • Executed {rule.execution_count || 0} times
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {rule.enabled ? <Pause className="w-4 h-4 text-jupiter-warning" /> : <Play className="w-4 h-4 text-jupiter-success" />}
                  </motion.button>
                  <motion.button
                    className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                  </motion.button>
                  <motion.button
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
        ))}

        {rules.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Zap className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-2">No automation rules configured</p>
              <p className="text-sm text-zinc-500">Create your first playbook to automate incident response</p>
            </div>
          </Card>
        )}
      </div>

      {/* Playbook Builder */}
      {showBuilder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-jupiter-secondary" />
              <span>Automation Playbook Builder</span>
            </h2>

            <form onSubmit={handleCreateRule} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Playbook Name</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="High Severity Alert Response"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Trigger</label>
                  <select
                    value={newRule.trigger_type}
                    onChange={(e) => setNewRule(prev => ({ ...prev, trigger_type: e.target.value }))}
                    className="input-field"
                  >
                    {triggerTypes.map(trigger => (
                      <option key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-zinc-300">Actions</label>
                  <div className="flex space-x-2">
                    {actionTypes.map(action => (
                      <motion.button
                        key={action.value}
                        type="button"
                        onClick={() => addAction(action.value)}
                        className="btn-ghost text-xs py-2 px-3 flex items-center space-x-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <action.icon className="w-3 h-3" />
                        <span>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {newRule.actions.map((action, index) => (
                    <div key={index} className="bg-cosmic-gray/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {actionTypes.find(a => a.value === action.type)?.icon && (
                          React.createElement(actionTypes.find(a => a.value === action.type).icon, {
                            className: "w-4 h-4 text-jupiter-secondary"
                          })
                        )}
                        <span className="font-medium text-zinc-200">
                          {actionTypes.find(a => a.value === action.type)?.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="p-1 hover:bg-jupiter-danger/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-jupiter-danger" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Playbook
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Automations;