import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Filter, 
  Trophy, 
  Brain,
  Plus,
  Download,
  Flag,
  Target,
  Users,
  Globe,
  Zap
} from 'lucide-react';
import EnhancedCard from '../components/ui/EnhancedCard';
import EnhancedTabs from '../components/ui/EnhancedTabs';
import ReportBuilder from '../components/analyst/ReportBuilder';
import NoiseBucketManager from '../components/analyst/NoiseBucketManager';
import GamificationDashboard from '../components/analyst/GamificationDashboard';

const AnalystFeatures = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [logData, setLogData] = useState(null);

  // Mock log data for demonstration
  const mockLogData = {
    timestamp: new Date().toISOString(),
    activity_name: 'SQL Injection Attempt',
    severity: 'high',
    source_ip: '192.168.1.100',
    user_id: 'admin',
    details: {
      query: "SELECT * FROM users WHERE id = '1' OR '1'='1'",
      table: 'users',
      method: 'POST'
    }
  };

  const tabs = [
    {
      id: 'reports',
      label: 'Reports & Flagging',
      icon: FileText,
      badge: 'Core'
    },
    {
      id: 'noise',
      label: 'Noise Management',
      icon: Filter,
      badge: 'UX'
    },
    {
      id: 'gamification',
      label: 'Analyst Profile',
      icon: Trophy,
      badge: 'New'
    }
  ];

  const quickActions = [
    {
      id: 'add_report',
      title: 'Add to Report',
      description: 'Include current log in security report',
      icon: Plus,
      color: 'blue',
      action: () => setLogData(mockLogData)
    },
    {
      id: 'export_report',
      title: 'Export Report',
      description: 'Download report as PDF/HTML',
      icon: Download,
      color: 'green',
      action: () => console.log('Export report')
    },
    {
      id: 'flag_admin',
      title: 'Flag to Admin',
      description: 'Request admin review',
      icon: Flag,
      color: 'red',
      action: () => console.log('Flag to admin')
    },
    {
      id: 'explain_log',
      title: 'AI Explanation',
      description: 'Get ELI5 explanation',
      icon: Brain,
      color: 'purple',
      action: () => setLogData(mockLogData)
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reports':
        return <ReportBuilder logData={logData} />;
      case 'noise':
        return <NoiseBucketManager />;
      case 'gamification':
        return <GamificationDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analyst Features</h1>
          <p className="text-zinc-400 mt-1">Core tools for security analysts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLogData(mockLogData)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Load Sample Log</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <EnhancedCard
        title="Quick Actions"
        subtitle="Common analyst tasks"
        priority="info"
        count={quickActions.length}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`p-4 rounded-lg border transition-all text-left group ${
                action.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50' :
                action.color === 'green' ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' :
                action.color === 'red' ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' :
                'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  action.color === 'blue' ? 'bg-blue-500/20 group-hover:bg-blue-500/30' :
                  action.color === 'green' ? 'bg-green-500/20 group-hover:bg-green-500/30' :
                  action.color === 'red' ? 'bg-red-500/20 group-hover:bg-red-500/30' :
                  'bg-purple-500/20 group-hover:bg-purple-500/30'
                } transition-colors`}>
                  <action.icon className={`w-5 h-5 ${
                    action.color === 'blue' ? 'text-blue-400' :
                    action.color === 'green' ? 'text-green-400' :
                    action.color === 'red' ? 'text-red-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div>
                  <div className="font-medium text-white">{action.title}</div>
                  <div className="text-sm text-zinc-400">{action.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </EnhancedCard>

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        className="mb-6"
      />

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

      {/* Feature Overview */}
      <EnhancedCard
        title="Feature Overview"
        subtitle="What's new in analyst features"
        priority="low"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">Reporting & Flagging</h4>
            </div>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Add logs to reports</li>
              <li>• Export PDF/HTML reports</li>
              <li>• Flag suspicious content</li>
              <li>• AI-powered explanations</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-white">Noise Management</h4>
            </div>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Aggregated alert buckets</li>
              <li>• Smart noise reduction</li>
              <li>• Pivot query templates</li>
              <li>• Trend analysis</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Gamification</h4>
            </div>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• XP and leveling system</li>
              <li>• Badges and achievements</li>
              <li>• Analyst leaderboard</li>
              <li>• Activity streaks</li>
            </ul>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
};

export default AnalystFeatures;
