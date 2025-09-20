# Query execution routes for JupiterEmerge SIEM
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
import json
import csv
import io
from datetime import datetime, timedelta
import re
import logging

from auth_middleware import get_current_user
from models.user_management import User
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security_utils import SecurityValidator, UserFriendlyValidator, sanitize_string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/logs", tags=["logs"])

# Pydantic models for request/response
class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=10000, description="OCSF query string")
    timeRange: str = Field(default="1h", max_length=50, description="Time range for query")
    limit: int = Field(default=100, ge=1, le=10000, description="Maximum number of results")
    offset: int = Field(default=0, ge=0, le=100000, description="Offset for pagination")
    sortBy: str = Field(default="time", max_length=50, description="Field to sort by")
    sortOrder: str = Field(default="desc", description="Sort order (asc/desc)")
    
    @validator('query')
    def validate_query_security(cls, v):
        """Enhanced query validation with security checks"""
        validation_result = UserFriendlyValidator.validate_query_with_help(v)
        if not validation_result["valid"]:
            # Return user-friendly error message
            errors = validation_result["errors"]
            suggestions = validation_result["suggestions"]
            error_msg = f"Query validation failed: {'; '.join(errors)}. Suggestions: {'; '.join(suggestions[:2])}"
            raise ValueError(error_msg)
        return sanitize_string(v, max_length=10000)
    
    @validator('timeRange')
    def validate_time_range(cls, v):
        """Validate time range format"""
        valid_ranges = ['1m', '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1d', '3d', '7d', '30d']
        if v not in valid_ranges:
            raise ValueError(f"Invalid time range. Valid options: {', '.join(valid_ranges)}")
        return v
    
    @validator('sortBy')
    def validate_sort_field(cls, v):
        """Validate sort field"""
        valid_fields = ['time', 'severity', 'activity_name', 'user_name', 'src_endpoint_ip', 'dst_endpoint_ip']
        if v not in valid_fields:
            raise ValueError(f"Invalid sort field. Valid options: {', '.join(valid_fields)}")
        return v
    
    @validator('sortOrder')
    def validate_sort_order(cls, v):
        """Validate sort order"""
        if v.lower() not in ['asc', 'desc']:
            raise ValueError("Sort order must be 'asc' or 'desc'")
        return v.lower()

class QueryValidationRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=10000, description="Query to validate")
    
    @validator('query')
    def validate_query_input(cls, v):
        """Basic query input validation"""
        return sanitize_string(v, max_length=10000)

class QuerySuggestionRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=10000, description="Partial query")
    position: int = Field(..., ge=0, le=10000, description="Cursor position in query")
    
    @validator('query')
    def validate_query_input(cls, v):
        """Basic query input validation"""
        return sanitize_string(v, max_length=10000)

class QueryResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    total: int = 0
    results: List[Dict[str, Any]] = []
    error: Optional[str] = None
    execution_time: Optional[float] = None

class ValidationResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
    suggestions: List[str] = []
    warnings: List[str] = []

class SuggestionResponse(BaseModel):
    success: bool
    suggestions: List[Dict[str, Any]] = []

