import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Server,
  Brain,
  Database,
  Zap
} from 'lucide-react';
import Card from './Card';
import connectionTest from '../utils/connectionTest';

const ConnectionStatus = ({ showDetails = false }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    basic: 'unknown',
    auth: 'unknown',
    query: 'unknown',
    ai: 'unknown',
    rag: 'unknown'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [lastTest, setLastTest] = useState(null);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    setIsTesting(true);
    
    try {
      const results = await connectionTest.runAllTests();
      
      // Update status based on results
      const newStatus = {
        basic: results.results.basicConnection.success ? 'connected' : 'disconnected',
        auth: results.results.authentication.success ? 'connected' : 'disconnected',
        query: results.results.queryService.success ? 'connected' : 'disconnected',
        ai: results.results.aiService.success ? 'connected' : 'disconnected',
        rag: results.results.ragSearch.success ? 'connected' : 'disconnected'
      };
      
      setConnectionStatus(newStatus);
      setLastTest(new Date());
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'disconnected':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
    }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(connectionStatus);
    const connectedCount = statuses.filter(s => s === 'connected').length;
    const totalCount = statuses.length;
    
    if (connectedCount === totalCount) {
      return { status: 'connected', text: 'All Systems Connected' };
    } else if (connectedCount > 0) {
      return { status: 'partial', text: `${connectedCount}/${totalCount} Systems Connected` };
    } else {
      return { status: 'disconnected', text: 'Systems Disconnected' };
    }
  };

  const overallStatus = getOverallStatus();

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={testConnections}
          disabled={isTesting}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-colors ${
            overallStatus.status === 'connected' 
              ? 'text-green-400 bg-green-400/20 border-green-400/30 hover:bg-green-400/30'
              : overallStatus.status === 'partial'
              ? 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30 hover:bg-yellow-400/30'
              : 'text-red-400 bg-red-400/20 border-red-400/30 hover:bg-red-400/30'
          }`}
        >
          {isTesting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : overallStatus.status === 'connected' ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{overallStatus.text}</span>
        </button>
      </div>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-white">
            <Server className="w-5 h-5 text-blue-400" />
            <span>Connection Status</span>
          </h3>
          <button
            onClick={testConnections}
            disabled={isTesting}
            className="flex items-center space-x-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-300">Test</span>
          </button>
        </div>

        {/* Overall Status */}
        <div className={`p-3 rounded-lg border ${getStatusColor(overallStatus.status)}`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus.status)}
            <span className="font-medium">{overallStatus.text}</span>
          </div>
          {lastTest && (
            <p className="text-xs opacity-75 mt-1">
              Last tested: {lastTest.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Individual Services */}
        <div className="space-y-2">
          <h4 className="font-medium text-zinc-200">Services</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {/* Basic API */}
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Basic API</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus.basic)}
                <span className="text-xs text-zinc-400">Backend</span>
              </div>
            </div>

            {/* Authentication */}
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus.auth)}
                <span className="text-xs text-zinc-400">JWT</span>
              </div>
            </div>

            {/* Query Service */}
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Query Service</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus.query)}
                <span className="text-xs text-zinc-400">OCSF</span>
              </div>
            </div>

            {/* AI Service */}
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">AI Service</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus.ai)}
                <span className="text-xs text-zinc-400">LLM</span>
              </div>
            </div>

            {/* RAG System */}
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">RAG System</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(connectionStatus.rag)}
                <span className="text-xs text-zinc-400">Vector DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-zinc-700">
          <div className="flex space-x-2">
            <button
              onClick={() => window.open('/api/docs', '_blank')}
              className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
            >
              API Docs
            </button>
            <button
              onClick={() => window.open('/api/health', '_blank')}
              className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
            >
              Health Check
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConnectionStatus;
