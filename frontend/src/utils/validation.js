/**
 * Jupiter SIEM Frontend Validation Utilities
 * User-friendly input validation and sanitization
 */

// Validation patterns
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  ipAddress: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
  port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  safeString: /^[a-zA-Z0-9\s\-_.,!?@#$%&*+=()]+$/
};

// Input limits
const INPUT_LIMITS = {
  maxQueryLength: 10000,
  maxEmailLength: 254,
  maxUsernameLength: 50,
  maxCommentLength: 1000,
  maxTenantNameLength: 100,
  maxPasswordLength: 128,
  minPasswordLength: 10
};

/**
 * Sanitize string input to prevent XSS and injection
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') {
    return String(input);
  }

  // Remove null bytes and control characters
  let clean = input.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  
  // Trim whitespace
  clean = clean.trim();
  
  // Limit length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  
  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  
  // Escape HTML entities
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return clean;
};

/**
 * Validate email address with user-friendly feedback
 */
export const validateEmail = (email) => {
  const result = {
    valid: false,
    error: null,
    suggestion: null
  };

  if (!email || typeof email !== 'string') {
    result.error = 'Email is required';
    return result;
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    result.error = 'Email cannot be empty';
    return result;
  }

  if (trimmedEmail.length > INPUT_LIMITS.maxEmailLength) {
    result.error = `Email too long (max ${INPUT_LIMITS.maxEmailLength} characters)`;
    return result;
  }

  if (!VALIDATION_PATTERNS.email.test(trimmedEmail)) {
    result.error = 'Invalid email format';
    result.suggestion = 'Please enter a valid email address (e.g., user@example.com)';
    return result;
  }

  // Check for dangerous characters
  const dangerousChars = ['<', '>', '"', "'", '&', '\n', '\r'];
  if (dangerousChars.some(char => trimmedEmail.includes(char))) {
    result.error = 'Email contains invalid characters';
    return result;
  }

  result.valid = true;
  return result;
};

/**
 * Validate password with strength analysis and helpful suggestions
 */
export const validatePassword = (password) => {
  const result = {
    valid: false,
    strength: 0,
    strengthText: 'Very Weak',
    issues: [],
    suggestions: []
  };

  if (!password || typeof password !== 'string') {
    result.issues.push('Password is required');
    result.suggestions.push('Enter a password');
    return result;
  }

  const issues = [];
  const suggestions = [];

  // Length check
  if (password.length < INPUT_LIMITS.minPasswordLength) {
    issues.push('Password too short');
    suggestions.push(`Use at least ${INPUT_LIMITS.minPasswordLength} characters`);
  }

  if (password.length > INPUT_LIMITS.maxPasswordLength) {
    issues.push('Password too long');
    suggestions.push(`Use no more than ${INPUT_LIMITS.maxPasswordLength} characters`);
  }

  // Character requirements
  if (!/[A-Z]/.test(password)) {
    issues.push('Missing uppercase letter');
    suggestions.push('Add at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Missing lowercase letter');
    suggestions.push('Add at least one lowercase letter (a-z)');
  }

  if (!/\d/.test(password)) {
    issues.push('Missing number');
    suggestions.push('Add at least one number (0-9)');
  }

  if (!/[!@#$%&*+\-=?]/.test(password)) {
    issues.push('Missing special character');
    suggestions.push('Add at least one special character (!@#$%&*+-=?)');
  }

  // Common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Too many repeated characters');
    suggestions.push('Avoid repeating the same character more than 2 times');
  }

  if (/password|123|qwerty|admin/i.test(password)) {
    issues.push('Common password pattern detected');
    suggestions.push('Avoid common words and patterns');
  }

  // Calculate strength score
  const strengthScore = Math.max(0, 100 - issues.length * 15);
  
  result.valid = issues.length === 0;
  result.strength = strengthScore;
  result.issues = issues;
  result.suggestions = suggestions;
  result.strengthText = getStrengthText(strengthScore);

  return result;
};

/**
 * Get user-friendly strength description
 */
const getStrengthText = (score) => {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Medium';
  if (score >= 40) return 'Weak';
  return 'Very Weak';
};

/**
 * Validate IP address or CIDR block
 */
export const validateIPAddress = (ip) => {
  const result = {
    valid: false,
    error: null,
    suggestion: null
  };

  if (!ip || typeof ip !== 'string') {
    result.error = 'IP address is required';
    return result;
  }

  const trimmedIP = ip.trim();

  if (trimmedIP.length === 0) {
    result.error = 'IP address cannot be empty';
    return result;
  }

  if (!VALIDATION_PATTERNS.ipAddress.test(trimmedIP)) {
    result.error = 'Invalid IP address format';
    result.suggestion = 'Enter a valid IP address (e.g., 192.168.1.1) or CIDR block (e.g., 192.168.1.0/24)';
    return result;
  }

  // Additional validation for IP ranges
  try {
    const parts = trimmedIP.split('.');
    for (const part of parts) {
      const num = parseInt(part);
      if (num < 0 || num > 255) {
        result.error = 'Invalid IP address range';
        result.suggestion = 'Each IP octet must be between 0 and 255';
        return result;
      }
    }
  } catch (e) {
    result.error = 'Invalid IP address format';
    return result;
  }

  result.valid = true;
  return result;
};

