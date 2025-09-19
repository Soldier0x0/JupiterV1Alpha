#!/usr/bin/env python3
"""
Jupiter SIEM Security Utilities
Comprehensive security validation and sanitization utilities
"""

import re
import hashlib
import hmac
import secrets
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SecurityValidator:
    """Security validation utilities"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            return str(value)
        
        # Remove null bytes and control characters
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
        
        # Limit length
        sanitized = sanitized[:max_length]
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', sanitized)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_email(email: str) -> tuple[bool, str]:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        is_valid = bool(re.match(pattern, email))
        error = "" if is_valid else "Invalid email format"
        return is_valid, error
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        result = {
            'valid': True,
            'score': 0,
            'issues': []
        }
        
        if len(password) < 8:
            result['valid'] = False
            result['issues'].append('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', password):
            result['score'] += 1
            result['issues'].append('Password should contain uppercase letters')
        
        if not re.search(r'[a-z]', password):
            result['score'] += 1
            result['issues'].append('Password should contain lowercase letters')
        
        if not re.search(r'\d', password):
            result['score'] += 1
            result['issues'].append('Password should contain numbers')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            result['score'] += 1
            result['issues'].append('Password should contain special characters')
        
        if result['score'] >= 2:
            result['valid'] = True
        
        return result

class RequestLimiter:
    """Request rate limiting utilities"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        if identifier in self.requests:
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if req_time > window_start
            ]
        else:
            self.requests[identifier] = []
        
        # Check limit
        if len(self.requests[identifier]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[identifier].append(now)
        return True

def validate_request_size(request_size: int, max_size: int = 10485760) -> bool:
    """Validate request size"""
    return request_size <= max_size

def generate_secure_token(length: int = 32) -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(length)

def hash_data(data: str, salt: Optional[str] = None) -> str:
    """Hash data with optional salt"""
    if salt is None:
        salt = secrets.token_hex(16)
    
    combined = f"{data}{salt}"
    return hashlib.sha256(combined.encode()).hexdigest()

def verify_hash(data: str, hash_value: str, salt: str) -> bool:
    """Verify hashed data"""
    expected_hash = hash_data(data, salt)
    return hmac.compare_digest(hash_value, expected_hash)

def sanitize_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize dictionary data"""
    sanitized = {}
    for key, value in data.items():
        # Sanitize key
        clean_key = SecurityValidator.sanitize_string(str(key), 100)
        
        # Sanitize value based on type
        if isinstance(value, str):
            clean_value = SecurityValidator.sanitize_string(value)
        elif isinstance(value, dict):
            clean_value = sanitize_dict(value)
        elif isinstance(value, list):
            clean_value = [sanitize_dict(item) if isinstance(item, dict) 
                          else SecurityValidator.sanitize_string(str(item)) 
                          for item in value]
        else:
            clean_value = value
        
        sanitized[clean_key] = clean_value
    
    return sanitized

def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Standalone sanitize string function"""
    return SecurityValidator.sanitize_string(value, max_length)

class UserFriendlyValidator:
    """User-friendly validation with helpful error messages"""
    
    @staticmethod
    def validate_password_with_help(password: str) -> tuple[bool, List[str]]:
        """Validate password and return helpful error messages"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return len(errors) == 0, errors

# Export utilities
__all__ = [
    'SecurityValidator',
    'UserFriendlyValidator',
    'RequestLimiter', 
    'validate_request_size',
    'generate_secure_token',
    'hash_data',
    'verify_hash',
    'sanitize_dict',
    'sanitize_string'
]