import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Clock, 
  Database,
  Target,
  BarChart3,
  Settings
} from 'lucide-react';
import Card from './Card';

const QueryOptimizer = ({ query, onOptimize }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (query && query.trim()) {
      analyzeQuery(query);
    }
  }, [query]);

  const analyzeQuery = async (queryString) => {
    setLoading(true);
    
    // Simulate analysis (replace with real API call)
    setTimeout(() => {
      const analysisResult = performQueryAnalysis(queryString);
      setAnalysis(analysisResult);
      setLoading(false);
    }, 1000);
  };

  const performQueryAnalysis = (query) => {
    const conditions = query.split(' AND ').length;
    const hasTimeFilter = query.toLowerCase().includes('time');
    const hasRegex = query.toLowerCase().includes('regex');
    const hasWildcards = query.includes('*') || query.includes('%');
    
    // Calculate complexity score
    let complexityScore = 1;
    complexityScore += conditions * 2;
    if (hasRegex) complexityScore += 3;
    if (hasWildcards) complexityScore += 2;
    if (!hasTimeFilter) complexityScore += 2;
    
    // Estimate execution time
    let estimatedTime = 0.1; // Base time
    estimatedTime += conditions * 0.05;
    if (hasRegex) estimatedTime += 0.2;
    if (!hasTimeFilter) estimatedTime += 0.3;
    
    // Generate suggestions
    const suggestions = [];
    const warnings = [];
    
    if (!hasTimeFilter) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        title: 'Add Time Filter',
        description: 'Add a time range filter to improve query performance',
        example: 'AND time >= "2024-01-01T00:00:00Z"',
        impact: 'High performance improvement'
      });
    }
    
    if (hasRegex) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: 'Consider Exact Matches',
        description: 'Regex operations can be slow. Use exact matches when possible',
        example: 'activity_name = "failed_login" instead of activity_name REGEX ".*login.*"',
        impact: 'Medium performance improvement'
      });
    }
    
    if (conditions > 5) {
      suggestions.push({
        type: 'complexity',
        priority: 'medium',
        title: 'Simplify Query',
        description: 'Consider breaking complex queries into smaller parts',
        example: 'Split into multiple focused queries',
        impact: 'Better maintainability'
      });
    }
    
    if (hasWildcards) {
      warnings.push({
        type: 'warning',
        title: 'Wildcard Usage',
        description: 'Wildcards can impact performance on large datasets',
        recommendation: 'Use specific values when possible'
      });
    }
    
    // Index recommendations
    const indexRecommendations = [];
    if (query.includes('activity_name')) {
      indexRecommendations.push('activity_name');
    }
    if (query.includes('severity')) {
      indexRecommendations.push('severity');
    }
    if (query.includes('user_name')) {
      indexRecommendations.push('user_name');
    }
    if (query.includes('src_endpoint_ip')) {
      indexRecommendations.push('src_endpoint_ip');
    }
    
    return {
      complexityScore: Math.min(complexityScore, 10),
      estimatedTime: estimatedTime.toFixed(2),
      conditions,
      hasTimeFilter,
      hasRegex,
      hasWildcards,
      suggestions,
      warnings,
      indexRecommendations,
      performanceScore: Math.max(0, 10 - complexityScore)
    };
  };

  const getComplexityColor = (score) => {
    if (score <= 3) return 'text-green-500 bg-green-500/20';
    if (score <= 6) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getPerformanceColor = (score) => {
    if (score >= 8) return 'text-green-500 bg-green-500/20';
    if (score >= 5) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      default: return 'text-zinc-500 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-pulse-glow">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-zinc-400 mt-3">Analyzing query...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <div className="text-center py-8 text-zinc-400">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Enter a query to see optimization suggestions</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-white">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span>Query Performance Analysis</span>
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(analysis.performanceScore)}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {analysis.performanceScore}/10
            </div>
            <p className="text-xs text-zinc-400 mt-1">Performance Score</p>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.complexityScore)}`}>
              <Target className="w-4 h-4 mr-1" />
              {analysis.complexityScore}/10
            </div>
            <p className="text-xs text-zinc-400 mt-1">Complexity</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-500 bg-blue-500/20">
              <Clock className="w-4 h-4 mr-1" />
              {analysis.estimatedTime}s
            </div>
            <p className="text-xs text-zinc-400 mt-1">Est. Time</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-purple-500 bg-purple-500/20">
              <Database className="w-4 h-4 mr-1" />
              {analysis.conditions}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Conditions</p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-zinc-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-white mb-2">Query Characteristics</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {analysis.hasTimeFilter ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-zinc-300">Time Filter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {analysis.hasRegex ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-zinc-300">Regex Operations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {analysis.hasWildcards ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-zinc-300">Wildcards</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Index Recommendations</h4>
                  {analysis.indexRecommendations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {analysis.indexRecommendations.map((field, index) => (
                        <span key={index} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {field}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-xs">No specific index recommendations</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Optimization Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>Optimization Suggestions</span>
          </h3>
          
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.type === 'performance' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white">{suggestion.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-300 mb-2">{suggestion.description}</p>
                    
                    {suggestion.example && (
                      <div className="bg-zinc-900 p-2 rounded text-xs font-mono text-zinc-300 mb-2">
                        {suggestion.example}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{suggestion.impact}</span>
                      <button
                        onClick={() => onOptimize?.(suggestion)}
                        className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Warnings</span>
          </h3>
          
          <div className="space-y-2">
            {analysis.warnings.map((warning, index) => (
              <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-400 text-sm">{warning.title}</h4>
                    <p className="text-sm text-zinc-300 mt-1">{warning.description}</p>
                    {warning.recommendation && (
                      <p className="text-xs text-zinc-400 mt-1">{warning.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QueryOptimizer;