# Mock data for demonstration (replace with real database queries)
MOCK_LOG_DATA = [
    {
        "id": 1,
        "time": "2024-01-15T10:30:00Z",
        "activity_name": "failed_login",
        "user_name": "john.doe",
        "src_endpoint_ip": "192.168.1.100",
        "severity": "medium",
        "message": "Failed login attempt for user john.doe from 192.168.1.100",
        "device_name": "WORKSTATION-01",
        "category_uid": 1,
        "class_uid": 1001
    },
    {
        "id": 2,
        "time": "2024-01-15T10:31:15Z",
        "activity_name": "process_started",
        "process_name": "powershell.exe",
        "device_name": "WORKSTATION-01",
        "severity": "low",
        "message": "Process powershell.exe started on WORKSTATION-01",
        "user_name": "admin",
        "process_cmd_line": "powershell.exe -ExecutionPolicy Bypass -File script.ps1",
        "category_uid": 1,
        "class_uid": 1002
    },
    {
        "id": 3,
        "time": "2024-01-15T10:32:30Z",
        "activity_name": "file_created",
        "file_name": "suspicious.exe",
        "file_path": "C:\\temp\\suspicious.exe",
        "user_name": "admin",
        "severity": "high",
        "message": "File suspicious.exe created by admin in C:\\temp\\",
        "device_name": "WORKSTATION-01",
        "file_hash_sha256": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        "category_uid": 1,
        "class_uid": 1003
    },
    {
        "id": 4,
        "time": "2024-01-15T10:33:45Z",
        "activity_name": "network_connection",
        "src_endpoint_ip": "192.168.1.50",
        "dst_endpoint_ip": "8.8.8.8",
        "dst_endpoint_port": 53,
        "network_protocol": "UDP",
        "severity": "low",
        "message": "DNS query from 192.168.1.50 to 8.8.8.8:53",
        "device_name": "WORKSTATION-02",
        "category_uid": 1,
        "class_uid": 1004
    },
    {
        "id": 5,
        "time": "2024-01-15T10:34:20Z",
        "activity_name": "privilege_escalation",
        "user_name": "service_account",
        "device_name": "SERVER-01",
        "severity": "critical",
        "message": "Privilege escalation attempt by service_account on SERVER-01",
        "src_endpoint_ip": "192.168.1.200",
        "category_uid": 1,
        "class_uid": 1005
    },
    {
        "id": 6,
        "time": "2024-01-15T10:35:10Z",
        "activity_name": "registry_modified",
        "registry_key": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
        "registry_value": "StartupProgram",
        "registry_data": "C:\\Program Files\\App\\app.exe",
        "user_name": "admin",
        "severity": "medium",
        "message": "Registry key modified: StartupProgram",
        "device_name": "WORKSTATION-01",
        "category_uid": 1,
        "class_uid": 1006
    },
    {
        "id": 7,
        "time": "2024-01-15T10:36:00Z",
        "activity_name": "dns_query",
        "dns_question_name": "malicious-domain.net",
        "dns_question_type": "A",
        "dns_answer_data": "192.168.1.100",
        "src_endpoint_ip": "192.168.1.50",
        "severity": "high",
        "message": "DNS query for malicious-domain.net",
        "device_name": "WORKSTATION-02",
        "category_uid": 1,
        "class_uid": 1007
    },
    {
        "id": 8,
        "time": "2024-01-15T10:37:30Z",
        "activity_name": "http_request",
        "http_request_method": "POST",
        "http_request_url": "https://example.com/api/data",
        "http_response_status_code": 200,
        "src_endpoint_ip": "192.168.1.100",
        "severity": "low",
        "message": "HTTP POST request to example.com",
        "device_name": "WORKSTATION-01",
        "category_uid": 1,
        "class_uid": 1008
    }
]

@router.post("/search", response_model=QueryResponse)
async def execute_query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Execute an OCSF query against the log database
    """
    try:
        start_time = datetime.now()
        
        # Parse and validate the query
        parsed_query = parse_ocsf_query(request.query)
        
        # Apply filters to mock data (replace with real database query)
        filtered_results = apply_query_filters(MOCK_LOG_DATA, parsed_query)
        
        # Apply time range filter
        filtered_results = apply_time_range(filtered_results, request.timeRange)
        
        # Sort results
        filtered_results = sort_results(filtered_results, request.sortBy, request.sortOrder)
        
        # Apply pagination
        total = len(filtered_results)
        paginated_results = filtered_results[request.offset:request.offset + request.limit]
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Query executed by user {current_user.username}: {request.query}")
        
        return QueryResponse(
            success=True,
            data={
                "query": request.query,
                "timeRange": request.timeRange,
                "execution_time": execution_time
            },
            total=total,
            results=paginated_results,
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"Query execution failed: {str(e)}")
        return QueryResponse(
            success=False,
            error=str(e),
            results=[]
        )

@router.post("/validate", response_model=ValidationResponse)
async def validate_query(
    request: QueryValidationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Validate an OCSF query for syntax and field correctness
    """
    try:
        # Parse the query to check for syntax errors
        parsed_query = parse_ocsf_query(request.query)
        
        # Validate field names and operators
        validation_result = validate_query_fields(parsed_query)
        
        return ValidationResponse(
            valid=validation_result["valid"],
            error=validation_result.get("error"),
            suggestions=validation_result.get("suggestions", []),
            warnings=validation_result.get("warnings", [])
        )
        
    except Exception as e:
        return ValidationResponse(
            valid=False,
            error=f"Query validation failed: {str(e)}"
        )

