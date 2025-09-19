#!/usr/bin/env python3
"""
Jupiter SIEM Framework Analysis Routes
API endpoints for cybersecurity framework analysis and mapping
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import logging

from auth_middleware import get_current_user
from models.user_management import User
from cybersecurity_frameworks import (
    FrameworkAnalyzer, 
    MITREAttackMapper, 
    DiamondModelMapper, 
    KillChainMapper,
    FrameworkType
)
from security_utils import sanitize_string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/frameworks", tags=["frameworks"])

# Initialize framework analyzer
framework_analyzer = FrameworkAnalyzer()

# Request/Response Models
class LogAnalysisRequest(BaseModel):
    """Request model for log analysis"""
    log_data: Dict[str, Any] = Field(..., description="Log data to analyze")
    frameworks: Optional[List[str]] = Field(default=["mitre_attack", "diamond_model", "kill_chain"], description="Frameworks to use")
    
    @validator('log_data')
    def validate_log_data(cls, v):
        """Validate log data structure"""
        if not isinstance(v, dict):
            raise ValueError("Log data must be a dictionary")
        
        # Sanitize string values in log data
        return sanitize_log_data(v)
    
    @validator('frameworks')
    def validate_frameworks(cls, v):
        """Validate framework names"""
        valid_frameworks = ["mitre_attack", "diamond_model", "kill_chain", "nist_csf", "owasp_top_10"]
        for framework in v:
            if framework not in valid_frameworks:
                raise ValueError(f"Invalid framework: {framework}")
        return v

class FrameworkAnalysisResponse(BaseModel):
    """Response model for framework analysis"""
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TechniqueSearchRequest(BaseModel):
    """Request model for technique search"""
    query: str = Field(..., min_length=1, max_length=100, description="Search query")
    tactic: Optional[str] = Field(None, description="Filter by tactic")
    platform: Optional[str] = Field(None, description="Filter by platform")
    
    @validator('query')
    def validate_query(cls, v):
        """Validate and sanitize search query"""
        return sanitize_string(v, max_length=100)
    
    @validator('tactic')
    def validate_tactic(cls, v):
        """Validate tactic name"""
        if v is not None:
            return sanitize_string(v, max_length=50)
        return v
    
    @validator('platform')
    def validate_platform(cls, v):
        """Validate platform name"""
        if v is not None:
            return sanitize_string(v, max_length=50)
        return v

class ThreatIntelligenceRequest(BaseModel):
    """Request model for threat intelligence"""
    indicators: List[str] = Field(..., description="Threat indicators")
    framework: str = Field(default="mitre_attack", description="Framework to use")
    
    @validator('indicators')
    def validate_indicators(cls, v):
        """Validate and sanitize indicators"""
        if not v:
            raise ValueError("At least one indicator is required")
        
        sanitized_indicators = []
        for indicator in v:
            sanitized = sanitize_string(indicator, max_length=200)
            if sanitized.strip():
                sanitized_indicators.append(sanitized)
        
        if not sanitized_indicators:
            raise ValueError("No valid indicators provided")
        
        return sanitized_indicators
    
    @validator('framework')
    def validate_framework(cls, v):
        """Validate framework name"""
        valid_frameworks = ["mitre_attack", "diamond_model", "kill_chain"]
        if v not in valid_frameworks:
            raise ValueError(f"Invalid framework: {v}")
        return v

def sanitize_log_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively sanitize log data"""
    sanitized = {}
    
    for key, value in data.items():
        # Sanitize key
        clean_key = sanitize_string(str(key), max_length=100)
        
        if isinstance(value, str):
            # Sanitize string value
            sanitized[clean_key] = sanitize_string(value, max_length=1000)
        elif isinstance(value, dict):
            # Recursively sanitize nested dictionary
            sanitized[clean_key] = sanitize_log_data(value)
        elif isinstance(value, list):
            # Sanitize list items
            sanitized[clean_key] = [
                sanitize_string(str(item), max_length=1000) if isinstance(item, str) else item
                for item in value
            ]
        else:
            # Keep other types as-is
            sanitized[clean_key] = value
    
    return sanitized

