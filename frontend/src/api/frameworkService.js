/**
 * Framework Service for Jupiter SIEM
 * API client for cybersecurity framework analysis
 */

import apiClient from './client';

export const frameworkService = {
  /**
   * Analyze log data using cybersecurity frameworks
   */
  async analyzeLog(logData, frameworks = ['mitre_attack', 'diamond_model', 'kill_chain']) {
    try {
      const response = await apiClient.post('/api/frameworks/analyze', {
        log_data: logData,
        frameworks: frameworks
      });
      
      return {
        success: true,
        analysis: response.data.analysis,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Error analyzing log with frameworks:', error);
      throw error;
    }
  },

  /**
   * Get MITRE ATT&CK techniques
   */
  async getMITRETechniques(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.tactic) params.append('tactic', options.tactic);
      if (options.platform) params.append('platform', options.platform);
      if (options.limit) params.append('limit', options.limit);
      
      const response = await apiClient.get(`/api/frameworks/mitre/techniques?${params}`);
      
      return {
        success: true,
        techniques: response.data.techniques,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting MITRE techniques:', error);
      throw error;
    }
  },

  /**
   * Get specific MITRE ATT&CK technique by ID
   */
  async getMITRETechnique(techniqueId) {
    try {
      const response = await apiClient.get(`/api/frameworks/mitre/techniques/${techniqueId}`);
      
      return {
        success: true,
        technique: response.data.technique
      };
    } catch (error) {
      console.error('Error getting MITRE technique:', error);
      throw error;
    }
  },

  /**
   * Get MITRE ATT&CK tactics
   */
  async getMITRETactics() {
    try {
      const response = await apiClient.get('/api/frameworks/mitre/tactics');
      
      return {
        success: true,
        tactics: response.data.tactics,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting MITRE tactics:', error);
      throw error;
    }
  },

  /**
   * Search MITRE ATT&CK techniques
   */
  async searchMITRETechniques(query, options = {}) {
    try {
      const response = await apiClient.post('/api/frameworks/mitre/search', {
        query: query,
        tactic: options.tactic,
        platform: options.platform
      });
      
      return {
        success: true,
        query: response.data.query,
        results: response.data.results,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching MITRE techniques:', error);
      throw error;
    }
  },

  /**
   * Get Diamond Model phases
   */
  async getDiamondModelPhases() {
    try {
      const response = await apiClient.get('/api/frameworks/diamond-model/phases');
      
      return {
        success: true,
        phases: response.data.phases,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting Diamond Model phases:', error);
      throw error;
    }
  },

  /**
   * Get Kill Chain phases
   */
  async getKillChainPhases() {
    try {
      const response = await apiClient.get('/api/frameworks/kill-chain/phases');
      
      return {
        success: true,
        phases: response.data.phases,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting Kill Chain phases:', error);
      throw error;
    }
  },

  /**
   * Analyze threat intelligence using frameworks
   */
  async analyzeThreatIntelligence(indicators, framework = 'mitre_attack') {
    try {
      const response = await apiClient.post('/api/frameworks/threat-intelligence', {
        indicators: indicators,
        framework: framework
      });
      
      return {
        success: true,
        framework: response.data.framework,
        results: response.data.results,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error analyzing threat intelligence:', error);
      throw error;
    }
  },

  /**
   * Get framework dashboard summary
   */
  async getDashboardSummary(days = 7) {
    try {
      const response = await apiClient.get(`/api/frameworks/dashboard/summary?days=${days}`);
      
      return {
        success: true,
        summary: response.data.summary
      };
    } catch (error) {
      console.error('Error getting framework dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Batch analyze multiple logs
   */
  async batchAnalyzeLogs(logs, frameworks = ['mitre_attack', 'diamond_model', 'kill_chain']) {
    try {
      const promises = logs.map(log => this.analyzeLog(log, frameworks));
      const results = await Promise.allSettled(promises);
      
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
      
      return {
        success: true,
        successful: successful,
        failed: failed,
        total: logs.length,
        successCount: successful.length,
        failureCount: failed.length
      };
    } catch (error) {
      console.error('Error batch analyzing logs:', error);
      throw error;
    }
  },

  /**
   * Get framework statistics
   */
  async getFrameworkStatistics(timeframe = '7d') {
    try {
      const response = await apiClient.get(`/api/frameworks/statistics?timeframe=${timeframe}`);
      
      return {
        success: true,
        statistics: response.data.statistics
      };
    } catch (error) {
      console.error('Error getting framework statistics:', error);
      throw error;
    }
  },

  /**
   * Export framework analysis results
   */
  async exportAnalysisResults(analysisId, format = 'json') {
    try {
      const response = await apiClient.get(`/api/frameworks/export/${analysisId}?format=${format}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        format: format
      };
    } catch (error) {
      console.error('Error exporting analysis results:', error);
      throw error;
    }
  }
};

export default frameworkService;