@router.post("/suggestions", response_model=SuggestionResponse)
async def get_suggestions(
    request: QuerySuggestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get query suggestions based on partial input
    """
    try:
        suggestions = generate_query_suggestions(request.query, request.position)
        
        return SuggestionResponse(
            success=True,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Failed to get suggestions: {str(e)}")
        return SuggestionResponse(
            success=False,
            suggestions=[]
        )

@router.get("/fields")
async def get_field_metadata(current_user: User = Depends(get_current_user)):
    """
    Get available OCSF fields and their metadata
    """
    try:
        # This would typically come from a database or configuration
        fields = {
            "activity": [
                {"name": "activity_name", "type": "string", "description": "Activity name"},
                {"name": "severity", "type": "string", "description": "Severity level"},
                {"name": "category_uid", "type": "integer", "description": "Category ID"}
            ],
            "user": [
                {"name": "user_name", "type": "string", "description": "User name"},
                {"name": "user_type", "type": "string", "description": "User type"}
            ],
            "network": [
                {"name": "src_endpoint_ip", "type": "ip_address", "description": "Source IP"},
                {"name": "dst_endpoint_ip", "type": "ip_address", "description": "Destination IP"},
                {"name": "dst_endpoint_port", "type": "integer", "description": "Destination port"}
            ],
            "file": [
                {"name": "file_name", "type": "string", "description": "File name"},
                {"name": "file_path", "type": "string", "description": "File path"},
                {"name": "file_hash_sha256", "type": "string", "description": "File SHA256 hash"}
            ],
            "process": [
                {"name": "process_name", "type": "string", "description": "Process name"},
                {"name": "process_cmd_line", "type": "string", "description": "Process command line"}
            ],
            "registry": [
                {"name": "registry_key", "type": "string", "description": "Registry key"},
                {"name": "registry_value", "type": "string", "description": "Registry value"},
                {"name": "registry_data", "type": "string", "description": "Registry data"}
            ],
            "dns": [
                {"name": "dns_question_name", "type": "string", "description": "DNS query name"},
                {"name": "dns_question_type", "type": "string", "description": "DNS query type"},
                {"name": "dns_answer_data", "type": "string", "description": "DNS answer data"}
            ],
            "http": [
                {"name": "http_request_method", "type": "string", "description": "HTTP method"},
                {"name": "http_request_url", "type": "string", "description": "HTTP URL"},
                {"name": "http_response_status_code", "type": "integer", "description": "HTTP status code"}
            ]
        }
        
        return {"fields": fields}
        
    except Exception as e:
        logger.error(f"Failed to get field metadata: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get field metadata")

@router.post("/export")
async def export_results(
    request: QueryRequest,
    format: str = Query("json", description="Export format (json, csv)"),
    current_user: User = Depends(get_current_user)
):
    """
    Export query results in various formats
    """
    try:
        # Execute the query first
        query_response = await execute_query(request, current_user)
        
        if not query_response.success:
            raise HTTPException(status_code=400, detail=query_response.error)
        
        if format.lower() == "csv":
            return export_csv(query_response.results, f"query_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        else:
            return export_json(query_response.results, f"query_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            
    except Exception as e:
        logger.error(f"Export failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/metrics")
async def get_query_metrics(
    request: QueryValidationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get query performance metrics and optimization suggestions
    """
    try:
        # Parse the query
        parsed_query = parse_ocsf_query(request.query)
        
        # Generate metrics and suggestions
        metrics = {
            "estimated_execution_time": estimate_query_time(parsed_query),
            "complexity_score": calculate_query_complexity(parsed_query),
            "optimization_suggestions": generate_optimization_suggestions(parsed_query),
            "index_recommendations": get_index_recommendations(parsed_query)
        }
        
        return {"metrics": metrics}
        
    except Exception as e:
        logger.error(f"Failed to get query metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get query metrics: {str(e)}")

# Helper functions
def parse_ocsf_query(query: str) -> Dict[str, Any]:
    """
    Parse an OCSF query string into a structured format
    """
    # Simple query parser (replace with more sophisticated parser)
    conditions = []
    
    # Split by AND/OR operators
    parts = re.split(r'\s+(?:AND|OR)\s+', query, flags=re.IGNORECASE)
    
    for part in parts:
        part = part.strip()
        
        # Parse different operator types
        if ' = ' in part:
            field, value = part.split(' = ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'equals',
                'value': value.strip().strip('"\'')
            })
        elif ' CONTAINS ' in part:
            field, value = part.split(' CONTAINS ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'contains',
                'value': value.strip().strip('"\'')
            })
        elif ' > ' in part:
            field, value = part.split(' > ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'greater_than',
                'value': value.strip()
            })
        elif ' < ' in part:
            field, value = part.split(' < ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'less_than',
                'value': value.strip()
            })
        elif ' >= ' in part:
            field, value = part.split(' >= ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'greater_equal',
                'value': value.strip()
            })
        elif ' <= ' in part:
            field, value = part.split(' <= ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'less_equal',
                'value': value.strip()
            })
        elif ' IN ' in part:
            field, value = part.split(' IN ', 1)
            # Parse list values
            value = value.strip().strip('()')
            values = [v.strip().strip('"\'') for v in value.split(',')]
            conditions.append({
                'field': field.strip(),
                'operator': 'in',
                'value': values
            })
        elif ' REGEX ' in part:
            field, value = part.split(' REGEX ', 1)
            conditions.append({
                'field': field.strip(),
                'operator': 'regex',
                'value': value.strip().strip('"\'')
            })
    
    return {
        'conditions': conditions,
        'original_query': query
    }