@router.post("/analyze", response_model=FrameworkAnalysisResponse)
async def analyze_log(
    request: LogAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze log data using cybersecurity frameworks
    """
    try:
        logger.info(f"Analyzing log data for user {current_user.email}")
        
        # Perform framework analysis
        analysis = framework_analyzer.analyze_log(request.log_data)
        
        # Filter analysis based on requested frameworks
        if request.frameworks:
            filtered_analysis = {
                "log_id": analysis["log_id"],
                "timestamp": analysis["timestamp"],
                "frameworks": {
                    framework: analysis["frameworks"].get(framework)
                    for framework in request.frameworks
                    if framework in analysis["frameworks"]
                },
                "threat_assessment": analysis["threat_assessment"]
            }
            analysis = filtered_analysis
        
        return FrameworkAnalysisResponse(
            success=True,
            analysis=analysis
        )
        
    except Exception as e:
        logger.error(f"Error analyzing log data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze log data: {str(e)}"
        )

@router.get("/mitre/techniques")
async def get_mitre_techniques(
    current_user: User = Depends(get_current_user),
    tactic: Optional[str] = Query(None, description="Filter by tactic"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results")
):
    """
    Get MITRE ATT&CK techniques
    """
    try:
        techniques = []
        
        for tech_id, technique in framework_analyzer.mitre_mapper.techniques.items():
            # Apply filters
            if tactic and tactic not in technique.tactics:
                continue
            if platform and platform not in technique.platforms:
                continue
            
            techniques.append({
                "id": technique.id,
                "name": technique.name,
                "description": technique.description,
                "tactics": technique.tactics,
                "platforms": technique.platforms,
                "data_sources": technique.data_sources,
                "detection_rules": technique.detection_rules,
                "mitigations": technique.mitigations
            })
            
            if len(techniques) >= limit:
                break
        
        return {
            "success": True,
            "techniques": techniques,
            "total": len(techniques)
        }
        
    except Exception as e:
        logger.error(f"Error getting MITRE techniques: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get MITRE techniques: {str(e)}"
        )

@router.get("/mitre/techniques/{technique_id}")
async def get_mitre_technique(
    technique_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get specific MITRE ATT&CK technique by ID
    """
    try:
        # Sanitize technique ID
        clean_id = sanitize_string(technique_id, max_length=20)
        
        technique = framework_analyzer.mitre_mapper.get_technique_by_id(clean_id)
        
        if not technique:
            raise HTTPException(
                status_code=404,
                detail=f"Technique {clean_id} not found"
            )
        
        return {
            "success": True,
            "technique": {
                "id": technique.id,
                "name": technique.name,
                "description": technique.description,
                "tactics": technique.tactics,
                "platforms": technique.platforms,
                "data_sources": technique.data_sources,
                "detection_rules": technique.detection_rules,
                "mitigations": technique.mitigations
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting MITRE technique {technique_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get MITRE technique: {str(e)}"
        )

@router.get("/mitre/tactics")
async def get_mitre_tactics(
    current_user: User = Depends(get_current_user)
):
    """
    Get MITRE ATT&CK tactics
    """
    try:
        tactics = []
        
        for tactic_name, description in framework_analyzer.mitre_mapper.tactics.items():
            # Get techniques for this tactic
            techniques = framework_analyzer.mitre_mapper.get_techniques_by_tactic(tactic_name)
            
            tactics.append({
                "name": tactic_name,
                "description": description,
                "technique_count": len(techniques),
                "techniques": [
                    {
                        "id": tech.id,
                        "name": tech.name
                    }
                    for tech in techniques[:10]  # Limit to first 10 techniques
                ]
            })
        
        return {
            "success": True,
            "tactics": tactics,
            "total": len(tactics)
        }
        
    except Exception as e:
        logger.error(f"Error getting MITRE tactics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get MITRE tactics: {str(e)}"
        )

@router.post("/mitre/search")
async def search_mitre_techniques(
    request: TechniqueSearchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Search MITRE ATT&CK techniques
    """
    try:
        query_lower = request.query.lower()
        results = []
        
        for tech_id, technique in framework_analyzer.mitre_mapper.techniques.items():
            # Apply filters
            if request.tactic and request.tactic not in technique.tactics:
                continue
            if request.platform and request.platform not in technique.platforms:
                continue
            
            # Search in name and description
            if (query_lower in technique.name.lower() or 
                query_lower in technique.description.lower()):
                
                results.append({
                    "id": technique.id,
                    "name": technique.name,
                    "description": technique.description,
                    "tactics": technique.tactics,
                    "platforms": technique.platforms,
                    "relevance_score": _calculate_relevance_score(query_lower, technique)
                })
        
        # Sort by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return {
            "success": True,
            "query": request.query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching MITRE techniques: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search MITRE techniques: {str(e)}"
        )

@router.get("/diamond-model/phases")
async def get_diamond_model_phases(
    current_user: User = Depends(get_current_user)
):
    """
    Get Diamond Model phases
    """
    try:
        phases = framework_analyzer.diamond_mapper.phases
        
        return {
            "success": True,
            "phases": phases,
            "total": len(phases)
        }
        
    except Exception as e:
        logger.error(f"Error getting Diamond Model phases: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Diamond Model phases: {str(e)}"
        )

@router.get("/kill-chain/phases")
async def get_kill_chain_phases(
    current_user: User = Depends(get_current_user)
):
    """
    Get Kill Chain phases
    """
    try:
        phases = []
        
        for phase_name, phase in framework_analyzer.kill_chain_mapper.phases.items():
            phases.append({
                "name": phase_name,
                "description": phase.description,
                "indicators": phase.indicators,
                "detection_methods": phase.detection_methods,
                "mitigations": phase.mitigations
            })
        
        return {
            "success": True,
            "phases": phases,
            "total": len(phases)
        }
        
    except Exception as e:
        logger.error(f"Error getting Kill Chain phases: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Kill Chain phases: {str(e)}"
        )

@router.post("/threat-intelligence")
async def analyze_threat_intelligence(
    request: ThreatIntelligenceRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze threat intelligence using frameworks
    """
    try:
        analysis_results = []
        
        for indicator in request.indicators:
            # Create mock log data for analysis
            mock_log = {
                "activity_name": indicator,
                "severity": "Medium",
                "src_endpoint": {"ip": "192.168.1.100"},
                "dst_endpoint": {"ip": "192.168.1.200"},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Analyze using specified framework
            if request.framework == "mitre_attack":
                techniques = framework_analyzer.mitre_mapper.map_log_to_techniques(mock_log)
                analysis_results.append({
                    "indicator": indicator,
                    "framework": request.framework,
                    "techniques": [
                        {
                            "id": tech.id,
                            "name": tech.name,
                            "confidence_score": getattr(tech, 'confidence_score', 0.0)
                        }
                        for tech in techniques
                    ]
                })
            elif request.framework == "diamond_model":
                diamond_model = framework_analyzer.diamond_mapper.map_log_to_diamond_model(mock_log)
                analysis_results.append({
                    "indicator": indicator,
                    "framework": request.framework,
                    "analysis": {
                        "phase": diamond_model.phase,
                        "methodology": diamond_model.methodology,
                        "direction": diamond_model.direction,
                        "result": diamond_model.result
                    }
                })
            elif request.framework == "kill_chain":
                kill_chain_phase = framework_analyzer.kill_chain_mapper.map_log_to_kill_chain(mock_log)
                analysis_results.append({
                    "indicator": indicator,
                    "framework": request.framework,
                    "phase": kill_chain_phase.phase,
                    "description": kill_chain_phase.description
                })
        
        return {
            "success": True,
            "framework": request.framework,
            "results": analysis_results,
            "total": len(analysis_results)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing threat intelligence: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze threat intelligence: {str(e)}"
        )

@router.get("/dashboard/summary")
async def get_framework_dashboard_summary(
    current_user: User = Depends(get_current_user),
    days: int = Query(7, ge=1, le=30, description="Number of days to analyze")
):
    """
    Get framework analysis dashboard summary
    """
    try:
        # This would typically query your database for recent logs
        # For now, return mock data
        summary = {
            "timeframe": f"Last {days} days",
            "total_logs_analyzed": 1250,
            "frameworks": {
                "mitre_attack": {
                    "techniques_detected": 45,
                    "top_tactics": [
                        {"name": "Defense Evasion", "count": 12},
                        {"name": "Lateral Movement", "count": 8},
                        {"name": "Command and Control", "count": 6}
                    ],
                    "threat_levels": {
                        "high": 5,
                        "medium": 15,
                        "low": 25
                    }
                },
                "diamond_model": {
                    "phases_detected": 7,
                    "attack_directions": {
                        "inbound": 20,
                        "outbound": 8,
                        "lateral": 12
                    },
                    "methodologies": [
                        {"name": "SQL Injection", "count": 5},
                        {"name": "Phishing", "count": 3},
                        {"name": "Brute Force", "count": 2}
                    ]
                },
                "kill_chain": {
                    "phases_detected": 6,
                    "phase_distribution": [
                        {"phase": "Reconnaissance", "count": 15},
                        {"phase": "Exploitation", "count": 8},
                        {"phase": "Command and Control", "count": 5}
                    ]
                }
            },
            "overall_threat_assessment": {
                "risk_level": "Medium",
                "risk_score": 6,
                "critical_alerts": 2,
                "recommendations": [
                    "Implement network segmentation",
                    "Enable multi-factor authentication",
                    "Update security monitoring rules"
                ]
            }
        }
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Error getting framework dashboard summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get framework dashboard summary: {str(e)}"
        )

def _calculate_relevance_score(query: str, technique) -> float:
    """Calculate relevance score for search results"""
    score = 0.0
    
    # Exact name match
    if query in technique.name.lower():
        score += 1.0
    
    # Partial name match
    elif any(word in technique.name.lower() for word in query.split()):
        score += 0.8
    
    # Description match
    if query in technique.description.lower():
        score += 0.6
    
    # Partial description match
    elif any(word in technique.description.lower() for word in query.split()):
        score += 0.4
    
    return score