/**
 * Validate port number
 */
export const validatePort = (port) => {
  const result = {
    valid: false,
    error: null,
    suggestion: null
  };

  if (!port) {
    result.error = 'Port is required';
    return result;
  }

  const portNum = parseInt(port);
  
  if (isNaN(portNum)) {
    result.error = 'Port must be a number';
    result.suggestion = 'Enter a valid port number (1-65535)';
    return result;
  }

  if (portNum < 1 || portNum > 65535) {
    result.error = 'Port must be between 1 and 65535';
    result.suggestion = 'Enter a valid port number';
    return result;
  }

  result.valid = true;
  return result;
};

/**
 * Validate OCSF query with security checks
 */
export const validateQuery = (query) => {
  const result = {
    valid: false,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!query || typeof query !== 'string') {
    result.errors.push('Query is required');
    return result;
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    result.errors.push('Query cannot be empty');
    return result;
  }

  if (trimmedQuery.length > INPUT_LIMITS.maxQueryLength) {
    result.errors.push(`Query too long (max ${INPUT_LIMITS.maxQueryLength} characters)`);
    result.suggestions.push('Break your query into smaller parts or use more specific filters');
    return result;
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedQuery)) {
      result.errors.push('Potentially dangerous content detected');
      result.suggestions.push('Remove any script tags or special characters');
      break;
    }
  }

  // Check for suspicious keywords
  const suspiciousKeywords = ['union', 'select', 'insert', 'delete', 'update', 'drop', 'exec', 'execute'];
  for (const keyword of suspiciousKeywords) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(trimmedQuery)) {
      result.warnings.push(`Suspicious keyword detected: ${keyword}`);
    }
  }

  // Check for basic OCSF structure
  if (!/\b[A-Z_][A-Z0-9_]*\s*(=|=~|>|<|>=|<=|IN|CONTAINS)/i.test(trimmedQuery)) {
    result.warnings.push('Query may not follow OCSF syntax');
    result.suggestions.push('Use OCSF field names and operators (e.g., activity_name = "login")');
  }

  // Check for common query issues
  if (!/\b(AND|OR)\b/i.test(trimmedQuery) && trimmedQuery.includes('=')) {
    result.suggestions.push('Consider using AND/OR operators to combine multiple conditions');
  }

  if (/\s{2,}/.test(trimmedQuery)) {
    result.suggestions.push('Remove extra spaces between words');
  }

  result.valid = result.errors.length === 0;
  return result;
};

/**
 * Validate tenant name
 */
export const validateTenantName = (name) => {
  const result = {
    valid: false,
    error: null,
    suggestion: null
  };

  if (!name || typeof name !== 'string') {
    result.error = 'Tenant name is required';
    return result;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    result.error = 'Tenant name cannot be empty';
    return result;
  }

  if (trimmedName.length > INPUT_LIMITS.maxTenantNameLength) {
    result.error = `Tenant name too long (max ${INPUT_LIMITS.maxTenantNameLength} characters)`;
    return result;
  }

  if (!VALIDATION_PATTERNS.safeString.test(trimmedName)) {
    result.error = 'Tenant name contains invalid characters';
    result.suggestion = 'Use only letters, numbers, spaces, and common punctuation';
    return result;
  }

  result.valid = true;
  return result;
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  const result = {
    valid: false,
    error: null,
    suggestion: null
  };

  if (!username || typeof username !== 'string') {
    result.error = 'Username is required';
    return result;
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length === 0) {
    result.error = 'Username cannot be empty';
    return result;
  }

  if (trimmedUsername.length > INPUT_LIMITS.maxUsernameLength) {
    result.error = `Username too long (max ${INPUT_LIMITS.maxUsernameLength} characters)`;
    return result;
  }

  if (trimmedUsername.length < 3) {
    result.error = 'Username too short (min 3 characters)';
    result.suggestion = 'Use at least 3 characters for your username';
    return result;
  }

  if (!VALIDATION_PATTERNS.safeString.test(trimmedUsername)) {
    result.error = 'Username contains invalid characters';
    result.suggestion = 'Use only letters, numbers, spaces, and common punctuation';
    return result;
  }

  result.valid = true;
  return result;
};

/**
 * Get validation limits for UI display
 */
export const getValidationLimits = () => {
  return {
    maxQueryLength: INPUT_LIMITS.maxQueryLength,
    maxEmailLength: INPUT_LIMITS.maxEmailLength,
    maxUsernameLength: INPUT_LIMITS.maxUsernameLength,
    maxCommentLength: INPUT_LIMITS.maxCommentLength,
    maxTenantNameLength: INPUT_LIMITS.maxTenantNameLength,
    maxPasswordLength: INPUT_LIMITS.maxPasswordLength,
    minPasswordLength: INPUT_LIMITS.minPasswordLength
  };
};

/**
 * Real-time validation with debouncing
 */
export const createValidator = (validationFn, delay = 300) => {
  let timeoutId = null;
  
  return (value, callback) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validationFn(value);
      callback(result);
    }, delay);
  };
};

// Export all validation functions
export default {
  sanitizeString,
  validateEmail,
  validatePassword,
  validateIPAddress,
  validatePort,
  validateQuery,
  validateTenantName,
  validateUsername,
  getValidationLimits,
  createValidator
};
