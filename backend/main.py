#!/usr/bin/env python3
"""
Jupiter SIEM Main Application
Production-ready FastAPI backend with admin-controlled user management
"""

import os
import sys
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, validator
import jwt
from dotenv import load_dotenv

# Load environment variables from multiple sources
load_dotenv()                    # Load root .env
load_dotenv('backend/.env')      # Load backend/.env (overrides)

# Environment-specific loading
env = os.getenv('APP_ENVIRONMENT', 'production')
if env == 'development':
    load_dotenv('.env.development')
elif env == 'production':
    load_dotenv('.env.production')

# Import our user management system
sys.path.append('/app')
from models.user_management import (
    UserManagementSystem, 
    UserCreateRequest, 
    PasswordSetRequest,
    UserRole,
    JWTManager
)

# Import query routes
from query_routes import router as query_router
from saved_queries_routes import router as saved_queries_router
from ai_routes import router as ai_router
from framework_routes import router as framework_router
from extended_framework_routes import router as extended_framework_router
from analyst_features_routes import router as analyst_router
from security_ops_routes import router as security_ops_router # New import

# Import security middleware
from security_middleware import setup_security_middleware

# Initialize FastAPI
app = FastAPI(
    title="Jupiter SIEM API",
    description="Security Information and Event Management System - Production Ready",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
allowed_origins = os.getenv("CORS_ORIGINS", "https://projectjupiter.in,https://www.projectjupiter.in").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configuration
DUCKDB_PATH = os.getenv("DUCKDB_PATH", "data/jupiter_siem.db")
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "jupiter_siem_production_secret_key")
EMAIL_CONFIG = {
    'host': os.getenv("EMAIL_HOST", "smtp.outlook.com"),
    'port': int(os.getenv("EMAIL_PORT", 587)),
    'username': os.getenv("EMAIL_USER", "harsha@projectjupiter.in"),
    'password': os.getenv("EMAIL_PASSWORD"),
    'use_tls': os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
}

# Initialize database and systems
from database import get_db_manager
db_manager = get_db_manager()
user_manager = UserManagementSystem(DUCKDB_PATH, EMAIL_CONFIG, JWT_SECRET)
jwt_manager = JWTManager(JWT_SECRET)
security = HTTPBearer()

# Setup security middleware
setup_security_middleware(app)

# Include query routes
app.include_router(query_router)
app.include_router(saved_queries_router)
app.include_router(ai_router)
app.include_router(framework_router)
app.include_router(extended_framework_router)
app.include_router(analyst_router)
app.include_router(security_ops_router) # New extended framework router

