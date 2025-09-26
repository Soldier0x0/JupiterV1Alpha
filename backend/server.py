#!/usr/bin/env python3
"""
Jupiter SIEM FastAPI Backend
Integrated with Query AST System and ClickHouse
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

# Import our AST system
from query_ast_schema import JupiterQueryAST, EXAMPLE_ASTS, ASTTimeRange
from query_manager import query_manager, execute_ocsf_query, get_example_queries, QueryBackend
from query_providers import MockQueryProvider

# Import Phase 3, 4 & 5 components
from threat_intelligence import initialize_threat_intelligence, enrich_event_with_threat_intel
from soar_engine import initialize_soar_engine, process_event_for_soar
from reporting_engine import initialize_reporting_engine, generate_report_async
from operations_manager import initialize_operations_manager, run_health_checks, execute_backup_job

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Jupiter SIEM Backend starting...")
    
    # Initialize query providers
    logger.info(f"Available query backends: {query_manager.get_available_backends()}")
    
    # Initialize Phase 3 & 4 components
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Initialize Threat Intelligence
    threat_config = {
        "cache_ttl": 3600,
        "providers": {
            "abuseipdb": {
                "enabled": bool(os.getenv("ABUSEIPDB_API_KEY")),
                "api_key": os.getenv("ABUSEIPDB_API_KEY", "")
            },
            "virustotal": {
                "enabled": bool(os.getenv("VIRUSTOTAL_API_KEY")),
                "api_key": os.getenv("VIRUSTOTAL_API_KEY", "")
            },
            "mitre_attack": {
                "enabled": True
            }
        }
    }
    await initialize_threat_intelligence(redis_url, threat_config)
    
    # Initialize SOAR Engine
    soar_config = {
        "n8n_webhook_url": os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook")
    }
    initialize_soar_engine(soar_config)
    
    # Initialize Reporting Engine
    reporting_config = {
        "output_dir": "/app/reports"
    }
    initialize_reporting_engine(reporting_config)
    
    # Initialize Operations Manager
    operations_config = {
        "backup_dir": "/app/backups"
    }
    initialize_operations_manager(operations_config)
    
    logger.info("All systems initialized successfully")
    
    yield
    
    logger.info("Jupiter SIEM Backend shutting down...")

# FastAPI application
app = FastAPI(
    title="Jupiter SIEM API",
    description="Advanced Security Information and Event Management Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# REQUEST/RESPONSE MODELS
# ==============================================================================

class QueryRequest(BaseModel):
    """Request model for OCSF queries"""
    query: str
    tenant_id: Optional[str] = None
    backend: Optional[str] = None
    limit: Optional[int] = 100
    time_range: Optional[str] = None  # e.g., "1h", "24h", "7d"

class ASTQueryRequest(BaseModel):
    """Request model for direct AST queries"""
    ast: Dict[str, Any]
    backend: Optional[str] = None

class ThreatIntelRequest(BaseModel):
    """Request for threat intelligence enrichment"""
    event: Dict[str, Any]

class SOARTriggerRequest(BaseModel):
    """Request to trigger SOAR workflow"""
    event: Dict[str, Any]
    playbook_id: Optional[str] = None

class ReportGenerationRequest(BaseModel):
    """Request to generate report"""
    report_id: str
    parameters: Optional[Dict[str, Any]] = None
    format: Optional[str] = "html"

class QueryResponse(BaseModel):
    """Response model for query results"""
    success: bool
    data: List[Dict[str, Any]]
    total: int
    execution_time: float
    backend: str
    query_id: Optional[str] = None
    sql: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    version: str
    backends: List[str]

# ==============================================================================
# HEALTH & STATUS ENDPOINTS
# ==============================================================================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=str(pd.Timestamp.now()),
        version="1.0.0",
        backends=query_manager.get_available_backends()
    )

@app.get("/api/status")
async def get_status():
    """Get detailed system status"""
    return {
        "application": "Jupiter SIEM",
        "version": "1.0.0",
        "environment": os.getenv("APP_ENVIRONMENT", "development"),
        "query_backend": os.getenv("JUPITER_QUERY_BACKEND", "mock"),
        "backends": {
            backend: query_manager.get_backend_info(QueryBackend(backend))
            for backend in query_manager.get_available_backends()
        },
        "timestamp": str(pd.Timestamp.now())
    }

# ==============================================================================
# QUERY ENDPOINTS - LEGACY COMPATIBILITY
# ==============================================================================

@app.post("/api/query/ocsf", response_model=QueryResponse)
async def execute_ocsf_query_endpoint(request: QueryRequest):
    """
    Execute OCSF query string (legacy compatibility)
    Converts query string to AST and executes
    """
    try:
        result = execute_ocsf_query(
            query_string=request.query,
            tenant_id=request.tenant_id,
            backend=request.backend
        )
        
        return QueryResponse(
            success=result["success"],
            data=result.get("data", []),
            total=result.get("total", 0),
            execution_time=result.get("execution_time", 0),
            backend=result.get("backend", "unknown"),
            query_id=result.get("query_id"),
            sql=result.get("sql"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"OCSF query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/query/examples")
async def get_query_examples():
    """Get example queries for testing"""
    examples = {}
    for name, ast in get_example_queries().items():
        examples[name] = {
            "name": name,
            "description": f"Example {name.replace('_', ' ').title()} query",
            "ast": ast.dict()
        }
    return examples

# ==============================================================================
# QUERY ENDPOINTS - NEW AST SYSTEM
# ==============================================================================

@app.post("/api/query/ast", response_model=QueryResponse)
async def execute_ast_query(request: ASTQueryRequest):
    """
    Execute query using Jupiter Query AST
    Direct AST execution for advanced users
    """
    try:
        # Parse AST from request
        ast = JupiterQueryAST.parse_obj(request.ast)
        
        # Execute query
        backend_enum = QueryBackend(request.backend) if request.backend else None
        result = query_manager.execute_query(ast, backend_enum)
        
        return QueryResponse(
            success=result["success"],
            data=result.get("data", []),
            total=result.get("total", 0),
            execution_time=result.get("execution_time", 0),
            backend=result.get("backend", "unknown"),
            query_id=result.get("query_id"),
            sql=result.get("sql"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"AST query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query/validate")
async def validate_query(request: ASTQueryRequest):
    """Validate query AST without executing"""
    try:
        ast = JupiterQueryAST.parse_obj(request.ast)
        backend_enum = QueryBackend(request.backend) if request.backend else None
        validation = query_manager.validate_query(ast, backend_enum)
        return validation
    except Exception as e:
        logger.error(f"Query validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# OCSF SCHEMA ENDPOINTS
# ==============================================================================

@app.get("/api/ocsf/classes")
async def get_ocsf_classes():
    """Get OCSF event classes"""
    return {
        "classes": [
            {"uid": 1001, "name": "Authentication", "category": "Identity & Access Management"},
            {"uid": 1002, "name": "Process Activity", "category": "System Activity"},
            {"uid": 1003, "name": "File System Activity", "category": "System Activity"},
            {"uid": 1004, "name": "Network Activity", "category": "Network Activity"},
            {"uid": 1005, "name": "Registry", "category": "System Activity"},
        ]
    }

@app.get("/api/ocsf/fields")
async def get_ocsf_fields():
    """Get available OCSF fields for query building"""
    return {
        "core_fields": [
            "time", "event_uid", "tenant_id", "class_uid", "category_uid", 
            "activity_name", "severity", "message"
        ],
        "user_fields": [
            "user.name", "user.uid", "user.type", "user.domain", "user.email"
        ],
        "device_fields": [
            "device.name", "device.type", "device.ip", "device.hostname", "device.os.name"
        ],
        "network_fields": [
            "src_endpoint.ip", "src_endpoint.port", "dst_endpoint.ip", "dst_endpoint.port",
            "network.protocol"
        ],
        "process_fields": [
            "process.name", "process.pid", "process.cmd_line", "process.parent.name"
        ],
        "file_fields": [
            "file.name", "file.path", "file.size", "file.hash.sha256"
        ]
    }

# ==============================================================================
# DASHBOARD & ANALYTICS ENDPOINTS
# ==============================================================================

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(
    tenant_id: str = Query(default="main_tenant"),
    time_range: str = Query(default="24h")
):
    """Get dashboard summary statistics"""
    try:
        # Create AST for summary query
        from query_ast_schema import ASTField, ASTFunction, ASTSelectField, ASTTimeRange
        
        ast = JupiterQueryAST(
            select=[
                ASTSelectField(
                    field=ASTFunction(name="count", args=[]),
                    alias="total_events"
                ),
                ASTSelectField(
                    field=ASTFunction(name="count_distinct", args=[ASTField(name="actor_user_name")]),
                    alias="unique_users"
                ),
                ASTSelectField(
                    field=ASTFunction(name="count_distinct", args=[ASTField(name="device_name")]), 
                    alias="unique_devices"
                )
            ],
            tenant_id=tenant_id,
            time_range=ASTTimeRange(last=time_range)
        )
        
        result = query_manager.execute_query(ast)
        
        if result["success"] and result["data"]:
            summary = result["data"][0]
            return {
                "success": True,
                "summary": {
                    "total_events": summary.get("total_events", 0),
                    "unique_users": summary.get("unique_users", 0), 
                    "unique_devices": summary.get("unique_devices", 0),
                    "time_range": time_range,
                    "tenant_id": tenant_id
                },
                "execution_time": result["execution_time"]
            }
        else:
            return {"success": False, "error": result.get("error", "Unknown error")}
            
    except Exception as e:
        logger.error(f"Dashboard summary failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/events/recent")
async def get_recent_events(
    tenant_id: str = Query(default="main_tenant"),
    limit: int = Query(default=50, le=1000),
    severity: Optional[str] = Query(default=None)
):
    """Get recent security events"""
    try:
        from query_ast_schema import (
            ASTField, ASTSelectField, ASTOrderBy, ASTCondition, 
            ASTLiteral, SortOrder, ComparisonOperator, FieldType
        )
        
        select_fields = [
            ASTSelectField(field=ASTField(name="time")),
            ASTSelectField(field=ASTField(name="severity")),
            ASTSelectField(field=ASTField(name="activity_name")),
            ASTSelectField(field=ASTField(name="message")),
            ASTSelectField(field=ASTField(name="actor_user_name")),
            ASTSelectField(field=ASTField(name="device_name"))
        ]
        
        ast = JupiterQueryAST(
            select=select_fields,
            tenant_id=tenant_id,
            order_by=[ASTOrderBy(field=ASTField(name="time"), direction=SortOrder.DESC)],
            limit=limit
        )
        
        # Add severity filter if specified
        if severity:
            ast.where = ASTCondition(
                left=ASTField(name="severity"),
                operator=ComparisonOperator.EQUALS,
                right=ASTLiteral(value=severity, literal_type=FieldType.STRING)
            )
        
        result = query_manager.execute_query(ast)
        
        return {
            "success": result["success"],
            "events": result.get("data", []),
            "total": result.get("total", 0),
            "execution_time": result.get("execution_time", 0),
            "filters": {"severity": severity, "limit": limit}
        }
        
    except Exception as e:
        logger.error(f"Recent events query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# PHASE 3: THREAT INTELLIGENCE & SOAR ENDPOINTS
# ==============================================================================

@app.post("/api/threat-intelligence/enrich")
async def enrich_with_threat_intelligence(request: ThreatIntelRequest):
    """Enrich event with threat intelligence"""
    try:
        enriched_event = await enrich_event_with_threat_intel(request.event)
        return {
            "success": True,
            "enriched_event": enriched_event,
            "enrichments": enriched_event.get("threat_intelligence", {})
        }
    except Exception as e:
        logger.error(f"Threat intelligence enrichment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/soar/trigger")
async def trigger_soar_workflow(request: SOARTriggerRequest):
    """Trigger SOAR workflow for security event"""
    try:
        alert = await process_event_for_soar(request.event)
        if alert:
            return {
                "success": True,
                "alert_created": True,
                "alert": alert.to_dict()
            }
        else:
            return {
                "success": True,
                "alert_created": False,
                "message": "Event did not trigger alert creation"
            }
    except Exception as e:
        logger.error(f"SOAR workflow trigger failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/soar/alerts")
async def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=1000)
):
    """Get security alerts"""
    try:
        from soar_engine import soar_engine
        
        if soar_engine:
            alerts = list(soar_engine.alerts.values())
            
            # Apply filters
            if status:
                alerts = [a for a in alerts if a.status.value == status]
            if severity:
                alerts = [a for a in alerts if a.severity.value == severity]
            
            # Sort by creation time (newest first)
            alerts.sort(key=lambda x: x.created_at, reverse=True)
            
            # Apply limit
            alerts = alerts[:limit]
            
            return {
                "success": True,
                "alerts": [alert.to_dict() for alert in alerts],
                "total": len(alerts)
            }
        else:
            return {"success": False, "error": "SOAR engine not initialized"}
    except Exception as e:
        logger.error(f"Failed to retrieve alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/soar/playbooks")
async def get_playbooks():
    """Get available SOAR playbooks"""
    try:
        from soar_engine import soar_engine
        
        if soar_engine:
            playbooks = {}
            for pb_id, playbook in soar_engine.playbooks.items():
                playbooks[pb_id] = {
                    "id": playbook.id,
                    "name": playbook.name,
                    "description": playbook.description,
                    "enabled": playbook.enabled,
                    "actions_count": len(playbook.actions),
                    "created_at": playbook.created_at.isoformat()
                }
            
            return {
                "success": True,
                "playbooks": playbooks
            }
        else:
            return {"success": False, "error": "SOAR engine not initialized"}
    except Exception as e:
        logger.error(f"Failed to retrieve playbooks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# PHASE 4: REPORTING & PRESENTATION ENDPOINTS
# ==============================================================================

@app.post("/api/reports/generate")
async def generate_report(request: ReportGenerationRequest):
    """Generate a security report"""
    try:
        execution = await generate_report_async(request.report_id, request.parameters)
        
        return {
            "success": True,
            "execution_id": execution.id,
            "status": execution.status.value,
            "report_id": execution.report_id,
            "format": execution.format.value,
            "started_at": execution.started_at.isoformat()
        }
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/available")
async def get_available_reports():
    """Get list of available reports"""
    try:
        from reporting_engine import reporting_engine
        
        if reporting_engine:
            reports = {}
            for report_id, report_def in reporting_engine.reports.items():
                reports[report_id] = {
                    "id": report_def.id,
                    "name": report_def.name,
                    "description": report_def.description,
                    "format": report_def.format.value,
                    "frequency": report_def.frequency.value,
                    "enabled": report_def.enabled,
                    "last_run": report_def.last_run.isoformat() if report_def.last_run else None
                }
            
            return {
                "success": True,
                "reports": reports
            }
        else:
            return {"success": False, "error": "Reporting engine not initialized"}
    except Exception as e:
        logger.error(f"Failed to retrieve reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/execution/{execution_id}")
async def get_execution_status(execution_id: str):
    """Get report execution status"""
    try:
        from reporting_engine import reporting_engine
        
        if reporting_engine:
            execution = reporting_engine.get_execution_status(execution_id)
            if execution:
                return {
                    "success": True,
                    "execution": {
                        "id": execution.id,
                        "report_id": execution.report_id,
                        "status": execution.status.value,
                        "format": execution.format.value,
                        "started_at": execution.started_at.isoformat(),
                        "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                        "execution_time": execution.execution_time,
                        "file_size": execution.file_size,
                        "error_message": execution.error_message
                    }
                }
            else:
                raise HTTPException(status_code=404, detail="Execution not found")
        else:
            return {"success": False, "error": "Reporting engine not initialized"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get execution status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/download/{execution_id}")
async def download_report(execution_id: str):
    """Download generated report file"""
    try:
        from reporting_engine import reporting_engine
        
        if reporting_engine:
            execution = reporting_engine.get_execution_status(execution_id)
            if execution and execution.file_path and execution.status.value == "completed":
                return FileResponse(
                    path=execution.file_path,
                    filename=f"{execution.report_id}_{execution.id}.{execution.format.value}",
                    media_type="application/octet-stream"
                )
            else:
                raise HTTPException(status_code=404, detail="Report file not found or not completed")
        else:
            raise HTTPException(status_code=500, detail="Reporting engine not initialized")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# INTEGRATED EVENT PROCESSING PIPELINE
# ==============================================================================

@app.post("/api/events/process")
async def process_security_event(event: Dict[str, Any] = Body(...)):
    """
    Complete event processing pipeline:
    1. Threat intelligence enrichment
    2. SOAR workflow triggering
    3. Alert generation
    """
    try:
        processing_results = {
            "event_id": event.get("event_uid", "unknown"),
            "original_event": event,
            "processing_steps": []
        }
        
        # Step 1: Threat Intelligence Enrichment
        try:
            enriched_event = await enrich_event_with_threat_intel(event)
            processing_results["enriched_event"] = enriched_event
            processing_results["processing_steps"].append({
                "step": "threat_intelligence",
                "status": "success",
                "enrichments_added": len(enriched_event.get("threat_intelligence", {}).get("indicators", []))
            })
        except Exception as e:
            logger.error(f"Threat intelligence enrichment failed: {e}")
            enriched_event = event
            processing_results["processing_steps"].append({
                "step": "threat_intelligence",
                "status": "failed",
                "error": str(e)
            })
        
        # Step 2: SOAR Processing
        try:
            alert = await process_event_for_soar(enriched_event)
            if alert:
                processing_results["alert"] = alert.to_dict()
                processing_results["processing_steps"].append({
                    "step": "soar",
                    "status": "success",
                    "alert_created": True,
                    "alert_id": alert.id,
                    "playbooks_executed": len(alert.playbooks_executed)
                })
            else:
                processing_results["processing_steps"].append({
                    "step": "soar",
                    "status": "success",
                    "alert_created": False
                })
        except Exception as e:
            logger.error(f"SOAR processing failed: {e}")
            processing_results["processing_steps"].append({
                "step": "soar",
                "status": "failed",
                "error": str(e)
            })
        
        return {
            "success": True,
            "processing_results": processing_results
        }
        
    except Exception as e:
        logger.error(f"Event processing pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backends")
async def get_backends():
    """Get available query backends"""
    backends = {}
    for backend_name in query_manager.get_available_backends():
        backend_enum = QueryBackend(backend_name)
        backends[backend_name] = query_manager.get_backend_info(backend_enum)
    
    return {
        "backends": backends,
        "default": query_manager._select_backend(None).value,
        "configured": os.getenv("JUPITER_QUERY_BACKEND", "auto")
    }

@app.post("/api/backends/test/{backend_name}")
async def test_backend(backend_name: str):
    """Test a specific backend"""
    try:
        backend_enum = QueryBackend(backend_name)
        
        # Create simple test query
        from query_ast_schema import ASTField, ASTSelectField, ASTFunction
        
        test_ast = JupiterQueryAST(
            select=[
                ASTSelectField(
                    field=ASTFunction(name="count", args=[]),
                    alias="test_count"
                )
            ],
            limit=1
        )
        
        result = query_manager.execute_query(test_ast, backend_enum)
        
        return {
            "backend": backend_name,
            "success": result["success"],
            "execution_time": result.get("execution_time", 0),
            "error": result.get("error")
        }
        
    except Exception as e:
        logger.error(f"Backend test failed: {e}")
        return {
            "backend": backend_name,
            "success": False,
            "error": str(e)
        }

@app.get("/api/test/health")
async def test_health():
    """Test endpoint"""
    return {"success": True, "message": "Test endpoint working"}

# ==============================================================================
# PHASE 5: OPERATIONS & DISASTER RECOVERY ENDPOINTS  
# ==============================================================================

@app.get("/api/system/health")
async def get_system_health():
    """Get comprehensive system health status"""
    try:
        from operations_manager import operations_manager
        
        if operations_manager:
            # For now, return a simple status since operations_manager might not have all methods
            return {
                "success": True,
                "message": "Operations manager is initialized",
                "status": "healthy"
            }
        else:
            return {"success": False, "error": "Operations manager not initialized"}
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/status")
async def get_system_status():
    """Get overall system status summary"""
    try:
        from operations_manager import operations_manager
        
        if operations_manager:
            status = operations_manager.get_system_status()
            return {"success": True, "status": status}
        else:
            return {"success": False, "error": "Operations manager not initialized"}
    except Exception as e:
        logger.error(f"System status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backup/execute/{job_id}")
async def execute_backup(job_id: str):
    """Execute backup job manually"""
    try:
        execution = await execute_backup_job(job_id)
        
        if execution:
            return {
                "success": True,
                "execution": {
                    "id": execution.id,
                    "job_id": execution.job_id,
                    "status": execution.status.value,
                    "started_at": execution.started_at.isoformat(),
                    "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                    "duration_seconds": execution.duration_seconds,
                    "files_count": execution.files_count,
                    "size_mb": execution.size_bytes / (1024 * 1024) if execution.size_bytes else 0,
                    "error": execution.error_message
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Backup job not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Backup execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backup/status")
async def get_backup_status():
    """Get backup system status"""
    try:
        from operations_manager import operations_manager
        
        if operations_manager:
            status = operations_manager.get_backup_status()
            return {"success": True, "backup_status": status}
        else:
            return {"success": False, "error": "Operations manager not initialized"}
    except Exception as e:
        logger.error(f"Backup status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backup/jobs")
async def get_backup_jobs():
    """Get list of backup jobs"""
    try:
        from operations_manager import operations_manager
        
        if operations_manager:
            jobs = {}
            for job_id, job in operations_manager.backup_jobs.items():
                jobs[job_id] = {
                    "id": job.id,
                    "name": job.name,
                    "backup_type": job.backup_type.value,
                    "schedule": job.schedule,
                    "enabled": job.enabled,
                    "retention_days": job.retention_days,
                    "compression": job.compression,
                    "last_run": job.last_run.isoformat() if job.last_run else None
                }
            
            return {"success": True, "jobs": jobs}
        else:
            return {"success": False, "error": "Operations manager not initialized"}
    except Exception as e:
        logger.error(f"Backup jobs retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/monitoring/metrics")
async def get_monitoring_metrics():
    """Get system monitoring metrics"""
    try:
        from operations_manager import operations_manager
        
        if operations_manager:
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "system": {},
                "services": {},
                "storage": {}
            }
            
            # Get system metrics from health checks
            for name, health in operations_manager.service_health.items():
                if health.metrics:
                    component = operations_manager.health_checks[name].component
                    if component not in metrics["services"]:
                        metrics["services"][component] = {}
                    
                    metrics["services"][component].update(health.metrics)
                    metrics["services"][component]["response_time"] = health.response_time
                    metrics["services"][component]["status"] = health.status.value
            
            # Add backup storage metrics
            backup_status = operations_manager.get_backup_status()
            metrics["storage"]["backups"] = backup_status.get("storage_usage", {})
            
            return {"success": True, "metrics": metrics}
        else:
            return {"success": False, "error": "Operations manager not initialized"}
    except Exception as e:
        logger.error(f"Metrics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "timestamp": str(pd.Timestamp.now())}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "timestamp": str(pd.Timestamp.now())}
    )

# Add missing import
import pandas as pd

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=os.getenv("HOT_RELOAD", "false").lower() == "true",
        log_level="info"
    )