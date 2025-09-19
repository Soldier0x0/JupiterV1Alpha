# AI Routes for JupiterEmerge SIEM
from fastapi import APIRouter, HTTPException, Depends, Body, BackgroundTasks
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging
from datetime import datetime

from auth_middleware import get_current_user
from models.user_management import User
from ai_models import get_ai_system, initialize_ai_system

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Pydantic models
class QueryGenerationRequest(BaseModel):
    user_input: str = Field(..., description="Natural language query request")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    model_preference: Optional[str] = Field("query_generator", description="Preferred model")

class QueryGenerationResponse(BaseModel):
    success: bool
    query: Optional[str] = None
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    error: Optional[str] = None

class ThreatAnalysisRequest(BaseModel):
    log_data: Dict[str, Any] = Field(..., description="Log data to analyze")
    analysis_type: Optional[str] = Field("comprehensive", description="Type of analysis")

class ThreatAnalysisResponse(BaseModel):
    success: bool
    threat_level: Optional[str] = None
    threat_type: Optional[str] = None
    confidence: Optional[float] = None
    recommendations: Optional[List[str]] = None
    analysis: Optional[str] = None
    error: Optional[str] = None

class LogAnalysisRequest(BaseModel):
    logs: List[Dict[str, Any]] = Field(..., description="Logs to analyze")
    analysis_type: Optional[str] = Field("pattern_detection", description="Type of analysis")

class LogAnalysisResponse(BaseModel):
    success: bool
    patterns: Optional[List[str]] = None
    anomalies: Optional[List[str]] = None
    summary: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None

class RAGRequest(BaseModel):
    query: str = Field(..., description="Search query")
    data_type: Optional[str] = Field("logs", description="Type of data to search")
    n_results: Optional[int] = Field(5, description="Number of results to return")

class RAGResponse(BaseModel):
    success: bool
    results: Optional[List[Dict[str, Any]]] = None
    total_found: Optional[int] = None
    error: Optional[str] = None

class TrainingRequest(BaseModel):
    logs: List[Dict[str, Any]] = Field(..., description="Logs for training")
    model_name: Optional[str] = Field("log_analyzer", description="Model to train")
    training_type: Optional[str] = Field("fine_tune", description="Type of training")

class TrainingResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    training_id: Optional[str] = None
    error: Optional[str] = None

@router.on_event("startup")
async def startup_event():
    """Initialize AI system on startup"""
    try:
        ai_system = initialize_ai_system()
        if ai_system:
            logger.info("AI system initialized successfully")
        else:
            logger.warning("AI system initialization failed - running in fallback mode")
    except Exception as e:
        logger.error(f"Failed to initialize AI system: {e}")

