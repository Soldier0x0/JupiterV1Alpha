import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Download, 
  Play, 
  Square, 
  Monitor,
  HardDrive,
  Zap,
  Settings,
  Trash2,
  Plus,
  Brain,
  Activity,
  Clock,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader
} from 'lucide-react';
import Card from '../components/Card';

const LocalModels = () => {
  const [localModels, setLocalModels] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [isDownloading, setIsDownloading] = useState({});
  const [runningModels, setRunningModels] = useState({});
  const [modelConfigs, setModelConfigs] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Available models for download
  const modelCatalog = [
    {
      name: 'llama2:7b',
      display_name: 'Llama 2 7B',
      description: 'Meta\'s Llama 2 model, great for general security analysis',
      size: '3.8GB',
      category: 'general',
      recommended: true,
      memory_required: '8GB',
      use_cases: ['threat-analysis', 'log-analysis', 'general-qa']
    },
    {
      name: 'mistral:7b',
      display_name: 'Mistral 7B',
      description: 'Efficient model optimized for security and coding tasks',
      size: '4.1GB',
      category: 'security',
      recommended: true,
      memory_required: '8GB',
      use_cases: ['code-analysis', 'incident-response', 'vulnerability-assessment']
    },
    {
      name: 'codellama:7b',
      display_name: 'Code Llama 7B',
      description: 'Specialized for code analysis and vulnerability detection',
      size: '3.8GB',
      category: 'code',
      memory_required: '8GB',
      use_cases: ['code-review', 'vulnerability-scanning', 'script-analysis']
    },
    {
      name: 'llama2:13b',
      display_name: 'Llama 2 13B',
      description: 'Larger model for complex threat intelligence analysis',
      size: '7.3GB',
      category: 'advanced',
      memory_required: '16GB',
      use_cases: ['deep-analysis', 'threat-hunting', 'strategic-intelligence']
    },
    {
      name: 'vicuna:7b',
      display_name: 'Vicuna 7B',
      description: 'Fine-tuned for conversational security assistance',
      size: '3.9GB',
      category: 'conversational',
      memory_required: '8GB',
      use_cases: ['security-chatbot', 'user-training', 'documentation']
    }
  ];

  useEffect(() => {
    loadSystemStats();
    loadInstalledModels();
    loadAvailableModels();
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      updateSystemStats();
      checkModelStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = () => {
    // Mock system stats - in production would come from system monitoring
    setSystemStats({
      cpu_usage: 23.5,
      gpu_usage: 15.2,
      memory_total: '32GB',
      memory_used: '8.4GB',
      memory_available: '23.6GB',
      gpu_memory_total: '12GB',
      gpu_memory_used: '2.1GB',
      gpu_name: 'RTX 3060',
      ollama_status: 'running',
      ollama_version: '0.4.4'
    });
  };

  const loadInstalledModels = () => {
    // Mock installed models - would come from Ollama API
    const mockModels = [
      {
        name: 'llama2:7b',
        display_name: 'Llama 2 7B',
        size: '3.8GB',
        status: 'idle',
        last_used: '2024-01-15T14:30:00Z',
        usage_count: 47,
        performance: { avg_tokens_per_sec: 12.5, avg_latency: 850 }
      },
      {
        name: 'mistral:7b',
        display_name: 'Mistral 7B', 
        size: '4.1GB',
        status: 'idle',
        last_used: '2024-01-14T09:20:00Z',
        usage_count: 23,
        performance: { avg_tokens_per_sec: 15.2, avg_latency: 720 }
      }
    ];
    setLocalModels(mockModels);
  };

  const loadAvailableModels = () => {
    setAvailableModels(modelCatalog);
  };

  const updateSystemStats = () => {
    // Update real-time stats
    setSystemStats(prev => ({
      ...prev,
      cpu_usage: 20 + Math.random() * 15,
      gpu_usage: 10 + Math.random() * 20,
      memory_used: `${(8 + Math.random() * 4).toFixed(1)}GB`
    }));
  };

  const checkModelStatus = () => {
    // Check which models are running
    setRunningModels(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(model => {
        if (Math.random() < 0.1) {  // 10% chance to change status
          updated[model] = !updated[model];
        }
      });
      return updated;
    });
  };

  const downloadModel = async (modelName) => {
    setIsDownloading(prev => ({ ...prev, [modelName]: true }));
    
    try {
      // Simulate download progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsDownloading(prev => ({ 
          ...prev, 
          [modelName]: { progress, status: 'downloading' }
        }));
      }
      
      // Add to local models
      const modelInfo = modelCatalog.find(m => m.name === modelName);
      const newModel = {
        name: modelName,
        display_name: modelInfo.display_name,
        size: modelInfo.size,
        status: 'idle',
        last_used: null,
        usage_count: 0,
        performance: { avg_tokens_per_sec: 0, avg_latency: 0 }
      };
      
      setLocalModels(prev => [...prev, newModel]);
      setIsDownloading(prev => ({ ...prev, [modelName]: false }));
      
    } catch (error) {
      console.error('Model download failed:', error);
      setIsDownloading(prev => ({ ...prev, [modelName]: false }));
    }
  };

  const startModel = async (modelName) => {
    setRunningModels(prev => ({ ...prev, [modelName]: true }));
    
    // Update model status
    setLocalModels(prev => 
      prev.map(model => 
        model.name === modelName 
          ? { ...model, status: 'running', last_used: new Date().toISOString() }
          : model
      )
    );
  };

  const stopModel = async (modelName) => {
    setRunningModels(prev => ({ ...prev, [modelName]: false }));
    
    setLocalModels(prev => 
      prev.map(model => 
        model.name === modelName 
          ? { ...model, status: 'idle' }
          : model
      )
    );
  };

  const deleteModel = async (modelName) => {
    if (!confirm(`Are you sure you want to delete ${modelName}? This will free up disk space but you'll need to re-download it to use again.`)) {
      return;
    }
    
    setLocalModels(prev => prev.filter(model => model.name !== modelName));
    setRunningModels(prev => ({ ...prev, [modelName]: false }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'text-blue-400',
      security: 'text-red-400',
      code: 'text-green-400',
      advanced: 'text-purple-400',
      conversational: 'text-cyan-400'
    };
    return colors[category] || 'text-zinc-400';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: Brain,
      security: Zap,
      code: Cpu,
      advanced: Activity,
      conversational: Monitor
    };
    return icons[category] || Brain;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-green-400" />
            <span>Local AI Models</span>
          </h1>
          <p className="body-text text-zinc-400">Manage local LLM models running on your RTX 3060</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
            systemStats.ollama_status === 'running' 
              ? 'border-green-500/30 bg-green-500/10' 
              : 'border-red-500/30 bg-red-500/10'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              systemStats.ollama_status === 'running' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm">
              Ollama {systemStats.ollama_status === 'running' ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-400">CPU Usage</h3>
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{systemStats.cpu_usage?.toFixed(1)}%</div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${systemStats.cpu_usage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-400">GPU Usage</h3>
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{systemStats.gpu_usage?.toFixed(1)}%</div>
            <p className="text-sm text-zinc-400">{systemStats.gpu_name}</p>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${systemStats.gpu_usage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-400">System Memory</h3>
              <HardDrive className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{systemStats.memory_used}</div>
            <p className="text-sm text-zinc-400">of {systemStats.memory_total} available</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-orange-400">Active Models</h3>
              <Brain className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {Object.values(runningModels).filter(Boolean).length}
            </div>
            <p className="text-sm text-zinc-400">Currently running</p>
          </div>
        </Card>
      </div>

      {/* Installed Models */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-6 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-green-400" />
            <span>Installed Models</span>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
              {localModels.length}
            </span>
          </h3>
          
          {localModels.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-2">No models installed</p>
              <p className="text-sm text-zinc-500">Download models from the catalog below to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localModels.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        runningModels[model.name] ? 'bg-green-400' : 'bg-zinc-500'
                      }`}></div>
                      
                      <div>
                        <h4 className="font-medium text-zinc-200">{model.display_name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-zinc-400">
                          <span>Size: {model.size}</span>
                          <span>•</span>
                          <span>Used: {model.usage_count} times</span>
                          {model.last_used && (
                            <>
                              <span>•</span>
                              <span>Last: {new Date(model.last_used).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {model.performance?.avg_tokens_per_sec > 0 && (
                        <div className="text-xs text-zinc-500">
                          {model.performance.avg_tokens_per_sec.toFixed(1)} tok/s
                        </div>
                      )}
                      
                      {runningModels[model.name] ? (
                        <motion.button
                          onClick={() => stopModel(model.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => startModel(model.name)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </motion.button>
                      )}
                      
                      <button
                        onClick={() => deleteModel(model.name)}
                        className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Model Catalog */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-6 flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-400" />
            <span>Model Catalog</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModels.map((model, index) => {
              const isInstalled = localModels.some(m => m.name === model.name);
              const isDownloading = isDownloading[model.name];
              const CategoryIcon = getCategoryIcon(model.category);
              
              return (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 relative ${
                    model.recommended 
                      ? 'border-blue-500/50 bg-blue-500/5' 
                      : 'border-zinc-700 bg-[#0b0c10]'
                  }`}
                >
                  {model.recommended && (
                    <div className="absolute -top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3 mb-4">
                    <CategoryIcon className={`w-8 h-8 ${getCategoryColor(model.category)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-zinc-200 mb-1">{model.display_name}</h4>
                      <p className="text-sm text-zinc-400 mb-2">{model.description}</p>
                      
                      <div className="flex items-center space-x-3 text-xs text-zinc-500">
                        <span>Size: {model.size}</span>
                        <span>•</span>
                        <span>RAM: {model.memory_required}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {model.use_cases.slice(0, 2).map(useCase => (
                        <span 
                          key={useCase} 
                          className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded"
                        >
                          {useCase}
                        </span>
                      ))}
                      {model.use_cases.length > 2 && (
                        <span className="text-xs text-zinc-500">+{model.use_cases.length - 2}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isInstalled ? (
                      <div className="flex-1 bg-green-500/20 text-green-400 py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Installed</span>
                      </div>
                    ) : isDownloading ? (
                      <div className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>
                          {typeof isDownloading === 'object' 
                            ? `${isDownloading.progress}%` 
                            : 'Downloading...'
                          }
                        </span>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => downloadModel(model.name)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LocalModels;