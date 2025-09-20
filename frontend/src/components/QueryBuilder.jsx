import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Code, 
  Eye, 
  Save, 
  History,
  HelpCircle,
  Search,
  Filter,
  Zap,
  Bot,
  BarChart3
} from 'lucide-react';
import { 
  OCSF_FIELDS, 
  OCSF_CATEGORIES, 
  QUERY_OPERATORS, 
  QUERY_TEMPLATES,
  getOperatorsForField,
  getFieldExamples,
  validateFieldValue
} from '../data/ocsfSchema.js';
import QueryOptimizer from './QueryOptimizer';
import AIQueryAssistant from './AIQueryAssistant';
import QueryAnalytics from './QueryAnalytics';

const QueryBuilder = ({ onQueryChange, onRunQuery, initialQuery = null }) => {
  const [mode, setMode] = useState('visual'); // 'visual', 'text', 'templates', 'ai', 'analytics'
  const [conditions, setConditions] = useState([]);
  const [textQuery, setTextQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [savedQueries, setSavedQueries] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  useEffect(() => {
    if (initialQuery) {
      if (typeof initialQuery === 'string') {
        setTextQuery(initialQuery);
        setMode('text');
      } else {
        setConditions(initialQuery.conditions || []);
        setMode('visual');
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    if (mode === 'visual') {
      const query = buildQueryFromConditions();
      setCurrentQuery(query);
      onQueryChange?.(query);
    } else if (mode === 'text') {
      setCurrentQuery(textQuery);
      onQueryChange?.(textQuery);
    }
  }, [conditions, textQuery, mode, onQueryChange]);

  const addCondition = () => {
    const newCondition = {
      id: Date.now(),
      field: '',
      operator: '',
      value: '',
      category: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id, updates) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const buildQueryFromConditions = () => {
    const validConditions = conditions.filter(c => c.field && c.operator && c.value);
    
    if (validConditions.length === 0) return '';

    const queryParts = validConditions.map(condition => {
      const { field, operator, value } = condition;
      
      switch (operator) {
        case 'equals':
          return `${field} = "${value}"`;
        case 'contains':
          return `${field} CONTAINS "${value}"`;
        case 'starts_with':
          return `${field} STARTS_WITH "${value}"`;
        case 'ends_with':
          return `${field} ENDS_WITH "${value}"`;
        case 'regex':
          return `${field} REGEX "${value}"`;
        case 'greater_than':
          return `${field} > ${value}`;
        case 'less_than':
          return `${field} < ${value}`;
        case 'greater_equal':
          return `${field} >= ${value}`;
        case 'less_equal':
          return `${field} <= ${value}`;
        case 'in':
          return `${field} IN (${value.split(',').map(v => `"${v.trim()}"`).join(', ')})`;
        case 'not_in':
          return `${field} NOT IN (${value.split(',').map(v => `"${v.trim()}"`).join(', ')})`;
        case 'between':
          const [start, end] = value.split(',');
          return `${field} BETWEEN "${start.trim()}" AND "${end.trim()}"`;
        case 'in_subnet':
          return `${field} IN_SUBNET "${value}"`;
        default:
          return `${field} ${operator} "${value}"`;
      }
    });

    return queryParts.join(' AND ');
  };

  const loadTemplate = (template) => {
    const templateConditions = Object.entries(template.query).map(([field, value], index) => ({
      id: Date.now() + index,
      field,
      operator: Array.isArray(value) ? 'in' : 'equals',
      value: Array.isArray(value) ? value.join(', ') : value,
      category: getFieldCategory(field)
    }));
    
    setConditions(templateConditions);
    setMode('visual');
  };

  const getFieldCategory = (fieldName) => {
    for (const [category, fields] of Object.entries(OCSF_FIELDS)) {
      if (fields.some(f => f.name === fieldName)) {
        return category;
      }
    }
    return '';
  };

  const getFieldsByCategory = (category) => {
    return OCSF_FIELDS[category] || [];
  };

  const saveQuery = () => {
    const queryName = prompt('Enter query name:');
    if (queryName) {
      const query = {
        id: Date.now(),
        name: queryName,
        query: mode === 'visual' ? buildQueryFromConditions() : textQuery,
        conditions: mode === 'visual' ? conditions : null,
        mode,
        timestamp: new Date().toISOString()
      };
      
      const updated = [...savedQueries, query];
      setSavedQueries(updated);
      localStorage.setItem('jupiter_saved_queries', JSON.stringify(updated));
    }
  };

  const loadSavedQuery = (query) => {
    if (query.conditions) {
      setConditions(query.conditions);
      setMode('visual');
    } else {
      setTextQuery(query.query);
      setMode('text');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('jupiter_saved_queries');
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setMode('visual')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'visual' 
                  ? 'bg-yellow-500 text-black' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Visual
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'text' 
                  ? 'bg-yellow-500 text-black' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-4 h-4 inline mr-1" />
              Text
            </button>
            <button
              onClick={() => setMode('templates')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'templates' 
                  ? 'bg-yellow-500 text-black' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Templates
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'ai' 
                  ? 'bg-yellow-500 text-black' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bot className="w-4 h-4 inline mr-1" />
              AI Assistant
            </button>
            <button
              onClick={() => setMode('analytics')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'analytics' 
                  ? 'bg-yellow-500 text-black' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Analytics
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={saveQuery}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Save Query"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Preview Query"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Query Builder Help</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300">
              <div>
                <h4 className="font-medium text-white mb-2">Visual Mode</h4>
                <p>Build queries using a visual interface with dropdowns and form fields. Great for beginners and quick queries.</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Text Mode</h4>
                <p>Write queries using a text editor with syntax highlighting. Perfect for complex queries and power users.</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Templates</h4>
                <p>Start with pre-built query templates for common security scenarios like failed logins and suspicious processes.</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">OCSF Schema</h4>
                <p>All fields are based on the OCSF (Open Cybersecurity Schema Framework) standard for consistent log analysis.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Query Preview</h3>
            <pre className="bg-zinc-900 p-3 rounded text-sm text-zinc-300 overflow-x-auto">
              {mode === 'visual' ? buildQueryFromConditions() : textQuery}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Optimizer */}
      {(mode === 'visual' || mode === 'text') && currentQuery && (
        <QueryOptimizer
          query={currentQuery}
          onOptimize={(suggestion) => {
            if (suggestion.example) {
              if (mode === 'text') {
                setTextQuery(suggestion.example);
              } else {
                // For visual mode, we could parse the suggestion and update conditions
                // This is a simplified approach
                setTextQuery(suggestion.example);
                setMode('text');
              }
            }
          }}
        />
      )}

      {/* Visual Query Builder */}
      {mode === 'visual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Build Query</h3>
            <button
              onClick={addCondition}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Condition</span>
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conditions added yet</p>
              <p className="text-sm">Click "Add Condition" to start building your query</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <ConditionRow
                  key={condition.id}
                  condition={condition}
                  index={index}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                  onRemove={() => removeCondition(condition.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text Query Editor */}
      {mode === 'text' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Text Query Editor</h3>
          <div className="relative">
            <textarea
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-zinc-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your query here...&#10;&#10;Example:&#10;activity_name = &quot;failed_login&quot; AND&#10;src_endpoint.ip = &quot;192.168.1.100&quot; AND&#10;time >= &quot;2024-01-01T00:00:00Z&quot;"
            />
          </div>
        </div>
      )}

      {/* Query Templates */}
      {mode === 'templates' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Query Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUERY_TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => loadTemplate(template)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                <p className="text-sm text-zinc-400 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                    {template.category}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {template.fields.length} fields
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Query Assistant */}
      {mode === 'ai' && (
        <AIQueryAssistant
          onQueryGenerated={(query) => {
            setTextQuery(query);
            setCurrentQuery(query);
            setMode('text');
            onQueryChange?.(query);
          }}
          currentQuery={currentQuery}
        />
      )}

      {/* Query Analytics */}
      {mode === 'analytics' && (
        <QueryAnalytics
          savedQueries={savedQueries}
          queryHistory={[]} // TODO: Implement query history tracking
        />
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRunQuery?.(mode === 'visual' ? buildQueryFromConditions() : textQuery)}
            className="btn-primary flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Run Query</span>
          </button>
          <button
            onClick={() => {
              setConditions([]);
              setTextQuery('');
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {savedQueries.length > 0 && (
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-zinc-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const query = savedQueries.find(q => q.id === parseInt(e.target.value));
                  if (query) loadSavedQuery(query);
                }
              }}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm text-zinc-200"
            >
              <option value="">Load Saved Query</option>
              {savedQueries.map(query => (
                <option key={query.id} value={query.id}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual condition row component
const ConditionRow = ({ condition, index, onUpdate, onRemove }) => {
  const [showFieldHelp, setShowFieldHelp] = useState(false);
  
  const field = OCSF_FIELDS[condition.category]?.find(f => f.name === condition.field);
  const operators = getOperatorsForField(condition.field);
  const examples = getFieldExamples(condition.field);

  const handleFieldChange = (fieldName) => {
    const fieldCategory = getFieldCategory(fieldName);
    onUpdate({ 
      field: fieldName, 
      category: fieldCategory,
      operator: '',
      value: ''
    });
  };

  const getFieldCategory = (fieldName) => {
    for (const [category, fields] of Object.entries(OCSF_FIELDS)) {
      if (fields.some(f => f.name === fieldName)) {
        return category;
      }
    }
    return '';
  };

  const validation = validateFieldValue(condition.field, condition.value, condition.operator);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
    >
      <div className="flex items-center space-x-3">
        <span className="text-sm text-zinc-400 font-mono w-8">
          {index + 1}
        </span>

        {/* Field Selection */}
        <div className="flex-1">
          <label className="block text-xs text-zinc-400 mb-1">Field</label>
          <select
            value={condition.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select field...</option>
            {Object.entries(OCSF_FIELDS).map(([category, fields]) => (
              <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                {fields.map(field => (
                  <option key={field.name} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Operator Selection */}
        <div className="flex-1">
          <label className="block text-xs text-zinc-400 mb-1">Operator</label>
          <select
            value={condition.operator}
            onChange={(e) => onUpdate({ operator: e.target.value })}
            disabled={!condition.field}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            <option value="">Select operator...</option>
            {operators.map(op => (
              <option key={op.value} value={op.value} title={op.description}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        <div className="flex-1">
          <label className="block text-xs text-zinc-400 mb-1">Value</label>
          <div className="relative">
            <input
              type="text"
              value={condition.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder={examples.length > 0 ? `e.g., ${examples[0]}` : 'Enter value...'}
              className={`w-full bg-zinc-700 border rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                condition.value && !validation.valid 
                  ? 'border-red-500' 
                  : 'border-zinc-600'
              }`}
            />
            {field && (
              <button
                onClick={() => setShowFieldHelp(!showFieldHelp)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                title="Field help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          {condition.value && !validation.valid && (
            <p className="text-xs text-red-400 mt-1">{validation.error}</p>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
          title="Remove condition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Field Help */}
      {showFieldHelp && field && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-zinc-700"
        >
          <div className="text-sm text-zinc-300">
            <p className="font-medium text-white mb-1">{field.name}</p>
            <p className="text-zinc-400 mb-2">{field.description}</p>
            {examples.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Examples:</p>
                <div className="flex flex-wrap gap-1">
                  {examples.slice(0, 3).map((example, i) => (
                    <span key={i} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QueryBuilder;
