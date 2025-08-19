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

# Initialize default roles on startup
@app.on_event("startup")
async def startup_event():
    initialize_default_roles()

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
roles_collection = db.roles  # New collection for RBAC

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

class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: str
    permissions: List[str]
    level: int  # Hierarchy level - lower numbers = more powerful
    tenant_scoped: bool = True  # Whether this role is limited to tenant scope

class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    enabled: Optional[bool] = None

class UserRoleAssignment(BaseModel):
    user_id: str
    role_id: str
    assigned_by: str

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

# RBAC System Constants and Functions
DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "display_name": "Super Administrator", 
        "description": "Complete system access across all tenants",
        "permissions": [
            "system:manage", "tenants:create", "tenants:delete", "tenants:manage",
            "users:create", "users:delete", "users:manage", "roles:manage",
            "dashboards:view", "dashboards:manage", "alerts:view", "alerts:manage",
            "intel:view", "intel:manage", "automations:view", "automations:manage",
            "cases:view", "cases:manage", "settings:view", "settings:manage",
            "ai:view", "ai:manage", "reports:generate"
        ],
        "level": 0,
        "tenant_scoped": False
    },
    {
        "name": "tenant_owner",
        "display_name": "Tenant Owner",
        "description": "Full access within tenant scope",
        "permissions": [
            "users:create", "users:manage", "roles:assign",
            "dashboards:view", "dashboards:manage", "alerts:view", "alerts:manage",
            "intel:view", "intel:manage", "automations:view", "automations:manage", 
            "cases:view", "cases:manage", "settings:view", "settings:manage",
            "ai:view", "ai:manage", "reports:generate"
        ],
        "level": 1,
        "tenant_scoped": True
    },
    {
        "name": "admin",
        "display_name": "Administrator",
        "description": "Administrative access to security operations",
        "permissions": [
            "dashboards:view", "dashboards:manage", "alerts:view", "alerts:manage",
            "intel:view", "intel:manage", "automations:view", "automations:manage",
            "cases:view", "cases:manage", "settings:view", "ai:view", "ai:manage"
        ],
        "level": 2,
        "tenant_scoped": True
    },
    {
        "name": "analyst",
        "display_name": "Security Analyst",
        "description": "Operational access for threat analysis and response",
        "permissions": [
            "dashboards:view", "alerts:view", "alerts:manage", "intel:view", 
            "intel:create", "cases:view", "cases:manage", "ai:view"
        ],
        "level": 3,
        "tenant_scoped": True
    },
    {
        "name": "viewer",
        "display_name": "Viewer",
        "description": "Read-only access to security data",
        "permissions": [
            "dashboards:view", "alerts:view", "intel:view", "cases:view"
        ],
        "level": 4,
        "tenant_scoped": True
    }
]

def initialize_default_roles():
    """Initialize default roles if they don't exist"""
    try:
        for role_data in DEFAULT_ROLES:
            existing = roles_collection.find_one({"name": role_data["name"]})
            if not existing:
                role_id = str(uuid.uuid4())
                role = {
                    "_id": role_id,
                    **role_data,
                    "enabled": True,
                    "created_at": datetime.utcnow(),
                    "created_by": "system"
                }
                roles_collection.insert_one(role)
                print(f"Initialized role: {role_data['display_name']}")
    except Exception as e:
        print(f"Error initializing roles: {e}")

def has_permission(user_permissions: List[str], required_permission: str) -> bool:
    """Check if user has required permission"""
    if "system:manage" in user_permissions:  # Super admin has all permissions
        return True
    return required_permission in user_permissions

def get_user_permissions(user_id: str, tenant_id: str = None) -> List[str]:
    """Get all permissions for a user"""
    try:
        user = users_collection.find_one({"_id": user_id})
        if not user:
            return []
        
        # Get user's role
        role_id = user.get("role_id")
        if not role_id:
            # Fallback for legacy users - convert is_owner to role
            if user.get("is_owner", False):
                # Find tenant_owner role
                role = roles_collection.find_one({"name": "tenant_owner"})
            else:
                # Find viewer role as default
                role = roles_collection.find_one({"name": "viewer"})
                
            if role:
                return role.get("permissions", [])
            return []
        
        role = roles_collection.find_one({"_id": role_id, "enabled": True})
        if not role:
            return []
            
        return role.get("permissions", [])
    except Exception as e:
        print(f"Error getting user permissions: {e}")
        return []

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get current_user from kwargs or function signature
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
            
            if not has_permission(user_permissions, permission):
                raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
                
            return func(*args, **kwargs)
        return wrapper
    return decorator

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
        
        if user_id is None or tenant_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user with role information
        user = users_collection.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Get user's role and permissions
        role = None
        permissions = []
        
        if user.get("role_id"):
            role = roles_collection.find_one({"_id": user["role_id"], "enabled": True})
            if role:
                permissions = role.get("permissions", [])
        else:
            # Legacy support - convert is_owner to permissions
            if user.get("is_owner", False):
                # Find tenant_owner role for permissions
                owner_role = roles_collection.find_one({"name": "tenant_owner"})
                if owner_role:
                    permissions = owner_role.get("permissions", [])
        
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "email": payload.get("email"),
            "is_owner": payload.get("is_owner", False),  # Keep for backward compatibility
            "role": role.get("name") if role else ("tenant_owner" if user.get("is_owner") else "viewer"),
            "role_display": role.get("display_name") if role else ("Tenant Owner" if user.get("is_owner") else "Viewer"),
            "permissions": permissions
        }
    except JWTError:
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

