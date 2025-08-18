from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import os
import jwt
import bcrypt
import uuid
import random
import requests
import json
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Jupiter SIEM API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/jupiter_siem")
client = MongoClient(MONGO_URL)
db = client.jupiter_siem

# Collections
users_collection = db.users
tenants_collection = db.tenants
alerts_collection = db.alerts
iocs_collection = db.iocs
automations_collection = db.automations
api_keys_collection = db.api_keys
logs_collection = db.logs
cases_collection = db.cases

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    tenant_name: str
    is_owner: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    otp: str
    tenant_id: str

class OTPRequest(BaseModel):
    email: EmailStr
    tenant_id: str

class ThreatIntelAPI(BaseModel):
    name: str
    api_key: str
    endpoint: str
    enabled: bool = True

class IOCCreate(BaseModel):
    ioc_type: str  # ip, domain, hash, url
    value: str
    threat_level: str  # low, medium, high, critical
    tags: List[str] = []
    description: Optional[str] = None

class AutomationRule(BaseModel):
    name: str
    trigger_type: str  # high_severity_alert, ioc_match, regex_match
    trigger_config: Dict[str, Any]
    actions: List[Dict[str, Any]]
    enabled: bool = True

class AlertCreate(BaseModel):
    severity: str
    source: str
    entity: str
    message: str
    metadata: Optional[Dict[str, Any]] = {}

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, tenant_id: str, is_owner: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "is_owner": is_owner,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp: str):
    """Send OTP via email - simplified for demo"""
    print(f"OTP for {email}: {otp}")  # In production, use real SMTP
    # TODO: Implement real email sending

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        tenant_id = payload.get("tenant_id")
        is_owner = payload.get("is_owner", False)
        
        if not user_id or not tenant_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "is_owner": is_owner
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication Endpoints
@app.post("/api/auth/register")
async def register_user(user_data: UserRegister):
    # Check if tenant exists
    tenant = tenants_collection.find_one({"name": user_data.tenant_name})
    if not tenant:
        # Create new tenant
        tenant_id = str(uuid.uuid4())
        tenants_collection.insert_one({
            "_id": tenant_id,
            "name": user_data.tenant_name,
            "created_at": datetime.utcnow(),
            "enabled": True
        })
    else:
        tenant_id = tenant["_id"]
    
    # Check if user exists
    existing_user = users_collection.find_one({"email": user_data.email, "tenant_id": tenant_id})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user_id = str(uuid.uuid4())
    users_collection.insert_one({
        "_id": user_id,
        "email": user_data.email,
        "tenant_id": tenant_id,
        "is_owner": user_data.is_owner,
        "created_at": datetime.utcnow(),
        "last_login": None,
        "otp": None,
        "otp_expires": None
    })
    
    return {"message": "User registered successfully", "user_id": user_id, "tenant_id": tenant_id}

@app.post("/api/auth/request-otp")
async def request_otp(otp_request: OTPRequest):
    user = users_collection.find_one({"email": otp_request.email, "tenant_id": otp_request.tenant_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=10)
    
    # Update user with OTP
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"otp": otp, "otp_expires": otp_expires}}
    )
    
    # Send OTP email
    await send_otp_email(otp_request.email, otp)
    
    return {"message": "OTP sent successfully"}

@app.post("/api/auth/login")
async def login_user(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email, "tenant_id": login_data.tenant_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check OTP
    if not user.get("otp") or user["otp"] != login_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.get("otp_expires") and user["otp_expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Clear OTP and update last login
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow(), "otp": None, "otp_expires": None}}
    )
    
    # Generate JWT token
    token = create_jwt_token(user["_id"], user["tenant_id"], user.get("is_owner", False))
    
    return {
        "token": token,
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "tenant_id": user["tenant_id"],
            "is_owner": user.get("is_owner", False)
        }
    }