def apply_query_filters(data: List[Dict], parsed_query: Dict) -> List[Dict]:
    """
    Apply parsed query conditions to filter data
    """
    filtered_data = data.copy()
    
    for condition in parsed_query['conditions']:
        field = condition['field']
        operator = condition['operator']
        value = condition['value']
        
        filtered_data = [item for item in filtered_data if evaluate_condition(item, field, operator, value)]
    
    return filtered_data

def evaluate_condition(item: Dict, field: str, operator: str, value: Any) -> bool:
    """
    Evaluate a single condition against a log item
    """
    item_value = item.get(field)
    
    if item_value is None:
        return False
    
    try:
        if operator == 'equals':
            return str(item_value).lower() == str(value).lower()
        elif operator == 'contains':
            return str(value).lower() in str(item_value).lower()
        elif operator == 'greater_than':
            return float(item_value) > float(value)
        elif operator == 'less_than':
            return float(item_value) < float(value)
        elif operator == 'greater_equal':
            return float(item_value) >= float(value)
        elif operator == 'less_equal':
            return float(item_value) <= float(value)
        elif operator == 'in':
            return str(item_value).lower() in [str(v).lower() for v in value]
        elif operator == 'regex':
            return bool(re.search(value, str(item_value), re.IGNORECASE))
        else:
            return False
    except (ValueError, TypeError):
        return False

def apply_time_range(data: List[Dict], time_range: str) -> List[Dict]:
    """
    Apply time range filter to data
    """
    now = datetime.now()
    
    if time_range == "15m":
        cutoff = now - timedelta(minutes=15)
    elif time_range == "1h":
        cutoff = now - timedelta(hours=1)
    elif time_range == "24h":
        cutoff = now - timedelta(hours=24)
    elif time_range == "7d":
        cutoff = now - timedelta(days=7)
    elif time_range == "30d":
        cutoff = now - timedelta(days=30)
    else:
        return data
    
    filtered_data = []
    for item in data:
        try:
            item_time = datetime.fromisoformat(item['time'].replace('Z', '+00:00'))
            if item_time >= cutoff:
                filtered_data.append(item)
        except (ValueError, KeyError):
            continue
    
    return filtered_data

def sort_results(data: List[Dict], sort_by: str, sort_order: str) -> List[Dict]:
    """
    Sort results by specified field and order
    """
    try:
        reverse = sort_order.lower() == 'desc'
        return sorted(data, key=lambda x: x.get(sort_by, ''), reverse=reverse)
    except (KeyError, TypeError):
        return data

def validate_query_fields(parsed_query: Dict) -> Dict[str, Any]:
    """
    Validate field names and operators in the query
    """
    valid_fields = {
        'activity_name', 'severity', 'user_name', 'src_endpoint_ip', 'dst_endpoint_ip',
        'file_name', 'process_name', 'registry_key', 'dns_question_name', 'http_request_method'
    }
    
    valid_operators = {
        'equals', 'contains', 'greater_than', 'less_than', 'greater_equal', 
        'less_equal', 'in', 'regex'
    }
    
    suggestions = []
    warnings = []
    
    for condition in parsed_query['conditions']:
        field = condition['field']
        operator = condition['operator']
        
        if field not in valid_fields:
            suggestions.append(f"Unknown field '{field}'. Did you mean one of: {', '.join(valid_fields)}?")
        
        if operator not in valid_operators:
            suggestions.append(f"Unknown operator '{operator}'. Valid operators: {', '.join(valid_operators)}")
    
    return {
        'valid': len(suggestions) == 0,
        'suggestions': suggestions,
        'warnings': warnings
    }

