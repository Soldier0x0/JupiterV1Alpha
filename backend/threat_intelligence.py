#!/usr/bin/env python3
"""
Jupiter SIEM Threat Intelligence Module
Integrates with external threat feeds and enriches security events
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import hashlib
import aiohttp
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

class ThreatLevel(str, Enum):
    """Threat severity levels"""
    CRITICAL = "critical"
    HIGH = "high" 
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class IndicatorType(str, Enum):
    """Types of threat indicators"""
    IP_ADDRESS = "ip"
    DOMAIN = "domain"
    URL = "url"
    FILE_HASH = "file_hash"
    EMAIL = "email"
    USER_AGENT = "user_agent"
    MUTEX = "mutex"
    REGISTRY_KEY = "registry"

@dataclass
class ThreatIndicator:
    """Threat intelligence indicator"""
    value: str
    indicator_type: IndicatorType
    threat_level: ThreatLevel
    confidence: float  # 0.0 to 1.0
    source: str
    first_seen: datetime
    last_seen: datetime
    tags: List[str]
    context: Dict[str, Any]
    ttl: Optional[datetime] = None

class ThreatIntelligenceProvider:
    """Base class for threat intelligence providers"""
    
    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config
        self.enabled = config.get("enabled", False)
    
    async def fetch_indicators(self) -> List[ThreatIndicator]:
        """Fetch threat indicators from source"""
        raise NotImplementedError
    
    async def lookup_indicator(self, indicator: str, indicator_type: IndicatorType) -> Optional[ThreatIndicator]:
        """Look up a specific indicator"""
        raise NotImplementedError

class AbuseIPDBProvider(ThreatIntelligenceProvider):
    """AbuseIPDB threat intelligence provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("AbuseIPDB", config)
        self.api_key = config.get("api_key", "")
        self.base_url = "https://api.abuseipdb.com/api/v2"
    
    async def lookup_indicator(self, indicator: str, indicator_type: IndicatorType) -> Optional[ThreatIndicator]:
        """Look up IP address in AbuseIPDB"""
        if not self.enabled or indicator_type != IndicatorType.IP_ADDRESS:
            return None
        
        try:
            headers = {
                "Key": self.api_key,
                "Accept": "application/json"
            }
            
            params = {
                "ipAddress": indicator,
                "maxAgeInDays": 90,
                "verbose": ""
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/check", headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        ip_data = data.get("data", {})
                        
                        if ip_data.get("abuseConfidencePercentage", 0) > 0:
                            threat_level = self._map_confidence_to_threat_level(
                                ip_data.get("abuseConfidencePercentage", 0)
                            )
                            
                            return ThreatIndicator(
                                value=indicator,
                                indicator_type=IndicatorType.IP_ADDRESS,
                                threat_level=threat_level,
                                confidence=ip_data.get("abuseConfidencePercentage", 0) / 100.0,
                                source="AbuseIPDB",
                                first_seen=datetime.now(),
                                last_seen=datetime.now(),
                                tags=["malicious_ip", "abuse"],
                                context={
                                    "country_code": ip_data.get("countryCode"),
                                    "usage_type": ip_data.get("usageType"),
                                    "isp": ip_data.get("isp"),
                                    "total_reports": ip_data.get("totalReports", 0)
                                }
                            )
        
        except Exception as e:
            logger.error(f"AbuseIPDB lookup failed for {indicator}: {e}")
        
        return None
    
    def _map_confidence_to_threat_level(self, confidence: int) -> ThreatLevel:
        """Map AbuseIPDB confidence to threat level"""
        if confidence >= 75:
            return ThreatLevel.CRITICAL
        elif confidence >= 50:
            return ThreatLevel.HIGH
        elif confidence >= 25:
            return ThreatLevel.MEDIUM
        else:
            return ThreatLevel.LOW

class VirusTotalProvider(ThreatIntelligenceProvider):
    """VirusTotal threat intelligence provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("VirusTotal", config)
        self.api_key = config.get("api_key", "")
        self.base_url = "https://www.virustotal.com/vtapi/v2"
    
    async def lookup_indicator(self, indicator: str, indicator_type: IndicatorType) -> Optional[ThreatIndicator]:
        """Look up indicator in VirusTotal"""
        if not self.enabled:
            return None
        
        try:
            endpoint = None
            params = {"apikey": self.api_key}
            
            if indicator_type == IndicatorType.IP_ADDRESS:
                endpoint = "ip-address/report"
                params["ip"] = indicator
            elif indicator_type == IndicatorType.DOMAIN:
                endpoint = "domain/report"
                params["domain"] = indicator
            elif indicator_type == IndicatorType.FILE_HASH:
                endpoint = "file/report"
                params["resource"] = indicator
            else:
                return None
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/{endpoint}", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get("response_code") == 1:
                            positives = data.get("positives", 0)
                            total = data.get("total", 1)
                            detection_ratio = positives / total if total > 0 else 0
                            
                            if detection_ratio > 0:
                                threat_level = self._map_detection_to_threat_level(detection_ratio)
                                
                                return ThreatIndicator(
                                    value=indicator,
                                    indicator_type=indicator_type,
                                    threat_level=threat_level,
                                    confidence=detection_ratio,
                                    source="VirusTotal",
                                    first_seen=datetime.now(),
                                    last_seen=datetime.now(),
                                    tags=["malware", "virus"],
                                    context={
                                        "positives": positives,
                                        "total": total,
                                        "scan_date": data.get("scan_date"),
                                        "detection_ratio": detection_ratio
                                    }
                                )
        
        except Exception as e:
            logger.error(f"VirusTotal lookup failed for {indicator}: {e}")
        
        return None
    
    def _map_detection_to_threat_level(self, ratio: float) -> ThreatLevel:
        """Map detection ratio to threat level"""
        if ratio >= 0.5:
            return ThreatLevel.CRITICAL
        elif ratio >= 0.25:
            return ThreatLevel.HIGH
        elif ratio >= 0.1:
            return ThreatLevel.MEDIUM
        else:
            return ThreatLevel.LOW

class MITREAttackProvider(ThreatIntelligenceProvider):
    """MITRE ATT&CK framework provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("MITRE_ATTACK", config)
        self.techniques_cache = {}
        self.last_update = None
    
    async def fetch_techniques(self) -> Dict[str, Any]:
        """Fetch MITRE ATT&CK techniques"""
        # In production, this would fetch from MITRE ATT&CK STIX data
        # For now, return common techniques
        return {
            "T1059.001": {
                "name": "PowerShell",
                "tactic": "Execution",
                "description": "Adversaries may abuse PowerShell commands and scripts for execution.",
                "mitigation": "Restrict PowerShell execution policy"
            },
            "T1055": {
                "name": "Process Injection",
                "tactic": "Defense Evasion",
                "description": "Adversaries may inject code into processes to evade detection.",
                "mitigation": "Monitor for suspicious process behavior"
            },
            "T1110": {
                "name": "Brute Force",
                "tactic": "Credential Access", 
                "description": "Adversaries may use brute force techniques to gain access.",
                "mitigation": "Implement account lockout policies"
            }
        }

class ThreatIntelligenceManager:
    """Central manager for threat intelligence operations"""
    
    def __init__(self, redis_client, config: Dict[str, Any]):
        self.redis = redis_client
        self.config = config
        self.providers = []
        self.cache_ttl = config.get("cache_ttl", 3600)  # 1 hour default
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize threat intelligence providers"""
        provider_configs = self.config.get("providers", {})
        
        # Initialize AbuseIPDB
        if "abuseipdb" in provider_configs:
            self.providers.append(AbuseIPDBProvider(provider_configs["abuseipdb"]))
        
        # Initialize VirusTotal
        if "virustotal" in provider_configs:
            self.providers.append(VirusTotalProvider(provider_configs["virustotal"]))
        
        # Initialize MITRE ATT&CK
        if "mitre_attack" in provider_configs:
            self.providers.append(MITREAttackProvider(provider_configs["mitre_attack"]))
        
        logger.info(f"Initialized {len(self.providers)} threat intelligence providers")
    
    async def enrich_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich security event with threat intelligence"""
        enriched_event = event.copy()
        enrichments = []
        
        # Extract indicators from event
        indicators = self._extract_indicators(event)
        
        # Look up each indicator
        for indicator_value, indicator_type in indicators:
            threat_info = await self._lookup_indicator_cached(indicator_value, indicator_type)
            if threat_info:
                enrichments.append(threat_info)
        
        # Add enrichments to event
        if enrichments:
            enriched_event["threat_intelligence"] = {
                "indicators": [self._threat_indicator_to_dict(ti) for ti in enrichments],
                "max_threat_level": self._get_max_threat_level(enrichments),
                "confidence_score": self._calculate_confidence_score(enrichments),
                "enrichment_timestamp": datetime.now().isoformat()
            }
            
            # Update risk score
            enriched_event["risk_score"] = self._calculate_risk_score(enrichments)
            
            # Add MITRE ATT&CK mappings
            mitre_mappings = self._get_mitre_mappings(event, enrichments)
            if mitre_mappings:
                enriched_event["mitre_attack"] = mitre_mappings
        
        return enriched_event
    
    def _extract_indicators(self, event: Dict[str, Any]) -> List[tuple]:
        """Extract threat indicators from security event"""
        indicators = []
        
        # Extract IP addresses
        for ip_field in ["src_endpoint_ip", "dst_endpoint_ip", "device_ip"]:
            if ip_field in event and event[ip_field]:
                indicators.append((event[ip_field], IndicatorType.IP_ADDRESS))
        
        # Extract file hashes
        for hash_field in ["file_hash_sha256", "file_hash_md5", "file_hash_sha1"]:
            if hash_field in event and event[hash_field]:
                indicators.append((event[hash_field], IndicatorType.FILE_HASH))
        
        # Extract domains from URLs
        if "http_url" in event and event["http_url"]:
            try:
                from urllib.parse import urlparse
                domain = urlparse(event["http_url"]).netloc
                if domain:
                    indicators.append((domain, IndicatorType.DOMAIN))
            except Exception:
                pass
        
        return indicators
    
    async def _lookup_indicator_cached(self, indicator: str, indicator_type: IndicatorType) -> Optional[ThreatIndicator]:
        """Look up indicator with caching"""
        cache_key = f"threat_intel:{indicator_type.value}:{indicator}"
        
        # Check cache first
        try:
            cached_result = await self.redis.get(cache_key)
            if cached_result:
                cached_data = json.loads(cached_result)
                if cached_data.get("threat_level"):  # Valid cached result
                    return self._dict_to_threat_indicator(cached_data)
        except Exception as e:
            logger.warning(f"Cache lookup failed for {cache_key}: {e}")
        
        # Look up in providers
        for provider in self.providers:
            try:
                result = await provider.lookup_indicator(indicator, indicator_type)
                if result:
                    # Cache the result
                    try:
                        await self.redis.setex(
                            cache_key,
                            self.cache_ttl,
                            json.dumps(self._threat_indicator_to_dict(result))
                        )
                    except Exception as e:
                        logger.warning(f"Cache store failed for {cache_key}: {e}")
                    
                    return result
            except Exception as e:
                logger.error(f"Provider {provider.name} lookup failed for {indicator}: {e}")
        
        # Cache negative result to prevent repeated lookups
        try:
            await self.redis.setex(cache_key, self.cache_ttl // 4, json.dumps({"threat_level": None}))
        except Exception:
            pass
        
        return None
    
    def _threat_indicator_to_dict(self, indicator: ThreatIndicator) -> Dict[str, Any]:
        """Convert ThreatIndicator to dictionary"""
        return {
            "value": indicator.value,
            "indicator_type": indicator.indicator_type.value,
            "threat_level": indicator.threat_level.value,
            "confidence": indicator.confidence,
            "source": indicator.source,
            "first_seen": indicator.first_seen.isoformat(),
            "last_seen": indicator.last_seen.isoformat(),
            "tags": indicator.tags,
            "context": indicator.context
        }
    
    def _dict_to_threat_indicator(self, data: Dict[str, Any]) -> ThreatIndicator:
        """Convert dictionary to ThreatIndicator"""
        return ThreatIndicator(
            value=data["value"],
            indicator_type=IndicatorType(data["indicator_type"]),
            threat_level=ThreatLevel(data["threat_level"]),
            confidence=data["confidence"],
            source=data["source"],
            first_seen=datetime.fromisoformat(data["first_seen"]),
            last_seen=datetime.fromisoformat(data["last_seen"]),
            tags=data["tags"],
            context=data["context"]
        )
    
    def _get_max_threat_level(self, indicators: List[ThreatIndicator]) -> str:
        """Get maximum threat level from indicators"""
        levels = [ThreatLevel.INFO, ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL]
        max_level = ThreatLevel.INFO
        
        for indicator in indicators:
            if levels.index(indicator.threat_level) > levels.index(max_level):
                max_level = indicator.threat_level
        
        return max_level.value
    
    def _calculate_confidence_score(self, indicators: List[ThreatIndicator]) -> float:
        """Calculate overall confidence score"""
        if not indicators:
            return 0.0
        
        return sum(indicator.confidence for indicator in indicators) / len(indicators)
    
    def _calculate_risk_score(self, indicators: List[ThreatIndicator]) -> float:
        """Calculate risk score based on threat intelligence"""
        if not indicators:
            return 0.0
        
        risk_score = 0.0
        for indicator in indicators:
            level_weight = {
                ThreatLevel.CRITICAL: 0.9,
                ThreatLevel.HIGH: 0.7,
                ThreatLevel.MEDIUM: 0.5,
                ThreatLevel.LOW: 0.3,
                ThreatLevel.INFO: 0.1
            }.get(indicator.threat_level, 0.1)
            
            risk_score += level_weight * indicator.confidence
        
        return min(risk_score, 1.0)  # Cap at 1.0
    
    def _get_mitre_mappings(self, event: Dict[str, Any], indicators: List[ThreatIndicator]) -> Dict[str, Any]:
        """Get MITRE ATT&CK mappings for event"""
        mappings = {}
        
        # Basic technique mapping based on event content
        activity_name = event.get("activity_name", "")
        process_name = event.get("process_name", "")
        
        if "powershell" in process_name.lower():
            mappings["T1059.001"] = {
                "technique": "PowerShell",
                "tactic": "Execution",
                "confidence": 0.8
            }
        
        if activity_name == "failed_login":
            mappings["T1110"] = {
                "technique": "Brute Force",
                "tactic": "Credential Access", 
                "confidence": 0.6
            }
        
        return mappings

# Global threat intelligence manager instance
threat_manager = None

async def initialize_threat_intelligence(redis_url: str, config: Dict[str, Any]):
    """Initialize threat intelligence manager"""
    global threat_manager
    
    redis_client = aioredis.from_url(redis_url, decode_responses=True)
    threat_manager = ThreatIntelligenceManager(redis_client, config)
    
    logger.info("Threat Intelligence Manager initialized")

async def enrich_event_with_threat_intel(event: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich event with threat intelligence (convenience function)"""
    if threat_manager:
        return await threat_manager.enrich_event(event)
    return event