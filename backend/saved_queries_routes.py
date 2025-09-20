# Saved queries routes for JupiterEmerge SIEM
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from auth_middleware import get_current_user
from models.user_management import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/queries", tags=["queries"])

# Pydantic models
class SavedQuery(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., description="Query name")
    description: Optional[str] = Field(None, description="Query description")
    query: str = Field(..., description="OCSF query string")
    conditions: Optional[List[Dict[str, Any]]] = Field(None, description="Visual query conditions")
    mode: str = Field(default="visual", description="Query mode (visual/text)")
    tags: List[str] = Field(default=[], description="Query tags")
    is_public: bool = Field(default=False, description="Whether query is public")
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SavedQueryResponse(BaseModel):
    success: bool
    query: Optional[SavedQuery] = None
    error: Optional[str] = None

class SavedQueriesResponse(BaseModel):
    success: bool
    queries: List[SavedQuery] = []
    error: Optional[str] = None

# In-memory storage for demo (replace with database)
SAVED_QUERIES_DB = {}
QUERY_ID_COUNTER = 1

# Default saved queries
DEFAULT_QUERIES = [
    {
        "name": "Failed Login Attempts",
        "description": "Find failed authentication attempts in the last 24 hours",
        "query": "activity_name = \"failed_login\" AND time >= \"2024-01-01T00:00:00Z\"",
        "conditions": [
            {"field": "activity_name", "operator": "equals", "value": "failed_login"},
            {"field": "time", "operator": "greater_equal", "value": "2024-01-01T00:00:00Z"}
        ],
        "mode": "visual",
        "tags": ["authentication", "security", "login"],
        "is_public": True
    },
    {
        "name": "Suspicious Process Execution",
        "description": "Detect potentially malicious process executions",
        "query": "process_name IN (\"powershell.exe\", \"cmd.exe\", \"wscript.exe\") AND severity = \"high\"",
        "conditions": [
            {"field": "process_name", "operator": "in", "value": "powershell.exe, cmd.exe, wscript.exe"},
            {"field": "severity", "operator": "equals", "value": "high"}
        ],
        "mode": "visual",
        "tags": ["process", "malware", "execution"],
        "is_public": True
    },
    {
        "name": "External Network Connections",
        "description": "Find connections to external IP addresses",
        "query": "dst_endpoint_ip NOT IN (\"192.168.0.0/16\", \"10.0.0.0/8\", \"172.16.0.0/12\")",
        "conditions": [
            {"field": "dst_endpoint_ip", "operator": "not_in", "value": "192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12"}
        ],
        "mode": "visual",
        "tags": ["network", "external", "connections"],
        "is_public": True
    },
    {
        "name": "High Severity Events",
        "description": "Find all high and critical severity events",
        "query": "severity IN (\"high\", \"critical\")",
        "conditions": [
            {"field": "severity", "operator": "in", "value": "high, critical"}
        ],
        "mode": "visual",
        "tags": ["severity", "critical", "high"],
        "is_public": True
    },
    {
        "name": "Registry Modifications",
        "description": "Monitor Windows registry changes",
        "query": "activity_name = \"registry_modified\" AND registry_key CONTAINS \"Run\"",
        "conditions": [
            {"field": "activity_name", "operator": "equals", "value": "registry_modified"},
            {"field": "registry_key", "operator": "contains", "value": "Run"}
        ],
        "mode": "visual",
        "tags": ["registry", "windows", "persistence"],
        "is_public": True
    }
]

