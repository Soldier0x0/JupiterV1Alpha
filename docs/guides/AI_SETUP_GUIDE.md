# AI-Powered SIEM Setup Guide

## 🎯 Your Hardware Configuration

**RTX 3060 (12GB VRAM) + Ryzen 5 3500x + 16GB DDR4**
- **Perfect for**: 7B-13B parameter models
- **Memory**: ~8-10GB VRAM available for models
- **CPU**: 6 cores for background processing
- **Storage**: 240GB SSD for models, 2TB HDD for data

## 🤖 Recommended AI Models

### 1. Query Generation Model
```bash
# Microsoft DialoGPT Medium (345M parameters)
Model: microsoft/DialoGPT-medium
VRAM Usage: ~2-3GB
Purpose: Natural language to OCSF query conversion
Performance: Fast, good for real-time queries
```

### 2. Threat Analysis Model
```bash
# Microsoft DialoGPT Large (774M parameters)
Model: microsoft/DialoGPT-large
VRAM Usage: ~4-6GB
Purpose: Threat analysis and risk assessment
Performance: Better reasoning, slower but more accurate
```

### 3. Log Analysis Model
```bash
# DistilBERT Base (66M parameters)
Model: distilbert-base-uncased
VRAM Usage: ~1-2GB
Purpose: Log classification and pattern detection
Performance: Very fast, efficient for batch processing
```

### 4. Embedding Model
```bash
# Sentence Transformers MiniLM
Model: sentence-transformers/all-MiniLM-L6-v2
VRAM Usage: ~1GB
Purpose: RAG vector embeddings
Performance: Fast embeddings for similarity search
```

## 🚀 Installation & Setup

### 1. Install AI Dependencies
```bash
# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install transformers and AI libraries
pip install transformers sentence-transformers langchain chromadb

# Install quantization libraries
pip install bitsandbytes accelerate

# Install additional dependencies
pip install numpy pandas scikit-learn
```

### 2. Configure Environment Variables
```bash
# .env file
AI_ENABLED=true
AI_MODELS_PATH=./models
AI_VECTOR_STORE_PATH=./vector_store
AI_MAX_MEMORY_USAGE=0.8
AI_DEVICE=cuda
AI_QUANTIZATION=true
```

### 3. Initialize AI System
```python
# In your backend startup
from ai_models import initialize_ai_system

config = {
    "models_path": "./models",
    "vector_store_path": "./vector_store",
    "enable_gpu": True,
    "max_memory_usage": 0.8,
    "quantization": True
}

ai_system = initialize_ai_system(config)
```

## 🔧 Apache NiFi Integration

### 1. NiFi Setup
```bash
# Install NiFi on your Debian server
wget https://archive.apache.org/dist/nifi/1.23.2/nifi-1.23.2-bin.tar.gz
tar -xzf nifi-1.23.2-bin.tar.gz
cd nifi-1.23.2
./bin/nifi.sh start
```

### 2. EVTX to OCSF Flow
```python
# The flow includes:
1. GetFile - Monitor EVTX files
2. ConvertEVTX - Parse Windows Event Logs
3. TransformToOCSF - Convert to OCSF format
4. ValidateOCSF - Validate schema compliance
5. PutKafka - Send to Kafka for processing
```

### 3. NiFi Configuration
```yaml
# nifi.properties
nifi.web.http.host=0.0.0.0
nifi.web.http.port=8080
nifi.web.https.host=
nifi.web.https.port=
nifi.security.user.authorizer=managed-authorizer
nifi.security.user.login.identity.provider=ldap-provider
```

## 🧠 RAG System Implementation

### 1. Vector Database Setup
```python
# ChromaDB for vector storage
import chromadb
from chromadb.config import Settings

client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_db"
))

# Create collections
collections = {
    "logs": client.get_or_create_collection("security_logs"),
    "threats": client.get_or_create_collection("threat_intelligence"),
    "queries": client.get_or_create_collection("query_patterns")
}
```

### 2. Embedding Pipeline
```python
# Generate embeddings for RAG
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def add_to_rag(data, collection_name):
    text = extract_text_from_data(data)
    embedding = embedder.encode(text)
    
    collection = collections[collection_name]
    collection.add(
        embeddings=[embedding.tolist()],
        documents=[text],
        metadatas=[data],
        ids=[f"{collection_name}_{timestamp}"]
    )
```

### 3. Similarity Search
```python
def search_similar(query, collection_name, n_results=5):
    query_embedding = embedder.encode(query)
    collection = collections[collection_name]
    
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=n_results
    )
    
    return results
```

## 📊 Model Performance Optimization

### 1. Memory Management
```python
# Use 8-bit quantization
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0
)

# Load models with quantization
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    quantization_config=quantization_config,
    torch_dtype=torch.float16,
    device_map="auto"
)
```

### 2. Model Loading Strategy
```python
# Load models on-demand
class ModelManager:
    def __init__(self):
        self.models = {}
        self.loaded_models = set()
    
    def load_model(self, model_name):
        if model_name not in self.loaded_models:
            # Load model
            self.models[model_name] = load_model(model_name)
            self.loaded_models.add(model_name)
        
        return self.models[model_name]
    
    def unload_model(self, model_name):
        if model_name in self.loaded_models:
            del self.models[model_name]
            self.loaded_models.remove(model_name)
            torch.cuda.empty_cache()
```