# Dashboard Endpoints
@app.get("/api/dashboard/overview")
async def get_dashboard_overview(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    is_owner = current_user["is_owner"]
    
    if is_owner:
        # Owner view - system-wide metrics
        total_logs = logs_collection.count_documents({})
        total_alerts = alerts_collection.count_documents({})
        critical_alerts = alerts_collection.count_documents({"severity": "critical"})
        
        # Get recent alerts across all tenants
        recent_alerts = list(alerts_collection.find({}).sort("timestamp", -1).limit(10))
        
        # System health metrics (mock for now)
        health_metrics = [
            {"name": "API", "status": "healthy"},
            {"name": "MongoDB", "status": "healthy"},
            {"name": "OpenSearch", "status": "degraded"},
            {"name": "Threat Intel", "status": "healthy"},
            {"name": "SOAR Engine", "status": "healthy"}
        ]
        
    else:
        # Tenant view - scoped metrics
        total_logs = logs_collection.count_documents({"tenant_id": tenant_id})
        total_alerts = alerts_collection.count_documents({"tenant_id": tenant_id})
        critical_alerts = alerts_collection.count_documents({"tenant_id": tenant_id, "severity": "critical"})
        
        # Get recent alerts for this tenant only
        recent_alerts = list(alerts_collection.find({"tenant_id": tenant_id}).sort("timestamp", -1).limit(10))
        
        # Limited health view for tenant
        health_metrics = [
            {"name": "Tenant Status", "status": "active"},
            {"name": "Alert Processing", "status": "healthy"},
            {"name": "IOC Matching", "status": "healthy"}
        ]
    
    # Convert ObjectId to string for JSON serialization
    for alert in recent_alerts:
        alert["_id"] = str(alert["_id"])
        if "timestamp" in alert and hasattr(alert["timestamp"], "isoformat"):
            alert["timestamp"] = alert["timestamp"].isoformat()
    
    return {
        "total_logs": total_logs,
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts,
        "recent_alerts": recent_alerts,
        "health_metrics": health_metrics,
        "is_owner_view": is_owner
    }

# Alerts Endpoints
@app.get("/api/alerts")
async def get_alerts(current_user: dict = Depends(get_current_user), skip: int = 0, limit: int = 100):
    tenant_id = current_user["tenant_id"]
    is_owner = current_user["is_owner"]
    
    query = {} if is_owner else {"tenant_id": tenant_id}
    
    alerts = list(alerts_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit))
    
    # Convert ObjectId to string
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        if "timestamp" in alert and hasattr(alert["timestamp"], "isoformat"):
            alert["timestamp"] = alert["timestamp"].isoformat()
    
    return {"alerts": alerts, "total": alerts_collection.count_documents(query)}

@app.post("/api/alerts")
async def create_alert(alert_data: AlertCreate, current_user: dict = Depends(get_current_user)):
    alert_id = str(uuid.uuid4())
    alert = {
        "_id": alert_id,
        "tenant_id": current_user["tenant_id"],
        "severity": alert_data.severity,
        "source": alert_data.source,
        "entity": alert_data.entity,
        "message": alert_data.message,
        "metadata": alert_data.metadata,
        "timestamp": datetime.utcnow(),
        "status": "open",
        "assigned_to": None
    }
    
    alerts_collection.insert_one(alert)
    
    # Trigger automation rules
    await trigger_automations("alert_created", alert)
    
    return {"alert_id": alert_id, "message": "Alert created successfully"}

