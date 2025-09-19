// AI Service for JupiterEmerge SIEM
import apiClient from './client';

export const aiService = {
  // Query Generation
  async generateQuery(userInput, context = null) {
    try {
      const response = await apiClient.post('/api/ai/generate-query', {
        user_input: userInput,
        context,
        model_preference: 'query_generator'
      });
      
      return {
        success: true,
        query: response.data.query,
        confidence: response.data.confidence,
        explanation: response.data.explanation
      };
    } catch (error) {
      console.error('Query generation failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Query generation failed'
      };
    }
  },

  // Threat Analysis
  async analyzeThreat(logData) {
    try {
      const response = await apiClient.post('/api/ai/analyze-threat', {
        log_data: logData,
        analysis_type: 'comprehensive'
      });
      
      return {
        success: true,
        threat_level: response.data.threat_level,
        threat_type: response.data.threat_type,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations,
        analysis: response.data.analysis
      };
    } catch (error) {
      console.error('Threat analysis failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Threat analysis failed'
      };
    }
  },

  // Log Analysis
  async analyzeLogs(logs) {
    try {
      const response = await apiClient.post('/api/ai/analyze-logs', {
        logs,
        analysis_type: 'pattern_detection'
      });
      
      return {
        success: true,
        patterns: response.data.patterns,
        anomalies: response.data.anomalies,
        summary: response.data.summary,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Log analysis failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Log analysis failed'
      };
    }
  },

  // RAG Search
  async searchRAG(query, dataType = 'logs', nResults = 5) {
    try {
      const response = await apiClient.post('/api/ai/search-rag', {
        query,
        data_type: dataType,
        n_results: nResults
      });
      
      return {
        success: true,
        results: response.data.results,
        total_found: response.data.total_found
      };
    } catch (error) {
      console.error('RAG search failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'RAG search failed'
      };
    }
  },

  // Add to RAG
  async addToRAG(data, dataType = 'logs') {
    try {
      const response = await apiClient.post('/api/ai/add-to-rag', data, {
        params: { data_type: dataType }
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to add to RAG:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to RAG'
      };
    }
  },

  // Model Training
  async trainModel(logs, modelName = 'log_analyzer') {
    try {
      const response = await apiClient.post('/api/ai/train-model', {
        logs,
        model_name: modelName,
        training_type: 'fine_tune'
      });
      
      return {
        success: response.data.success,
        message: response.data.message,
        training_id: response.data.training_id
      };
    } catch (error) {
      console.error('Model training failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Model training failed'
      };
    }
  },

  // Get Model Status
  async getModelsStatus() {
    try {
      const response = await apiClient.get('/api/ai/models/status');
      
      return {
        success: response.data.success,
        models: response.data.models,
        vector_store: response.data.vector_store,
        device: response.data.device
      };
    } catch (error) {
      console.error('Failed to get model status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get model status'
      };
    }
  },

  // Get Model Recommendations
  async getModelRecommendations() {
    try {
      const response = await apiClient.get('/api/ai/models/recommendations');
      
      return {
        success: response.data.success,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get recommendations'
      };
    }
  },

  // Get Model Performance
  async getModelPerformance() {
    try {
      // This would typically come from a separate endpoint
      // For now, return mock data
      return {
        success: true,
        avg_response_time: 150,
        success_rate: 95.2,
        memory_usage: 68,
        gpu_utilization: 45,
        models_loaded: 4
      };
    } catch (error) {
      console.error('Failed to get model performance:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get model performance'
      };
    }
  },

  // Batch Operations
  async batchAnalyzeLogs(logs, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      const result = await this.analyzeLogs(batch);
      results.push(result);
      
      // Add small delay to prevent overwhelming the API
      if (i + batchSize < logs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  },

  // Smart Query Suggestions
  async getSmartSuggestions(context) {
    try {
      // Use RAG to find similar queries
      const ragResults = await this.searchRAG(context, 'queries', 3);
      
      if (ragResults.success && ragResults.results.length > 0) {
        return ragResults.results.map(result => ({
          query: result.metadata?.query || result.text,
          description: result.metadata?.description || 'Similar query found',
          confidence: 1 - result.distance
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get smart suggestions:', error);
      return [];
    }
  },

  // Threat Intelligence Integration
  async enrichWithThreatIntel(logData) {
    try {
      // Search for similar threats in RAG
      const threatResults = await this.searchRAG(
        `${logData.activity_name} ${logData.src_endpoint_ip}`,
        'threats',
        3
      );
      
      if (threatResults.success && threatResults.results.length > 0) {
        return {
          enriched: true,
          threat_intel: threatResults.results,
          risk_score: this.calculateRiskScore(logData, threatResults.results)
        };
      }
      
      return { enriched: false };
    } catch (error) {
      console.error('Failed to enrich with threat intel:', error);
      return { enriched: false, error: error.message };
    }
  },

  // Calculate Risk Score
  calculateRiskScore(logData, threatIntel) {
    let riskScore = 0;
    
    // Base risk from log severity
    const severityRisk = {
      'low': 0.2,
      'medium': 0.5,
      'high': 0.8,
      'critical': 1.0
    };
    
    riskScore += severityRisk[logData.severity] || 0.3;
    
    // Add risk from threat intelligence
    if (threatIntel.length > 0) {
      const avgThreatSimilarity = threatIntel.reduce((sum, threat) => sum + (1 - threat.distance), 0) / threatIntel.length;
      riskScore += avgThreatSimilarity * 0.3;
    }
    
    // Cap at 1.0
    return Math.min(riskScore, 1.0);
  },

  // Continuous Learning
  async enableContinuousLearning() {
    try {
      // This would typically start a background process
      // For now, just return success
      return {
        success: true,
        message: 'Continuous learning enabled'
      };
    } catch (error) {
      console.error('Failed to enable continuous learning:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Model Health Check
  async healthCheck() {
    try {
      const status = await this.getModelsStatus();
      const performance = await this.getModelPerformance();
      
      return {
        healthy: status.success && performance.success,
        models_loaded: Object.keys(status.models || {}).length,
        avg_response_time: performance.avg_response_time,
        memory_usage: performance.memory_usage,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }
};

export default aiService;
