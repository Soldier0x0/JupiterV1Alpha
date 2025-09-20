// Connection Test for JupiterEmerge SIEM
import apiClient from '../api/client';
import { queryService } from '../api/queryService';
import { aiService } from '../api/aiService';

export const connectionTest = {
  // Test basic API connectivity
  async testBasicConnection() {
    try {
      console.log('🔍 Testing basic API connection...');
      const response = await apiClient.get('/health');
      console.log('✅ Basic connection successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Basic connection failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test authentication
  async testAuthentication() {
    try {
      console.log('🔍 Testing authentication...');
      const response = await apiClient.get('/user/profile');
      console.log('✅ Authentication successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test query service
  async testQueryService() {
    try {
      console.log('🔍 Testing query service...');
      const response = await queryService.executeQuery('activity_name = "test"', {
        timeRange: '1h',
        limit: 10
      });
      console.log('✅ Query service successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Query service failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test AI service
  async testAIService() {
    try {
      console.log('🔍 Testing AI service...');
      const response = await aiService.getModelsStatus();
      console.log('✅ AI service successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ AI service failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test AI query generation
  async testAIQueryGeneration() {
    try {
      console.log('🔍 Testing AI query generation...');
      const response = await aiService.generateQuery('Find failed login attempts');
      console.log('✅ AI query generation successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ AI query generation failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test RAG search
  async testRAGSearch() {
    try {
      console.log('🔍 Testing RAG search...');
      const response = await aiService.searchRAG('failed login', 'logs', 3);
      console.log('✅ RAG search successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ RAG search failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive connection tests...');
    
    const results = {
      basicConnection: await this.testBasicConnection(),
      authentication: await this.testAuthentication(),
      queryService: await this.testQueryService(),
      aiService: await this.testAIService(),
      aiQueryGeneration: await this.testAIQueryGeneration(),
      ragSearch: await this.testRAGSearch()
    };

    // Summary
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 Test Results: ${successCount}/${totalTests} tests passed`);
    
    if (successCount === totalTests) {
      console.log('🎉 All tests passed! Frontend and backend are fully connected.');
    } else {
      console.log('⚠️ Some tests failed. Check the errors above.');
    }

    return {
      results,
      summary: {
        passed: successCount,
        total: totalTests,
        success: successCount === totalTests
      }
    };
  },

  // Test specific component
  async testComponent(componentName) {
    const tests = {
      'basic': this.testBasicConnection,
      'auth': this.testAuthentication,
      'query': this.testQueryService,
      'ai': this.testAIService,
      'ai-query': this.testAIQueryGeneration,
      'rag': this.testRAGSearch
    };

    if (tests[componentName]) {
      return await tests[componentName]();
    } else {
      console.error(`❌ Unknown component: ${componentName}`);
      return { success: false, error: 'Unknown component' };
    }
  }
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to ensure app is loaded
  setTimeout(() => {
    console.log('🔧 Development mode: Running connection tests...');
    connectionTest.runAllTests();
  }, 2000);
}

export default connectionTest;