# Threat Intelligence Endpoints
@app.get("/api/threat-intel/iocs")
async def get_iocs(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    is_owner = current_user["is_owner"]
    
    query = {} if is_owner else {"tenant_id": tenant_id}
    
    iocs = list(iocs_collection.find(query).sort("created_at", -1))
    
    for ioc in iocs:
        ioc["_id"] = str(ioc["_id"])
        if "created_at" in ioc and hasattr(ioc["created_at"], "isoformat"):
            ioc["created_at"] = ioc["created_at"].isoformat()
    
    return {"iocs": iocs}

@app.post("/api/threat-intel/iocs")
async def create_ioc(ioc_data: IOCCreate, current_user: dict = Depends(get_current_user)):
    ioc_id = str(uuid.uuid4())
    ioc = {
        "_id": ioc_id,
        "tenant_id": current_user["tenant_id"],
        "ioc_type": ioc_data.ioc_type,
        "value": ioc_data.value,
        "threat_level": ioc_data.threat_level,
        "tags": ioc_data.tags,
        "description": ioc_data.description,
        "created_at": datetime.utcnow(),
        "created_by": current_user["user_id"]
    }
    
    iocs_collection.insert_one(ioc)
    return {"ioc_id": ioc_id, "message": "IOC created successfully"}

# API Keys Management
@app.get("/api/settings/api-keys")
async def get_api_keys(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    
    api_keys = list(api_keys_collection.find({"tenant_id": tenant_id}))
    
    # Don't return actual API keys, just metadata
    for key in api_keys:
        key["_id"] = str(key["_id"])
        key.pop("api_key", None)  # Remove actual key for security
        if "created_at" in key and hasattr(key["created_at"], "isoformat"):
            key["created_at"] = key["created_at"].isoformat()
    
    return {"api_keys": api_keys}

@app.post("/api/settings/api-keys")
async def save_api_key(api_key_data: ThreatIntelAPI, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    
    # Check if API key already exists for this service
    existing = api_keys_collection.find_one({"tenant_id": tenant_id, "name": api_key_data.name})
    
    if existing:
        # Update existing
        api_keys_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "api_key": api_key_data.api_key,
                "endpoint": api_key_data.endpoint,
                "enabled": api_key_data.enabled,
                "updated_at": datetime.utcnow()
            }}
        )
        return {"message": f"{api_key_data.name} API key updated successfully"}
    else:
        # Create new
        key_id = str(uuid.uuid4())
        api_keys_collection.insert_one({
            "_id": key_id,
            "tenant_id": tenant_id,
            "name": api_key_data.name,
            "api_key": api_key_data.api_key,
            "endpoint": api_key_data.endpoint,
            "enabled": api_key_data.enabled,
            "created_at": datetime.utcnow(),
            "created_by": current_user["user_id"]
        })
        return {"message": f"{api_key_data.name} API key saved successfully"}

