#!/usr/bin/env python3
"""
Jupiter SIEM Security Middleware
Comprehensive security middleware with request validation, rate limiting, and headers
"""

import time
import json
from typing import Dict, Any, Optional
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
import asyncio

from security_utils import SecurityValidator, RequestLimiter, validate_request_size

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        
        return response

class RequestSizeMiddleware(BaseHTTPMiddleware):
    """Validate and limit request sizes"""
    
    async def dispatch(self, request: Request, call_next):
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                is_valid, error_msg = validate_request_size(size)
                if not is_valid:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "error": "Request too large",
                            "message": error_msg,
                            "max_size_mb": RequestLimiter.MAX_REQUEST_SIZE // (1024*1024)
                        }
                    )
            except ValueError:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "Invalid content-length header"}
                )
        
        response = await call_next(request)
        return response

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """Sanitize input data in requests"""
    
    async def dispatch(self, request: Request, call_next):
        # Only sanitize POST/PUT/PATCH requests with JSON body
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    # Read and parse the request body
                    body = await request.body()
                    if body:
                        # Parse JSON
                        json_data = json.loads(body.decode())
                        
                        # Sanitize the data
                        sanitized_data = SecurityValidator._sanitize_json_data(json_data)
                        
                        # Create new request with sanitized data
                        new_body = json.dumps(sanitized_data).encode()
                        
                        # Replace the request body
                        async def receive():
                            return {"type": "http.request", "body": new_body}
                        
                        request._receive = receive
                        
                except json.JSONDecodeError:
                    # Invalid JSON, let the endpoint handle it
                    pass
                except Exception as e:
                    logger.warning(f"Input sanitization error: {e}")
        
        response = await call_next(request)
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting"""
    
    def __init__(self, app: ASGIApp, requests_per_minute: int = 60, requests_per_hour: int = 1000):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.minute_requests = defaultdict(deque)
        self.hour_requests = defaultdict(deque)
        self.cleanup_interval = 60  # seconds
        self.last_cleanup = time.time()
    
    def _get_client_id(self, request: Request) -> str:
        """Get client identifier for rate limiting"""
        # Try to get user ID from JWT token first
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # Extract user ID from token (simplified)
                token = auth_header.split(" ")[1]
                # In a real implementation, you'd decode the JWT to get user ID
                return f"user_{hash(token) % 10000}"
            except:
                pass
        
        # Fall back to IP address
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self):
        """Clean up old request records"""
        current_time = time.time()
        
        # Clean minute requests older than 60 seconds
        for client_id in list(self.minute_requests.keys()):
            while (self.minute_requests[client_id] and 
                   current_time - self.minute_requests[client_id][0] > 60):
                self.minute_requests[client_id].popleft()
            
            if not self.minute_requests[client_id]:
                del self.minute_requests[client_id]
        
        # Clean hour requests older than 3600 seconds
        for client_id in list(self.hour_requests.keys()):
            while (self.hour_requests[client_id] and 
                   current_time - self.hour_requests[client_id][0] > 3600):
                self.hour_requests[client_id].popleft()
            
            if not self.hour_requests[client_id]:
                del self.hour_requests[client_id]
    
    async def dispatch(self, request: Request, call_next):
        current_time = time.time()
        client_id = self._get_client_id(request)
        
        # Cleanup old requests periodically
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_requests()
            self.last_cleanup = current_time
        
        # Check minute rate limit
        minute_requests = self.minute_requests[client_id]
        while minute_requests and current_time - minute_requests[0] > 60:
            minute_requests.popleft()
        
        if len(minute_requests) >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {self.requests_per_minute} per minute",
                    "retry_after": 60
                },
                headers={"Retry-After": "60"}
            )
        
        # Check hour rate limit
        hour_requests = self.hour_requests[client_id]
        while hour_requests and current_time - hour_requests[0] > 3600:
            hour_requests.popleft()
        
        if len(hour_requests) >= self.requests_per_hour:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {self.requests_per_hour} per hour",
                    "retry_after": 3600
                },
                headers={"Retry-After": "3600"}
            )
        
        # Record this request
        minute_requests.append(current_time)
        hour_requests.append(current_time)
        
        response = await call_next(request)
        return response

class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    """Log security-relevant events"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
        
        response = await call_next(request)
        
        # Log response
        duration = time.time() - start_time
        logger.info(f"Response: {response.status_code} in {duration:.3f}s")
        
        # Log security events
        if response.status_code in [401, 403, 429, 413]:
            logger.warning(f"Security event: {response.status_code} for {request.method} {request.url.path}")
        
        return response

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """User-friendly error handling"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            # Handle known HTTP exceptions
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": e.detail,
                    "message": self._get_user_friendly_message(e.status_code),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            # Handle unexpected errors
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Internal server error",
                    "message": "Something went wrong. Please try again later.",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
    
    def _get_user_friendly_message(self, status_code: int) -> str:
        """Get user-friendly error messages"""
        messages = {
            400: "Invalid request. Please check your input and try again.",
            401: "Authentication required. Please log in.",
            403: "Access denied. You don't have permission for this action.",
            404: "The requested resource was not found.",
            413: "Request too large. Please reduce the size of your data.",
            429: "Too many requests. Please wait a moment and try again.",
            500: "Server error. Please try again later."
        }
        return messages.get(status_code, "An error occurred. Please try again.")

def setup_security_middleware(app):
    """Setup all security middleware"""
    
    # Add middleware in reverse order (last added is first executed)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60, requests_per_hour=1000)
    app.add_middleware(InputSanitizationMiddleware)
    app.add_middleware(RequestSizeMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    
    logger.info("Security middleware setup complete")

# Export setup function
__all__ = ['setup_security_middleware']
