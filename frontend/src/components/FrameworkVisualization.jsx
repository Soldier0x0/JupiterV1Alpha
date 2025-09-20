import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Zap, 
  Eye, 
  Search, 
  Filter, 
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Layers,
  Network,
  Activity
} from 'lucide-react';
import Card from './Card';

/**
 * FrameworkVisualization Component
 * Interactive visualization of cybersecurity frameworks
 */

const FrameworkVisualization = ({ 
  logData, 
  analysisResults, 
  onTechniqueSelect,
  className = ""
}) => {
  const [activeFramework, setActiveFramework] = useState('mitre_attack');
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const frameworks = [
    { id: 'mitre_attack', name: 'MITRE ATT&CK', icon: Target, color: 'text-red-400' },
    { id: 'diamond_model', name: 'Diamond Model', icon: Layers, color: 'text-blue-400' },
    { id: 'kill_chain', name: 'Kill Chain', icon: Network, color: 'text-green-400' }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleTechniqueClick = (technique) => {
    setSelectedTechnique(technique);
    if (onTechniqueSelect) {
      onTechniqueSelect(technique);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Framework Selector */}
      <div className="flex space-x-2">
        {frameworks.map((framework) => (
          <button
            key={framework.id}
            onClick={() => setActiveFramework(framework.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              activeFramework === framework.id
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            <framework.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{framework.name}</span>
          </button>
        ))}
      </div>

      {/* Framework Content */}
      <AnimatePresence mode="wait">
        {activeFramework === 'mitre_attack' && (
          <MITREAttackVisualization
            key="mitre"
            analysisResults={analysisResults}
            onTechniqueClick={handleTechniqueClick}
            selectedTechnique={selectedTechnique}
          />
        )}
        {activeFramework === 'diamond_model' && (
          <DiamondModelVisualization
            key="diamond"
            analysisResults={analysisResults}
          />
        )}
        {activeFramework === 'kill_chain' && (
          <KillChainVisualization
            key="killchain"
            analysisResults={analysisResults}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * MITRE ATT&CK Visualization Component
 */
const MITREAttackVisualization = ({ 
  analysisResults, 
  onTechniqueClick, 
  selectedTechnique 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState(null);

  const mitreData = analysisResults?.frameworks?.mitre_attack;
  const techniques = mitreData?.techniques || [];
  const tactics = mitreData?.tactics || {};

  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTactic = !selectedTactic || technique.tactics.includes(selectedTactic);
    return matchesSearch && matchesTactic;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">MITRE ATT&CK Analysis</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search techniques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            
            <select
              value={selectedTactic || ''}
              onChange={(e) => setSelectedTactic(e.target.value || null)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="">All Tactics</option>
              {Object.keys(tactics).map(tactic => (
                <option key={tactic} value={tactic}>{tactic}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechniques.map((technique, index) => (
          <motion.div
            key={technique.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTechniqueClick(technique)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedTechnique?.id === technique.id
                ? 'bg-yellow-500/20 border-yellow-500/50'
                : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-yellow-400">{technique.id}</span>
                <div className={`w-2 h-2 rounded-full ${
                  technique.confidence_score > 0.7 ? 'bg-green-500' :
                  technique.confidence_score > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <span className="text-xs text-zinc-500">
                {Math.round(technique.confidence_score * 100)}%
              </span>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-2">{technique.name}</h4>
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{technique.description}</p>
            
            <div className="flex flex-wrap gap-1">
              {technique.tactics.map(tactic => (
                <span
                  key={tactic}
                  className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Technique Details */}
      {selectedTechnique && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <TechniqueDetails technique={selectedTechnique} />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Diamond Model Visualization Component
 */
const DiamondModelVisualization = ({ analysisResults }) => {
  const diamondData = analysisResults?.frameworks?.diamond_model;

  if (!diamondData) {
    return (
      <Card>
        <div className="text-center py-8">
          <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-400">No Diamond Model analysis available</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Diamond Model Analysis</h3>
        </div>

        {/* Diamond Model Diagram */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Adversary</h4>
              <p className="text-white">{diamondData.adversary}</p>
            </div>
            
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Capability</h4>
              <p className="text-white">{diamondData.capability}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">Infrastructure</h4>
              <p className="text-white">{diamondData.infrastructure}</p>
            </div>
            
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Victim</h4>
              <p className="text-white">{diamondData.victim}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Phase</h4>
            <p className="text-white">{diamondData.phase}</p>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Direction</h4>
            <p className="text-white">{diamondData.direction}</p>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Result</h4>
            <p className={`font-semibold ${
              diamondData.result === 'Success' ? 'text-red-400' : 'text-green-400'
            }`}>
              {diamondData.result}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Kill Chain Visualization Component
 */
const KillChainVisualization = ({ analysisResults }) => {
  const killChainData = analysisResults?.frameworks?.kill_chain;

  if (!killChainData) {
    return (
      <Card>
        <div className="text-center py-8">
          <Network className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-400">No Kill Chain analysis available</p>
        </div>
      </Card>
    );
  }

  const phases = [
    'Reconnaissance',
    'Weaponization',
    'Delivery',
    'Exploitation',
    'Installation',
    'Command and Control',
    'Actions on Objectives'
  ];

  const currentPhaseIndex = phases.indexOf(killChainData.phase);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Network className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Kill Chain Analysis</h3>
        </div>

        {/* Kill Chain Progress */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Attack Progress</h4>
          <div className="flex items-center space-x-2">
            {phases.map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  index <= currentPhaseIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {index + 1}
                </div>
                {index < phases.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    index < currentPhaseIndex ? 'bg-green-500' : 'bg-zinc-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Phase Details */}
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-green-400 mb-2">Current Phase</h4>
          <p className="text-white font-semibold">{killChainData.phase}</p>
          <p className="text-zinc-400 text-sm mt-1">{killChainData.description}</p>
        </div>

        {/* Indicators and Mitigations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Indicators</h4>
            <ul className="space-y-1">
              {killChainData.indicators?.map((indicator, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Mitigations</h4>
            <ul className="space-y-1">
              {killChainData.mitigations?.map((mitigation, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full" />
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Technique Details Component
 */
const TechniqueDetails = ({ technique }) => {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg font-mono text-yellow-400">{technique.id}</span>
              <span className="text-sm text-zinc-500">
                {Math.round(technique.confidence_score * 100)}% confidence
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{technique.name}</h3>
            <p className="text-zinc-400">{technique.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Tactics</h4>
            <div className="flex flex-wrap gap-2">
              {technique.tactics?.map(tactic => (
                <span
                  key={tactic}
                  className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-full"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {technique.platforms?.map(platform => (
                <span
                  key={platform}
                  className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        {technique.matched_indicators && technique.matched_indicators.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Matched Indicators</h4>
            <ul className="space-y-1">
              {technique.matched_indicators.map((indicator, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {technique.detection_rules && technique.detection_rules.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Detection Rules</h4>
            <ul className="space-y-1">
              {technique.detection_rules.map((rule, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {technique.mitigations && technique.mitigations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Mitigations</h4>
            <ul className="space-y-1">
              {technique.mitigations.map((mitigation, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FrameworkVisualization;
