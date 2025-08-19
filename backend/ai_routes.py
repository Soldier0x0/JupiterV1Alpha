"""
AI and RAG API Routes for Project Jupiter
Provides endpoints for AI-powered security analysis and chat functionality
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import uuid

from .server import get_current_user
from .ai_services import ai_service_manager

# Create API router
router = APIRouter(prefix="/api/ai", tags=["AI & Intelligence"])

# Pydantic Models
class ThreatAnalysisRequest(BaseModel):
    source_ip: Optional[str] = None
    technique: Optional[str] = None
    severity: str = "medium"
    indicators: List[str] = []
    timeline: Optional[str] = None
    metadata: Dict[str, Any] = {}
    model_preference: str = "auto"  # auto, local:model_name, cloud:provider:model

class AIChartRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    model_preference: str = "auto"
    context_type: str = "security"  # security, general, threat_intel

class SecurityDocumentRequest(BaseModel):
    content: str
    document_type: str  # ioc, alert, report, policy, etc.
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class APIKeyConfigRequest(BaseModel):
    provider: str  # openai, anthropic, google, emergent
    api_key: str
    model_config: Dict[str, Any] = {}

class RAGSearchRequest(BaseModel):
    query: str
    limit: int = 5
    document_types: List[str] = []

# AI Analysis Endpoints
@router.post("/analyze/threat")
async def analyze_threat(
    request: ThreatAnalysisRequest,
    current_user: Dict = Depends(get_current_user)
):
    """AI-powered threat analysis using RAG and LLM"""
    try:
        tenant_id = current_user["tenant_id"]
        
        threat_data = {
            "source_ip": request.source_ip,
            "technique": request.technique,
            "severity": request.severity,
            "indicators": request.indicators,
            "timeline": request.timeline,
            "metadata": request.metadata
        }
        
        result = await ai_service_manager.ai_threat_analysis(
            threat_data=threat_data,
            tenant_id=tenant_id,
            model_preference=request.model_preference
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/chat")
async def ai_chat(
    request: AIChartRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Interactive AI chat for security analysis"""
    try:
        tenant_id = current_user["tenant_id"]
        session_id = request.session_id or str(uuid.uuid4())
        
        # Build context-aware prompt based on chat type
        if request.context_type == "security":
            system_context = """You are a cybersecurity expert AI assistant for Project Jupiter SIEM platform. 
            Help users with threat analysis, security investigations, and incident response. 
            Provide actionable insights and recommendations."""
        elif request.context_type == "threat_intel":
            system_context = """You are a threat intelligence analyst AI. 
            Help users understand threat actors, attack techniques, and IOCs. 
            Provide strategic intelligence and attribution analysis."""
        else:
            system_context = "You are a helpful AI assistant for security operations."
        
        # RAG search for relevant context
        rag_results = await ai_service_manager.rag_search(
            query=request.message,
            tenant_id=tenant_id,
            limit=3
        )
        
        # Build contextual prompt
        context = "\n".join([doc['content'] for doc in rag_results[:2]])  # Limit context length
        
        full_prompt = f"""
        Context from security knowledge base:
        {context}
        
        User question: {request.message}
        
        Please provide a helpful response based on the context and your security expertise.
        """
        
        # Choose analysis method
        if request.model_preference == "auto":
            if "emergent" in ai_service_manager.cloud_clients:
                result = await ai_service_manager.analyze_with_cloud_llm(
                    full_prompt, "emergent", "gpt-4o-mini"
                )
            elif ai_service_manager.local_models:
                result = await ai_service_manager.analyze_with_local_llm(
                    full_prompt, "llama2:7b"
                )
            else:
                raise Exception("No AI models available")
        else:
            # Handle specific model preferences
            if request.model_preference.startswith("local:"):
                model_name = request.model_preference.replace("local:", "")
                result = await ai_service_manager.analyze_with_local_llm(full_prompt, model_name)
            elif request.model_preference.startswith("cloud:"):
                parts = request.model_preference.replace("cloud:", "").split(":")
                provider, model = parts[0], parts[1] if len(parts) > 1 else "gpt-4o-mini"
                result = await ai_service_manager.analyze_with_cloud_llm(full_prompt, provider, model)
        
        # Store chat history
        ai_service_manager.ai_chats_collection.insert_one({
            "_id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "session_id": session_id,
            "type": "chat",
            "user_message": request.message,
            "ai_response": result,
            "context_type": request.context_type,
            "rag_context": rag_results,
            "created_at": datetime.utcnow()
        })
        
        return {
            "session_id": session_id,
            "response": result,
            "context_used": len(rag_results),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# RAG and Knowledge Management
@router.post("/knowledge/add")
async def add_security_document(
    request: SecurityDocumentRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Add security document to RAG knowledge base"""
    try:
        tenant_id = current_user["tenant_id"]
        
        metadata = {
            "document_type": request.document_type,
            "tags": request.tags,
            "added_by": current_user["user_id"],
            **request.metadata
        }
        
        doc_id = await ai_service_manager.add_security_document(
            content=request.content,
            metadata=metadata,
            tenant_id=tenant_id
        )
        
        return {
            "document_id": doc_id,
            "message": "Document added to knowledge base successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add document: {str(e)}")

@router.post("/knowledge/search")
async def search_knowledge_base(
    request: RAGSearchRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Search RAG knowledge base"""
    try:
        tenant_id = current_user["tenant_id"]
        
        results = await ai_service_manager.rag_search(
            query=request.query,
            tenant_id=tenant_id,
            limit=request.limit
        )
        
        return {
            "query": request.query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Model Management
@router.get("/models")
async def get_available_models(current_user: Dict = Depends(get_current_user)):
    """Get available AI models and configurations"""
    try:
        models = await ai_service_manager.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

@router.post("/config/api-key")
async def save_ai_api_key(
    request: APIKeyConfigRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Save AI provider API key configuration"""
    try:
        tenant_id = current_user["tenant_id"]
        
        success = await ai_service_manager.save_api_key(
            tenant_id=tenant_id,
            provider=request.provider,
            api_key=request.api_key,
            model_config=request.model_config
        )
        
        if success:
            return {"message": f"{request.provider} API key saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save API key")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration failed: {str(e)}")

# Chat History
@router.get("/chat/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: Dict = Depends(get_current_user)
):
    """Get AI chat history"""
    try:
        tenant_id = current_user["tenant_id"]
        
        query = {"tenant_id": tenant_id, "type": "chat"}
        if session_id:
            query["session_id"] = session_id
        
        chats = list(
            ai_service_manager.ai_chats_collection
            .find(query)
            .sort("created_at", -1)
            .limit(limit)
        )
        
        # Convert ObjectIds and dates to strings
        for chat in chats:
            chat["_id"] = str(chat["_id"])
            if "created_at" in chat:
                chat["created_at"] = chat["created_at"].isoformat()
        
        return {"chats": chats, "count": len(chats)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

# System Intelligence
@router.get("/intelligence/summary")
async def get_ai_intelligence_summary(current_user: Dict = Depends(get_current_user)):
    """Get AI-powered intelligence summary for dashboard"""
    try:
        tenant_id = current_user["tenant_id"]
        
        # Get recent AI analyses
        recent_analyses = list(
            ai_service_manager.ai_chats_collection
            .find({"tenant_id": tenant_id})
            .sort("created_at", -1)
            .limit(10)
        )
        
        # Get knowledge base stats
        kb_stats = ai_service_manager.vector_documents_collection.count_documents(
            {"tenant_id": tenant_id}
        )
        
        # Get available models
        models = await ai_service_manager.get_available_models()
        
        summary = {
            "recent_analyses": len(recent_analyses),
            "knowledge_documents": kb_stats,
            "available_models": models,
            "ai_health": {
                "local_models_available": len(models.get("local_models", [])) > 0,
                "cloud_providers_configured": len(models.get("cloud_providers", [])) > 0,
                "rag_operational": kb_stats > 0
            },
            "recommendations": []
        }
        
        # Add intelligent recommendations
        if not models.get("local_models") and not models.get("cloud_providers"):
            summary["recommendations"].append("Configure AI models for threat analysis")
            
        if kb_stats < 10:
            summary["recommendations"].append("Add more security documents to knowledge base for better RAG performance")
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate intelligence summary: {str(e)}")