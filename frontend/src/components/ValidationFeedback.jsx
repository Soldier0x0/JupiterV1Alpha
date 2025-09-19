import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';

/**
 * ValidationFeedback Component
 * User-friendly validation feedback with animations and helpful suggestions
 */

export const ValidationFeedback = ({ 
  validation, 
  show = true, 
  className = "",
  size = "sm"
}) => {
  if (!show || !validation) return null;

  const { valid, error, warning, suggestion, strength, strengthText } = validation;

  const getIcon = () => {
    if (valid) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (error) return <XCircle className="w-4 h-4 text-red-500" />;
    if (warning) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getTextColor = () => {
    if (valid) return "text-green-400";
    if (error) return "text-red-400";
    if (warning) return "text-yellow-400";
    return "text-blue-400";
  };

  const getBgColor = () => {
    if (valid) return "bg-green-500/10 border-green-500/30";
    if (error) return "bg-red-500/10 border-red-500/30";
    if (warning) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-blue-500/10 border-blue-500/30";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start space-x-2 p-3 rounded-lg border ${getBgColor()} ${className}`}
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {error || warning || (valid ? "Valid" : "Invalid")}
          </div>
          {suggestion && (
            <div className="text-xs text-zinc-400 mt-1">
              💡 {suggestion}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * PasswordStrengthIndicator Component
 * Visual password strength indicator with helpful feedback
 */
export const PasswordStrengthIndicator = ({ 
  validation, 
  show = true, 
  className = ""
}) => {
  if (!show || !validation) return null;

  const { strength, strengthText, issues, suggestions } = validation;

  const getStrengthColor = () => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-yellow-500";
    if (strength >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthTextColor = () => {
    if (strength >= 80) return "text-green-400";
    if (strength >= 60) return "text-yellow-400";
    if (strength >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`space-y-3 ${className}`}
      >
        {/* Strength Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-300">Password Strength</span>
            <span className={`text-sm font-medium ${getStrengthTextColor()}`}>
              {strengthText}
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getStrengthColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Issues and Suggestions */}
        {(issues.length > 0 || suggestions.length > 0) && (
          <div className="space-y-2">
            {issues.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-red-400">Issues:</div>
                {issues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-red-300"
                  >
                    <XCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{issue}</span>
                  </motion.div>
                ))}
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-400">Suggestions:</div>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (issues.length + index) * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-blue-300"
                  >
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * QueryValidationFeedback Component
 * Specialized feedback for query validation
 */
export const QueryValidationFeedback = ({ 
  validation, 
  show = true, 
  className = ""
}) => {
  if (!show || !validation) return null;

  const { valid, errors, warnings, suggestions } = validation;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`space-y-3 ${className}`}
      >
        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-400">Query Errors</span>
            </div>
            {errors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ml-6 text-sm text-red-300"
              >
                • {error}
              </motion.div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-400">Warnings</span>
            </div>
            {warnings.map((warning, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (errors.length + index) * 0.1 }}
                className="ml-6 text-sm text-yellow-300"
              >
                • {warning}
              </motion.div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">Suggestions</span>
            </div>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (errors.length + warnings.length + index) * 0.1 }}
                className="ml-6 text-sm text-blue-300"
              >
                💡 {suggestion}
              </motion.div>
            ))}
          </div>
        )}

        {/* Success */}
        {valid && errors.length === 0 && warnings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">Query is valid</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * LoadingIndicator Component
 * Simple loading indicator for validation
 */
export const LoadingIndicator = ({ 
  show = false, 
  message = "Validating...", 
  className = ""
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center space-x-2 text-sm text-zinc-400 ${className}`}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{message}</span>
    </motion.div>
  );
};

/**
 * PasswordVisibilityToggle Component
 * Toggle password visibility
 */
export const PasswordVisibilityToggle = ({ 
  isVisible, 
  onToggle, 
  className = ""
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`p-2 text-zinc-400 hover:text-zinc-300 transition-colors ${className}`}
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );
};

export default {
  ValidationFeedback,
  PasswordStrengthIndicator,
  QueryValidationFeedback,
  LoadingIndicator,
  PasswordVisibilityToggle
};
