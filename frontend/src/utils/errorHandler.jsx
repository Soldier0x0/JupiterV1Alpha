/**
 * Jupiter SIEM Error Handling Utilities
 * User-friendly error handling and display
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Error types and their user-friendly messages
 */
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: {
    title: "Connection Problem",
    message: "Unable to connect to the server. Please check your internet connection and try again.",
    suggestion: "Check your internet connection or try refreshing the page."
  },
  TIMEOUT_ERROR: {
    title: "Request Timeout",
    message: "The request took too long to complete. The server might be busy.",
    suggestion: "Please wait a moment and try again."
  },
  
  // Authentication errors
  UNAUTHORIZED: {
    title: "Authentication Required",
    message: "You need to log in to access this feature.",
    suggestion: "Please log in and try again."
  },
  FORBIDDEN: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    suggestion: "Contact your administrator if you believe this is an error."
  },
  TOKEN_EXPIRED: {
    title: "Session Expired",
    message: "Your session has expired. Please log in again.",
    suggestion: "You will be redirected to the login page."
  },
  
  // Validation errors
  VALIDATION_ERROR: {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    suggestion: "Review the highlighted fields and correct any errors."
  },
  REQUIRED_FIELD: {
    title: "Missing Information",
    message: "Please fill in all required fields.",
    suggestion: "Check that all required fields are completed."
  },
  
  // Server errors
  SERVER_ERROR: {
    title: "Server Error",
    message: "Something went wrong on our end. We're working to fix it.",
    suggestion: "Please try again in a few moments."
  },
  SERVICE_UNAVAILABLE: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable.",
    suggestion: "Please try again later."
  },
  
  // Rate limiting
  RATE_LIMITED: {
    title: "Too Many Requests",
    message: "You're making requests too quickly. Please slow down.",
    suggestion: "Wait a moment before trying again."
  },
  
  // File upload errors
  FILE_TOO_LARGE: {
    title: "File Too Large",
    message: "The file you're trying to upload is too large.",
    suggestion: "Please choose a smaller file or compress it."
  },
  INVALID_FILE_TYPE: {
    title: "Invalid File Type",
    message: "The file type is not supported.",
    suggestion: "Please choose a supported file format."
  },
  
  // Query errors
  QUERY_ERROR: {
    title: "Query Error",
    message: "There was an error with your query.",
    suggestion: "Check your query syntax and try again."
  },
  QUERY_TIMEOUT: {
    title: "Query Timeout",
    message: "Your query took too long to execute.",
    suggestion: "Try simplifying your query or reducing the time range."
  }
};

/**
 * Parse error from API response
 */
export const parseError = (error) => {
  // Default error
  let errorInfo = {
    type: 'UNKNOWN_ERROR',
    title: 'An Error Occurred',
    message: 'Something went wrong. Please try again.',
    suggestion: 'If the problem persists, contact support.',
    status: null,
    details: null
  };

  // Network error
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorInfo = { ...ERROR_MESSAGES.TIMEOUT_ERROR, type: 'TIMEOUT_ERROR' };
    } else {
      errorInfo = { ...ERROR_MESSAGES.NETWORK_ERROR, type: 'NETWORK_ERROR' };
    }
    return errorInfo;
  }

  const status = error.response.status;
  const data = error.response.data;

  // HTTP status code errors
  switch (status) {
    case 400:
      if (data?.detail?.includes('validation')) {
        errorInfo = { ...ERROR_MESSAGES.VALIDATION_ERROR, type: 'VALIDATION_ERROR', details: data.detail };
      } else if (data?.detail?.includes('required')) {
        errorInfo = { ...ERROR_MESSAGES.REQUIRED_FIELD, type: 'REQUIRED_FIELD', details: data.detail };
      } else {
        errorInfo = { ...ERROR_MESSAGES.VALIDATION_ERROR, type: 'VALIDATION_ERROR', details: data.detail };
      }
      break;
    case 401:
      if (data?.detail?.includes('token') || data?.detail?.includes('expired')) {
        errorInfo = { ...ERROR_MESSAGES.TOKEN_EXPIRED, type: 'TOKEN_EXPIRED' };
      } else {
        errorInfo = { ...ERROR_MESSAGES.UNAUTHORIZED, type: 'UNAUTHORIZED' };
      }
      break;
    case 403:
      errorInfo = { ...ERROR_MESSAGES.FORBIDDEN, type: 'FORBIDDEN' };
      break;
    case 413:
      errorInfo = { ...ERROR_MESSAGES.FILE_TOO_LARGE, type: 'FILE_TOO_LARGE' };
      break;
    case 429:
      errorInfo = { ...ERROR_MESSAGES.RATE_LIMITED, type: 'RATE_LIMITED' };
      break;
    case 500:
      errorInfo = { ...ERROR_MESSAGES.SERVER_ERROR, type: 'SERVER_ERROR' };
      break;
    case 503:
      errorInfo = { ...ERROR_MESSAGES.SERVICE_UNAVAILABLE, type: 'SERVICE_UNAVAILABLE' };
      break;
    default:
      if (data?.detail) {
        errorInfo.message = data.detail;
        errorInfo.details = data.detail;
      }
  }

  // Check for specific error types in the response
  if (data?.error) {
    const errorType = data.error.toUpperCase();
    if (ERROR_MESSAGES[errorType]) {
      errorInfo = { ...ERROR_MESSAGES[errorType], type: errorType };
    }
  }

  // Check for query-specific errors
  if (data?.message && data.message.includes('query')) {
    if (data.message.includes('timeout')) {
      errorInfo = { ...ERROR_MESSAGES.QUERY_TIMEOUT, type: 'QUERY_TIMEOUT' };
    } else {
      errorInfo = { ...ERROR_MESSAGES.QUERY_ERROR, type: 'QUERY_ERROR', details: data.message };
    }
  }

  return {
    ...errorInfo,
    status,
    originalError: error
  };
};