### 3. Batch Processing
```python
# Process logs in batches
def batch_analyze_logs(logs, batch_size=10):
    results = []
    
    for i in range(0, len(logs), batch_size):
        batch = logs[i:i + batch_size]
        batch_result = analyze_logs_batch(batch)
        results.append(batch_result)
        
        # Clear cache between batches
        torch.cuda.empty_cache()
    
    return results
```

## 🔄 Continuous Learning Pipeline

### 1. Log Processing
```python
# Process new logs for training
def process_new_logs(logs):
    # Add to RAG system
    for log in logs:
        add_to_rag(log, "logs")
    
    # Update model if enough new data
    if len(logs) > 100:
        fine_tune_model(logs)
```

### 2. Model Fine-tuning
```python
# Fine-tune models on new data
def fine_tune_model(logs, model_name="log_analyzer"):
    # Prepare training data
    training_data = prepare_training_data(logs)
    
    # Fine-tune model
    model = get_model(model_name)
    model.train()
    
    # Update model weights
    # (Simplified - use proper training loop in production)
    
    return True
```

### 3. Performance Monitoring
```python
# Monitor model performance
def monitor_performance():
    metrics = {
        "response_time": get_avg_response_time(),
        "accuracy": get_model_accuracy(),
        "memory_usage": get_memory_usage(),
        "gpu_utilization": get_gpu_utilization()
    }
    
    # Log metrics
    logger.info(f"Model performance: {metrics}")
    
    # Alert if performance degrades
    if metrics["accuracy"] < 0.8:
        alert_performance_degradation(metrics)
```

## 🎯 Use Cases for Your Setup

### 1. Real-time Threat Detection
```python
# Analyze incoming logs in real-time
async def analyze_realtime_logs(log_stream):
    for log in log_stream:
        # AI threat analysis
        threat_analysis = ai_system.analyze_threat(log)
        
        # RAG similarity search
        similar_threats = ai_system.retrieve_similar(
            f"{log['activity_name']} {log['src_endpoint_ip']}",
            "threats"
        )
        
        # Risk scoring
        risk_score = calculate_risk_score(log, similar_threats)
        
        if risk_score > 0.7:
            trigger_alert(log, threat_analysis, risk_score)
```

### 2. Query Generation
```python
# Generate OCSF queries from natural language
def generate_security_query(user_input):
    # AI query generation
    query = ai_system.generate_query(user_input)
    
    # Validate query
    validation = validate_ocsf_query(query)
    
    # Optimize query
    optimization = optimize_query_performance(query)
    
    return {
        "query": query,
        "valid": validation.valid,
        "optimized": optimization.suggestions
    }
```

### 3. Pattern Detection
```python
# Detect patterns in log data
def detect_attack_patterns(logs):
    # Analyze logs for patterns
    analysis = ai_system.analyze_logs(logs)
    
    # Search for similar attack patterns
    similar_patterns = ai_system.retrieve_similar(
        analysis["summary"],
        "threats"
    )
    
    # Generate attack timeline
    timeline = build_attack_timeline(logs, analysis)
    
    return {
        "patterns": analysis["patterns"],
        "anomalies": analysis["anomalies"],
        "similar_attacks": similar_patterns,
        "timeline": timeline
    }
```

## 📈 Performance Expectations

### RTX 3060 Performance
- **Query Generation**: 50-100ms per query
- **Threat Analysis**: 100-200ms per log
- **Log Analysis**: 10-20ms per log (batch processing)
- **RAG Search**: 20-50ms per search
- **Model Loading**: 5-10 seconds per model

### Memory Usage
- **Query Generator**: ~2GB VRAM
- **Threat Analyzer**: ~4GB VRAM
- **Log Analyzer**: ~1GB VRAM
- **Embedder**: ~1GB VRAM
- **Total**: ~8GB VRAM (leaving 4GB for system)

### Throughput
- **Real-time Analysis**: 100-200 logs/second
- **Batch Processing**: 1000-2000 logs/second
- **Query Generation**: 10-20 queries/second
- **RAG Search**: 50-100 searches/second

## 🔧 Troubleshooting

### Common Issues
1. **Out of Memory**: Reduce batch size or use CPU for some models
2. **Slow Performance**: Enable quantization or use smaller models
3. **Model Loading Errors**: Check CUDA compatibility and memory
4. **RAG Search Issues**: Verify vector database initialization

### Performance Tuning
1. **Enable Mixed Precision**: Use torch.float16 for faster inference
2. **Optimize Batch Sizes**: Find optimal batch size for your hardware
3. **Use Model Caching**: Cache frequently used models
4. **Monitor GPU Usage**: Use nvidia-smi to monitor GPU utilization

## 🚀 Next Steps

1. **Install Dependencies**: Follow the installation guide
2. **Configure Models**: Set up the recommended models
3. **Test Performance**: Run performance benchmarks
4. **Deploy NiFi**: Set up the EVTX to OCSF pipeline
5. **Enable RAG**: Initialize the vector database
6. **Start Learning**: Begin continuous learning from your logs

Your RTX 3060 setup is perfect for this AI-powered SIEM! You'll be able to run multiple specialized models simultaneously while maintaining good performance for real-time analysis.
