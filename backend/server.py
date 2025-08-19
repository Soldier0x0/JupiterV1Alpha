from fastapi import FastAPI, HTTPException, Depends, Response, Cookie, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import os
from jose import JWTError, jwt
import bcrypt
import uuid
import random
import requests
import json
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
import asyncio
import aiohttp
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
sessions_collection = db.sessions  # New collection for OAuth sessions

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

class OAuthSession(BaseModel):
    session_id: str

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

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session_token: Optional[str] = Cookie(None)
):
    # Try session token first (OAuth)
    if session_token:
        session = sessions_collection.find_one({
            "session_token": session_token,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        if session:
            user = users_collection.find_one({"_id": session["user_id"]})
            if user:
                return {
                    "user_id": user["_id"],
                    "tenant_id": user["tenant_id"],
                    "email": user["email"],
                    "is_owner": user.get("is_owner", False)
                }
    
    # Fallback to JWT token (traditional auth)
    if credentials:
        try:
            token = credentials.credentials
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
            tenant_id = payload.get("tenant_id")
            
            if user_id is None or tenant_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            return {
                "user_id": user_id,
                "tenant_id": tenant_id,
                "email": payload.get("email"),
                "is_owner": payload.get("is_owner", False)
            }
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    raise HTTPException(status_code=401, detail="Authentication required")

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

@app.get("/api/auth/tenant/{tenant_name}")
async def get_tenant_by_name(tenant_name: str):
    """Get tenant ID by tenant name for authentication"""
    tenant = tenants_collection.find_one({"name": tenant_name})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"tenant_id": tenant["_id"], "name": tenant["name"]}

# OAuth Endpoints
@app.post("/api/auth/oauth/profile")
async def oauth_profile(session_data: OAuthSession, response: Response):
    """Handle OAuth session authentication from Emergent auth"""
    try:
        # Call Emergent auth API to get session data
        async with aiohttp.ClientSession() as session:
            headers = {"X-Session-ID": session_data.session_id}
            async with session.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers=headers
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid session")
                
                auth_data = await resp.json()
                
        # Extract user data
        user_email = auth_data["email"]
        user_name = auth_data.get("name", "")
        user_picture = auth_data.get("picture", "")
        session_token = auth_data["session_token"]
        
        # Check if user exists, create if not
        user = users_collection.find_one({"email": user_email})
        
        if not user:
            # Create default tenant for new OAuth users
            tenant_id = str(uuid.uuid4())
            default_tenant_name = f"{user_name.split()[0] if user_name else 'User'}'s Organization"
            
            tenants_collection.insert_one({
                "_id": tenant_id,
                "name": default_tenant_name,
                "created_at": datetime.utcnow(),
                "enabled": True
            })
            
            # Create new user
            user_id = str(uuid.uuid4())
            users_collection.insert_one({
                "_id": user_id,
                "email": user_email,
                "name": user_name,
                "picture": user_picture,
                "tenant_id": tenant_id,
                "is_owner": True,  # OAuth users are owners of their default tenant
                "auth_method": "oauth",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            })
            
            user = users_collection.find_one({"_id": user_id})
        else:
            # Update last login for existing user
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Save session token with 7-day expiry
        session_expiry = datetime.utcnow() + timedelta(days=7)
        sessions_collection.update_one(
            {"session_token": session_token},
            {
                "$set": {
                    "user_id": user["_id"],
                    "expires_at": session_expiry,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Set HttpOnly cookie with session token
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,  # 7 days in seconds
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {
            "success": True,
            "user": {
                "user_id": user["_id"],
                "email": user["email"],
                "name": user.get("name", ""),
                "tenant_id": user["tenant_id"],
                "is_owner": user.get("is_owner", False)
            },
            "session_token": session_token
        }
        
    except Exception as e:
        print(f"OAuth authentication error: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

# Helper function to get user from session token
async def get_current_user_from_session(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """Get current user from session token (cookie or header)"""
    token = session_token
    
    # Fallback to Authorization header if no cookie
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
    
    if not token:
        return None
    
    # Check if session exists and is valid
    session = sessions_collection.find_one({
        "session_token": token,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not session:
        return None
    
    # Get user data
    user = users_collection.find_one({"_id": session["user_id"]})
    return user

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
    
    # For development/testing - include OTP in response
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "development":
        return {"message": "OTP sent successfully", "dev_otp": otp}
    else:
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

class ThreatLookupRequest(BaseModel):
    indicator: str
    ioc_type: str

@app.post("/api/threat-intel/lookup")
async def threat_intel_lookup(
    request: ThreatLookupRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        tenant_id = current_user["tenant_id"]
        
        # Get API keys for this tenant (exclude AI model configs)
        api_keys = list(api_keys_collection.find({
            "tenant_id": tenant_id, 
            "enabled": True,
            "service_type": {"$ne": "ai_model"}  # Exclude AI model configurations
        }))
        
        results = {}
        
        for key_doc in api_keys:
            # Check if this is a threat intel API key (has 'name' field)
            if 'name' not in key_doc:
                continue
                
            service_name = key_doc["name"].lower()
            api_key = key_doc["api_key"]
            
            try:
                if service_name == "abuseipdb" and request.ioc_type == "ip":
                    results["abuseipdb"] = await query_abuseipdb(request.indicator, api_key)
                elif service_name == "virustotal":
                    results["virustotal"] = await query_virustotal(request.indicator, api_key)
            except Exception as e:
                results[service_name] = {"error": f"Service query failed: {str(e)}"}
        
        return {"indicator": request.indicator, "type": request.ioc_type, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threat intel lookup failed: {str(e)}")

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

# AI Endpoints - Integrated directly to avoid import issues
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

# AI Pydantic Models
class ThreatAnalysisRequest(BaseModel):
    source_ip: Optional[str] = None
    technique: Optional[str] = None
    severity: str = "medium"
    indicators: List[str] = []
    timeline: Optional[str] = None
    metadata: Dict[str, Any] = {}
    model_preference: str = "auto"

class AIChartRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    model_preference: str = "auto"
    context_type: str = "security"

class AIKeyConfigRequest(BaseModel):
    provider: str  # openai, anthropic, google, emergent
    api_key: str
    model_name: str = "gpt-4o-mini"
    enabled: bool = True

# AI Analysis Endpoints
@app.post("/api/ai/analyze/threat")
async def analyze_threat_with_ai(
    request: ThreatAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """AI-powered threat analysis - Mock implementation for now"""
    try:
        # Mock AI analysis response
        analysis = {
            "analysis_id": str(uuid.uuid4()),
            "threat_data": {
                "source_ip": request.source_ip,
                "technique": request.technique,
                "severity": request.severity,
                "indicators": request.indicators,
                "confidence": 94.7
            },
            "ai_analysis": {
                "severity_assessment": "HIGH",
                "confidence": 94.7,
                "threat_type": "APT Activity",
                "explanation": "AI has detected coordinated attack patterns similar to APT29 campaigns. The attack exhibits lateral movement techniques and credential harvesting behaviors typical of state-sponsored actors.",
                "recommendations": [
                    "Immediate isolation of affected endpoints",
                    "Deploy deception technology to confuse attackers",
                    "Activate threat hunting playbook TH-2024-001",
                    "Alert incident response team with Purple Team engagement"
                ],
                "biological_analogy": "This threat behaves like a viral infection - fast-spreading with polymorphic characteristics. The immune system should activate memory cells for similar past infections.",
                "risk_evolution": "87% likelihood of escalation within 24 hours if not contained",
                "attack_psychology": "Attacker shows patience and stealth - likely experienced threat actor with long-term objectives"
            },
            "model_used": request.model_preference,
            "rag_context_count": 3,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/ai/chat")
async def ai_security_chat(
    request: AIChartRequest,
    current_user: dict = Depends(get_current_user)
):
    """AI Chat for security analysis - Mock implementation"""
    try:
        # Mock AI chat response
        responses = [
            "Based on the indicators you've provided, this appears to be a sophisticated attack targeting your network infrastructure. I recommend immediate containment actions.",
            "The behavioral patterns suggest this is likely an advanced persistent threat (APT) actor. The attack techniques align with known TTPs from Eastern European threat groups.",
            "Your network logs show signs of lateral movement using WMI and PowerShell. This is consistent with modern living-off-the-land techniques.",
            "The time-based analysis reveals the attacker has been in your environment for approximately 72 hours, suggesting a patient, methodical approach.",
            "I'm seeing anomalous authentication patterns that suggest credential harvesting. Recommend immediate password resets for affected accounts."
        ]
        
        session_id = request.session_id or str(uuid.uuid4())
        
        # Select response based on message content
        response_text = random.choice(responses)
        
        return {
            "session_id": session_id,
            "response": {
                "model": "jupiter-ai-security-analyst",
                "response": response_text,
                "confidence": 89.5,
                "analysis_type": request.context_type
            },
            "context_used": 3,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.get("/api/ai/models")
async def get_available_ai_models(current_user: dict = Depends(get_current_user)):
    """Get available AI models"""
    return {
        "local_models": ["llama2:7b", "llama2:13b", "mistral:7b", "codellama:7b"],
        "cloud_providers": ["openai", "anthropic", "google", "emergent"],
        "recommended": {
            "fast_analysis": "local:llama2:7b",
            "deep_analysis": "cloud:emergent:gpt-4o",
            "privacy_focused": "local:mistral:7b"
        },
        "emergent_key_available": bool(os.getenv("EMERGENT_LLM_KEY")),
        "status": {
            "ollama_available": True,  # Mock for now
            "vector_db_ready": True,
            "rag_documents": 156
        }
    }

@app.post("/api/ai/config/api-key")
async def save_ai_api_key(
    request: AIKeyConfigRequest,
    current_user: dict = Depends(get_current_user)
):
    """Save AI API key configuration"""
    try:
        tenant_id = current_user["tenant_id"]
        
        # Check if API key configuration already exists
        existing = api_keys_collection.find_one({
            "tenant_id": tenant_id, 
            "service_type": "ai_model",
            "provider": request.provider
        })
        
        config_data = {
            "tenant_id": tenant_id,
            "service_type": "ai_model",
            "provider": request.provider,
            "api_key": request.api_key,
            "model_name": request.model_name,
            "enabled": request.enabled,
            "updated_at": datetime.utcnow()
        }
        
        if existing:
            # Update existing configuration
            api_keys_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": config_data}
            )
            message = f"{request.provider} AI configuration updated successfully"
        else:
            # Create new configuration
            config_data["_id"] = str(uuid.uuid4())
            config_data["created_at"] = datetime.utcnow()
            config_data["created_by"] = current_user["user_id"]
            api_keys_collection.insert_one(config_data)
            message = f"{request.provider} AI configuration saved successfully"
        
        return {"message": message, "provider": request.provider}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save AI configuration: {str(e)}")

@app.get("/api/ai/config")
async def get_ai_configurations(current_user: dict = Depends(get_current_user)):
    """Get AI model configurations for tenant"""
    try:
        tenant_id = current_user["tenant_id"]
        
        configs = list(api_keys_collection.find({
            "tenant_id": tenant_id,
            "service_type": "ai_model"
        }))
        
        # Remove sensitive API keys from response
        for config in configs:
            config["_id"] = str(config["_id"])
            config.pop("api_key", None)  # Don't return actual keys
            config["api_key_configured"] = True
            if "created_at" in config:
                config["created_at"] = config["created_at"].isoformat()
            if "updated_at" in config:
                config["updated_at"] = config["updated_at"].isoformat()
        
        return {"ai_configurations": configs}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI configurations: {str(e)}")

# Add intelligence summary for dashboard
@app.get("/api/ai/intelligence/summary")
async def get_ai_intelligence_summary(current_user: dict = Depends(get_current_user)):
    """Get AI intelligence summary for dashboard"""
    try:
        tenant_id = current_user["tenant_id"]
        
        # Mock intelligence data - in real implementation this would come from AI analysis
        summary = {
            "recent_analyses": 47,
            "threat_assessments_today": 12,
            "high_confidence_alerts": 3,
            "ai_recommendations": [
                "Deploy additional deception technology on network segment 10.0.50.x",
                "Investigate anomalous authentication patterns from IP 192.168.1.247",
                "Consider threat hunting for persistence mechanisms in domain controllers"
            ],
            "immune_system_health": {
                "adaptive_learning": 94.2,
                "threat_memory_cells": 3456,
                "antibody_patterns": 1247,
                "resistance_strength": 89.1
            },
            "cognitive_load": 42,
            "ai_health": {
                "local_models_available": True,
                "cloud_providers_configured": 2,
                "rag_operational": True,
                "vector_documents": 156
            }
        }
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate intelligence summary: {str(e)}")