@router.post("/generate-query", response_model=QueryGenerationResponse)
async def generate_query(
    request: QueryGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate OCSF query from natural language using AI
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            # Fallback to rule-based generation
            query = _fallback_query_generation(request.user_input)
            return QueryGenerationResponse(
                success=True,
                query=query,
                confidence=0.6,
                explanation="Generated using rule-based fallback (AI not available)"
            )
        
        # Generate query using AI
        query = ai_system.generate_query(request.user_input, request.context)
        
        # Calculate confidence (simplified)
        confidence = 0.8 if len(query) > 20 else 0.6
        
        return QueryGenerationResponse(
            success=True,
            query=query,
            confidence=confidence,
            explanation=f"Generated using {request.model_preference} model"
        )
        
    except Exception as e:
        logger.error(f"Query generation failed: {e}")
        return QueryGenerationResponse(
            success=False,
            error=str(e)
        )

@router.post("/analyze-threat", response_model=ThreatAnalysisResponse)
async def analyze_threat(
    request: ThreatAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze log data for potential threats using AI
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            # Fallback to rule-based analysis
            analysis = _fallback_threat_analysis(request.log_data)
            return ThreatAnalysisResponse(
                success=True,
                **analysis,
                analysis="Rule-based analysis (AI not available)"
            )
        
        # Analyze threat using AI
        analysis = ai_system.analyze_threat(request.log_data)
        
        return ThreatAnalysisResponse(
            success=True,
            **analysis
        )
        
    except Exception as e:
        logger.error(f"Threat analysis failed: {e}")
        return ThreatAnalysisResponse(
            success=False,
            error=str(e)
        )

@router.post("/analyze-logs", response_model=LogAnalysisResponse)
async def analyze_logs(
    request: LogAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze multiple logs for patterns and anomalies using AI
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            # Fallback to rule-based analysis
            analysis = _fallback_log_analysis(request.logs)
            return LogAnalysisResponse(
                success=True,
                **analysis,
                summary="Rule-based analysis (AI not available)"
            )
        
        # Analyze logs using AI
        analysis = ai_system.analyze_logs(request.logs)
        
        return LogAnalysisResponse(
            success=True,
            **analysis,
            confidence=0.75
        )
        
    except Exception as e:
        logger.error(f"Log analysis failed: {e}")
        return LogAnalysisResponse(
            success=False,
            error=str(e)
        )

@router.post("/search-rag", response_model=RAGResponse)
async def search_rag(
    request: RAGRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Search RAG system for similar data
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            return RAGResponse(
                success=False,
                error="RAG system not available"
            )
        
        # Search RAG system
        results = ai_system.retrieve_similar(
            request.query,
            request.data_type,
            request.n_results
        )
        
        return RAGResponse(
            success=True,
            results=results,
            total_found=len(results)
        )
        
    except Exception as e:
        logger.error(f"RAG search failed: {e}")
        return RAGResponse(
            success=False,
            error=str(e)
        )

@router.post("/add-to-rag")
async def add_to_rag(
    data: Dict[str, Any] = Body(...),
    data_type: str = "logs",
    current_user: User = Depends(get_current_user)
):
    """
    Add data to RAG system for future retrieval
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            return {"success": False, "error": "RAG system not available"}
        
        # Add data to RAG
        success = ai_system.add_to_rag(data, data_type)
        
        return {
            "success": success,
            "message": f"Data added to {data_type} collection" if success else "Failed to add data"
        }
        
    except Exception as e:
        logger.error(f"Failed to add data to RAG: {e}")
        return {"success": False, "error": str(e)}

@router.post("/train-model", response_model=TrainingResponse)
async def train_model(
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Train/fine-tune AI model on new log data
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            return TrainingResponse(
                success=False,
                error="AI system not available"
            )
        
        # Generate training ID
        training_id = f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Add training task to background
        background_tasks.add_task(
            _train_model_background,
            ai_system,
            request.logs,
            request.model_name,
            training_id
        )
        
        return TrainingResponse(
            success=True,
            message="Training started in background",
            training_id=training_id
        )
        
    except Exception as e:
        logger.error(f"Training request failed: {e}")
        return TrainingResponse(
            success=False,
            error=str(e)
        )

@router.get("/models/status")
async def get_models_status(current_user: User = Depends(get_current_user)):
    """
    Get status of AI models
    """
    try:
        ai_system = get_ai_system()
        
        if not ai_system:
            return {
                "success": False,
                "models": {},
                "status": "AI system not initialized"
            }
        
        # Get model status
        model_status = {}
        for name, model_info in ai_system.models.items():
            model_status[name] = {
                "loaded": True,
                "device": model_info["config"].device,
                "memory_usage": model_info["config"].memory_usage,
                "max_tokens": model_info["config"].max_tokens
            }
        
        # Add embedding model status
        if ai_system.embeddings_model:
            model_status["embedder"] = {
                "loaded": True,
                "device": ai_system.device,
                "memory_usage": "low"
            }
        
        return {
            "success": True,
            "models": model_status,
            "vector_store": {
                "available": ai_system.chroma_client is not None,
                "collections": list(ai_system.collections.keys()) if ai_system.collections else []
            },
            "device": ai_system.device
        }
        
    except Exception as e:
        logger.error(f"Failed to get model status: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/models/recommendations")
async def get_model_recommendations(current_user: User = Depends(get_current_user)):
    """
    Get model recommendations based on hardware
    """
    try:
        import torch
        
        recommendations = {
            "hardware": {
                "gpu_available": torch.cuda.is_available(),
                "gpu_memory": torch.cuda.get_device_properties(0).total_memory / 1024**3 if torch.cuda.is_available() else 0,
                "cpu_cores": torch.get_num_threads()
            },
            "recommended_models": {
                "query_generation": {
                    "model": "microsoft/DialoGPT-medium",
                    "reason": "Lightweight, good for query generation",
                    "memory_usage": "Low (2-3GB VRAM)"
                },
                "threat_analysis": {
                    "model": "microsoft/DialoGPT-large",
                    "reason": "Better reasoning for threat analysis",
                    "memory_usage": "Medium (4-6GB VRAM)"
                },
                "log_analysis": {
                    "model": "distilbert-base-uncased",
                    "reason": "Efficient for log classification",
                    "memory_usage": "Low (1-2GB VRAM)"
                },
                "embeddings": {
                    "model": "sentence-transformers/all-MiniLM-L6-v2",
                    "reason": "Fast and accurate embeddings",
                    "memory_usage": "Low (1GB VRAM)"
                }
            },
            "optimization_tips": [
                "Use 8-bit quantization to reduce memory usage",
                "Load models on-demand to save memory",
                "Use CPU for embedding model if GPU memory is limited",
                "Consider model distillation for smaller models"
            ]
        }
        
        return {
            "success": True,
            "recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# Background task functions
async def _train_model_background(ai_system, logs: List[Dict[str, Any]], model_name: str, training_id: str):
    """Background task for model training"""
    try:
        logger.info(f"Starting background training {training_id}")
        
        # Train the model
        success = ai_system.train_on_logs(logs, model_name)
        
        if success:
            logger.info(f"Training {training_id} completed successfully")
        else:
            logger.error(f"Training {training_id} failed")
            
    except Exception as e:
        logger.error(f"Background training {training_id} failed: {e}")

# Fallback functions
def _fallback_query_generation(user_input: str) -> str:
    """Fallback query generation without AI"""
    user_lower = user_input.lower()
    
    if "failed login" in user_lower:
        return 'activity_name = "failed_login"'
    elif "suspicious" in user_lower and "process" in user_lower:
        return 'process_name IN ("powershell.exe", "cmd.exe")'
    elif "external" in user_lower and "connection" in user_lower:
        return 'dst_endpoint_ip NOT IN ("192.168.0.0/16", "10.0.0.0/8")'
    elif "high severity" in user_lower:
        return 'severity IN ("high", "critical")'
    else:
        return 'activity_name = "unknown"'

def _fallback_threat_analysis(log_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback threat analysis without AI"""
    severity = log_data.get('severity', 'low')
    
    threat_level = "low"
    if severity in ["high", "critical"]:
        threat_level = "high"
    elif severity == "medium":
        threat_level = "medium"
    
    return {
        "threat_level": threat_level,
        "threat_type": "rule_based_analysis",
        "confidence": 0.6,
        "recommendations": ["Review log manually"]
    }

def _fallback_log_analysis(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Fallback log analysis without AI"""
    severities = [log.get('severity', 'low') for log in logs]
    activities = [log.get('activity_name', 'unknown') for log in logs]
    
    return {
        "patterns": ["rule_based_analysis"],
        "anomalies": ["high_severity_count"] if severities.count('high') > len(logs) * 0.3 else [],
        "summary": f"Analyzed {len(logs)} logs with {len(set(activities))} unique activities"
    }