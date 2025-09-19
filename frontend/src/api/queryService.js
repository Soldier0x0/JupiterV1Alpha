// Query service for JupiterEmerge SIEM
import apiClient from './client';

export const queryService = {
  // Execute a log search query
  async executeQuery(query, options = {}) {
    try {
      const response = await apiClient.post('/api/logs/search', {
        query,
        timeRange: options.timeRange || '1h',
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: options.sortBy || 'time',
        sortOrder: options.sortOrder || 'desc'
      });
      
      return {
        success: true,
        data: response.data,
        total: response.data.total || 0,
        results: response.data.results || []
      };
    } catch (error) {
      console.error('Query execution failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Query execution failed',
        results: []
      };
    }
  },

  // Validate a query before execution
  async validateQuery(query) {
    try {
      const response = await apiClient.post('/api/logs/validate', { query });
      return {
        valid: true,
        suggestions: response.data.suggestions || [],
        warnings: response.data.warnings || []
      };
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.message || 'Query validation failed',
        suggestions: [],
        warnings: []
      };
    }
  },

  // Get query suggestions based on partial input
  async getSuggestions(partialQuery, cursorPosition) {
    try {
      const response = await apiClient.post('/api/logs/suggestions', {
        query: partialQuery,
        position: cursorPosition
      });
      
      return {
        success: true,
        suggestions: response.data.suggestions || []
      };
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return {
        success: false,
        suggestions: []
      };
    }
  },

  // Get available fields and their metadata
  async getFieldMetadata() {
    try {
      const response = await apiClient.get('/api/logs/fields');
      return {
        success: true,
        fields: response.data.fields || []
      };
    } catch (error) {
      console.error('Failed to get field metadata:', error);
      return {
        success: false,
        fields: []
      };
    }
  },

  // Get query performance metrics
  async getQueryMetrics(query) {
    try {
      const response = await apiClient.post('/api/logs/metrics', { query });
      return {
        success: true,
        metrics: response.data.metrics || {}
      };
    } catch (error) {
      console.error('Failed to get query metrics:', error);
      return {
        success: false,
        metrics: {}
      };
    }
  },

  // Save a query for later use
  async saveQuery(queryData) {
    try {
      const response = await apiClient.post('/api/queries', queryData);
      return {
        success: true,
        query: response.data.query
      };
    } catch (error) {
      console.error('Failed to save query:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save query'
      };
    }
  },

  // Get saved queries
  async getSavedQueries() {
    try {
      const response = await apiClient.get('/api/queries');
      return {
        success: true,
        queries: response.data.queries || []
      };
    } catch (error) {
      console.error('Failed to get saved queries:', error);
      return {
        success: false,
        queries: []
      };
    }
  },

  // Delete a saved query
  async deleteQuery(queryId) {
    try {
      await apiClient.delete(`/api/queries/${queryId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete query:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete query'
      };
    }
  },

  // Export query results
  async exportResults(query, format = 'json', options = {}) {
    try {
      const response = await apiClient.post('/api/logs/export', {
        query,
        format,
        ...options
      }, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || 'export'
      };
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Export failed'
      };
    }
  }
};

export default queryService;
