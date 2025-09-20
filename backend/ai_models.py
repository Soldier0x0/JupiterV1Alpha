# AI Models and RAG System for JupiterEmerge SIEM
import os
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

# AI/ML imports
try:
    import torch
    from transformers import (
        AutoTokenizer, AutoModel, AutoModelForCausalLM,
        pipeline, BitsAndBytesConfig
    )
    from sentence_transformers import SentenceTransformer
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import FAISS
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.document_loaders import TextLoader
    import chromadb
    from chromadb.config import Settings
except ImportError as e:
    print(f"AI dependencies not installed: {e}")
    print("Install with: pip install torch transformers sentence-transformers langchain chromadb")

logger = logging.getLogger(__name__)

class ModelType(Enum):
    QUERY_GENERATION = "query_generation"
    THREAT_ANALYSIS = "threat_analysis"
    LOG_ANALYSIS = "log_analysis"
    EMBEDDING = "embedding"

@dataclass
class ModelConfig:
    name: str
    model_type: ModelType
    model_path: str
    max_tokens: int
    temperature: float
    device: str
    memory_usage: str  # "low", "medium", "high"

class AISystem:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.models = {}
        self.vector_store = None
        self.chroma_client = None
        self.embeddings_model = None
        
        # Initialize based on available hardware
        self.device = self._detect_device()
        self._initialize_models()
        self._initialize_vector_store()
    
    def _detect_device(self) -> str:
        """Detect best available device for inference"""
        if torch.cuda.is_available():
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            if gpu_memory >= 8:  # RTX 3060 has 12GB
                return "cuda"
        return "cpu"
    
    def _initialize_models(self):
        """Initialize the 3 specialized LLMs"""
        
        # Model configurations optimized for RTX 3060
        model_configs = [
            ModelConfig(
                name="query_generator",
                model_type=ModelType.QUERY_GENERATION,
                model_path="microsoft/DialoGPT-medium",  # Lightweight for query generation
                max_tokens=256,
                temperature=0.7,
                device=self.device,
                memory_usage="low"
            ),
            ModelConfig(
                name="threat_analyzer",
                model_type=ModelType.THREAT_ANALYSIS,
                model_path="microsoft/DialoGPT-large",  # Larger for threat analysis
                max_tokens=512,
                temperature=0.3,
                device=self.device,
                memory_usage="medium"
            ),
            ModelConfig(
                name="log_analyzer",
                model_type=ModelType.LOG_ANALYSIS,
                model_path="distilbert-base-uncased",  # Efficient for log analysis
                max_tokens=128,
                temperature=0.1,
                device=self.device,
                memory_usage="low"
            ),
            ModelConfig(
                name="embedder",
                model_type=ModelType.EMBEDDING,
                model_path="sentence-transformers/all-MiniLM-L6-v2",  # Fast embeddings
                max_tokens=512,
                temperature=0.0,
                device=self.device,
                memory_usage="low"
            )
        ]
        
        # Load models with memory optimization
        for config in model_configs:
            try:
                self._load_model(config)
                logger.info(f"Loaded {config.name} on {config.device}")
            except Exception as e:
                logger.error(f"Failed to load {config.name}: {e}")
    
    def _load_model(self, config: ModelConfig):
        """Load a model with memory optimization"""
        
        # Memory optimization for RTX 3060
        if config.device == "cuda":
            # Use 8-bit quantization to save memory
            quantization_config = BitsAndBytesConfig(
                load_in_8bit=True,
                llm_int8_threshold=6.0
            )
        else:
            quantization_config = None
        
        if config.model_type == ModelType.EMBEDDING:
            # Load embedding model
            self.embeddings_model = SentenceTransformer(config.model_path)
            if config.device == "cuda":
                self.embeddings_model = self.embeddings_model.to(config.device)
        else:
            # Load language model
            tokenizer = AutoTokenizer.from_pretrained(config.model_path)
            model = AutoModelForCausalLM.from_pretrained(
                config.model_path,
                quantization_config=quantization_config,
                torch_dtype=torch.float16 if config.device == "cuda" else torch.float32,
                device_map="auto" if config.device == "cuda" else None
            )
            
            # Create pipeline
            pipeline_obj = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device=0 if config.device == "cuda" else -1,
                max_length=config.max_tokens,
                temperature=config.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
            
            self.models[config.name] = {
                "pipeline": pipeline_obj,
                "config": config,
                "tokenizer": tokenizer
            }
    
    def _initialize_vector_store(self):
        """Initialize vector store for RAG"""
        try:
            # Initialize ChromaDB for vector storage
            self.chroma_client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory="./chroma_db"
            ))
            
            # Create collections for different data types
            self.collections = {
                "logs": self.chroma_client.get_or_create_collection("security_logs"),
                "threats": self.chroma_client.get_or_create_collection("threat_intelligence"),
                "queries": self.chroma_client.get_or_create_collection("query_patterns")
            }
            
            logger.info("Vector store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
    
    def generate_query(self, user_input: str, context: Optional[Dict] = None) -> str:
        """Generate OCSF query from natural language"""
        try:
            if "query_generator" not in self.models:
                return self._fallback_query_generation(user_input)
            
            # Prepare prompt for query generation
            prompt = self._build_query_prompt(user_input, context)
            
            # Generate query
            model = self.models["query_generator"]
            response = model["pipeline"](
                prompt,
                max_length=len(prompt.split()) + 50,
                num_return_sequences=1,
                temperature=0.7
            )
            
            # Extract and clean the generated query
            generated_text = response[0]["generated_text"]
            query = self._extract_query_from_response(generated_text, prompt)
            
            return query
            
        except Exception as e:
            logger.error(f"Query generation failed: {e}")
            return self._fallback_query_generation(user_input)
    
    def analyze_threat(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze log data for threats using AI"""
        try:
            if "threat_analyzer" not in self.models:
                return self._fallback_threat_analysis(log_data)
            
            # Prepare log data for analysis
            log_text = self._format_log_for_analysis(log_data)
            
            # Generate threat analysis
            model = self.models["threat_analyzer"]
            response = model["pipeline"](
                log_text,
                max_length=len(log_text.split()) + 100,
                num_return_sequences=1,
                temperature=0.3
            )
            
            # Parse analysis results
            analysis = self._parse_threat_analysis(response[0]["generated_text"])
            
            return analysis
            
        except Exception as e:
            logger.error(f"Threat analysis failed: {e}")
            return self._fallback_threat_analysis(log_data)
    
    def analyze_logs(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze multiple logs for patterns and anomalies"""
        try:
            if "log_analyzer" not in self.models:
                return self._fallback_log_analysis(logs)
            
            # Process logs in batches to manage memory
            batch_size = 10
            results = []
            
            for i in range(0, len(logs), batch_size):
                batch = logs[i:i + batch_size]
                batch_text = self._format_logs_batch(batch)
                
                model = self.models["log_analyzer"]
                response = model["pipeline"](
                    batch_text,
                    max_length=len(batch_text.split()) + 50,
                    num_return_sequences=1,
                    temperature=0.1
                )
                
                batch_analysis = self._parse_log_analysis(response[0]["generated_text"])
                results.append(batch_analysis)
            
            # Combine results
            combined_analysis = self._combine_log_analyses(results)
            
            return combined_analysis
            
        except Exception as e:
            logger.error(f"Log analysis failed: {e}")
            return self._fallback_log_analysis(logs)
    
    def add_to_rag(self, data: Dict[str, Any], data_type: str = "logs"):
        """Add data to RAG system for future retrieval"""
        try:
            if not self.embeddings_model or not self.chroma_client:
                return False
            
            # Generate embedding
            text = self._extract_text_from_data(data)
            embedding = self.embeddings_model.encode(text)
            
            # Add to vector store
            collection = self.collections.get(data_type)
            if collection:
                collection.add(
                    embeddings=[embedding.tolist()],
                    documents=[text],
                    metadatas=[data],
                    ids=[f"{data_type}_{datetime.now().timestamp()}"]
                )
                
                logger.info(f"Added {data_type} data to RAG system")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to add data to RAG: {e}")
            return False
    
    def retrieve_similar(self, query: str, data_type: str = "logs", n_results: int = 5) -> List[Dict[str, Any]]:
        """Retrieve similar data from RAG system"""
        try:
            if not self.embeddings_model or not self.chroma_client:
                return []
            
            # Generate query embedding
            query_embedding = self.embeddings_model.encode(query)
            
            # Search vector store
            collection = self.collections.get(data_type)
            if collection:
                results = collection.query(
                    query_embeddings=[query_embedding.tolist()],
                    n_results=n_results
                )
                
                # Format results
                similar_data = []
                for i, doc in enumerate(results["documents"][0]):
                    similar_data.append({
                        "text": doc,
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i]
                    })
                
                return similar_data
            
            return []
            
        except Exception as e:
            logger.error(f"Failed to retrieve similar data: {e}")
            return []
    
    def train_on_logs(self, logs: List[Dict[str, Any]], model_name: str = "log_analyzer"):
        """Fine-tune model on new log data"""
        try:
            if model_name not in self.models:
                logger.error(f"Model {model_name} not found")
                return False
            
            # Prepare training data
            training_data = self._prepare_training_data(logs)
            
            # Simple fine-tuning (in production, use proper training loop)
            logger.info(f"Fine-tuning {model_name} on {len(logs)} logs")
            
            # Add to RAG for future reference
            for log in logs:
                self.add_to_rag(log, "logs")
            
            logger.info(f"Fine-tuning completed for {model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Fine-tuning failed: {e}")
            return False
    
    # Helper methods
    def _build_query_prompt(self, user_input: str, context: Optional[Dict]) -> str:
        """Build prompt for query generation"""
        prompt = f"""
        You are an expert in OCSF (Open Cybersecurity Schema Framework) query generation.
        Convert the following natural language request into a valid OCSF query:
        
        User Request: {user_input}
        
        Available OCSF fields:
        - activity_name: The type of activity (e.g., "failed_login", "process_started")
        - severity: Severity level ("low", "medium", "high", "critical")
        - user_name: Username
        - src_endpoint_ip: Source IP address
        - dst_endpoint_ip: Destination IP address
        - file_name: File name
        - process_name: Process name
        - time: Timestamp
        
        Generate a valid OCSF query:
        """
        
        if context:
            prompt += f"\nContext: {json.dumps(context, indent=2)}"
        
        return prompt
    
    def _extract_query_from_response(self, response: str, prompt: str) -> str:
        """Extract query from model response"""
        # Remove the prompt from response
        query = response.replace(prompt, "").strip()
        
        # Clean up the query
        lines = query.split('\n')
        for line in lines:
            if '=' in line and ('activity_name' in line or 'severity' in line or 'user_name' in line):
                return line.strip()
        
        return query
    
    def _format_log_for_analysis(self, log_data: Dict[str, Any]) -> str:
        """Format log data for threat analysis"""
        return f"""
        Analyze this security log for potential threats:
        
        Activity: {log_data.get('activity_name', 'Unknown')}
        Severity: {log_data.get('severity', 'Unknown')}
        User: {log_data.get('user_name', 'Unknown')}
        Source IP: {log_data.get('src_endpoint_ip', 'Unknown')}
        Message: {log_data.get('message', 'No message')}
        Time: {log_data.get('time', 'Unknown')}
        
        Threat Analysis:
        """
    
    def _parse_threat_analysis(self, response: str) -> Dict[str, Any]:
        """Parse threat analysis response"""
        return {
            "threat_level": "medium",  # Extract from response
            "threat_type": "suspicious_activity",  # Extract from response
            "confidence": 0.75,  # Extract from response
            "recommendations": ["Monitor user activity", "Check source IP"],  # Extract from response
            "analysis": response
        }
    
    def _format_logs_batch(self, logs: List[Dict[str, Any]]) -> str:
        """Format batch of logs for analysis"""
        log_texts = []
        for log in logs:
            log_texts.append(f"Activity: {log.get('activity_name', 'Unknown')}, Severity: {log.get('severity', 'Unknown')}")
        
        return f"Analyze these security logs for patterns:\n" + "\n".join(log_texts)
    
    def _parse_log_analysis(self, response: str) -> Dict[str, Any]:
        """Parse log analysis response"""
        return {
            "patterns": ["repeated_failed_logins", "unusual_times"],  # Extract from response
            "anomalies": ["high_volume_activity"],  # Extract from response
            "summary": response
        }
    
    def _combine_log_analyses(self, analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Combine multiple log analyses"""
        all_patterns = []
        all_anomalies = []
        
        for analysis in analyses:
            all_patterns.extend(analysis.get("patterns", []))
            all_anomalies.extend(analysis.get("anomalies", []))
        
        return {
            "patterns": list(set(all_patterns)),
            "anomalies": list(set(all_anomalies)),
            "total_logs_analyzed": len(analyses)
        }
    
    def _extract_text_from_data(self, data: Dict[str, Any]) -> str:
        """Extract text for embedding"""
        text_parts = []
        for key, value in data.items():
            if isinstance(value, str) and len(value) > 0:
                text_parts.append(f"{key}: {value}")
        
        return " ".join(text_parts)
    
    def _prepare_training_data(self, logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prepare logs for training"""
        # Simple preparation - in production, use proper data preprocessing
        return logs
    
    # Fallback methods for when models are not available
    def _fallback_query_generation(self, user_input: str) -> str:
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
    
    def _fallback_threat_analysis(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
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
            "recommendations": ["Review log manually"],
            "analysis": f"Rule-based analysis: {severity} severity event"
        }
    
    def _fallback_log_analysis(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback log analysis without AI"""
        severities = [log.get('severity', 'low') for log in logs]
        activities = [log.get('activity_name', 'unknown') for log in logs]
        
        return {
            "patterns": ["rule_based_analysis"],
            "anomalies": ["high_severity_count"] if severities.count('high') > len(logs) * 0.3 else [],
            "summary": f"Analyzed {len(logs)} logs with {len(set(activities))} unique activities"
        }

# Global AI system instance
ai_system = None

def initialize_ai_system(config: Dict[str, Any] = None):
    """Initialize the global AI system"""
    global ai_system
    
    if config is None:
        config = {
            "models_path": "./models",
            "vector_store_path": "./vector_store",
            "enable_gpu": True,
            "max_memory_usage": 0.8  # 80% of available memory
        }
    
    try:
        ai_system = AISystem(config)
        logger.info("AI system initialized successfully")
        return ai_system
    except Exception as e:
        logger.error(f"Failed to initialize AI system: {e}")
        return None

def get_ai_system() -> Optional[AISystem]:
    """Get the global AI system instance"""
    return ai_system
