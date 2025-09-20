#!/usr/bin/env python3
"""
Jupiter SIEM Extended Framework Routes
API endpoints for additional cybersecurity frameworks and analyst fatigue management
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import logging

from auth_middleware import get_current_user
from models.user_management import User
from extended_frameworks import (
    ExtendedFrameworkAnalyzer,
    OWASPTop10Mapper,
    STRIDEMapper,
    NISTCSFMapper,
    AtomicRedTeamMapper
)
from analyst_fatigue_prevention import (
    AnalystProfile,
    AlertContext,
    IntelligentAlertPrioritizer,
    ContextualAlertCorrelator,
    AdaptiveThresholdManager,
    AnalystFatigueMonitor,
    SmartAlertPresentation
)
from security_utils import sanitize_string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/extended-frameworks", tags=["extended-frameworks"])

# Initialize extended framework analyzer
extended_analyzer = ExtendedFrameworkAnalyzer()

# Initialize fatigue management components
alert_prioritizer = IntelligentAlertPrioritizer()
alert_correlator = ContextualAlertCorrelator()
threshold_manager = AdaptiveThresholdManager()
fatigue_monitor = AnalystFatigueMonitor()
alert_presenter = SmartAlertPresentation()

# Request/Response Models
class ExtendedAnalysisRequest(BaseModel):
    """Request model for extended framework analysis"""
    log_data: Dict[str, Any] = Field(..., description="Log data to analyze")
    frameworks: Optional[List[str]] = Field(
        default=["owasp_top_10", "stride", "nist_csf", "atomic_red_team"],
        description="Frameworks to use"
    )
    analyst_id: Optional[str] = Field(None, description="Analyst ID for fatigue management")
    
    @validator('log_data')
    def validate_log_data(cls, v):
        """Validate log data structure"""
        if not isinstance(v, dict):
            raise ValueError("Log data must be a dictionary")
        return v
    
    @validator('frameworks')
    def validate_frameworks(cls, v):
        """Validate framework names"""
        valid_frameworks = [
            "owasp_top_10", "stride", "nist_csf", "atomic_red_team",
            "containers_matrix", "cisa_decider", "mitre_atlas"
        ]
        for framework in v:
            if framework not in valid_frameworks:
                raise ValueError(f"Invalid framework: {framework}")
        return v

class AnalystProfileRequest(BaseModel):
    """Request model for analyst profile creation"""
    analyst_id: str = Field(..., description="Analyst ID")
    name: str = Field(..., description="Analyst name")
    experience_level: str = Field(..., description="Experience level (junior, mid, senior)")
    shift_start: str = Field(..., description="Shift start time (ISO format)")
    shift_end: str = Field(..., description="Shift end time (ISO format)")
    max_alerts_per_hour: int = Field(50, ge=10, le=200, description="Maximum alerts per hour")
    preferred_alert_types: List[str] = Field(default=[], description="Preferred alert types")
    fatigue_threshold: float = Field(0.6, ge=0.1, le=1.0, description="Fatigue threshold")
    
    @validator('experience_level')
    def validate_experience_level(cls, v):
        """Validate experience level"""
        valid_levels = ['junior', 'mid', 'senior']
        if v not in valid_levels:
            raise ValueError(f"Experience level must be one of: {valid_levels}")
        return v

class AlertBatchRequest(BaseModel):
    """Request model for alert batch processing"""
    alerts: List[Dict[str, Any]] = Field(..., description="List of alerts to process")
    analyst_id: str = Field(..., description="Analyst ID")
    processing_mode: str = Field("standard", description="Processing mode")
    
    @validator('processing_mode')
    def validate_processing_mode(cls, v):
        """Validate processing mode"""
        valid_modes = ['standard', 'fatigue_aware', 'high_volume']
        if v not in valid_modes:
            raise ValueError(f"Processing mode must be one of: {valid_modes}")
        return v

@router.post("/analyze-extended")
async def analyze_log_extended(
    request: ExtendedAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze log data using extended cybersecurity frameworks
    """
    try:
        logger.info(f"Extended framework analysis for user {current_user.email}")
        
        # Perform extended framework analysis
        analysis = extended_analyzer.analyze_log_extended(
            request.log_data, 
            request.analyst_id
        )
        
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
                "threat_assessment": analysis["threat_assessment"],
                "fatigue_management": analysis.get("fatigue_management")
            }
            analysis = filtered_analysis
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error in extended framework analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Extended framework analysis failed: {str(e)}"
        )

