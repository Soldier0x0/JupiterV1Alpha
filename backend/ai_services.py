"""
AI Services Module for Project Jupiter
Provides both local LLM support and cloud-based LLM integration
with RAG (Retrieval Augmented Generation) capabilities
"""
import os
import uuid
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Vector Database and Embeddings
import chromadb
from chromadb.config import Settings
import sentence_transformers
from sentence_transformers import SentenceTransformer
import numpy as np

# Local LLM support
import ollama

# Cloud LLM support  
import openai
import anthropic
import google.generativeai as genai

# Emergent integrations
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Database
from pymongo import MongoClient

load_dotenv()

logger = logging.getLogger(__name__)

class AIServiceManager:
    """
    Manages AI/LLM services for Project Jupiter
    Supports both local and cloud-based models with RAG capabilities
    """
    
    def __init__(self):
        # MongoDB connection
        self.mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/jupiter_siem")
        self.client = MongoClient(self.mongo_url)
        self.db = self.client.jupiter_siem
        
        # Collections
        self.ai_chats_collection = self.db.ai_chats
        self.ai_configs_collection = self.db.ai_configs
        self.vector_documents_collection = self.db.vector_documents
        
        # Vector Database setup
        self.chroma_client = None
        self.vector_collection = None
        self.embedding_model = None
        
        # Local/Cloud model configurations
        self.local_models = {}
        self.cloud_clients = {}
        
        self.initialize_services()
    
    def initialize_services(self):
        """Initialize AI services and vector database"""
        try:
            # Initialize ChromaDB
            self.chroma_client = chromadb.PersistentClient(path="/app/data/chroma_db")
            self.vector_collection = self.chroma_client.get_or_create_collection(
                name="jupiter_security_intel",
                metadata={"hnsw:space": "cosine"}
            )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Check for local Ollama models
            self.check_local_models()
            
            # Initialize cloud clients based on available keys
            self.initialize_cloud_clients()
            
            logger.info("AI Services initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing AI services: {e}")
    
    def check_local_models(self):
        """Check available local models via Ollama"""
        try:
            # Check if Ollama is available
            models = ollama.list()
            self.local_models = {model['name']: model for model in models.get('models', [])}
            logger.info(f"Found {len(self.local_models)} local models")
        except Exception as e:
            logger.warning(f"Ollama not available or error checking models: {e}")
            self.local_models = {}
    
    def initialize_cloud_clients(self):
        """Initialize cloud LLM clients based on available API keys"""
        try:
            # Check for Emergent Universal Key
            emergent_key = os.getenv("EMERGENT_LLM_KEY")
            if emergent_key:
                self.cloud_clients['emergent'] = {
                    'key': emergent_key,
                    'type': 'universal'
                }
                logger.info("Emergent Universal LLM key found")
            
            # Check for individual API keys
            openai_key = os.getenv("OPENAI_API_KEY") 
            if openai_key:
                self.cloud_clients['openai'] = openai.OpenAI(api_key=openai_key)
                
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")
            if anthropic_key:
                self.cloud_clients['anthropic'] = anthropic.Anthropic(api_key=anthropic_key)
                
            google_key = os.getenv("GOOGLE_API_KEY")
            if google_key:
                genai.configure(api_key=google_key)
                self.cloud_clients['google'] = True
                
        except Exception as e:
            logger.error(f"Error initializing cloud clients: {e}")
    
    async def add_security_document(self, content: str, metadata: Dict[str, Any], tenant_id: str) -> str:
        """Add security document to RAG vector database"""
        try:
            # Generate embedding
            embedding = self.embedding_model.encode(content).tolist()
            
            # Create unique document ID
            doc_id = str(uuid.uuid4())
            
            # Add to ChromaDB
            self.vector_collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[{**metadata, "tenant_id": tenant_id, "created_at": datetime.utcnow().isoformat()}],
                ids=[doc_id]
            )
            
            # Store in MongoDB for persistence
            self.vector_documents_collection.insert_one({
                "_id": doc_id,
                "tenant_id": tenant_id,
                "content": content,
                "metadata": metadata,
                "embedding": embedding,
                "created_at": datetime.utcnow()
            })
            
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding security document: {e}")
            raise
    
    async def rag_search(self, query: str, tenant_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant security documents using RAG"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search in ChromaDB
            results = self.vector_collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where={"tenant_id": tenant_id} if tenant_id else None
            )
            
            # Format results
            documents = []
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    documents.append({
                        "id": results['ids'][0][i],
                        "content": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i],
                        "distance": results['distances'][0][i]
                    })
            
            return documents
            
        except Exception as e:
            logger.error(f"Error in RAG search: {e}")
            return []
    
    async def analyze_with_local_llm(self, prompt: str, model_name: str = "llama2:7b") -> Dict[str, Any]:
        """Analyze using local LLM via Ollama"""
        try:
            if model_name not in self.local_models:
                # Try to pull the model
                try:
                    ollama.pull(model_name)
                    self.check_local_models()  # Refresh model list
                except Exception as pull_error:
                    raise Exception(f"Model {model_name} not available and could not be pulled: {pull_error}")
            
            response = ollama.generate(
                model=model_name,
                prompt=prompt,
                options={
                    "temperature": 0.1,
                    "num_ctx": 4096
                }
            )
            
            return {
                "model": model_name,
                "response": response.get('response', ''),
                "model_info": response.get('model', {}),
                "total_duration": response.get('total_duration', 0),
                "load_duration": response.get('load_duration', 0)
            }
            
        except Exception as e:
            logger.error(f"Error with local LLM analysis: {e}")
            raise
    
    async def analyze_with_cloud_llm(self, prompt: str, provider: str = "openai", model: str = "gpt-4o-mini") -> Dict[str, Any]:
        """Analyze using cloud LLM"""
        try:
            if provider == "emergent" and "emergent" in self.cloud_clients:
                # Use Emergent Universal Key
                chat = LlmChat(
                    api_key=self.cloud_clients['emergent']['key'],
                    session_id=str(uuid.uuid4()),
                    system_message="You are a cybersecurity expert AI analyzing security threats and events for Project Jupiter SIEM platform."
                )
                
                # Set the specific model
                if model.startswith("gpt"):
                    chat.with_model("openai", model)
                elif model.startswith("claude"):
                    chat.with_model("anthropic", model) 
                elif model.startswith("gemini"):
                    chat.with_model("gemini", model)
                
                message = UserMessage(text=prompt)
                response = await chat.send_message(message)
                
                return {
                    "provider": "emergent",
                    "model": model,
                    "response": response,
                    "usage": "tracked_by_emergent"
                }
                
            elif provider == "openai" and "openai" in self.cloud_clients:
                response = self.cloud_clients['openai'].chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a cybersecurity expert analyzing security threats."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                
                return {
                    "provider": "openai",
                    "model": model,
                    "response": response.choices[0].message.content,
                    "usage": response.usage._asdict() if response.usage else {}
                }
                
            else:
                raise Exception(f"Provider {provider} not configured or available")
                
        except Exception as e:
            logger.error(f"Error with cloud LLM analysis: {e}")
            raise
    
    async def ai_threat_analysis(self, threat_data: Dict[str, Any], tenant_id: str, model_preference: str = "auto") -> Dict[str, Any]:
        """
        Comprehensive AI-powered threat analysis using RAG + LLM
        """
        try:
            # Prepare threat context
            threat_description = f"""
            Threat Analysis Request:
            
            Source IP: {threat_data.get('source_ip', 'Unknown')}
            Technique: {threat_data.get('technique', 'Unknown')}
            Severity: {threat_data.get('severity', 'Unknown')}
            Indicators: {', '.join(threat_data.get('indicators', []))}
            Timeline: {threat_data.get('timeline', 'Unknown')}
            
            Additional Context: {json.dumps(threat_data.get('metadata', {}), indent=2)}
            """
            
            # RAG Search for relevant security intelligence
            rag_results = await self.rag_search(threat_description, tenant_id, limit=3)
            
            # Build context-aware prompt
            context = "\n".join([doc['content'] for doc in rag_results])
            
            analysis_prompt = f"""
            As a cybersecurity expert, analyze the following threat data and provide a comprehensive assessment:
            
            {threat_description}
            
            Relevant Security Intelligence Context:
            {context}
            
            Please provide:
            1. Threat Assessment (severity, confidence level)
            2. Technical Analysis (attack techniques, IOCs)
            3. Attribution (likely threat actor characteristics)
            4. Impact Analysis (potential damage, scope)
            5. Recommendations (immediate actions, long-term strategies)
            6. Biological Security Analogy (how this relates to immune system responses)
            
            Format the response as detailed JSON with clear sections.
            """
            
            # Choose analysis method based on preference and availability
            if model_preference == "auto":
                if "emergent" in self.cloud_clients:
                    result = await self.analyze_with_cloud_llm(analysis_prompt, "emergent", "gpt-4o-mini")
                elif self.local_models:
                    result = await self.analyze_with_local_llm(analysis_prompt, "llama2:7b")
                else:
                    raise Exception("No AI models available for analysis")
            elif model_preference.startswith("local:"):
                model_name = model_preference.replace("local:", "")
                result = await self.analyze_with_local_llm(analysis_prompt, model_name)
            elif model_preference.startswith("cloud:"):
                parts = model_preference.replace("cloud:", "").split(":")
                provider, model = parts[0], parts[1] if len(parts) > 1 else "gpt-4o-mini"
                result = await self.analyze_with_cloud_llm(analysis_prompt, provider, model)
            
            # Store analysis in database
            analysis_id = str(uuid.uuid4())
            self.ai_chats_collection.insert_one({
                "_id": analysis_id,
                "tenant_id": tenant_id,
                "type": "threat_analysis",
                "input": threat_data,
                "prompt": analysis_prompt,
                "response": result,
                "rag_context": rag_results,
                "created_at": datetime.utcnow()
            })
            
            return {
                "analysis_id": analysis_id,
                "threat_data": threat_data,
                "ai_analysis": result,
                "rag_context_count": len(rag_results),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI threat analysis: {e}")
            raise
    
    async def get_available_models(self) -> Dict[str, Any]:
        """Get list of available local and cloud models"""
        return {
            "local_models": list(self.local_models.keys()),
            "cloud_providers": list(self.cloud_clients.keys()),
            "recommended": {
                "fast_analysis": "local:llama2:7b" if self.local_models else "cloud:emergent:gpt-4o-mini",
                "deep_analysis": "cloud:emergent:gpt-4o" if "emergent" in self.cloud_clients else "local:llama2:13b",
                "privacy_focused": "local:llama2:7b" if self.local_models else None
            }
        }
    
    async def save_api_key(self, tenant_id: str, provider: str, api_key: str, model_config: Dict[str, Any] = None) -> bool:
        """Save API key configuration for tenant"""
        try:
            config_data = {
                "tenant_id": tenant_id,
                "provider": provider,
                "api_key": api_key,
                "model_config": model_config or {},
                "enabled": True,
                "created_at": datetime.utcnow()
            }
            
            # Update or insert configuration
            self.ai_configs_collection.replace_one(
                {"tenant_id": tenant_id, "provider": provider},
                config_data,
                upsert=True
            )
            
            # Reinitialize clients with new key
            self.initialize_cloud_clients()
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving API key: {e}")
            return False

# Global AI Service Manager instance
ai_service_manager = AIServiceManager()