# Initialize with default queries
for query_data in DEFAULT_QUERIES:
    query = SavedQuery(
        id=QUERY_ID_COUNTER,
        name=query_data["name"],
        description=query_data["description"],
        query=query_data["query"],
        conditions=query_data["conditions"],
        mode=query_data["mode"],
        tags=query_data["tags"],
        is_public=query_data["is_public"],
        created_by="system",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    SAVED_QUERIES_DB[QUERY_ID_COUNTER] = query
    QUERY_ID_COUNTER += 1

@router.post("/", response_model=SavedQueryResponse)
async def create_saved_query(
    query_data: SavedQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new saved query
    """
    try:
        global QUERY_ID_COUNTER
        
        # Create new query
        new_query = SavedQuery(
            id=QUERY_ID_COUNTER,
            name=query_data.name,
            description=query_data.description,
            query=query_data.query,
            conditions=query_data.conditions,
            mode=query_data.mode,
            tags=query_data.tags,
            is_public=query_data.is_public,
            created_by=current_user.username,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        SAVED_QUERIES_DB[QUERY_ID_COUNTER] = new_query
        QUERY_ID_COUNTER += 1
        
        logger.info(f"Query created by user {current_user.username}: {new_query.name}")
        
        return SavedQueryResponse(
            success=True,
            query=new_query
        )
        
    except Exception as e:
        logger.error(f"Failed to create saved query: {str(e)}")
        return SavedQueryResponse(
            success=False,
            error=str(e)
        )

@router.get("/", response_model=SavedQueriesResponse)
async def get_saved_queries(
    current_user: User = Depends(get_current_user),
    tags: Optional[str] = None,
    is_public: Optional[bool] = None
):
    """
    Get saved queries for the current user
    """
    try:
        queries = []
        
        for query in SAVED_QUERIES_DB.values():
            # Filter by user access
            if query.is_public or query.created_by == current_user.username:
                # Filter by tags if specified
                if tags:
                    tag_list = [tag.strip() for tag in tags.split(',')]
                    if not any(tag in query.tags for tag in tag_list):
                        continue
                
                # Filter by public status if specified
                if is_public is not None and query.is_public != is_public:
                    continue
                
                queries.append(query)
        
        # Sort by creation date (newest first)
        queries.sort(key=lambda x: x.created_at, reverse=True)
        
        return SavedQueriesResponse(
            success=True,
            queries=queries
        )
        
    except Exception as e:
        logger.error(f"Failed to get saved queries: {str(e)}")
        return SavedQueriesResponse(
            success=False,
            error=str(e)
        )

@router.get("/{query_id}", response_model=SavedQueryResponse)
async def get_saved_query(
    query_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific saved query by ID
    """
    try:
        if query_id not in SAVED_QUERIES_DB:
            raise HTTPException(status_code=404, detail="Query not found")
        
        query = SAVED_QUERIES_DB[query_id]
        
        # Check access permissions
        if not query.is_public and query.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return SavedQueryResponse(
            success=True,
            query=query
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get saved query {query_id}: {str(e)}")
        return SavedQueryResponse(
            success=False,
            error=str(e)
        )

@router.put("/{query_id}", response_model=SavedQueryResponse)
async def update_saved_query(
    query_id: int,
    query_data: SavedQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing saved query
    """
    try:
        if query_id not in SAVED_QUERIES_DB:
            raise HTTPException(status_code=404, detail="Query not found")
        
        existing_query = SAVED_QUERIES_DB[query_id]
        
        # Check ownership
        if existing_query.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update query
        updated_query = SavedQuery(
            id=query_id,
            name=query_data.name,
            description=query_data.description,
            query=query_data.query,
            conditions=query_data.conditions,
            mode=query_data.mode,
            tags=query_data.tags,
            is_public=query_data.is_public,
            created_by=existing_query.created_by,
            created_at=existing_query.created_at,
            updated_at=datetime.now()
        )
        
        SAVED_QUERIES_DB[query_id] = updated_query
        
        logger.info(f"Query updated by user {current_user.username}: {updated_query.name}")
        
        return SavedQueryResponse(
            success=True,
            query=updated_query
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update saved query {query_id}: {str(e)}")
        return SavedQueryResponse(
            success=False,
            error=str(e)
        )

@router.delete("/{query_id}")
async def delete_saved_query(
    query_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a saved query
    """
    try:
        if query_id not in SAVED_QUERIES_DB:
            raise HTTPException(status_code=404, detail="Query not found")
        
        query = SAVED_QUERIES_DB[query_id]
        
        # Check ownership
        if query.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete query
        del SAVED_QUERIES_DB[query_id]
        
        logger.info(f"Query deleted by user {current_user.username}: {query.name}")
        
        return {"success": True, "message": "Query deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete saved query {query_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete query: {str(e)}")

@router.post("/{query_id}/duplicate", response_model=SavedQueryResponse)
async def duplicate_saved_query(
    query_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Duplicate an existing saved query
    """
    try:
        if query_id not in SAVED_QUERIES_DB:
            raise HTTPException(status_code=404, detail="Query not found")
        
        original_query = SAVED_QUERIES_DB[query_id]
        
        # Check access permissions
        if not original_query.is_public and original_query.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        global QUERY_ID_COUNTER
        
        # Create duplicate
        duplicated_query = SavedQuery(
            id=QUERY_ID_COUNTER,
            name=f"{original_query.name} (Copy)",
            description=original_query.description,
            query=original_query.query,
            conditions=original_query.conditions,
            mode=original_query.mode,
            tags=original_query.tags,
            is_public=False,  # Duplicates are private by default
            created_by=current_user.username,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        SAVED_QUERIES_DB[QUERY_ID_COUNTER] = duplicated_query
        QUERY_ID_COUNTER += 1
        
        logger.info(f"Query duplicated by user {current_user.username}: {duplicated_query.name}")
        
        return SavedQueryResponse(
            success=True,
            query=duplicated_query
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to duplicate saved query {query_id}: {str(e)}")
        return SavedQueryResponse(
            success=False,
            error=str(e)
        )

@router.get("/tags/list")
async def get_query_tags(current_user: User = Depends(get_current_user)):
    """
    Get all available query tags
    """
    try:
        tags = set()
        
        for query in SAVED_QUERIES_DB.values():
            # Include tags from public queries or user's own queries
            if query.is_public or query.created_by == current_user.username:
                tags.update(query.tags)
        
        return {
            "success": True,
            "tags": sorted(list(tags))
        }
        
    except Exception as e:
        logger.error(f"Failed to get query tags: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get query tags: {str(e)}")

@router.post("/{query_id}/favorite")
async def toggle_query_favorite(
    query_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle favorite status for a query (placeholder for future implementation)
    """
    try:
        if query_id not in SAVED_QUERIES_DB:
            raise HTTPException(status_code=404, detail="Query not found")
        
        query = SAVED_QUERIES_DB[query_id]
        
        # Check access permissions
        if not query.is_public and query.created_by != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # For now, just return success (favorites feature can be implemented later)
        return {"success": True, "message": "Favorite status toggled"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle favorite for query {query_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to toggle favorite: {str(e)}")

@router.get("/search/{search_term}")
async def search_saved_queries(
    search_term: str,
    current_user: User = Depends(get_current_user)
):
    """
    Search saved queries by name, description, or tags
    """
    try:
        search_term_lower = search_term.lower()
        matching_queries = []
        
        for query in SAVED_QUERIES_DB.values():
            # Check access permissions
            if not query.is_public and query.created_by != current_user.username:
                continue
            
            # Search in name, description, and tags
            if (search_term_lower in query.name.lower() or
                (query.description and search_term_lower in query.description.lower()) or
                any(search_term_lower in tag.lower() for tag in query.tags)):
                matching_queries.append(query)
        
        # Sort by relevance (name matches first, then description, then tags)
        def relevance_score(q):
            score = 0
            if search_term_lower in q.name.lower():
                score += 10
            if q.description and search_term_lower in q.description.lower():
                score += 5
            if any(search_term_lower in tag.lower() for tag in q.tags):
                score += 1
            return score
        
        matching_queries.sort(key=relevance_score, reverse=True)
        
        return {
            "success": True,
            "queries": matching_queries,
            "total": len(matching_queries)
        }
        
    except Exception as e:
        logger.error(f"Failed to search saved queries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search queries: {str(e)}")