def generate_query_suggestions(query: str, position: int) -> List[Dict[str, Any]]:
    """
    Generate query suggestions based on partial input
    """
    suggestions = []
    
    # Field suggestions
    field_suggestions = [
        {"type": "field", "value": "activity_name", "description": "Activity name"},
        {"type": "field", "value": "severity", "description": "Severity level"},
        {"type": "field", "value": "user_name", "description": "User name"},
        {"type": "field", "value": "src_endpoint_ip", "description": "Source IP address"},
        {"type": "field", "value": "dst_endpoint_ip", "description": "Destination IP address"},
        {"type": "field", "value": "file_name", "description": "File name"},
        {"type": "field", "value": "process_name", "description": "Process name"}
    ]
    
    # Operator suggestions
    operator_suggestions = [
        {"type": "operator", "value": "=", "description": "Equals"},
        {"type": "operator", "value": "CONTAINS", "description": "Contains"},
        {"type": "operator", "value": ">", "description": "Greater than"},
        {"type": "operator", "value": "<", "description": "Less than"},
        {"type": "operator", "value": "IN", "description": "In list"},
        {"type": "operator", "value": "REGEX", "description": "Regular expression"}
    ]
    
    # Value suggestions
    value_suggestions = [
        {"type": "value", "value": "failed_login", "description": "Failed login activity"},
        {"type": "value", "value": "high", "description": "High severity"},
        {"type": "value", "value": "critical", "description": "Critical severity"},
        {"type": "value", "value": "powershell.exe", "description": "PowerShell process"},
        {"type": "value", "value": "192.168.1.100", "description": "Example IP address"}
    ]
    
    # Combine all suggestions
    suggestions.extend(field_suggestions)
    suggestions.extend(operator_suggestions)
    suggestions.extend(value_suggestions)
    
    return suggestions

def estimate_query_time(parsed_query: Dict) -> float:
    """
    Estimate query execution time based on complexity
    """
    base_time = 0.1  # Base execution time in seconds
    complexity_factor = len(parsed_query['conditions']) * 0.05
    
    return base_time + complexity_factor

def calculate_query_complexity(parsed_query: Dict) -> int:
    """
    Calculate query complexity score (1-10)
    """
    score = 1
    score += len(parsed_query['conditions']) * 2
    
    # Add complexity for regex operations
    for condition in parsed_query['conditions']:
        if condition['operator'] == 'regex':
            score += 3
    
    return min(score, 10)

def generate_optimization_suggestions(parsed_query: Dict) -> List[str]:
    """
    Generate query optimization suggestions
    """
    suggestions = []
    
    # Check for time range
    has_time_filter = any(condition['field'] == 'time' for condition in parsed_query['conditions'])
    if not has_time_filter:
        suggestions.append("Add a time filter to improve query performance")
    
    # Check for high-cardinality fields
    high_cardinality_fields = ['src_endpoint_ip', 'dst_endpoint_ip', 'file_hash_sha256']
    for condition in parsed_query['conditions']:
        if condition['field'] in high_cardinality_fields:
            suggestions.append(f"Consider adding an index on {condition['field']} for better performance")
    
    # Check for regex usage
    has_regex = any(condition['operator'] == 'regex' for condition in parsed_query['conditions'])
    if has_regex:
        suggestions.append("Regex operations can be slow. Consider using exact matches when possible")
    
    return suggestions

def get_index_recommendations(parsed_query: Dict) -> List[str]:
    """
    Get index recommendations for the query
    """
    recommendations = []
    
    for condition in parsed_query['conditions']:
        field = condition['field']
        if field in ['time', 'activity_name', 'severity', 'user_name']:
            recommendations.append(f"Index on {field} for faster filtering")
    
    return list(set(recommendations))

def export_csv(data: List[Dict], filename: str):
    """
    Export data as CSV
    """
    if not data:
        raise HTTPException(status_code=400, detail="No data to export")
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def export_json(data: List[Dict], filename: str):
    """
    Export data as JSON
    """
    json_data = json.dumps(data, indent=2, default=str)
    
    return StreamingResponse(
        io.BytesIO(json_data.encode('utf-8')),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
