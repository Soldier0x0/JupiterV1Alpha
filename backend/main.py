#!/usr/bin/env python3
"""
Jupiter SIEM FastAPI Backend
Integrated with Query AST System and ClickHouse
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

# Import our AST system
from query_ast_schema import JupiterQueryAST, EXAMPLE_ASTS, ASTTimeRange
from query_manager import query_manager, execute_ocsf_query, get_example_queries, QueryBackend
from query_providers import MockQueryProvider

# Import Phase 3 & 4 components
from threat_intelligence import initialize_threat_intelligence, enrich_event_with_threat_intel
from soar_engine import initialize_soar_engine, process_event_for_soar
from reporting_engine import initialize_reporting_engine, generate_report_async

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
# BACKEND MANAGEMENT ENDPOINTS
# ==============================================================================

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