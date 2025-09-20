import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Play, Pause, Settings, BarChart3, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

const Models = () => {
  const [selectedModel, setSelectedModel] = useState(null);

  // Mock ML models data
  const models = [
    {
      id: '1',
      name: 'Anomaly Detection',
      type: 'Unsupervised Learning',
      status: 'running',
      accuracy: 94.2,
      last_trained: new Date(Date.now() - 86400000).toISOString(),
      predictions_today: 1247,
      description: 'Detects unusual patterns in network traffic and user behavior',
      metrics: {
        precision: 0.89,
        recall: 0.91,
        f1_score: 0.90
      }
    },
    {
      id: '2',
      name: 'Threat Classification',
      type: 'Supervised Learning',
      status: 'training',
      accuracy: 97.8,
      last_trained: new Date(Date.now() - 172800000).toISOString(),
      predictions_today: 856,
      description: 'Classifies incoming threats by severity and attack vector',
      metrics: {
        precision: 0.95,
        recall: 0.93,
        f1_score: 0.94
      }
    },
    {
      id: '3',
      name: 'User Behavior Analysis',
      type: 'Deep Learning',
      status: 'stopped',
      accuracy: 91.5,
      last_trained: new Date(Date.now() - 259200000).toISOString(),
      predictions_today: 0,
      description: 'Analyzes user behavior patterns to detect insider threats',
      metrics: {
        precision: 0.88,
        recall: 0.87,
        f1_score: 0.87
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-jupiter-success bg-jupiter-success/20';
      case 'training': return 'text-jupiter-warning bg-jupiter-warning/20';
      case 'stopped': return 'text-zinc-400 bg-zinc-400/20';
      default: return 'text-zinc-400 bg-zinc-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return Play;
      case 'training': return Brain;
      case 'stopped': return Pause;
      default: return AlertCircle;
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return 'text-jupiter-success';
    if (accuracy >= 90) return 'text-jupiter-warning';
    return 'text-jupiter-danger';
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">ML Models</h1>
        <p className="text-zinc-400 mt-1">Manage and monitor machine learning models for threat detection</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Active Models</p>
                <p className="text-2xl font-bold text-jupiter-secondary">
                  {models.filter(m => m.status === 'running').length}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-jupiter-secondary" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Training</p>
                <p className="text-2xl font-bold text-jupiter-warning">
                  {models.filter(m => m.status === 'training').length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-jupiter-warning" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Avg Accuracy</p>
                <p className="text-2xl font-bold text-jupiter-success">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-jupiter-success" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-zinc-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Predictions</p>
                <p className="text-2xl font-bold text-zinc-300">
                  {models.reduce((sum, m) => sum + m.predictions_today, 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-zinc-400" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model, index) => {
          const StatusIcon = getStatusIcon(model.status);
          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-card-hover transition-all duration-300 cursor-pointer">
                <div className="space-y-4">
                  {/* Model Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary/20 to-jupiter-primary/20 rounded-xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-jupiter-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-200">{model.name}</h3>
                        <p className="text-sm text-zinc-400">{model.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(model.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{model.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Model Description */}
                  <p className="text-sm text-zinc-400">{model.description}</p>

                  {/* Performance Metrics */}
                  <div className="bg-cosmic-gray/30 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Accuracy:</span>
                        <span className={`ml-2 font-medium ${getAccuracyColor(model.accuracy)}`}>
                          {model.accuracy}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Predictions:</span>
                        <span className="text-zinc-300 ml-2">{model.predictions_today.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Precision:</span>
                        <span className="text-zinc-300 ml-2">{model.metrics.precision}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Recall:</span>
                        <span className="text-zinc-300 ml-2">{model.metrics.recall}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-500">
                      Last trained: {new Date(model.last_trained).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      {model.status === 'running' ? (
                        <motion.button
                          className="p-2 hover:bg-jupiter-danger/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pause className="w-4 h-4 text-jupiter-danger" />
                        </motion.button>
                      ) : (
                        <motion.button
                          className="p-2 hover:bg-jupiter-success/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="w-4 h-4 text-jupiter-success" />
                        </motion.button>
                      )}
                      <motion.button
                        className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Model Training Queue */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-jupiter-secondary" />
          <span>Training Queue</span>
        </h2>
        
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-zinc-400">No models in training queue</p>
          <p className="text-sm text-zinc-500 mt-1">All models are up to date</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default Models;