/**
 * Get error icon based on error type
 */
export const getErrorIcon = (errorType) => {
  switch (errorType) {
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
    case 'SERVER_ERROR':
    case 'SERVICE_UNAVAILABLE':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
    case 'TOKEN_EXPIRED':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'VALIDATION_ERROR':
    case 'REQUIRED_FIELD':
      return <Info className="w-5 h-5 text-yellow-500" />;
    case 'RATE_LIMITED':
      return <RefreshCw className="w-5 h-5 text-orange-500" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
  }
};

/**
 * Get error color scheme based on error type
 */
export const getErrorColors = (errorType) => {
  switch (errorType) {
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
    case 'SERVER_ERROR':
    case 'SERVICE_UNAVAILABLE':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-500'
      };
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
    case 'TOKEN_EXPIRED':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-500'
      };
    case 'VALIDATION_ERROR':
    case 'REQUIRED_FIELD':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-500'
      };
    case 'RATE_LIMITED':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        icon: 'text-orange-500'
      };
    default:
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-500'
      };
  }
};

/**
 * ErrorDisplay Component
 * Displays user-friendly error messages
 */
export const ErrorDisplay = ({ 
  error, 
  onRetry = null, 
  onDismiss = null, 
  show = true, 
  className = "",
  compact = false
}) => {
  if (!show || !error) return null;

  const errorInfo = typeof error === 'string' ? 
    { title: 'Error', message: error, type: 'UNKNOWN_ERROR' } : 
    parseError(error);

  const colors = getErrorColors(errorInfo.type);
  const icon = getErrorIcon(errorInfo.type);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-2 p-3 rounded-lg border ${colors.bg} ${colors.border} ${className}`}
      >
        {icon}
        <div className="flex-1">
          <div className={`text-sm font-medium ${colors.text}`}>
            {errorInfo.title}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {errorInfo.message}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-6 rounded-lg border ${colors.bg} ${colors.border} ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
            {errorInfo.title}
          </h3>
          <p className="text-zinc-300 mb-4">
            {errorInfo.message}
          </p>
          {errorInfo.suggestion && (
            <div className="text-sm text-zinc-400 mb-4">
              💡 {errorInfo.suggestion}
            </div>
          )}
          {errorInfo.details && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400">
                Show Details
              </summary>
              <pre className="mt-2 text-xs text-zinc-400 bg-zinc-800 p-3 rounded overflow-auto">
                {errorInfo.details}
              </pre>
            </details>
          )}
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center space-x-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * SuccessDisplay Component
 * Displays success messages
 */
export const SuccessDisplay = ({ 
  message, 
  onDismiss = null, 
  show = true, 
  className = "",
  compact = false
}) => {
  if (!show || !message) return null;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-2 p-3 rounded-lg border bg-green-500/10 border-green-500/30 ${className}`}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-400">
            {message}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-6 rounded-lg border bg-green-500/10 border-green-500/30 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Success
          </h3>
          <p className="text-zinc-300">
            {message}
          </p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-4 flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <XCircle className="w-4 h-4" />
              <span>Dismiss</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Handle API errors with automatic retry logic
 */
export const handleApiError = async (error, retryFn = null, maxRetries = 3) => {
  const errorInfo = parseError(error);
  
  // Auto-retry for certain error types
  if (retryFn && maxRetries > 0) {
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'];
    
    if (retryableErrors.includes(errorInfo.type)) {
      console.log(`Retrying request (${maxRetries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return retryFn(maxRetries - 1);
    }
  }
  
  return errorInfo;
};

export default {
  parseError,
  getErrorIcon,
  getErrorColors,
  ErrorDisplay,
  SuccessDisplay,
  handleApiError
};
