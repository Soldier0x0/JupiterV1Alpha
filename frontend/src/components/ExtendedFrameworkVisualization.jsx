import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Target, 
  Layers, 
  Activity, 
  Brain, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Filter,
  Settings,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import EnhancedCard from './ui/EnhancedCard';
import ProgressiveDisclosure from './ui/ProgressiveDisclosure';
import { SkeletonCard, EmptyState, ErrorState } from './ui/LoadingStates';

const ExtendedFrameworkVisualization = ({ 
  logData, 
  analysisResults, 
  onTechniqueSelect,
  analystId = null,
  showFatigueManagement = true 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [fatigueStatus, setFatigueStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load fatigue status for analyst
  useEffect(() => {
    if (analystId && showFatigueManagement) {
      loadFatigueStatus();
    }
  }, [analystId, showFatigueManagement]);

  const loadFatigueStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/extended-frameworks/fatigue/status/${analystId}`);
      const data = await response.json();
      
      if (data.success) {
        setFatigueStatus(data.fatigue_status);
      }
    } catch (error) {
      console.error('Error loading fatigue status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getFatigueColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const renderOWASPAnalysis = () => {
    const owaspData = analysisResults?.frameworks?.owasp_top_10;
    if (!owaspData?.vulnerabilities?.length) {
      return (
        <EmptyState
          icon={Shield}
          title="No OWASP Vulnerabilities Detected"
          description="This log doesn't match any OWASP Top 10 vulnerability patterns."
        />
      );
    }

    // Group vulnerabilities by risk level
    const groupedVulns = owaspData.vulnerabilities.reduce((acc, vuln) => {
      const level = vuln.risk_level.toLowerCase();
      if (!acc[level]) acc[level] = [];
      acc[level].push(vuln);
      return acc;
    }, {});

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary Header */}
        <EnhancedCard
          title="OWASP Top 10 Analysis"
          subtitle="Web application security vulnerabilities"
          priority="high"
          count={owaspData.total_vulnerabilities}
          actions={
            <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-zinc-400" />
            </button>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(groupedVulns).map(([level, vulns]) => (
              <div key={level} className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(level).split(' ')[0]}`}>
                  {vulns.length}
                </div>
                <div className="text-sm text-zinc-400 capitalize">{level}</div>
              </div>
            ))}
          </div>
        </EnhancedCard>

        {/* Vulnerability Details */}
        <div className="space-y-4">
          {Object.entries(groupedVulns).map(([level, vulns]) => (
            <div key={level}>
              <h4 className="text-lg font-semibold text-white mb-3 capitalize flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  level === 'critical' ? 'bg-red-400' :
                  level === 'high' ? 'bg-orange-400' :
                  level === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span>{level} Vulnerabilities</span>
                <span className="text-sm text-zinc-400">({vulns.length})</span>
              </h4>
              
              <div className="space-y-3">
                {vulns.map((vuln, index) => (
                  <ProgressiveDisclosure
                    key={vuln.id}
                    title={`${vuln.id} - ${vuln.name}`}
                    summary={vuln.description}
                    level="medium"
                    details={
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-zinc-300 mb-2">Examples</h5>
                            <ul className="text-sm text-zinc-400 space-y-1">
                              {vuln.examples.map((example, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <span className="text-zinc-500 mt-1">•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-zinc-300 mb-2">Mitigations</h5>
                            <ul className="text-sm text-zinc-400 space-y-1">
                              {vuln.mitigations.map((mitigation, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <span className="text-zinc-500 mt-1">•</span>
                                  <span>{mitigation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2 border-t border-zinc-700">
                          <button
                            onClick={() => onTechniqueSelect && onTechniqueSelect(vuln)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-300 rounded-lg transition-colors text-sm">
                            <Copy className="w-4 h-4" />
                            <span>Copy Info</span>
                          </button>
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderSTRIDEAnalysis = () => {
    const strideData = analysisResults?.frameworks?.stride;
    if (!strideData?.threats?.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">STRIDE Threat Analysis</h3>
          <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            {strideData.total_threats} threats
          </span>
        </div>

        <div className="grid gap-3">
          {strideData.threats.map((threat, index) => (
            <motion.div
              key={threat.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{threat.category}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(threat.likelihood)}`}>
                      {threat.likelihood} likelihood
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">{threat.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Impact:</h4>
                      <p className="text-xs text-zinc-300">{threat.impact}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Mitigations:</h4>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {threat.mitigations.slice(0, 2).map((mitigation, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-zinc-500 mt-1">•</span>
                            <span>{mitigation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderNISTCSFAnalysis = () => {
    const nistData = analysisResults?.frameworks?.nist_csf;
    if (!nistData?.controls?.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">NIST CSF Controls</h3>
          <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
            {nistData.total_controls} controls
          </span>
        </div>

        <div className="grid gap-3">
          {nistData.controls.map((control, index) => (
            <motion.div
              key={control.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{control.id}</span>
                    <span className="text-sm text-zinc-400">{control.function}</span>
                    <span className="text-xs bg-zinc-600 text-zinc-300 px-2 py-1 rounded">
                      {control.category}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">{control.description}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Implementation Tiers:</h4>
                    <div className="flex flex-wrap gap-1">
                      {control.implementation_tiers.map((tier, i) => (
                        <span key={i} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderAtomicRedTeamAnalysis = () => {
    const atomicData = analysisResults?.frameworks?.atomic_red_team;
    if (!atomicData?.techniques?.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Atomic Red Team Techniques</h3>
          <span className="text-sm bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
            {atomicData.total_techniques} techniques
          </span>
        </div>

        <div className="grid gap-3">
          {atomicData.techniques.map((technique, index) => (
            <motion.div
              key={technique.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{technique.id} - {technique.name}</span>
                    <button
                      onClick={() => onTechniqueSelect && onTechniqueSelect(technique)}
                      className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-2 py-1 rounded transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">{technique.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Atomic Tests:</h4>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {technique.atomic_tests.slice(0, 2).map((test, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-zinc-500 mt-1">•</span>
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Detection Rules:</h4>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {technique.detection_rules.slice(0, 2).map((rule, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-zinc-500 mt-1">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderFatigueManagement = () => {
    if (!showFatigueManagement || !fatigueStatus) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Analyst Fatigue Management</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getFatigueColor(fatigueStatus.fatigue_level)}`}>
            {fatigueStatus.fatigue_level} fatigue
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Current Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-300">Fatigue Score:</span>
                <span className="text-sm font-medium text-white">
                  {(fatigueStatus.fatigue_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-300">Session Duration:</span>
                <span className="text-sm font-medium text-white">
                  {fatigueStatus.session_duration_hours?.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-300">Alerts Processed:</span>
                <span className="text-sm font-medium text-white">
                  {fatigueStatus.alerts_processed}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Recommendations</h4>
            <ul className="space-y-1">
              {fatigueStatus.recommendations?.map((rec, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start space-x-1">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderThreatAssessment = () => {
    const assessment = analysisResults?.threat_assessment;
    if (!assessment) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Overall Threat Assessment</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(assessment.risk_level)}`}>
            {assessment.risk_level} risk
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Risk Score</h4>
            <div className="text-2xl font-bold text-white">{assessment.threat_score}</div>
            <div className="text-xs text-zinc-400">out of 10</div>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Framework Coverage</h4>
            <div className="text-2xl font-bold text-white">{assessment.framework_coverage}</div>
            <div className="text-xs text-zinc-400">frameworks</div>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Threat Indicators</h4>
            <div className="text-2xl font-bold text-white">{assessment.threat_indicators?.length || 0}</div>
            <div className="text-xs text-zinc-400">indicators</div>
          </div>
        </div>

        {assessment.threat_indicators?.length > 0 && (
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Key Threat Indicators</h4>
            <ul className="space-y-1">
              {assessment.threat_indicators.slice(0, 5).map((indicator, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start space-x-2">
                  <span className="text-red-400 mt-1">⚠</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'owasp', label: 'OWASP Top 10', icon: Shield },
    { id: 'stride', label: 'STRIDE', icon: Target },
    { id: 'nist', label: 'NIST CSF', icon: Layers },
    { id: 'atomic', label: 'Atomic Red Team', icon: Activity },
    { id: 'fatigue', label: 'Fatigue Management', icon: Brain }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-zinc-800 border-b-2 border-yellow-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderThreatAssessment()}
          {activeTab === 'owasp' && renderOWASPAnalysis()}
          {activeTab === 'stride' && renderSTRIDEAnalysis()}
          {activeTab === 'nist' && renderNISTCSFAnalysis()}
          {activeTab === 'atomic' && renderAtomicRedTeamAnalysis()}
          {activeTab === 'fatigue' && renderFatigueManagement()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ExtendedFrameworkVisualization;