@router.get("/owasp/vulnerabilities")
async def get_owasp_vulnerabilities(
    current_user: User = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level")
):
    """
    Get OWASP Top 10 vulnerabilities
    """
    try:
        vulnerabilities = []
        
        for vuln_id, vuln in extended_analyzer.owasp_mapper.vulnerabilities.items():
            # Apply filters
            if category and category.lower() not in vuln.category.lower():
                continue
            if risk_level and vuln.risk_level.lower() != risk_level.lower():
                continue
            
            vulnerabilities.append({
                "id": vuln.id,
                "name": vuln.name,
                "description": vuln.description,
                "category": vuln.category,
                "risk_level": vuln.risk_level,
                "examples": vuln.examples,
                "mitigations": vuln.mitigations,
                "detection_rules": vuln.detection_rules
            })
        
        return {
            "success": True,
            "vulnerabilities": vulnerabilities,
            "total": len(vulnerabilities)
        }
        
    except Exception as e:
        logger.error(f"Error getting OWASP vulnerabilities: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get OWASP vulnerabilities: {str(e)}"
        )

@router.get("/stride/threats")
async def get_stride_threats(
    current_user: User = Depends(get_current_user)
):
    """
    Get STRIDE threat categories
    """
    try:
        threats = []
        
        for threat_name, threat in extended_analyzer.stride_mapper.threats.items():
            threats.append({
                "category": threat.category,
                "description": threat.description,
                "impact": threat.impact,
                "likelihood": threat.likelihood,
                "mitigations": threat.mitigations,
                "detection_indicators": threat.detection_indicators
            })
        
        return {
            "success": True,
            "threats": threats,
            "total": len(threats)
        }
        
    except Exception as e:
        logger.error(f"Error getting STRIDE threats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get STRIDE threats: {str(e)}"
        )

@router.get("/nist-csf/controls")
async def get_nist_csf_controls(
    current_user: User = Depends(get_current_user),
    function: Optional[str] = Query(None, description="Filter by function")
):
    """
    Get NIST CSF controls
    """
    try:
        controls = []
        
        for control_id, control in extended_analyzer.nist_csf_mapper.controls.items():
            # Apply filters
            if function and function.lower() not in control.function.lower():
                continue
            
            controls.append({
                "id": control.id,
                "function": control.function,
                "category": control.category,
                "subcategory": control.subcategory,
                "description": control.description,
                "implementation_tiers": control.implementation_tiers,
                "outcomes": control.outcomes
            })
        
        return {
            "success": True,
            "controls": controls,
            "total": len(controls)
        }
        
    except Exception as e:
        logger.error(f"Error getting NIST CSF controls: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get NIST CSF controls: {str(e)}"
        )

@router.get("/atomic-red-team/techniques")
async def get_atomic_techniques(
    current_user: User = Depends(get_current_user)
):
    """
    Get Atomic Red Team techniques
    """
    try:
        techniques = []
        
        for technique_id, technique in extended_analyzer.atomic_mapper.techniques.items():
            techniques.append({
                "id": technique_id,
                "name": technique["name"],
                "description": technique["description"],
                "atomic_tests": technique["atomic_tests"],
                "detection_rules": technique["detection_rules"]
            })
        
        return {
            "success": True,
            "techniques": techniques,
            "total": len(techniques)
        }
        
    except Exception as e:
        logger.error(f"Error getting Atomic Red Team techniques: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Atomic Red Team techniques: {str(e)}"
        )

