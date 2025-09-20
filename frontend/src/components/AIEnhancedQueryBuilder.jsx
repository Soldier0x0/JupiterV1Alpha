import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Zap, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Target,
  BarChart3,
  Sparkles,
  Cpu,
  Database
} from 'lucide-react';
import Card from './Card';
import { aiService } from '../api/aiService';

const AIEnhancedQueryBuilder = ({ onQueryGenerated, onThreatAnalysis }) => {
  const [aiStatus, setAiStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [ragResults, setRagResults] = useState([]);

  useEffect(() => {
    checkAIStatus();
    getModelPerformance();
  }, []);

  const checkAIStatus = async () => {
    try {
      const status = await aiService.getModelsStatus();
      setAiStatus(status);
    } catch (error) {
      console.error('Failed to get AI status:', error);
    }
  };

  const getModelPerformance = async () => {
    try {
      const performance = await aiService.getModelPerformance();
      setModelPerformance(performance);
    } catch (error) {
      console.error('Failed to get model performance:', error);
    }
  };

  const handleAIGeneration = async (userInput) => {
    setIsGenerating(true);
    try {
      const result = await aiService.generateQuery(userInput);
      if (result.success) {
        onQueryGenerated?.(result.query);
        setLastAnalysis({
          type: 'query_generation',
          input: userInput,
          output: result.query,
          confidence: result.confidence,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThreatAnalysis = async (logData) => {
    try {
      const result = await aiService.analyzeThreat(logData);
      if (result.success) {
        onThreatAnalysis?.(result);
        setLastAnalysis({
          type: 'threat_analysis',
          input: logData,
          output: result,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Threat analysis failed:', error);
    }
  };

  const searchRAG = async (query) => {
    try {
      const results = await aiService.searchRAG(query);
      setRagResults(results.results || []);
    } catch (error) {
      console.error('RAG search failed:', error);
    }
  };

  const getModelStatusColor = (status) => {
    switch (status) {
      case 'loaded': return 'text-green-500 bg-green-500/20';
      case 'loading': return 'text-yellow-500 bg-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/20';
      default: return 'text-zinc-500 bg-zinc-500/20';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* AI Status Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-white">
            <Brain className="w-5 h-5 text-blue-400" />
            <span>AI System Status</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              RTX 3060
            </span>
          </h3>
          <button
            onClick={checkAIStatus}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Refresh
          </button>
        </div>

        {aiStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Model Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-zinc-200">Models</h4>
              <div className="space-y-1">
                {Object.entries(aiStatus.models || {}).map(([name, model]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300 capitalize">{name.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getModelStatusColor(model.loaded ? 'loaded' : 'error')}`}>
                      {model.loaded ? 'Loaded' : 'Error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-zinc-200">Hardware</h4>
              <div className="space-y-1 text-sm text-zinc-300">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4" />
                  <span>Device: {aiStatus.device || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Vector Store: {aiStatus.vector_store?.available ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <h4 className="font-medium text-zinc-200">Performance</h4>
              {modelPerformance ? (
                <div className="space-y-1 text-sm text-zinc-300">
                  <div>Avg Response: {modelPerformance.avg_response_time}ms</div>
                  <div>Success Rate: {modelPerformance.success_rate}%</div>
                  <div>Memory Usage: {modelPerformance.memory_usage}%</div>
                </div>
              ) : (
                <div className="text-sm text-zinc-500">No data available</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-zinc-400">
            <div className="animate-pulse">
              <div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-zinc-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        )}
      </Card>

      {/* AI-Powered Query Generation */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>AI Query Generation</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">
                Natural Language Input
              </label>
              <textarea
                placeholder="Describe what you want to find... (e.g., 'Find failed login attempts from external IPs')"
                className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAIGeneration(e.target.value);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">
                Generated OCSF Query
              </label>
              <div className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 font-mono text-sm overflow-auto">
                {lastAnalysis?.type === 'query_generation' ? lastAnalysis.output : 'Generated query will appear here...'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {lastAnalysis?.type === 'query_generation' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-400">Confidence:</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(lastAnalysis.confidence)}`}>
                    {(lastAnalysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea?.value) {
                  handleAIGeneration(textarea.value);
                }
              }}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Query'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* RAG Search */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <Target className="w-5 h-5 text-green-400" />
          <span>RAG Knowledge Search</span>
        </h3>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search similar logs, threats, or patterns..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchRAG(e.target.value);
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="text"]');
                if (input?.value) {
                  searchRAG(input.value);
                }
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>

          {ragResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-zinc-200">Similar Results</h4>
              {ragResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-200">
                      {result.metadata?.activity_name || 'Unknown Activity'}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Similarity: {(1 - result.distance).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 truncate">{result.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* AI Insights */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span>AI Insights & Recommendations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-zinc-200">Query Optimization</h4>
            <div className="space-y-2">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Performance Tip</span>
                </div>
                <p className="text-sm text-zinc-300">Add time filters to improve query performance by 60-80%</p>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Best Practice</span>
                </div>
                <p className="text-sm text-zinc-300">Use specific field names instead of wildcards for better results</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-zinc-200">Threat Detection</h4>
            <div className="space-y-2">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">High Risk Pattern</span>
                </div>
                <p className="text-sm text-zinc-300">Multiple failed logins from same IP detected</p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Trending</span>
                </div>
                <p className="text-sm text-zinc-300">PowerShell usage increased by 40% this week</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Model Training Status */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Model Training & Learning</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">1,247</div>
              <div className="text-sm text-zinc-400">Logs Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">89.2%</div>
              <div className="text-sm text-zinc-400">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">23</div>
              <div className="text-sm text-zinc-400">New Patterns</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Continuous Learning</span>
              <span className="text-sm text-green-400">Active</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-zinc-500">Models are continuously learning from new log data</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIEnhancedQueryBuilder;
