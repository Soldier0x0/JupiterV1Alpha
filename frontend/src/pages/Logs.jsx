import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Download, Database, Activity, AlertTriangle, Shield, Target, Layers, Network } from 'lucide-react';
import Card from '../components/Card';
import QueryBuilder from '../components/QueryBuilder';
import { queryService } from '../api/queryService';
import { frameworkService } from '../api/frameworkService';
import FrameworkVisualization from '../components/FrameworkVisualization';

const Logs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [logSource, setLogSource] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [frameworkAnalysis, setFrameworkAnalysis] = useState(null);
  const [showFrameworkAnalysis, setShowFrameworkAnalysis] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleSearch = () => {
    setLoading(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setResults([]); // Empty results to show real data integration needed
      setLoading(false);
    }, 1000);
  };

  const handleQueryChange = (query) => {
    setCurrentQuery(query);
  };

  const handleRunQuery = async (query) => {
    setCurrentQuery(query);
    setLoading(true);
    
    try {
      // Use real API call
      const response = await queryService.executeQuery(query, {
        timeRange: timeRange,
        limit: 100
      });
      
      setResults(response.logs || []);
    } catch (error) {
      console.error('Query execution failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeWithFrameworks = async (logData) => {
    try {
      setLoading(true);
      const analysis = await frameworkService.analyzeLog(logData);
      setFrameworkAnalysis(analysis.analysis);
      setSelectedLog(logData);
      setShowFrameworkAnalysis(true);
    } catch (error) {
      console.error('Framework analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTechniqueSelect = (technique) => {
    console.log('Selected technique:', technique);
    // Handle technique selection (e.g., show details, create alert, etc.)
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
          <h1 className="text-3xl font-bold text-white">Log Search</h1>
          <p className="text-zinc-400 mt-1">Search and analyze security logs across your infrastructure</p>
        </div>
        {results.length > 0 && (
          <motion.button
            onClick={() => {/* TODO: Implement export */}}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </motion.button>
        )}
      </div>

          {/* Advanced Query Builder */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">OCSF Query Builder</h2>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  OCSF Schema
                </span>
              </div>
              
              <QueryBuilder
                onQueryChange={handleQueryChange}
                onRunQuery={handleRunQuery}
              />
            </div>
          </Card>

      {/* Empty State - No Data Yet */}
      {results.length === 0 && !loading && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Log Data Yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Set up log collection to start searching and analyzing your security logs.
          </p>
          <button className="btn-primary flex items-center space-x-2 mx-auto">
            <Activity className="w-4 h-4" />
            <span>Setup Log Collection</span>
          </button>
        </Card>
      )}

      {/* Current Query Display */}
      {currentQuery && (
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Search className="w-5 h-5 text-yellow-400" />
            <span>Current Query</span>
          </h2>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
              {currentQuery}
            </pre>
          </div>
        </Card>
      )}

      {/* Framework Analysis Section */}
      {showFrameworkAnalysis && frameworkAnalysis && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span>Framework Analysis</span>
            </h2>
            <button
              onClick={() => setShowFrameworkAnalysis(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          
          <FrameworkVisualization
            logData={selectedLog}
            analysisResults={frameworkAnalysis}
            onTechniqueSelect={handleTechniqueSelect}
          />
        </Card>
      )}

      {/* Log Results with Framework Analysis */}
      {results.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
            <Database className="w-5 h-5 text-yellow-400" />
            <span>Query Results</span>
            <span className="text-sm text-zinc-400">({results.length} logs)</span>
          </h2>
          
          <div className="space-y-3">
            {results.map((log, index) => (
              <div
                key={index}
                className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-white">
                        {log.activity_name || 'Unknown Activity'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        log.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        log.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {log.severity || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-zinc-400 mb-2">
                      {log.timestamp || 'No timestamp'}
                    </div>
                    
                    <div className="text-sm text-zinc-300">
                      {log.description || 'No description available'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleAnalyzeWithFrameworks(log)}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
                    >
                      <Target className="w-4 h-4" />
                      <span>Analyze</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Logs;