@router.post("/analyst-profile")
async def create_analyst_profile(
    request: AnalystProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create or update analyst profile for fatigue management
    """
    try:
        # Parse shift times
        shift_start = datetime.fromisoformat(request.shift_start.replace('Z', '+00:00'))
        shift_end = datetime.fromisoformat(request.shift_end.replace('Z', '+00:00'))
        
        # Create analyst profile
        profile = AnalystProfile(
            analyst_id=request.analyst_id,
            name=request.name,
            experience_level=request.experience_level,
            shift_start=shift_start,
            shift_end=shift_end,
            max_alerts_per_hour=request.max_alerts_per_hour,
            preferred_alert_types=request.preferred_alert_types,
            fatigue_threshold=request.fatigue_threshold
        )
        
        # Store profile (in a real implementation, this would be stored in database)
        # For now, we'll return the created profile
        
        return {
            "success": True,
            "profile": {
                "analyst_id": profile.analyst_id,
                "name": profile.name,
                "experience_level": profile.experience_level,
                "shift_start": profile.shift_start.isoformat(),
                "shift_end": profile.shift_end.isoformat(),
                "max_alerts_per_hour": profile.max_alerts_per_hour,
                "preferred_alert_types": profile.preferred_alert_types,
                "fatigue_threshold": profile.fatigue_threshold
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating analyst profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create analyst profile: {str(e)}"
        )

@router.post("/alerts/prioritize")
async def prioritize_alerts(
    request: AlertBatchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Prioritize alerts to reduce analyst fatigue
    """
    try:
        # Convert alerts to AlertContext objects
        alert_contexts = []
        for alert_data in request.alerts:
            alert_context = AlertContext(
                alert_id=alert_data.get('id', 'unknown'),
                timestamp=datetime.fromisoformat(alert_data.get('timestamp', datetime.utcnow().isoformat())),
                severity=alert_data.get('severity', 'Medium'),
                category=alert_data.get('category', 'unknown'),
                source_ip=alert_data.get('source_ip', ''),
                destination_ip=alert_data.get('destination_ip', ''),
                user=alert_data.get('user', ''),
                description=alert_data.get('description', ''),
                framework_mappings=alert_data.get('framework_mappings', []),
                confidence_score=alert_data.get('confidence_score', 0.5),
                false_positive_likelihood=alert_data.get('false_positive_likelihood', 0.3)
            )
            alert_contexts.append(alert_context)
        
        # Create analyst profile (in a real implementation, this would be retrieved from database)
        analyst_profile = AnalystProfile(
            analyst_id=request.analyst_id,
            name="Analyst",
            experience_level="mid",
            shift_start=datetime.utcnow(),
            shift_end=datetime.utcnow() + timedelta(hours=8),
            max_alerts_per_hour=50,
            preferred_alert_types=[],
            fatigue_threshold=0.6
        )
        
        # Prioritize alerts
        prioritized_alerts = alert_prioritizer.prioritize_alerts(alert_contexts, analyst_profile)
        
        # Correlate related alerts
        correlated_groups = alert_correlator.correlate_alerts(prioritized_alerts)
        
        # Monitor analyst session
        session_data = {
            'alerts_processed': len(alert_contexts),
            'decisions_made': len(alert_contexts)
        }
        fatigue_status = fatigue_monitor.monitor_analyst_session(request.analyst_id, session_data)
        
        # Optimize alert display
        optimized_alerts = alert_presenter.optimize_alert_display(
            prioritized_alerts, 
            analyst_profile, 
            fatigue_status['fatigue_level']
        )
        
        return {
            "success": True,
            "prioritized_alerts": optimized_alerts,
            "correlated_groups": correlated_groups,
            "fatigue_status": fatigue_status,
            "total_alerts": len(alert_contexts),
            "prioritized_count": len(prioritized_alerts)
        }
        
    except Exception as e:
        logger.error(f"Error prioritizing alerts: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to prioritize alerts: {str(e)}"
        )

@router.post("/thresholds/adjust")
async def adjust_thresholds(
    alert_type: str = Body(..., description="Alert type to adjust"),
    false_positive_rate: float = Body(..., ge=0.0, le=1.0, description="False positive rate"),
    analyst_feedback: Optional[Dict[str, Any]] = Body(None, description="Analyst feedback"),
    current_user: User = Depends(get_current_user)
):
    """
    Adjust alert thresholds based on false positive rate and analyst feedback
    """
    try:
        # Sanitize alert type
        clean_alert_type = sanitize_string(alert_type, max_length=50)
        
        # Adjust thresholds
        adjustment_result = threshold_manager.adjust_thresholds(
            clean_alert_type,
            false_positive_rate,
            analyst_feedback
        )
        
        return {
            "success": True,
            "adjustment": adjustment_result
        }
        
    except Exception as e:
        logger.error(f"Error adjusting thresholds: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to adjust thresholds: {str(e)}"
        )

@router.get("/fatigue/status/{analyst_id}")
async def get_fatigue_status(
    analyst_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get current fatigue status for an analyst
    """
    try:
        # Sanitize analyst ID
        clean_analyst_id = sanitize_string(analyst_id, max_length=50)
        
        # Get fatigue status (in a real implementation, this would be retrieved from database)
        # For now, return a mock status
        fatigue_status = {
            "analyst_id": clean_analyst_id,
            "fatigue_score": 0.3,
            "fatigue_level": "Low",
            "session_duration_hours": 2.5,
            "alerts_processed": 45,
            "decisions_made": 45,
            "recommendations": [
                "Continue current pace",
                "Take a break in 2 hours"
            ]
        }
        
        return {
            "success": True,
            "fatigue_status": fatigue_status
        }
        
    except Exception as e:
        logger.error(f"Error getting fatigue status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get fatigue status: {str(e)}"
        )

@router.get("/dashboard/extended-summary")
async def get_extended_dashboard_summary(
    current_user: User = Depends(get_current_user),
    days: int = Query(7, ge=1, le=30, description="Number of days to analyze")
):
    """
    Get extended framework dashboard summary
    """
    try:
        # This would typically query your database for recent logs
        # For now, return mock data
        summary = {
            "timeframe": f"Last {days} days",
            "total_logs_analyzed": 2500,
            "frameworks": {
                "owasp_top_10": {
                    "vulnerabilities_detected": 85,
                    "top_vulnerabilities": [
                        {"name": "A03 - Injection", "count": 25},
                        {"name": "A01 - Broken Access Control", "count": 20},
                        {"name": "A07 - Authentication Failures", "count": 15}
                    ],
                    "risk_distribution": {
                        "critical": 5,
                        "high": 25,
                        "medium": 35,
                        "low": 20
                    }
                },
                "stride": {
                    "threats_detected": 6,
                    "threat_distribution": {
                        "Information_Disclosure": 15,
                        "Denial_of_Service": 12,
                        "Elevation_of_Privilege": 8,
                        "Tampering": 5,
                        "Spoofing": 3,
                        "Repudiation": 2
                    }
                },
                "nist_csf": {
                    "controls_triggered": 12,
                    "function_distribution": {
                        "Detect": 8,
                        "Protect": 6,
                        "Respond": 4,
                        "Identify": 3,
                        "Recover": 2
                    }
                },
                "atomic_red_team": {
                    "techniques_detected": 18,
                    "top_techniques": [
                        {"name": "T1059 - Command and Scripting", "count": 8},
                        {"name": "T1083 - File Discovery", "count": 6},
                        {"name": "T1055 - Process Injection", "count": 4}
                    ]
                }
            },
            "analyst_fatigue": {
                "total_analysts": 5,
                "fatigue_levels": {
                    "low": 3,
                    "medium": 2,
                    "high": 0,
                    "critical": 0
                },
                "average_fatigue_score": 0.35,
                "recommendations": [
                    "Implement alert correlation for T1059 techniques",
                    "Adjust thresholds for A03 vulnerabilities",
                    "Schedule breaks for 2 analysts"
                ]
            },
            "overall_threat_assessment": {
                "risk_level": "Medium",
                "risk_score": 7,
                "critical_alerts": 3,
                "framework_coverage": 4,
                "recommendations": [
                    "Focus on injection attack prevention",
                    "Implement stronger access controls",
                    "Enhance authentication monitoring"
                ]
            }
        }
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Error getting extended dashboard summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get extended dashboard summary: {str(e)}"
        )