@app.get("/api/auth/tenant/{tenant_name}")
async def get_tenant_by_name(tenant_name: str):
    """Get tenant ID by tenant name for authentication"""
    tenant = tenants_collection.find_one({"name": tenant_name})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"tenant_id": tenant["_id"], "name": tenant["name"]}

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

# Role-Based Access Control (RBAC) Endpoints

@app.get("/api/roles")
async def get_roles(current_user: dict = Depends(get_current_user)):
    """Get all available roles - requires roles:manage or system:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not (has_permission(user_permissions, "roles:manage") or has_permission(user_permissions, "system:manage")):
        raise HTTPException(status_code=403, detail="Permission required: roles:manage")
    
    try:
        # Super admins can see all roles, others only tenant-scoped roles
        if has_permission(user_permissions, "system:manage"):
            query = {}
        else:
            query = {"tenant_scoped": True}
        
        roles = list(roles_collection.find(query).sort("level", 1))
        
        for role in roles:
            role["_id"] = str(role["_id"])
            if "created_at" in role and hasattr(role["created_at"], "isoformat"):
                role["created_at"] = role["created_at"].isoformat()
        
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get roles: {str(e)}")

@app.post("/api/roles")
async def create_role(role_data: RoleCreate, current_user: dict = Depends(get_current_user)):
    """Create a new role - requires system:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not has_permission(user_permissions, "system:manage"):
        raise HTTPException(status_code=403, detail="Permission required: system:manage")
    
    try:
        # Check if role name already exists
        existing = roles_collection.find_one({"name": role_data.name})
        if existing:
            raise HTTPException(status_code=400, detail="Role name already exists")
        
        role_id = str(uuid.uuid4())
        role = {
            "_id": role_id,
            "name": role_data.name,
            "display_name": role_data.display_name,
            "description": role_data.description,
            "permissions": role_data.permissions,
            "level": role_data.level,
            "tenant_scoped": role_data.tenant_scoped,
            "enabled": True,
            "created_at": datetime.utcnow(),
            "created_by": current_user["user_id"]
        }
        
        roles_collection.insert_one(role)
        return {"role_id": role_id, "message": "Role created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create role: {str(e)}")

@app.put("/api/roles/{role_id}")
async def update_role(role_id: str, role_data: RoleUpdate, current_user: dict = Depends(get_current_user)):
    """Update a role - requires system:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not has_permission(user_permissions, "system:manage"):
        raise HTTPException(status_code=403, detail="Permission required: system:manage")
    
    try:
        role = roles_collection.find_one({"_id": role_id})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Prevent modification of system default roles
        if role.get("created_by") == "system":
            raise HTTPException(status_code=400, detail="Cannot modify system default roles")
        
        update_data = {k: v for k, v in role_data.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.utcnow()
        update_data["updated_by"] = current_user["user_id"]
        
        roles_collection.update_one({"_id": role_id}, {"$set": update_data})
        return {"message": "Role updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")

@app.delete("/api/roles/{role_id}")
async def delete_role(role_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a role - requires system:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not has_permission(user_permissions, "system:manage"):
        raise HTTPException(status_code=403, detail="Permission required: system:manage")
    
    try:
        role = roles_collection.find_one({"_id": role_id})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Prevent deletion of system default roles
        if role.get("created_by") == "system":
            raise HTTPException(status_code=400, detail="Cannot delete system default roles")
        
        # Check if any users have this role
        users_with_role = users_collection.count_documents({"role_id": role_id})
        if users_with_role > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete role: {users_with_role} users still have this role")
        
        roles_collection.delete_one({"_id": role_id})
        return {"message": "Role deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete role: {str(e)}")

@app.post("/api/users/{user_id}/role")
async def assign_user_role(user_id: str, assignment: UserRoleAssignment, current_user: dict = Depends(get_current_user)):
    """Assign a role to a user - requires users:manage or roles:assign permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not (has_permission(user_permissions, "users:manage") or has_permission(user_permissions, "roles:assign")):
        raise HTTPException(status_code=403, detail="Permission required: users:manage or roles:assign")
    
    try:
        # Check if user exists and is in the same tenant (unless super admin)
        user = users_collection.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Tenant scoping check (super admins can assign across tenants)
        if not has_permission(user_permissions, "system:manage"):
            if user.get("tenant_id") != current_user.get("tenant_id"):
                raise HTTPException(status_code=403, detail="Cannot assign roles to users in other tenants")
        
        # Check if role exists
        role = roles_collection.find_one({"_id": assignment.role_id, "enabled": True})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Check if user can assign this role level
        current_user_role = roles_collection.find_one({"name": current_user.get("role", "viewer")})
        current_user_level = current_user_role.get("level", 999) if current_user_role else 999
        
        # Users cannot assign roles higher than their own level
        if role.get("level", 0) < current_user_level and not has_permission(user_permissions, "system:manage"):
            raise HTTPException(status_code=403, detail="Cannot assign role with higher privileges")
        
        # Update user's role
        users_collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "role_id": assignment.role_id,
                    "role_assigned_at": datetime.utcnow(),
                    "role_assigned_by": current_user["user_id"]
                }
            }
        )
        
        return {"message": f"Role '{role['display_name']}' assigned to user successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign role: {str(e)}")

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Get users with role information - requires users:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not has_permission(user_permissions, "users:manage"):
        raise HTTPException(status_code=403, detail="Permission required: users:manage")
    
    try:
        # Super admins can see all users, others only their tenant
        if has_permission(user_permissions, "system:manage"):
            query = {}
        else:
            query = {"tenant_id": current_user.get("tenant_id")}
        
        users = list(users_collection.find(query))
        
        # Enrich with role information
        for user in users:
            user["_id"] = str(user["_id"])
            if "created_at" in user and hasattr(user["created_at"], "isoformat"):
                user["created_at"] = user["created_at"].isoformat()
            if "last_login" in user and user["last_login"] and hasattr(user["last_login"], "isoformat"):
                user["last_login"] = user["last_login"].isoformat()
            
            # Add role information
            if user.get("role_id"):
                role = roles_collection.find_one({"_id": user["role_id"]})
                if role:
                    user["role_name"] = role["name"]
                    user["role_display"] = role["display_name"]
                    user["role_level"] = role["level"]
            else:
                # Legacy support
                if user.get("is_owner", False):
                    user["role_name"] = "tenant_owner"
                    user["role_display"] = "Tenant Owner"
                    user["role_level"] = 1
                else:
                    user["role_name"] = "viewer"
                    user["role_display"] = "Viewer"
                    user["role_level"] = 4
            
            # Remove sensitive data
            user.pop("otp", None)
            user.pop("otp_expires", None)
        
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

