import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ValidationFeedback, 
  PasswordStrengthIndicator, 
  QueryValidationFeedback,
  LoadingIndicator,
  PasswordVisibilityToggle
} from './ValidationFeedback';
import { 
  validateEmail, 
  validatePassword, 
  validateQuery, 
  validateIPAddress,
  validateTenantName,
  validateUsername,
  createValidator,
  sanitizeString
} from '../utils/validation';

/**
 * ValidatedInput Component
 * Enhanced input component with real-time validation and user-friendly feedback
 */

const ValidatedInput = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  onValidation,
  validationType = "text",
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  showValidation = true,
  debounceMs = 300,
  maxLength,
  minLength,
  autoComplete,
  id,
  name,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  // Create debounced validator
  const debouncedValidator = useCallback(
    createValidator((value) => {
      setIsValidating(true);
      const result = validateInput(value, validationType, { required, minLength, maxLength });
      setValidation(result);
      setIsValidating(false);
      if (onValidation) {
        onValidation(result);
      }
      return result;
    }, debounceMs),
    [validationType, required, minLength, maxLength, debounceMs, onValidation]
  );

  // Validate input based on type
  const validateInput = (value, type, options = {}) => {
    const { required, minLength, maxLength } = options;
    
    // Sanitize input
    const sanitizedValue = sanitizeString(value);
    
    // Check required
    if (required && (!sanitizedValue || sanitizedValue.trim().length === 0)) {
      return {
        valid: false,
        error: `${label || 'Field'} is required`,
        suggestion: 'Please enter a value'
      };
    }

    // Check length constraints
    if (minLength && sanitizedValue.length < minLength) {
      return {
        valid: false,
        error: `Minimum length is ${minLength} characters`,
        suggestion: `Enter at least ${minLength} characters`
      };
    }

    if (maxLength && sanitizedValue.length > maxLength) {
      return {
        valid: false,
        error: `Maximum length is ${maxLength} characters`,
        suggestion: `Use no more than ${maxLength} characters`
      };
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        return validateEmail(sanitizedValue);
      case 'password':
        return validatePassword(sanitizedValue);
      case 'query':
        return validateQuery(sanitizedValue);
      case 'ip':
        return validateIPAddress(sanitizedValue);
      case 'tenant':
        return validateTenantName(sanitizedValue);
      case 'username':
        return validateUsername(sanitizedValue);
      default:
        return {
          valid: true,
          error: null,
          suggestion: null
        };
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Call parent onChange
    if (onChange) {
      onChange(e);
    }

    // Validate if user has interacted with the field
    if (hasBlurred || hasFocus) {
      debouncedValidator(newValue, (result) => {
        setValidation(result);
        if (onValidation) {
          onValidation(result);
        }
      });
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    setHasFocus(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setHasFocus(false);
    setHasBlurred(true);
    
    // Validate on blur
    const result = validateInput(internalValue, validationType, { required, minLength, maxLength });
    setValidation(result);
    if (onValidation) {
      onValidation(result);
    }
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  // Get input type
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Get input classes
  const getInputClasses = () => {
    const baseClasses = "w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all duration-200";
    
    let borderClasses = "border-zinc-600 focus:border-yellow-500 focus:ring-yellow-500/20";
    
    if (validation && hasBlurred) {
      if (validation.valid) {
        borderClasses = "border-green-500 focus:border-green-500 focus:ring-green-500/20";
      } else if (validation.error) {
        borderClasses = "border-red-500 focus:border-red-500 focus:ring-red-500/20";
      } else if (validation.warning) {
        borderClasses = "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20";
      }
    }
    
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
    
    return `${baseClasses} ${borderClasses} ${disabledClasses} ${inputClassName}`;
  };

  // Render validation feedback
  const renderValidationFeedback = () => {
    if (!showValidation || !hasBlurred) return null;

    switch (validationType) {
      case 'password':
        return (
          <PasswordStrengthIndicator
            validation={validation}
            show={validation && hasBlurred}
          />
        );
      case 'query':
        return (
          <QueryValidationFeedback
            validation={validation}
            show={validation && hasBlurred}
          />
        );
      default:
        return (
          <ValidationFeedback
            validation={validation}
            show={validation && hasBlurred}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-zinc-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={getInputType()}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          className={getInputClasses()}
          {...props}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <PasswordVisibilityToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          />
        )}

        {/* Loading Indicator */}
        <LoadingIndicator
          show={isValidating}
          message="Validating..."
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        />
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-xs text-zinc-500 text-right">
          {internalValue.length}/{maxLength}
        </div>
      )}

      {/* Validation Feedback */}
      {renderValidationFeedback()}
    </div>
  );
};

/**
 * ValidatedTextarea Component
 * Enhanced textarea with validation
 */
export const ValidatedTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  onValidation,
  validationType = "text",
  required = false,
  disabled = false,
  className = "",
  textareaClassName = "",
  showValidation = true,
  debounceMs = 300,
  maxLength,
  minLength,
  rows = 4,
  id,
  name,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  // Create debounced validator
  const debouncedValidator = useCallback(
    createValidator((value) => {
      setIsValidating(true);
      const result = validateInput(value, validationType, { required, minLength, maxLength });
      setValidation(result);
      setIsValidating(false);
      if (onValidation) {
        onValidation(result);
      }
      return result;
    }, debounceMs),
    [validationType, required, minLength, maxLength, debounceMs, onValidation]
  );

  // Validate input based on type
  const validateInput = (value, type, options = {}) => {
    const { required, minLength, maxLength } = options;
    
    // Sanitize input
    const sanitizedValue = sanitizeString(value);
    
    // Check required
    if (required && (!sanitizedValue || sanitizedValue.trim().length === 0)) {
      return {
        valid: false,
        error: `${label || 'Field'} is required`,
        suggestion: 'Please enter a value'
      };
    }

    // Check length constraints
    if (minLength && sanitizedValue.length < minLength) {
      return {
        valid: false,
        error: `Minimum length is ${minLength} characters`,
        suggestion: `Enter at least ${minLength} characters`
      };
    }

    if (maxLength && sanitizedValue.length > maxLength) {
      return {
        valid: false,
        error: `Maximum length is ${maxLength} characters`,
        suggestion: `Use no more than ${maxLength} characters`
      };
    }

    // Type-specific validation
    switch (type) {
      case 'query':
        return validateQuery(sanitizedValue);
      default:
        return {
          valid: true,
          error: null,
          suggestion: null
        };
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Call parent onChange
    if (onChange) {
      onChange(e);
    }

    // Validate if user has interacted with the field
    if (hasBlurred || hasFocus) {
      debouncedValidator(newValue, (result) => {
        setValidation(result);
        if (onValidation) {
          onValidation(result);
        }
      });
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    setHasFocus(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setHasFocus(false);
    setHasBlurred(true);
    
    // Validate on blur
    const result = validateInput(internalValue, validationType, { required, minLength, maxLength });
    setValidation(result);
    if (onValidation) {
      onValidation(result);
    }
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  // Get textarea classes
  const getTextareaClasses = () => {
    const baseClasses = "w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-vertical";
    
    let borderClasses = "border-zinc-600 focus:border-yellow-500 focus:ring-yellow-500/20";
    
    if (validation && hasBlurred) {
      if (validation.valid) {
        borderClasses = "border-green-500 focus:border-green-500 focus:ring-green-500/20";
      } else if (validation.error) {
        borderClasses = "border-red-500 focus:border-red-500 focus:ring-red-500/20";
      } else if (validation.warning) {
        borderClasses = "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20";
      }
    }
    
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
    
    return `${baseClasses} ${borderClasses} ${disabledClasses} ${textareaClassName}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-zinc-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          id={id || name}
          name={name}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          className={getTextareaClasses()}
          {...props}
        />

        {/* Loading Indicator */}
        <LoadingIndicator
          show={isValidating}
          message="Validating..."
          className="absolute right-3 top-3"
        />
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-xs text-zinc-500 text-right">
          {internalValue.length}/{maxLength}
        </div>
      )}

      {/* Validation Feedback */}
      {showValidation && hasBlurred && (
        <QueryValidationFeedback
          validation={validation}
          show={validation}
        />
      )}
    </div>
  );
};

export default ValidatedInput;
