#!/usr/bin/env python3
"""
Jupiter SIEM Analyst Features Models
Core reporting, flagging, and AI explanation functionality
"""

import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field, validator
from enum import Enum
import uuid

class ReportStatus(Enum):
    """Report status enumeration"""
    DRAFT = "draft"
    PENDING = "pending"
    COMPLETED = "completed"
    EXPORTED = "exported"

class FlagStatus(Enum):
    """Flag status enumeration"""
    OPEN = "open"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class FlagPriority(Enum):
    """Flag priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ReportModel(BaseModel):
    """Report data model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="Tenant identifier")
    analyst_id: str = Field(..., description="Analyst who created the report")
    widget_id: Optional[str] = Field(None, description="Widget that generated the report")
    title: str = Field(..., max_length=200, description="Report title")
    content: Dict[str, Any] = Field(..., description="Report content data")
    status: ReportStatus = Field(default=ReportStatus.DRAFT, description="Report status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = Field(default=[], description="Report tags")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")
    
    @validator('content')
    def validate_content(cls, v):
        """Validate report content structure"""
        if not isinstance(v, dict):
            raise ValueError("Content must be a dictionary")
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate and sanitize tags"""
        if v is None:
            return []
        return [tag.strip() for tag in v if tag.strip()]

class SavedReportModel(BaseModel):
    """Saved report model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="Tenant identifier")
    report_id: str = Field(..., description="Original report ID")
    title: str = Field(..., max_length=200, description="Report title")
    content: str = Field(..., description="Report content (HTML/PDF)")
    format: str = Field(default="html", description="Report format")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    file_size: int = Field(default=0, description="File size in bytes")
    download_count: int = Field(default=0, description="Download count")
    compliance_metadata: Dict[str, Any] = Field(default={}, description="Compliance information")

class FlagModel(BaseModel):
    """Flag model for admin review"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="Tenant identifier")
    analyst_id: str = Field(..., description="Analyst who created the flag")
    widget_id: str = Field(..., description="Widget that was flagged")
    reason: Optional[str] = Field(None, max_length=500, description="Flag reason")
    priority: FlagPriority = Field(default=FlagPriority.MEDIUM, description="Flag priority")
    status: FlagStatus = Field(default=FlagStatus.OPEN, description="Flag status")
    data: Dict[str, Any] = Field(..., description="Flagged data")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = Field(None, description="When flag was reviewed")
    reviewed_by: Optional[str] = Field(None, description="Who reviewed the flag")
    resolution_notes: Optional[str] = Field(None, max_length=1000, description="Resolution notes")
    
    @validator('data')
    def validate_data(cls, v):
        """Validate flag data structure"""
        if not isinstance(v, dict):
            raise ValueError("Data must be a dictionary")
        return v

class AIExplanationRequest(BaseModel):
    """AI explanation request model"""
    log_data: Dict[str, Any] = Field(..., description="Log data to explain")
    format: str = Field(default="eli5", description="Explanation format")
    context: Optional[str] = Field(None, max_length=500, description="Additional context")
    analyst_id: str = Field(..., description="Requesting analyst")
    tenant_id: str = Field(..., description="Tenant identifier")
    
    @validator('format')
    def validate_format(cls, v):
        """Validate explanation format"""
        valid_formats = ['eli5', 'technical', 'summary', 'detailed']
        if v not in valid_formats:
            raise ValueError(f"Format must be one of: {valid_formats}")
        return v

class AIExplanationResponse(BaseModel):
    """AI explanation response model"""
    explanation: str = Field(..., description="Generated explanation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    format: str = Field(..., description="Explanation format")
    fallback_used: bool = Field(default=False, description="Whether fallback was used")
    processing_time: float = Field(..., description="Processing time in seconds")
    model_used: Optional[str] = Field(None, description="AI model used")

class ReportExportRequest(BaseModel):
    """Report export request model"""
    report_ids: List[str] = Field(..., description="Report IDs to export")
    format: str = Field(default="pdf", description="Export format")
    include_metadata: bool = Field(default=True, description="Include metadata")
    template: Optional[str] = Field(None, description="Export template")
    tenant_id: str = Field(..., description="Tenant identifier")
    analyst_id: str = Field(..., description="Requesting analyst")
    
    @validator('format')
    def validate_format(cls, v):
        """Validate export format"""
        valid_formats = ['pdf', 'html', 'json', 'csv']
        if v not in valid_formats:
            raise ValueError(f"Format must be one of: {valid_formats}")
        return v

class ReportExportResponse(BaseModel):
    """Report export response model"""
    export_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_path: str = Field(..., description="Exported file path")
    file_size: int = Field(..., description="File size in bytes")
    format: str = Field(..., description="Export format")
    download_url: str = Field(..., description="Download URL")
    expires_at: datetime = Field(..., description="Download expiration")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditEntry(BaseModel):
    """Audit entry model for immutable logging"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str = Field(..., description="Event type")
    tenant_id: str = Field(..., description="Tenant identifier")
    user_id: Optional[str] = Field(None, description="User who performed action")
    details: Dict[str, Any] = Field(..., description="Event details")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    immutable_hash: str = Field(..., description="Hash for integrity verification")
    previous_hash: Optional[str] = Field(None, description="Previous entry hash")
    
    @validator('immutable_hash')
    def validate_hash(cls, v, values):
        """Validate hash integrity"""
        if not v:
            raise ValueError("Hash cannot be empty")
        return v

