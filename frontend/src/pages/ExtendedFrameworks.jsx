import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Layers, 
  Activity, 
  Brain, 
  AlertTriangle, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react';
import EnhancedCard from '../components/ui/EnhancedCard';
import EnhancedTabs from '../components/ui/EnhancedTabs';
import { SkeletonCard, EmptyState, ErrorState, LoadingSpinner } from '../components/ui/LoadingStates';
import ExtendedFrameworkVisualization from '../components/ExtendedFrameworkVisualization';
import AnalystFatigueDashboard from '../components/AnalystFatigueDashboard';

const ExtendedFrameworks = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [logData, setLogData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState('analyst1');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      setLoading(true);
      
      // Mock log data for demonstration
      const mockLogData = {
        _id: 'log_001',
        timestamp: new Date().toISOString(),
        activity_name: 'SQL Injection Attempt',
        severity: 'High',
        source_ip: '192.168.1.100',
        destination_ip: '10.0.0.50',
        user: 'admin',
        description: 'Detected SQL injection attempt in login form',
        url: '/login',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        category: 'Web Application',
        confidence_score: 0.85,
        false_positive_likelihood: 0.15
      };

      setLogData(mockLogData);

      // Perform extended framework analysis
      const response = await fetch('/api/extended-frameworks/analyze-extended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
        body: JSON.stringify({
          log_data: mockLogData,
          frameworks: ['owasp_top_10', 'stride', 'nist_csf', 'atomic_red_team'],
          analyst_id: selectedAnalyst
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysisResults(data.analysis);
        }
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTechniqueSelect = (technique) => {
    console.log('Selected technique:', technique);
    // Handle technique selection (e.g., show details, create alert, etc.)
  };

  const tabs = [
    { 
      id: 'analysis', 
      label: 'Framework Analysis', 
      icon: Shield,
      badge: analysisResults ? 'Active' : null
    },
    { 
      id: 'fatigue', 
      label: 'Analyst Fatigue', 
      icon: Brain,
      badge: 'Live'
    },
    { 
      id: 'dashboard', 
      label: 'Extended Dashboard', 
      icon: BarChart3,
      badge: 'New'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings
    }
  ];

  const renderFrameworkAnalysis = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Extended Framework Analysis</h1>
            <p className="text-zinc-400 mt-1">Comprehensive security analysis using multiple frameworks</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={loadSampleData}
              className="btn-secondary flex items-center space-x-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Framework Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard
            title="OWASP Top 10"
            subtitle="Web vulnerabilities"
            priority="high"
            count={analysisResults?.frameworks?.owasp_top_10?.total_vulnerabilities || 0}
            actions={
              <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analysisResults?.frameworks?.owasp_top_10?.total_vulnerabilities || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Vulnerabilities</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Risk Level</div>
                <div className="text-sm font-medium text-red-400">High</div>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard
            title="STRIDE"
            subtitle="Threat modeling"
            priority="medium"
            count={analysisResults?.frameworks?.stride?.total_threats || 0}
            actions={
              <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analysisResults?.frameworks?.stride?.total_threats || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Threats</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Categories</div>
                <div className="text-sm font-medium text-blue-400">6</div>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard
            title="NIST CSF"
            subtitle="Security framework"
            priority="low"
            count={analysisResults?.frameworks?.nist_csf?.total_controls || 0}
            actions={
              <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analysisResults?.frameworks?.nist_csf?.total_controls || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Controls</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Functions</div>
                <div className="text-sm font-medium text-green-400">5</div>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard
            title="Atomic Red Team"
            subtitle="Attack techniques"
            priority="medium"
            count={analysisResults?.frameworks?.atomic_red_team?.total_techniques || 0}
            actions={
              <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analysisResults?.frameworks?.atomic_red_team?.total_techniques || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Techniques</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Tactics</div>
                <div className="text-sm font-medium text-purple-400">14</div>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Extended Framework Visualization */}
        {analysisResults && (
          <Card>
            <ExtendedFrameworkVisualization
              logData={logData}
              analysisResults={analysisResults}
              onTechniqueSelect={handleTechniqueSelect}
              analystId={selectedAnalyst}
              showFatigueManagement={true}
            />
          </Card>
        )}

        {/* Enhanced Quick Actions */}
        <EnhancedCard
          title="Quick Actions"
          subtitle="Common tasks and operations"
          priority="info"
          actions={
            <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-zinc-400" />
            </button>
          }
        >
          <div className="grid md:grid-cols-3 gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Search Similar Logs</div>
                  <div className="text-sm text-zinc-400">Find related security events</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-blue-400">
                <span>Find patterns</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Export Analysis</div>
                  <div className="text-sm text-zinc-400">Download detailed report</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-green-400">
                <span>PDF, CSV, JSON</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-purple-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Filter className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Create Alert Rule</div>
                  <div className="text-sm text-zinc-400">Set up automated detection</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-purple-400">
                <span>Auto-detect threats</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </motion.button>
          </div>
        </EnhancedCard>
      </motion.div>
    );
  };

  const renderAnalystFatigue = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <AnalystFatigueDashboard 
          analystId={selectedAnalyst} 
          showDetails={true} 
        />
      </motion.div>
    );
  };

  const renderExtendedDashboard = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Extended Framework Dashboard</h1>
            <p className="text-zinc-400 mt-1">Comprehensive view of all security frameworks and metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Framework Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">85</div>
                <div className="text-sm text-zinc-400">OWASP Vulnerabilities</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 ml-1">+12%</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">42</div>
                <div className="text-sm text-zinc-400">STRIDE Threats</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-400 ml-1">+8%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-zinc-400">NIST Controls</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 ml-1">+5%</span>
                </div>
              </div>
              <Layers className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">28</div>
                <div className="text-sm text-zinc-400">Atomic Techniques</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400 ml-1">+15%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Analyst Performance */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Analyst Performance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">94%</div>
              <div className="text-sm text-zinc-400">Average Accuracy</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 ml-1">+3%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">2.3s</div>
              <div className="text-sm text-zinc-400">Avg Response Time</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 ml-1">+0.2s</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">87%</div>
              <div className="text-sm text-zinc-400">Alert Resolution</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 ml-1">+5%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Framework Coverage */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Framework Coverage</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">OWASP Top 10</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-sm text-zinc-400">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">STRIDE</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-sm text-zinc-400">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">NIST CSF</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-sm text-zinc-400">92%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Atomic Red Team</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-sm text-zinc-400">65%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderSettings = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Extended Framework Settings</h1>
          <p className="text-zinc-400 mt-1">Configure extended security frameworks and fatigue management</p>
        </div>

        {/* Framework Configuration */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Framework Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Enabled Frameworks</h3>
                <div className="space-y-2">
                  {[
                    { name: 'OWASP Top 10', enabled: true },
                    { name: 'STRIDE', enabled: true },
                    { name: 'NIST CSF', enabled: true },
                    { name: 'Atomic Red Team', enabled: true },
                    { name: 'CWE', enabled: false },
                    { name: 'CISA Decider', enabled: false }
                  ].map((framework, index) => (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={framework.enabled}
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">{framework.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Fatigue Management</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Max Alerts per Hour</label>
                    <input
                      type="number"
                      defaultValue="50"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Fatigue Threshold</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      defaultValue="0.6"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Enable Smart Filtering</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        className="mb-6"
      />

      {/* Tab Content */}
      {activeTab === 'analysis' && renderFrameworkAnalysis()}
      {activeTab === 'fatigue' && renderAnalystFatigue()}
      {activeTab === 'dashboard' && renderExtendedDashboard()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default ExtendedFrameworks;
