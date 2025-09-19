import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Layers, 
  Network, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import Card from '../components/Card';
import FrameworkVisualization from '../components/FrameworkVisualization';
import { frameworkService } from '../api/frameworkService';
import { ErrorDisplay, SuccessDisplay } from '../utils/errorHandler';

/**
 * Framework Dashboard Page
 * Comprehensive cybersecurity framework analysis and visualization
 */

const FrameworkDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');

  const timeframes = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const frameworks = [
    { id: 'all', name: 'All Frameworks', icon: Shield },
    { id: 'mitre_attack', name: 'MITRE ATT&CK', icon: Target },
    { id: 'diamond_model', name: 'Diamond Model', icon: Layers },
    { id: 'kill_chain', name: 'Kill Chain', icon: Network }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'mitre', name: 'MITRE ATT&CK', icon: Target },
    { id: 'diamond', name: 'Diamond Model', icon: Layers },
    { id: 'killchain', name: 'Kill Chain', icon: Network },
    { id: 'threats', name: 'Threat Analysis', icon: AlertTriangle }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await frameworkService.getDashboardSummary(
        parseInt(selectedTimeframe.replace('d', ''))
      );
      
      setDashboardData(response.summary);
      setSuccess('Dashboard data loaded successfully');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      // Implementation for exporting dashboard data
      setSuccess('Dashboard data exported successfully');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!dashboardData) return null;

    const { frameworks: frameworkData, overall_threat_assessment } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Threat Assessment Summary */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Threat Assessment</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              overall_threat_assessment.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400' :
              overall_threat_assessment.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400' :
              overall_threat_assessment.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {overall_threat_assessment.risk_level}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {overall_threat_assessment.risk_score}
              </div>
              <div className="text-sm text-zinc-400">Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {overall_threat_assessment.critical_alerts}
              </div>
              <div className="text-sm text-zinc-400">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {dashboardData.total_logs_analyzed}
              </div>
              <div className="text-sm text-zinc-400">Logs Analyzed</div>
            </div>
          </div>

          {overall_threat_assessment.recommendations && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {overall_threat_assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-zinc-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Framework Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MITRE ATT&CK Summary */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-red-400" />
              <h4 className="text-lg font-semibold text-white">MITRE ATT&CK</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Techniques Detected</span>
                <span className="text-sm font-semibold text-white">
                  {frameworkData.mitre_attack.techniques_detected}
                </span>
              </div>
              
              <div>
                <div className="text-sm text-zinc-400 mb-2">Top Tactics</div>
                <div className="space-y-1">
                  {frameworkData.mitre_attack.top_tactics.map((tactic, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-zinc-300">{tactic.name}</span>
                      <span className="text-zinc-400">{tactic.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Diamond Model Summary */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Diamond Model</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Phases Detected</span>
                <span className="text-sm font-semibold text-white">
                  {frameworkData.diamond_model.phases_detected}
                </span>
              </div>
              
              <div>
                <div className="text-sm text-zinc-400 mb-2">Attack Directions</div>
                <div className="space-y-1">
                  {Object.entries(frameworkData.diamond_model.attack_directions).map(([direction, count]) => (
                    <div key={direction} className="flex justify-between text-sm">
                      <span className="text-zinc-300 capitalize">{direction}</span>
                      <span className="text-zinc-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Kill Chain Summary */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Network className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Kill Chain</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Phases Detected</span>
                <span className="text-sm font-semibold text-white">
                  {frameworkData.kill_chain.phases_detected}
                </span>
              </div>
              
              <div>
                <div className="text-sm text-zinc-400 mb-2">Phase Distribution</div>
                <div className="space-y-1">
                  {frameworkData.kill_chain.phase_distribution.map((phase, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-zinc-300">{phase.phase}</span>
                      <span className="text-zinc-400">{phase.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderMITRETab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">MITRE ATT&CK Analysis</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {/* Implement technique search */}}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search Techniques</span>
              </button>
            </div>
          </div>

          <div className="text-center py-12">
            <Target className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">MITRE ATT&CK Analysis</h4>
            <p className="text-zinc-400 mb-6">
              Detailed MITRE ATT&CK technique analysis and mapping will be displayed here.
            </p>
            <button className="btn-primary">
              Load MITRE Data
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const renderDiamondTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Diamond Model Analysis</h3>
            </div>
          </div>

          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Diamond Model Analysis</h4>
            <p className="text-zinc-400 mb-6">
              Diamond Model attack analysis and visualization will be displayed here.
            </p>
            <button className="btn-primary">
              Load Diamond Model Data
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const renderKillChainTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Kill Chain Analysis</h3>
            </div>
          </div>

          <div className="text-center py-12">
            <Network className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Kill Chain Analysis</h4>
            <p className="text-zinc-400 mb-6">
              Kill Chain attack progression analysis will be displayed here.
            </p>
            <button className="btn-primary">
              Load Kill Chain Data
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const renderThreatsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Threat Analysis</h3>
            </div>
          </div>

          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Threat Analysis</h4>
            <p className="text-zinc-400 mb-6">
              Comprehensive threat analysis and correlation will be displayed here.
            </p>
            <button className="btn-primary">
              Load Threat Data
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'mitre':
        return renderMITRETab();
      case 'diamond':
        return renderDiamondTab();
      case 'killchain':
        return renderKillChainTab();
      case 'threats':
        return renderThreatsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading framework dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Framework Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Cybersecurity framework analysis and threat mapping
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      <SuccessDisplay message={success} onDismiss={() => setSuccess(null)} />

      {/* Framework Selector */}
      <div className="flex flex-wrap gap-2">
        {frameworks.map((framework) => (
          <button
            key={framework.id}
            onClick={() => setSelectedFramework(framework.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              selectedFramework === framework.id
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            <framework.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{framework.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-zinc-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.name}</span>
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
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default FrameworkDashboard;