class PointsModel(BaseModel):
    """Analyst points and gamification model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    analyst_id: str = Field(..., description="Analyst identifier")
    tenant_id: str = Field(..., description="Tenant identifier")
    xp: int = Field(default=0, ge=0, description="Experience points")
    badges: List[str] = Field(default=[], description="Earned badges")
    streak_count: int = Field(default=0, ge=0, description="Current streak")
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    level: int = Field(default=1, ge=1, description="Analyst level")
    achievements: List[Dict[str, Any]] = Field(default=[], description="Achievement history")
    
    @validator('level')
    def calculate_level(cls, v, values):
        """Calculate level based on XP"""
        xp = values.get('xp', 0)
        return max(1, (xp // 100) + 1)

class NoiseBucketModel(BaseModel):
    """Noise bucket for alert aggregation"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="Tenant identifier")
    bucket_key: str = Field(..., description="Unique bucket identifier")
    alert_type: str = Field(..., description="Type of alerts in bucket")
    source_ip: Optional[str] = Field(None, description="Source IP")
    user_id: Optional[str] = Field(None, description="User ID")
    count: int = Field(default=1, ge=1, description="Alert count")
    first_seen: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    severity: str = Field(default="medium", description="Aggregated severity")
    sample_alerts: List[Dict[str, Any]] = Field(default=[], description="Sample alerts")
    resolved: bool = Field(default=False, description="Whether bucket is resolved")
    
    @validator('bucket_key')
    def validate_bucket_key(cls, v):
        """Validate bucket key format"""
        if not v or len(v.strip()) == 0:
            raise ValueError("Bucket key cannot be empty")
        return v.strip()

class PivotTemplate(BaseModel):
    """Pivot query template model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., max_length=100, description="Template name")
    description: str = Field(..., max_length=500, description="Template description")
    pivot_type: str = Field(..., description="Type of pivot (ip, asn, username)")
    query_template: str = Field(..., description="Query template")
    parameters: List[str] = Field(default=[], description="Required parameters")
    tenant_id: Optional[str] = Field(None, description="Tenant-specific template")
    created_by: str = Field(..., description="Creator analyst ID")
    usage_count: int = Field(default=0, description="Usage count")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WebhookConfig(BaseModel):
    """Webhook configuration model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = Field(..., description="Tenant identifier")
    name: str = Field(..., max_length=100, description="Webhook name")
    url: str = Field(..., description="Webhook URL")
    platform: str = Field(..., description="Platform (slack, discord, mattermost)")
    events: List[str] = Field(..., description="Subscribed events")
    enabled: bool = Field(default=True, description="Whether webhook is enabled")
    secret: Optional[str] = Field(None, description="Webhook secret")
    headers: Dict[str, str] = Field(default={}, description="Custom headers")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered: Optional[datetime] = Field(None, description="Last trigger time")
    failure_count: int = Field(default=0, description="Failure count")
    
    @validator('url')
    def validate_url(cls, v):
        """Validate webhook URL"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError("URL must start with http:// or https://")
        return v

class IncidentReplayModel(BaseModel):
    """Incident replay model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str = Field(..., description="Incident identifier")
    tenant_id: str = Field(..., description="Tenant identifier")
    logs: List[Dict[str, Any]] = Field(..., description="Replay logs")
    sequence_order: List[str] = Field(..., description="Log sequence order")
    replayable: bool = Field(default=True, description="Whether incident is replayable")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    duration_seconds: float = Field(default=0.0, description="Replay duration")
    metadata: Dict[str, Any] = Field(default={}, description="Replay metadata")

class TenantHealthModel(BaseModel):
    """Tenant health monitoring model"""
    tenant_id: str = Field(..., description="Tenant identifier")
    severity_counts: Dict[str, int] = Field(default={}, description="Severity counts")
    load_metrics: Dict[str, float] = Field(default={}, description="Load metrics")
    health_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Health score")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    alerts: List[str] = Field(default=[], description="Health alerts")
    recommendations: List[str] = Field(default=[], description="Health recommendations")

# Export all models
__all__ = [
    'ReportStatus', 'FlagStatus', 'FlagPriority',
    'ReportModel', 'SavedReportModel', 'FlagModel',
    'AIExplanationRequest', 'AIExplanationResponse',
    'ReportExportRequest', 'ReportExportResponse',
    'AuditEntry', 'PointsModel', 'NoiseBucketModel',
    'PivotTemplate', 'WebhookConfig', 'IncidentReplayModel',
    'TenantHealthModel'
]
