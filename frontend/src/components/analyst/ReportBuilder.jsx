import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  Save, 
  FileText, 
  Flag, 
  Brain, 
  Eye, 
  EyeOff,
  Copy,
  Share,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';
import EnhancedCard from '../ui/EnhancedCard';
import { SkeletonCard, EmptyState } from '../ui/LoadingStates';

const ReportBuilder = ({ logData, onReportAdded, onFlagCreated }) => {
  const [reports, setReports] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showELI5, setShowELI5] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    loadReports();
    loadSavedReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from API
      const mockReports = [
        {
          id: '1',
          title: 'SQL Injection Analysis',
          content: { alerts: 5, severity: 'high' },
          created_at: new Date().toISOString(),
          status: 'draft'
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedReports = async () => {
    try {
      // Mock data - in production, fetch from API
      const mockSavedReports = [
        {
          id: '1',
          title: 'Weekly Security Report',
          format: 'pdf',
          created_at: new Date().toISOString(),
          download_count: 12
        }
      ];
      setSavedReports(mockSavedReports);
    } catch (error) {
      console.error('Error loading saved reports:', error);
    }
  };

  const addToReport = async (reportData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyst/reports/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
        body: JSON.stringify({
          tenant_id: 'default',
          analyst_id: 'current_user',
          widget_id: 'log_viewer',
          title: reportData.title || 'Log Analysis Report',
          content: reportData,
          status: 'draft'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setReports(prev => [...prev, result]);
        onReportAdded && onReportAdded(result);
      }
    } catch (error) {
      console.error('Error adding to report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportIds, format = 'pdf') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyst/reports/export?report_ids=${reportIds.join(',')}&format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Trigger download
        window.open(result.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const flagToAdmin = async (flagData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyst/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
        body: JSON.stringify({
          tenant_id: 'default',
          analyst_id: 'current_user',
          widget_id: 'log_viewer',
          reason: flagData.reason,
          priority: flagData.priority || 'medium',
          data: flagData
        })
      });

      if (response.ok) {
        const result = await response.json();
        onFlagCreated && onFlagCreated(result);
      }
    } catch (error) {
      console.error('Error flagging to admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const explainLog = async (logData) => {
    try {
      setExplaining(true);
      const response = await fetch('/api/analyst/logs/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
        body: JSON.stringify({
          log_data: logData,
          format: showELI5 ? 'eli5' : 'technical',
          analyst_id: 'current_user',
          tenant_id: 'default'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiExplanation(result.explanation);
      }
    } catch (error) {
      console.error('Error explaining log:', error);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ELI5 Toggle */}
      <EnhancedCard
        title="AI Explanation Mode"
        subtitle="Toggle between technical and simple explanations"
        priority="info"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-zinc-300">
              {showELI5 ? 'ELI5 Mode (Explain Like I\'m 5)' : 'Technical Mode'}
            </span>
          </div>
          <button
            onClick={() => setShowELI5(!showELI5)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showELI5 ? 'bg-blue-600' : 'bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showELI5 ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </EnhancedCard>

      {/* Log Explanation */}
      {logData && (
        <EnhancedCard
          title="Log Analysis"
          subtitle="AI-powered log explanation"
          priority="medium"
          actions={
            <button
              onClick={() => explainLog(logData)}
              disabled={explaining}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Brain className={`w-4 h-4 text-blue-400 ${explaining ? 'animate-pulse' : ''}`} />
            </button>
          }
        >
          {aiExplanation ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    {showELI5 ? 'Simple Explanation' : 'Technical Analysis'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    aiExplanation.fallback_used ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {aiExplanation.fallback_used ? 'Fallback' : 'AI'}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{aiExplanation.explanation}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>Confidence: {(aiExplanation.confidence * 100).toFixed(0)}%</span>
                  <span>Processing: {aiExplanation.processing_time.toFixed(2)}s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">Click the brain icon to get an AI explanation</p>
            </div>
          )}
        </EnhancedCard>
      )}

      {/* Quick Actions */}
      <EnhancedCard
        title="Quick Actions"
        subtitle="Report and flagging tools"
        priority="info"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addToReport(logData)}
            disabled={loading}
            className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-white">Add to Report</div>
                <div className="text-sm text-zinc-400">Include in security report</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => exportReport(reports.map(r => r.id))}
            disabled={loading || reports.length === 0}
            className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Download className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-medium text-white">Export Report</div>
                <div className="text-sm text-zinc-400">Download as PDF/HTML</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => flagToAdmin({ reason: 'Suspicious activity detected', priority: 'high' })}
            disabled={loading}
            className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-red-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <Flag className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-medium text-white">Flag to Admin</div>
                <div className="text-sm text-zinc-400">Request admin review</div>
              </div>
            </div>
          </motion.button>
        </div>
      </EnhancedCard>

      {/* Current Reports */}
      <EnhancedCard
        title="Current Reports"
        subtitle="Draft and active reports"
        priority="medium"
        count={reports.length}
      >
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Reports Yet"
            description="Create your first security report by adding log data"
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{report.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Created: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      report.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </EnhancedCard>

      {/* Saved Reports */}
      <EnhancedCard
        title="Saved Reports"
        subtitle="Previously exported reports"
        priority="low"
        count={savedReports.length}
      >
        {savedReports.length === 0 ? (
          <EmptyState
            icon={Save}
            title="No Saved Reports"
            description="Export reports to see them here"
          />
        ) : (
          <div className="space-y-3">
            {savedReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{report.title}</h4>
                    <p className="text-sm text-zinc-400">
                      {report.format.toUpperCase()} • {report.download_count} downloads
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                      <Share className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </EnhancedCard>
    </div>
  );
};

export default ReportBuilder;
