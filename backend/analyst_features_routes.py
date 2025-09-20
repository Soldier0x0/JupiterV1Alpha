#!/usr/bin/env python3
"""
Jupiter SIEM Analyst Features Routes
Core reporting, flagging, and AI explanation functionality
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body, BackgroundTasks
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import json
import logging
import asyncio
from pathlib import Path

from auth_middleware import get_current_user
from models.user_management import User
from models.analyst_features import (
    ReportModel, SavedReportModel, FlagModel, AIExplanationRequest,
    AIExplanationResponse, ReportExportRequest, ReportExportResponse,
    AuditEntry, PointsModel, NoiseBucketModel, PivotTemplate,
    WebhookConfig, IncidentReplayModel, TenantHealthModel
)
from security_utils import sanitize_string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyst", tags=["analyst-features"])

# Mock database collections (in production, use MongoDB)
reports_db = {}
saved_reports_db = {}
flags_db = {}
audit_db = {}
points_db = {}
noise_buckets_db = {}
pivot_templates_db = {}
webhooks_db = {}
incident_replays_db = {}
tenant_health_db = {}

# =============================================================================
# PHASE 1: CORE ANALYST FEATURES
# =============================================================================

@router.post("/reports/add")
async def add_to_report(
    request: ReportModel,
    current_user: User = Depends(get_current_user)
):
    """
    Add data to a report
    """
    try:
        # Validate tenant access
        if not hasattr(current_user, 'tenant_id') or current_user.tenant_id != request.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to tenant")
        
        # Store report
        report_id = request.id
        reports_db[report_id] = request.dict()
        
        # Create audit entry
        audit_entry = AuditEntry(
            event_type="report_added",
            tenant_id=request.tenant_id,
            user_id=current_user.email,
            details={
                "report_id": report_id,
                "title": request.title,
                "widget_id": request.widget_id
            },
            immutable_hash=hashlib.sha256(f"{report_id}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        )
        audit_db[audit_entry.id] = audit_entry.dict()
        
        # Award points
        await award_points(current_user.email, request.tenant_id, "report_created", 10)
        
        return {
            "success": True,
            "report_id": report_id,
            "message": "Report added successfully"
        }
        
    except Exception as e:
        logger.error(f"Error adding report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add report: {str(e)}")

@router.get("/reports/export")
async def export_report(
    report_ids: List[str] = Query(..., description="Report IDs to export"),
    format: str = Query("pdf", description="Export format"),
    current_user: User = Depends(get_current_user)
):
    """
    Export reports in specified format
    """
    try:
        # Validate tenant access and collect reports
        exported_reports = []
        for report_id in report_ids:
            if report_id in reports_db:
                report = reports_db[report_id]
                if report['tenant_id'] == current_user.tenant_id:
                    exported_reports.append(report)
        
        if not exported_reports:
            raise HTTPException(status_code=404, detail="No reports found")
        
        # Generate export
        export_id = f"export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        if format == "pdf":
            # Mock PDF generation (in production, use WeasyPrint/Pandoc)
            content = generate_pdf_content(exported_reports)
            file_path = f"/tmp/exports/{export_id}.pdf"
        elif format == "html":
            content = generate_html_content(exported_reports)
            file_path = f"/tmp/exports/{export_id}.html"
        else:
            content = json.dumps(exported_reports, indent=2)
            file_path = f"/tmp/exports/{export_id}.json"
        
        # Save to saved reports
        saved_report = SavedReportModel(
            tenant_id=current_user.tenant_id,
            report_id=export_id,
            title=f"Export {len(exported_reports)} Reports",
            content=content,
            format=format,
            file_size=len(content.encode('utf-8'))
        )
        saved_reports_db[saved_report.id] = saved_report.dict()
        
        # Create audit entry
        audit_entry = AuditEntry(
            event_type="report_exported",
            tenant_id=current_user.tenant_id,
            user_id=current_user.email,
            details={
                "export_id": export_id,
                "format": format,
                "report_count": len(exported_reports)
            },
            immutable_hash=hashlib.sha256(f"{export_id}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        )
        audit_db[audit_entry.id] = audit_entry.dict()
        
        return {
            "success": True,
            "export_id": export_id,
            "download_url": f"/api/analyst/reports/download/{export_id}",
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error exporting reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export reports: {str(e)}")

@router.post("/flags")
async def flag_to_admin(
    request: FlagModel,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Flag content to admin for review
    """
    try:
        # Validate tenant access
        if not hasattr(current_user, 'tenant_id') or current_user.tenant_id != request.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to tenant")
        
        # Store flag
        flag_id = request.id
        flags_db[flag_id] = request.dict()
        
        # Trigger webhook/email notification
        background_tasks.add_task(notify_admin_flag, request)
        
        # Create audit entry
        audit_entry = AuditEntry(
            event_type="flag_created",
            tenant_id=request.tenant_id,
            user_id=current_user.email,
            details={
                "flag_id": flag_id,
                "widget_id": request.widget_id,
                "priority": request.priority.value
            },
            immutable_hash=hashlib.sha256(f"{flag_id}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        )
        audit_db[audit_entry.id] = audit_entry.dict()
        
        # Award points
        await award_points(current_user.email, request.tenant_id, "flag_created", 5)
        
        return {
            "success": True,
            "flag_id": flag_id,
            "message": "Flag created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error creating flag: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create flag: {str(e)}")

@router.get("/flags")
async def get_flags(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    current_user: User = Depends(get_current_user)
):
    """
    Get flags (admin-only)
    """
    try:
        # Check admin permissions
        if not hasattr(current_user, 'is_admin') or not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Filter flags
        flags = []
        for flag_data in flags_db.values():
            if flag_data['tenant_id'] == current_user.tenant_id:
                if status and flag_data['status'] != status:
                    continue
                if priority and flag_data['priority'] != priority:
                    continue
                flags.append(flag_data)
        
        return {
            "success": True,
            "flags": flags,
            "total": len(flags)
        }
        
    except Exception as e:
        logger.error(f"Error getting flags: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get flags: {str(e)}")

@router.post("/logs/explain")
async def explain_log(
    request: AIExplanationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI explanation for log data
    """
    try:
        # Validate tenant access
        if not hasattr(current_user, 'tenant_id') or current_user.tenant_id != request.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to tenant")
        
        start_time = datetime.utcnow()
        
        # Try AI explanation first
        try:
            explanation = await generate_ai_explanation(request.log_data, request.format)
            fallback_used = False
            model_used = "ai_model"
        except Exception as ai_error:
            logger.warning(f"AI explanation failed: {ai_error}")
            # Fallback to rule-based explanation
            explanation = generate_fallback_explanation(request.log_data, request.format)
            fallback_used = True
            model_used = "fallback"
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        response = AIExplanationResponse(
            explanation=explanation,
            confidence=0.9 if not fallback_used else 0.6,
            format=request.format,
            fallback_used=fallback_used,
            processing_time=processing_time,
            model_used=model_used
        )
        
        # Create audit entry
        audit_entry = AuditEntry(
            event_type="log_explained",
            tenant_id=request.tenant_id,
            user_id=current_user.email,
            details={
                "format": request.format,
                "fallback_used": fallback_used,
                "processing_time": processing_time
            },
            immutable_hash=hashlib.sha256(f"{request.analyst_id}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        )
        audit_db[audit_entry.id] = audit_entry.dict()
        
        return {
            "success": True,
            "explanation": response
        }
        
    except Exception as e:
        logger.error(f"Error explaining log: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to explain log: {str(e)}")

# =============================================================================
# PHASE 2: ANALYST UX ENHANCEMENTS
# =============================================================================

@router.get("/noise-buckets")
async def get_noise_buckets(
    current_user: User = Depends(get_current_user)
):
    """
    Get aggregated noise buckets
    """
    try:
        buckets = []
        for bucket_data in noise_buckets_db.values():
            if bucket_data['tenant_id'] == current_user.tenant_id:
                buckets.append(bucket_data)
        
        return {
            "success": True,
            "buckets": buckets,
            "total": len(buckets)
        }
        
    except Exception as e:
        logger.error(f"Error getting noise buckets: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get noise buckets: {str(e)}")

@router.post("/pivot")
async def pivot_query(
    pivot_type: str = Body(..., description="Pivot type (ip, asn, username)"),
    value: str = Body(..., description="Value to pivot on"),
    current_user: User = Depends(get_current_user)
):
    """
    Execute pivot query
    """
    try:
        # Get pivot template
        template = None
        for template_data in pivot_templates_db.values():
            if template_data['pivot_type'] == pivot_type:
                template = template_data
                break
        
        if not template:
            raise HTTPException(status_code=404, detail="Pivot template not found")
        
        # Execute pivot query (mock)
        results = await execute_pivot_query(template, value, current_user.tenant_id)
        
        # Award points
        await award_points(current_user.email, current_user.tenant_id, "pivot_query", 3)
        
        return {
            "success": True,
            "results": results,
            "template_used": template['name']
        }
        
    except Exception as e:
        logger.error(f"Error executing pivot query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute pivot query: {str(e)}")

@router.get("/points")
async def get_analyst_points(
    current_user: User = Depends(get_current_user)
):
    """
    Get analyst points and gamification data
    """
    try:
        points_key = f"{current_user.email}_{current_user.tenant_id}"
        if points_key in points_db:
            points_data = points_db[points_key]
        else:
            # Initialize points
            points_data = PointsModel(
                analyst_id=current_user.email,
                tenant_id=current_user.tenant_id
            ).dict()
            points_db[points_key] = points_data
        
        return {
            "success": True,
            "points": points_data
        }
        
    except Exception as e:
        logger.error(f"Error getting points: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get points: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(
    current_user: User = Depends(get_current_user)
):
    """
    Get analyst leaderboard
    """
    try:
        # Get all analysts for tenant
        tenant_points = []
        for points_data in points_db.values():
            if points_data['tenant_id'] == current_user.tenant_id:
                tenant_points.append(points_data)
        
        # Sort by XP
        tenant_points.sort(key=lambda x: x['xp'], reverse=True)
        
        return {
            "success": True,
            "leaderboard": tenant_points[:10],  # Top 10
            "total_analysts": len(tenant_points)
        }
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def award_points(analyst_id: str, tenant_id: str, action: str, points: int):
    """Award points to analyst"""
    try:
        points_key = f"{analyst_id}_{tenant_id}"
        if points_key in points_db:
            points_data = points_db[points_key]
        else:
            points_data = PointsModel(
                analyst_id=analyst_id,
                tenant_id=tenant_id
            ).dict()
        
        points_data['xp'] += points
        points_data['last_activity'] = datetime.utcnow().isoformat()
        
        # Check for level up
        new_level = max(1, (points_data['xp'] // 100) + 1)
        if new_level > points_data['level']:
            points_data['level'] = new_level
            # Award level up badge
            if f"level_{new_level}" not in points_data['badges']:
                points_data['badges'].append(f"level_{new_level}")
        
        points_db[points_key] = points_data
        
    except Exception as e:
        logger.error(f"Error awarding points: {e}")

async def notify_admin_flag(flag: FlagModel):
    """Notify admin about new flag"""
    try:
        # Mock webhook notification
        logger.info(f"Admin notification: New flag {flag.id} from {flag.analyst_id}")
        
        # In production, send webhook/email
        # await send_webhook_notification(flag)
        
    except Exception as e:
        logger.error(f"Error notifying admin: {e}")

async def generate_ai_explanation(log_data: Dict[str, Any], format: str) -> str:
    """Generate AI explanation (mock)"""
    # Mock AI explanation
    if format == "eli5":
        return f"This log shows a {log_data.get('activity_name', 'unknown activity')} that happened at {log_data.get('timestamp', 'unknown time')}. It's like a security camera recording that caught something happening in your digital space."
    else:
        return f"Technical analysis: {json.dumps(log_data, indent=2)}"

def generate_fallback_explanation(log_data: Dict[str, Any], format: str) -> str:
    """Generate fallback explanation"""
    activity = log_data.get('activity_name', 'Unknown activity')
    severity = log_data.get('severity', 'Unknown')
    
    if format == "eli5":
        return f"This is a {severity.lower()} security event called '{activity}'. Think of it as a warning that something unusual happened in your system that might need attention."
    else:
        return f"Event: {activity}, Severity: {severity}, Details: {json.dumps(log_data, indent=2)}"

def generate_pdf_content(reports: List[Dict[str, Any]]) -> str:
    """Generate PDF content (mock)"""
    content = f"# Security Report Export\n\n"
    content += f"Generated: {datetime.utcnow().isoformat()}\n\n"
    
    for i, report in enumerate(reports, 1):
        content += f"## Report {i}: {report['title']}\n\n"
        content += f"**Created:** {report['created_at']}\n"
        content += f"**Analyst:** {report['analyst_id']}\n\n"
        content += f"**Content:**\n{json.dumps(report['content'], indent=2)}\n\n"
    
    return content

def generate_html_content(reports: List[Dict[str, Any]]) -> str:
    """Generate HTML content"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Report Export</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; }}
            .report {{ margin: 30px 0; padding: 20px; border: 1px solid #ddd; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Security Report Export</h1>
            <p>Generated: {datetime.utcnow().isoformat()}</p>
        </div>
    """
    
    for i, report in enumerate(reports, 1):
        html += f"""
        <div class="report">
            <h2>Report {i}: {report['title']}</h2>
            <p><strong>Created:</strong> {report['created_at']}</p>
            <p><strong>Analyst:</strong> {report['analyst_id']}</p>
            <pre>{json.dumps(report['content'], indent=2)}</pre>
        </div>
        """
    
    html += "</body></html>"
    return html

async def execute_pivot_query(template: Dict[str, Any], value: str, tenant_id: str) -> List[Dict[str, Any]]:
    """Execute pivot query (mock)"""
    # Mock pivot results
    return [
        {
            "value": value,
            "count": 42,
            "first_seen": datetime.utcnow().isoformat(),
            "last_seen": datetime.utcnow().isoformat(),
            "related_events": ["event1", "event2", "event3"]
        }
    ]

# Export router
__all__ = ['router']
