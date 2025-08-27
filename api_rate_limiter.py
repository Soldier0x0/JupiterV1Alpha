#!/usr/bin/env python3
"""
Jupiter SIEM API Rate Limiter
Handles rate limiting for all configured threat intelligence APIs
"""

import os
import json
import time
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Optional, Tuple
import pymongo
from dataclasses import dataclass

@dataclass
class APIConfig:
    """API Configuration with rate limits"""
    name: str
    api_key: str
    rate_limit_per_min: Optional[int] = None
    rate_limit_per_hour: Optional[int] = None 
    rate_limit_per_day: Optional[int] = None
    rate_limit_per_month: Optional[int] = None
    notes: Optional[str] = None

class APIRateLimiter:
    """
    Centralized API rate limiter for all threat intelligence services
    Tracks usage and enforces limits defined in environment variables
    """
    
    def __init__(self, mongo_url: str):
        self.client = pymongo.MongoClient(mongo_url)
        self.db = self.client.jupiter_siem
        self.usage_collection = self.db.api_usage_logs
        self.apis = self._load_api_configs()
        self.usage_cache = defaultdict(list)
    
    def _load_api_configs(self) -> Dict[str, APIConfig]:
        """Load API configurations from environment variables"""
        apis = {}
        
        # VirusTotal
        if os.getenv('VT_API_KEY'):
            apis['virustotal'] = APIConfig(
                name="VirusTotal",
                api_key=os.getenv('VT_API_KEY'),
                rate_limit_per_min=int(os.getenv('VT_RATE_LIMIT_PER_MIN', 4)),
                rate_limit_per_day=int(os.getenv('VT_RATE_LIMIT_PER_DAY', 500)),
                notes="Free tier: 4 requests/minute, 500/day"
            )
        
        # AbuseIPDB
        if os.getenv('ABUSEIPDB_API_KEY'):
            apis['abuseipdb'] = APIConfig(
                name="AbuseIPDB",
                api_key=os.getenv('ABUSEIPDB_API_KEY'),
                rate_limit_per_day=int(os.getenv('ABUSEIPDB_RATE_LIMIT_CHECKS_PER_DAY', 1000)),
                notes="Free tier: 1000 checks/day, 100 reports/day"
            )
        
        # AlienVault OTX
        if os.getenv('OTX_API_KEY'):
            apis['otx'] = APIConfig(
                name="AlienVault OTX",
                api_key=os.getenv('OTX_API_KEY'),
                notes="No strict limits - reasonable use policy"
            )
        
        # IntelligenceX
        if os.getenv('INTELX_API_KEY'):
            apis['intelx'] = APIConfig(
                name="IntelligenceX",
                api_key=os.getenv('INTELX_API_KEY'),
                rate_limit_per_month=int(os.getenv('INTELX_RATE_LIMIT_SEARCH_PER_MONTH', 50)),
                notes="Free tier: 50 searches/month, 100 views"
            )
        
        # LeakIX
        if os.getenv('LEAKIX_API_KEY'):
            apis['leakix'] = APIConfig(
                name="LeakIX",
                api_key=os.getenv('LEAKIX_API_KEY'),
                rate_limit_per_month=int(os.getenv('LEAKIX_RATE_LIMIT_PER_MONTH', 3000)),
                notes="Free tier: 3000 calls/month"
            )
        
        # FOFA
        if os.getenv('FOFA_KEY'):
            apis['fofa'] = APIConfig(
                name="FOFA",
                api_key=os.getenv('FOFA_KEY'),
                rate_limit_per_month=int(os.getenv('FOFA_RATE_LIMIT_PER_MONTH', 300)),
                notes="Free tier: 300 queries/month"
            )
        
        # Custom APIs (for future expansion)
        for i in range(1, 4):  # Support for 3 custom APIs
            if os.getenv(f'CUSTOM_API_{i}_KEY'):
                apis[f'custom_{i}'] = APIConfig(
                    name=os.getenv(f'CUSTOM_API_{i}_NAME', f'Custom API {i}'),
                    api_key=os.getenv(f'CUSTOM_API_{i}_KEY'),
                    notes=os.getenv(f'CUSTOM_API_{i}_RATE_LIMIT', 'Custom limits')
                )
        
        return apis
    
    def check_rate_limit(self, api_name: str, user_id: str = None) -> Tuple[bool, Dict]:
        """
        Check if API call is within rate limits
        Returns: (allowed: bool, limit_info: dict)
        """
        if api_name not in self.apis:
            return False, {"error": f"API {api_name} not configured"}
        
        api_config = self.apis[api_name]
        now = datetime.utcnow()
        
        # Get usage statistics
        usage_stats = self._get_usage_stats(api_name, user_id, now)
        
        # Check limits
        limit_info = {
            "api_name": api_config.name,
            "notes": api_config.notes,
            "current_usage": usage_stats,
            "limits": {},
            "next_reset": {}
        }
        
        # Check minute limit
        if api_config.rate_limit_per_min:
            if usage_stats["last_minute"] >= api_config.rate_limit_per_min:
                limit_info["error"] = f"Minute limit exceeded: {usage_stats['last_minute']}/{api_config.rate_limit_per_min}"
                return False, limit_info
            limit_info["limits"]["per_minute"] = f"{usage_stats['last_minute']}/{api_config.rate_limit_per_min}"
            limit_info["next_reset"]["minute"] = (now.replace(second=0, microsecond=0) + timedelta(minutes=1)).isoformat()
        
        # Check hour limit
        if api_config.rate_limit_per_hour:
            if usage_stats["last_hour"] >= api_config.rate_limit_per_hour:
                limit_info["error"] = f"Hour limit exceeded: {usage_stats['last_hour']}/{api_config.rate_limit_per_hour}"
                return False, limit_info
            limit_info["limits"]["per_hour"] = f"{usage_stats['last_hour']}/{api_config.rate_limit_per_hour}"
            limit_info["next_reset"]["hour"] = (now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)).isoformat()
        
        # Check day limit
        if api_config.rate_limit_per_day:
            if usage_stats["last_day"] >= api_config.rate_limit_per_day:
                limit_info["error"] = f"Daily limit exceeded: {usage_stats['last_day']}/{api_config.rate_limit_per_day}"
                return False, limit_info
            limit_info["limits"]["per_day"] = f"{usage_stats['last_day']}/{api_config.rate_limit_per_day}"
            limit_info["next_reset"]["day"] = (now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
        
        # Check month limit
        if api_config.rate_limit_per_month:
            if usage_stats["last_month"] >= api_config.rate_limit_per_month:
                limit_info["error"] = f"Monthly limit exceeded: {usage_stats['last_month']}/{api_config.rate_limit_per_month}"
                return False, limit_info
            limit_info["limits"]["per_month"] = f"{usage_stats['last_month']}/{api_config.rate_limit_per_month}"
            # Calculate next month reset
            if now.month == 12:
                next_month = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                next_month = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
            limit_info["next_reset"]["month"] = next_month.isoformat()
        
        return True, limit_info
    
    def record_usage(self, api_name: str, user_id: str = None, request_type: str = "query", 
                    response_code: int = 200, metadata: Dict = None) -> None:
        """Record API usage for tracking and rate limiting"""
        if api_name not in self.apis:
            return
        
        usage_record = {
            "api_name": api_name,
            "user_id": user_id,
            "request_type": request_type,
            "response_code": response_code,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {}
        }
        
        # Store in MongoDB
        self.usage_collection.insert_one(usage_record)
        
        # Update cache
        self.usage_cache[f"{api_name}:{user_id}"].append({
            "timestamp": usage_record["timestamp"],
            "response_code": response_code
        })
        
        # Clean old cache entries (keep last 24 hours)
        cutoff = datetime.utcnow() - timedelta(days=1)
        self.usage_cache[f"{api_name}:{user_id}"] = [
            entry for entry in self.usage_cache[f"{api_name}:{user_id}"]
            if entry["timestamp"] > cutoff
        ]
    
    def _get_usage_stats(self, api_name: str, user_id: str, now: datetime) -> Dict:
        """Get usage statistics for rate limit checking"""
        base_query = {"api_name": api_name}
        if user_id:
            base_query["user_id"] = user_id
        
        # Time ranges
        minute_ago = now - timedelta(minutes=1)
        hour_ago = now - timedelta(hours=1) 
        day_ago = now - timedelta(days=1)
        month_ago = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Count queries in each time range
        stats = {
            "last_minute": self.usage_collection.count_documents({
                **base_query,
                "timestamp": {"$gte": minute_ago}
            }),
            "last_hour": self.usage_collection.count_documents({
                **base_query,
                "timestamp": {"$gte": hour_ago}
            }),
            "last_day": self.usage_collection.count_documents({
                **base_query,
                "timestamp": {"$gte": day_ago}
            }),
            "last_month": self.usage_collection.count_documents({
                **base_query,
                "timestamp": {"$gte": month_ago}
            })
        }
        
        return stats
    
    def get_all_api_status(self, user_id: str = None) -> Dict:
        """Get current status and usage for all configured APIs"""
        now = datetime.utcnow()
        status = {}
        
        for api_key, api_config in self.apis.items():
            allowed, limit_info = self.check_rate_limit(api_key, user_id)
            status[api_key] = {
                "name": api_config.name,
                "status": "available" if allowed else "rate_limited",
                "config": {
                    "notes": api_config.notes,
                    "has_key": bool(api_config.api_key)
                },
                **limit_info
            }
        
        return status
    
    def add_custom_api(self, name: str, api_key: str, rate_limits: Dict = None) -> bool:
        """Add a new custom API configuration"""
        # Find next available custom slot
        for i in range(1, 4):
            if f'custom_{i}' not in self.apis:
                self.apis[f'custom_{i}'] = APIConfig(
                    name=name,
                    api_key=api_key,
                    rate_limit_per_day=rate_limits.get('per_day') if rate_limits else None,
                    rate_limit_per_month=rate_limits.get('per_month') if rate_limits else None,
                    notes=rate_limits.get('notes', 'Custom API') if rate_limits else 'Custom API'
                )
                
                # Update environment variables for persistence
                os.environ[f'CUSTOM_API_{i}_NAME'] = name
                os.environ[f'CUSTOM_API_{i}_KEY'] = api_key
                if rate_limits and rate_limits.get('notes'):
                    os.environ[f'CUSTOM_API_{i}_RATE_LIMIT'] = rate_limits['notes']
                
                return True
        
        return False  # No available slots


# FastAPI integration
def create_rate_limiter_middleware(mongo_url: str):
    """Create rate limiter middleware for FastAPI"""
    limiter = APIRateLimiter(mongo_url)
    
    async def rate_limit_middleware(request, call_next):
        """Middleware to check rate limits for API endpoints"""
        # Skip rate limiting for non-API routes
        if not request.url.path.startswith('/api/threat-intel/'):
            return await call_next(request)
        
        # Extract API name from path or headers
        api_name = request.path_params.get('api_name') or request.headers.get('X-API-Name')
        user_id = getattr(request.state, 'user_id', None)
        
        if api_name:
            allowed, limit_info = limiter.check_rate_limit(api_name, user_id)
            
            if not allowed:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit_info": limit_info
                    }
                )
            
            # Add rate limit headers to response
            response = await call_next(request)
            for key, value in limit_info.get('limits', {}).items():
                response.headers[f'X-RateLimit-{key.replace("_", "-").title()}'] = value
            
            # Record usage after successful request
            if response.status_code < 400:
                limiter.record_usage(api_name, user_id, "query", response.status_code)
            
            return response
        
        return await call_next(request)
    
    return rate_limit_middleware, limiter