# Request/Response Models
class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, max_length=128, description="User password")
    tenant_id: Optional[str] = Field(None, max_length=100, description="Tenant ID")
    
    @validator('email')
    def validate_email_security(cls, v):
        """Enhanced email validation"""
        from security_utils import SecurityValidator
        is_valid, error = SecurityValidator.validate_email(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @validator('password')
    def validate_password_input(cls, v):
        """Basic password input validation"""
        if not v or len(v.strip()) == 0:
            raise ValueError("Password is required")
        return v.strip()
    
    @validator('tenant_id')
    def validate_tenant_id(cls, v):
        """Validate and sanitize tenant ID"""
        if v is not None:
            from security_utils import sanitize_string
            return sanitize_string(v, max_length=100)
        return v

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict
    expires_in: int

class UserListResponse(BaseModel):
    users: List[Dict]
    total: int

class PasswordRequirementsResponse(BaseModel):
    requirements: Dict

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Get current authenticated user"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user from database
        user = user_manager.users.find_one({"_id": user_id, "is_active": True})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Admin dependency
async def require_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """Require admin privileges"""
    if current_user.get("role") not in ["super_admin", "tenant_admin"]:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# Routes
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Jupiter SIEM API",
        "version": "2.0.0"
    }

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Authenticate user with email and password"""
    
    try:
        user_data = user_manager.authenticate_user(
            email=login_request.email,
            password=login_request.password,
            tenant_id=login_request.tenant_id
        )
        
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access token
        token_data = {
            "user_id": user_data["user_id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "tenant_id": user_data["tenant_id"]
        }
        
        access_token = jwt_manager.create_access_token(
            data=token_data,
            expires_delta=timedelta(hours=24)
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data,
            expires_in=24 * 3600  # 24 hours in seconds
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users")
async def create_user(
    user_request: UserCreateRequest,
    current_user: Dict = Depends(require_admin)
):
    """Create new user (admin only)"""
    
    try:
        result = user_manager.create_user(user_request, current_user["_id"])
        return {
            "message": "User created successfully",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users", response_model=UserListResponse)
async def list_users(
    tenant_id: Optional[str] = None,
    current_user: Dict = Depends(require_admin)
):
    """List all users (admin only)"""
    
    try:
        query = {"is_active": True}
        
        # If not super admin, limit to their tenant
        if current_user.get("role") != "super_admin":
            query["tenant_id"] = current_user["tenant_id"]
        elif tenant_id:
            query["tenant_id"] = tenant_id
        
        users = list(user_manager.users.find(query, {
            "password_hash": 0  # Exclude password hash
        }))
        
        # Convert ObjectId to string and add tenant names
        for user in users:
            user["_id"] = str(user["_id"])
            if user.get("created_at"):
                user["created_at"] = user["created_at"].isoformat()
            if user.get("last_login"):
                user["last_login"] = user["last_login"].isoformat()
            
            # Add tenant name
            tenant = user_manager.tenants.find_one({"_id": user["tenant_id"]})
            user["tenant_name"] = tenant["name"] if tenant else "Unknown"
        
        return UserListResponse(
            users=users,
            total=len(users)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/set-password")
async def set_password(request: PasswordSetRequest):
    """Set user password using token"""
    
    try:
        success = user_manager.set_user_password(request.token, request.password)
        
        if success:
            return {"message": "Password set successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to set password")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/password-requirements", response_model=PasswordRequirementsResponse)
async def get_password_requirements():
    """Get password requirements for frontend"""
    
    requirements = user_manager.get_password_requirements()
    return PasswordRequirementsResponse(requirements=requirements)

@app.get("/api/user/profile")
async def get_user_profile(current_user: Dict = Depends(get_current_user)):
    """Get current user profile"""
    
    # Remove sensitive data
    profile = current_user.copy()
    profile.pop("password_hash", None)
    profile["_id"] = str(profile["_id"])
    
    if profile.get("created_at"):
        profile["created_at"] = profile["created_at"].isoformat()
    if profile.get("last_login"):
        profile["last_login"] = profile["last_login"].isoformat()
    
    # Add tenant name
    tenant = user_manager.tenants.find_one({"_id": profile["tenant_id"]})
    profile["tenant_name"] = tenant["name"] if tenant else "Unknown"
    
    return profile

@app.get("/api/dashboard/overview")
async def dashboard_overview(current_user: Dict = Depends(get_current_user)):
    """Get dashboard overview data"""
    
    # Sample data - replace with real metrics
    return {
        "total_events": 156789,
        "critical_alerts": 23,
        "active_alerts": 342,
        "total_logs": 2847293,
        "connected_assets": 1247,
        "active_users": 89,
        "threat_intel_feeds": 6,
        "system_status": "operational",
        "last_updated": datetime.utcnow().isoformat()
    }

@app.get("/api/admin/tenants")
async def list_tenants(current_user: Dict = Depends(require_admin)):
    """List all tenants (admin only)"""
    
    try:
        query = {}
        
        # If not super admin, limit to their tenant
        if current_user.get("role") != "super_admin":
            query["_id"] = current_user["tenant_id"]
        
        tenants = list(user_manager.tenants.find(query))
        
        for tenant in tenants:
            tenant["_id"] = str(tenant["_id"])
            if tenant.get("created_at"):
                tenant["created_at"] = tenant["created_at"].isoformat()
        
        return {"tenants": tenants}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Initialize super admin on startup
@app.on_event("startup")
async def create_initial_admin():
    """Create initial super admin if not exists"""
    
    admin_email = os.getenv("SUPER_ADMIN_EMAIL", "admin@projectjupiter.in")
    admin_password = os.getenv("SUPER_ADMIN_PASSWORD", "Harsha@313")
    tenant_name = os.getenv("SUPER_ADMIN_TENANT_NAME", "MainTenant")
    
    try:
        result = user_manager.create_super_admin(admin_email, admin_password, tenant_name)
        print(f"✅ Super admin created: {result}")
        
        # Send welcome email to admin
        if EMAIL_CONFIG.get('password'):
            user_manager.email_service.send_welcome_email(
                email=admin_email,
                user_name="Administrator",
                tenant_name=tenant_name,
                password_reset_token="already_set",
                admin_email="system@projectjupiter.in"
            )
        
    except ValueError as e:
        if "already exists" in str(e):
            print("ℹ️ Super admin already exists")
        else:
            print(f"❌ Error creating super admin: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8001,
        reload=False,  # Disable in production
        log_level="info"
    )