# Automation Rules
@app.get("/api/automations")
async def get_automation_rules(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    
    rules = list(automations_collection.find({"tenant_id": tenant_id}))
    
    for rule in rules:
        rule["_id"] = str(rule["_id"])
        if "created_at" in rule and hasattr(rule["created_at"], "isoformat"):
            rule["created_at"] = rule["created_at"].isoformat()
    
    return {"automation_rules": rules}

@app.post("/api/automations")
async def create_automation_rule(rule_data: AutomationRule, current_user: dict = Depends(get_current_user)):
    rule_id = str(uuid.uuid4())
    rule = {
        "_id": rule_id,
        "tenant_id": current_user["tenant_id"],
        "name": rule_data.name,
        "trigger_type": rule_data.trigger_type,
        "trigger_config": rule_data.trigger_config,
        "actions": rule_data.actions,
        "enabled": rule_data.enabled,
        "created_at": datetime.utcnow(),
        "created_by": current_user["user_id"],
        "execution_count": 0
    }
    
    automations_collection.insert_one(rule)
    return {"rule_id": rule_id, "message": "Automation rule created successfully"}

# Tenant Management (Owner only)
@app.get("/api/admin/tenants")
async def get_tenants(current_user: dict = Depends(get_current_user)):
    if not current_user["is_owner"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    tenants = list(tenants_collection.find({}))
    
    for tenant in tenants:
        tenant["_id"] = str(tenant["_id"])
        if "created_at" in tenant and hasattr(tenant["created_at"], "isoformat"):
            tenant["created_at"] = tenant["created_at"].isoformat()
        
        # Add user count
        tenant["user_count"] = users_collection.count_documents({"tenant_id": tenant["_id"]})
    
    return {"tenants": tenants}

# Threat Intelligence API Integrations
async def query_abuseipdb(ip: str, api_key: str) -> Dict[str, Any]:
    """Query AbuseIPDB for IP reputation"""
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Key": api_key,
        "Accept": "application/json"
    }
    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90,
        "verbose": True
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API returned status {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

async def query_virustotal(indicator: str, api_key: str) -> Dict[str, Any]:
    """Query VirusTotal for indicator analysis"""
    url = f"https://www.virustotal.com/vtapi/v2/ip-address/report"
    params = {
        "apikey": api_key,
        "ip": indicator
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API returned status {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/threat-intel/lookup")
async def threat_intel_lookup(
    indicator: str, 
    ioc_type: str, 
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user["tenant_id"]
    
    # Get API keys for this tenant
    api_keys = list(api_keys_collection.find({"tenant_id": tenant_id, "enabled": True}))
    
    results = {}
    
    for key_doc in api_keys:
        service_name = key_doc["name"].lower()
        api_key = key_doc["api_key"]
        
        if service_name == "abuseipdb" and ioc_type == "ip":
            results["abuseipdb"] = await query_abuseipdb(indicator, api_key)
        elif service_name == "virustotal":
            results["virustotal"] = await query_virustotal(indicator, api_key)
    
    return {"indicator": indicator, "type": ioc_type, "results": results}

# Automation Engine
async def trigger_automations(event_type: str, event_data: Dict[str, Any]):
    """Trigger automation rules based on events"""
    tenant_id = event_data.get("tenant_id")
    if not tenant_id:
        return
    
    # Find matching automation rules
    rules = list(automations_collection.find({
        "tenant_id": tenant_id,
        "enabled": True,
        "trigger_type": event_type
    }))
    
    for rule in rules:
        await execute_automation_rule(rule, event_data)

async def execute_automation_rule(rule: Dict[str, Any], event_data: Dict[str, Any]):
    """Execute actions for an automation rule"""
    for action in rule["actions"]:
        action_type = action.get("type")
        
        if action_type == "send_email":
            # Mock email sending
            print(f"Sending email: {action.get('subject', 'Alert Notification')}")
        elif action_type == "block_ip":
            # Mock IP blocking
            print(f"Blocking IP: {event_data.get('entity', 'unknown')}")
        elif action_type == "tag_alert":
            # Add tag to alert
            if event_data.get("_id"):
                alerts_collection.update_one(
                    {"_id": event_data["_id"]},
                    {"$addToSet": {"tags": action.get("tag", "automated")}}
                )
        elif action_type == "create_case":
            # Create a case
            case_id = str(uuid.uuid4())
            cases_collection.insert_one({
                "_id": case_id,
                "tenant_id": rule["tenant_id"],
                "title": action.get("title", f"Auto-generated case for {event_data.get('entity', 'unknown')}"),
                "description": action.get("description", "Automatically created by SOAR automation"),
                "severity": event_data.get("severity", "medium"),
                "status": "open",
                "created_at": datetime.utcnow(),
                "created_by": "automation",
                "related_alerts": [event_data.get("_id")] if event_data.get("_id") else []
            })
    
    # Update execution count
    automations_collection.update_one(
        {"_id": rule["_id"]},
        {"$inc": {"execution_count": 1}}
    )

# Cases Management
@app.get("/api/cases")
async def get_cases(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["tenant_id"]
    is_owner = current_user["is_owner"]
    
    query = {} if is_owner else {"tenant_id": tenant_id}
    
    cases = list(cases_collection.find(query).sort("created_at", -1))
    
    for case in cases:
        case["_id"] = str(case["_id"])
        if "created_at" in case and hasattr(case["created_at"], "isoformat"):
            case["created_at"] = case["created_at"].isoformat()
    
    return {"cases": cases}

# System Health
@app.get("/api/system/health")
async def get_system_health(current_user: dict = Depends(get_current_user)):
    if not current_user["is_owner"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check database connectivity
    try:
        db.command("ping")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Check collections
    collections_health = {
        "users": users_collection.count_documents({}),
        "tenants": tenants_collection.count_documents({}),
        "alerts": alerts_collection.count_documents({}),
        "iocs": iocs_collection.count_documents({}),
        "automations": automations_collection.count_documents({})
    }
    
    return {
        "database": db_status,
        "collections": collections_health,
        "api_status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)