@app.get("/api/permissions")
async def get_available_permissions(current_user: dict = Depends(get_current_user)):
    """Get all available permissions - requires roles:manage permission"""
    user_permissions = get_user_permissions(current_user["user_id"], current_user.get("tenant_id"))
    
    if not has_permission(user_permissions, "roles:manage"):
        raise HTTPException(status_code=403, detail="Permission required: roles:manage")
    
    permissions = [
        # System level
        {"name": "system:manage", "description": "Complete system administration", "category": "System"},
        
        # Tenant management
        {"name": "tenants:create", "description": "Create new tenants", "category": "Tenants"},
        {"name": "tenants:delete", "description": "Delete tenants", "category": "Tenants"},
        {"name": "tenants:manage", "description": "Manage tenant settings", "category": "Tenants"},
        
        # User management
        {"name": "users:create", "description": "Create new users", "category": "Users"},
        {"name": "users:delete", "description": "Delete users", "category": "Users"},
        {"name": "users:manage", "description": "Manage user accounts", "category": "Users"},
        
        # Role management
        {"name": "roles:manage", "description": "Manage roles and permissions", "category": "Roles"},
        {"name": "roles:assign", "description": "Assign roles to users", "category": "Roles"},
        
        # Dashboard access
        {"name": "dashboards:view", "description": "View dashboards", "category": "Dashboards"},
        {"name": "dashboards:manage", "description": "Customize and manage dashboards", "category": "Dashboards"},
        
        # Alerts
        {"name": "alerts:view", "description": "View alerts", "category": "Alerts"},
        {"name": "alerts:manage", "description": "Create and manage alerts", "category": "Alerts"},
        
        # Threat Intelligence
        {"name": "intel:view", "description": "View threat intelligence", "category": "Threat Intelligence"},
        {"name": "intel:create", "description": "Create threat intelligence entries", "category": "Threat Intelligence"},
        {"name": "intel:manage", "description": "Full threat intelligence management", "category": "Threat Intelligence"},
        
        # Automations
        {"name": "automations:view", "description": "View automation rules", "category": "Automations"},
        {"name": "automations:manage", "description": "Create and manage automations", "category": "Automations"},
        
        # Cases
        {"name": "cases:view", "description": "View cases", "category": "Cases"},
        {"name": "cases:manage", "description": "Create and manage cases", "category": "Cases"},
        
        # Settings
        {"name": "settings:view", "description": "View system settings", "category": "Settings"},
        {"name": "settings:manage", "description": "Modify system settings", "category": "Settings"},
        
        # AI Features
        {"name": "ai:view", "description": "Access AI features", "category": "AI"},
        {"name": "ai:manage", "description": "Configure AI settings", "category": "AI"},
        
        # Reports
        {"name": "reports:generate", "description": "Generate reports", "category": "Reports"}
    ]
    
    return {"permissions": permissions}

if __name__ == "__main__":
    import uvicorn
    # Initialize default roles on startup
    initialize_default_roles()
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