/**
 * Jupiter SIEM Frontend Environment Configuration
 * This module provides centralized access to environment variables
 */

const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8001',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8001',
  
  // Application Configuration
  environment: process.env.REACT_APP_ENVIRONMENT || 'production',
  version: process.env.REACT_APP_VERSION || '2.0.0',
  debug: process.env.REACT_APP_DEBUG === 'true',
  
  // Feature Flags
  aiEnabled: process.env.REACT_APP_AI_ENABLED === 'true',
  analyticsEnabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  experimentalFeatures: process.env.REACT_APP_EXPERIMENTAL_FEATURES === 'true',
  betaFeatures: process.env.REACT_APP_BETA_FEATURES === 'true',
  
  // Application Information
  appName: process.env.REACT_APP_APP_NAME || 'Jupiter SIEM',
  appTitle: process.env.REACT_APP_APP_TITLE || 'Jupiter SIEM - Security Information and Event Management',
  appDescription: process.env.REACT_APP_APP_DESCRIPTION || 'Enterprise-grade SIEM solution for threat detection and response',
  
  // Domain Configuration
  domain: process.env.REACT_APP_DOMAIN || 'siem.projectjupiter.in',
  mainDomain: process.env.REACT_APP_MAIN_DOMAIN || 'projectjupiter.in',
  
  // Security Configuration
  enable2FA: process.env.REACT_APP_ENABLE_2FA === 'true',
  sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT || '3600'),
  maxLoginAttempts: parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS || '5'),
  
  // Monitoring Configuration
  enableMetrics: process.env.REACT_APP_ENABLE_METRICS === 'true',
  metricsPort: parseInt(process.env.REACT_APP_METRICS_PORT || '9090'),
  healthCheckInterval: parseInt(process.env.REACT_APP_HEALTH_CHECK_INTERVAL || '30'),
  
  // Cloudflare Configuration
  cloudflareEnabled: process.env.REACT_APP_CLOUDFLARE_ENABLED === 'true',
  cloudflareEmail: process.env.REACT_APP_CLOUDFLARE_EMAIL || 'harsha@projectjupiter.in',
  
  // Notification Configuration
  notificationEmailEnabled: process.env.REACT_APP_NOTIFICATION_EMAIL_ENABLED === 'true',
  notificationSlackEnabled: process.env.REACT_APP_NOTIFICATION_SLACK_ENABLED === 'true',
  notificationWebhookEnabled: process.env.REACT_APP_NOTIFICATION_WEBHOOK_ENABLED === 'true',
  
  // Custom Configuration
  customFeaturesEnabled: process.env.REACT_APP_CUSTOM_FEATURES_ENABLED === 'true',
  experimentalAiFeatures: process.env.REACT_APP_EXPERIMENTAL_AI_FEATURES === 'true',
  betaFeaturesEnabled: process.env.REACT_APP_BETA_FEATURES_ENABLED === 'true',
  
  // Development helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validation function
export const validateConfig = () => {
  const errors = [];
  
  // Required configuration validation
  if (!config.apiUrl) {
    errors.push('REACT_APP_API_URL is required');
  }
  
  if (!config.wsUrl) {
    errors.push('REACT_APP_WS_URL is required');
  }
  
  if (!config.domain) {
    errors.push('REACT_APP_DOMAIN is required');
  }
  
  // Security validation
  if (config.environment === 'production' && config.debug) {
    errors.push('Debug mode should not be enabled in production');
  }
  
  if (config.environment === 'production' && !config.enable2FA) {
    console.warn('2FA is disabled in production environment');
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (config.isProduction) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('Jupiter SIEM Frontend Configuration:', {
    environment: config.environment,
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    debug: config.debug,
    aiEnabled: config.aiEnabled,
    cloudflareEnabled: config.cloudflareEnabled,
  });
}

// Validate configuration on load
validateConfig();

export default config;
