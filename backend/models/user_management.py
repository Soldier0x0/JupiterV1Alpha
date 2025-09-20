#!/usr/bin/env python3
"""
Jupiter SIEM User Management System
Admin-controlled user creation with secure password requirements
"""

import os
import uuid
import re
import secrets
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
from pydantic import BaseModel, EmailStr, validator, Field
from database import get_db_manager
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security_utils import SecurityValidator, UserFriendlyValidator, sanitize_string

class UserRole(Enum):
    """User roles with specific permissions"""
    SUPER_ADMIN = "super_admin"
    TENANT_ADMIN = "tenant_admin" 
    SECURITY_ANALYST = "security_analyst"
    SOC_OPERATOR = "soc_operator"
    VIEWER = "viewer"
    GUEST = "guest"

class PasswordValidator:
    """Secure password validation with specific requirements"""
    
    MIN_LENGTH = 10
    ALLOWED_SPECIAL_CHARS = "!@#$%&*+-=?"
    
    @classmethod
    def validate_password(cls, password: str) -> Tuple[bool, List[str]]:
        """Validate password against security requirements"""
        errors = []
        
        if len(password) < cls.MIN_LENGTH:
            errors.append(f"Password must be at least {cls.MIN_LENGTH} characters long")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter (A-Z)")
            
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter (a-z)")
            
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number (0-9)")
            
        special_char_pattern = f'[{re.escape(cls.ALLOWED_SPECIAL_CHARS)}]'
        if not re.search(special_char_pattern, password):
            errors.append(f"Password must contain at least one special character ({cls.ALLOWED_SPECIAL_CHARS})")
        
        # Check for forbidden characters
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + cls.ALLOWED_SPECIAL_CHARS)
        if not set(password).issubset(allowed_chars):
            forbidden_chars = set(password) - allowed_chars
            errors.append(f"Password contains forbidden characters: {', '.join(forbidden_chars)}")
        
        return len(errors) == 0, errors

class UserCreateRequest(BaseModel):
    """Request model for creating new users"""
    email: EmailStr = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    tenant_name: Optional[str] = Field(None, max_length=100, description="Tenant name")
    permissions: Optional[List[str]] = Field(default=[], description="Custom permissions")
    send_email: bool = Field(default=True, description="Send welcome email")
    
    @validator('email')
    def validate_email_security(cls, v):
        """Enhanced email validation"""
        is_valid, error = SecurityValidator.validate_email(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @validator('tenant_name')
    def validate_tenant_name(cls, v):
        """Validate and sanitize tenant name"""
        if v is not None:
            sanitized = sanitize_string(v, max_length=100)
            if not sanitized.strip():
                raise ValueError("Tenant name cannot be empty")
            return sanitized
        return v
    
    @validator('permissions')
    def validate_permissions(cls, v):
        """Validate and sanitize permissions"""
        if v is None:
            return []
        
        sanitized_permissions = []
        for permission in v:
            sanitized = sanitize_string(permission, max_length=50)
            if sanitized.strip():
                sanitized_permissions.append(sanitized)
        
        return sanitized_permissions

class User(BaseModel):
    """User model for API responses"""
    id: str = Field(..., description="Unique user ID")
    email: EmailStr = Field(..., description="User email address")
    tenant_id: str = Field(..., description="Tenant ID for multi-tenancy")
    role: UserRole = Field(..., description="User role")
    is_active: bool = Field(..., description="Whether user is active")
    is_owner: bool = Field(..., description="Whether user is tenant owner")
    created_at: datetime = Field(..., description="User creation timestamp")
    updated_at: datetime = Field(..., description="User last update timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    two_fa_enabled: bool = Field(default=False, description="Whether 2FA is enabled")
    metadata: Optional[Dict] = Field(default_factory=dict, description="Additional user metadata")

class PasswordSetRequest(BaseModel):
    """Request model for setting user password"""
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., min_length=10, max_length=128, description="New password")
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Enhanced password validation with user-friendly feedback"""
        validation_result = UserFriendlyValidator.validate_password_with_help(v)
        if not validation_result["valid"]:
            # Return user-friendly error message
            issues = validation_result["issues"]
            suggestions = validation_result["suggestions"]
            error_msg = f"Password issues: {', '.join(issues)}. Suggestions: {'; '.join(suggestions[:3])}"
            raise ValueError(error_msg)
        return v
    
    @validator('token')
    def validate_token(cls, v):
        """Validate and sanitize token"""
        if not v or len(v.strip()) < 10:
            raise ValueError("Invalid token format")
        return sanitize_string(v, max_length=500)

class JWTManager:
    """JWT token management for secure authentication"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=1)
        
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_password_reset_token(self, user_id: str, email: str) -> str:
        """Create password reset token (expires in 24 hours)"""
        data = {
            "user_id": user_id,
            "email": email,
            "type": "password_reset",
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

class EmailService:
    """Email service for user notifications"""
    
    def __init__(self, smtp_config: Dict):
        self.smtp_config = smtp_config
    
    def send_welcome_email(self, email: str, user_name: str, tenant_name: str, 
                          password_reset_token: str, admin_email: str) -> bool:
        """Send welcome email with password setup instructions"""
        
        password_setup_url = f"https://projectjupiter.in/set-password?token={password_reset_token}"
        
        email_template = Template("""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Welcome to Jupiter SIEM</h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0 0;">Security Information and Event Management Platform</p>
                </div>
                
                <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                    <h2 style="color: #1e40af; margin-top: 0;">Your Account Has Been Created</h2>
                    <p>Hello <strong>{{ user_name }}</strong>,</p>
                    <p>Your Jupiter SIEM account has been created by the system administrator. You now have access to our security monitoring platform.</p>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #1ea8ff; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e40af;">Account Details:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li><strong>Email:</strong> {{ email }}</li>
                            <li><strong>Organization:</strong> {{ tenant_name }}</li>
                            <li><strong>Created by:</strong> {{ admin_email }}</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #92400e; margin-top: 0;">🔐 Set Your Secure Password</h3>
                    <p style="margin-bottom: 15px;">For security, you need to set a strong password that meets our requirements:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        <h4 style="color: #1f2937; margin-top: 0;">Password Requirements:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #374151;">
                            <li>Minimum 10 characters long</li>
                            <li>At least 1 uppercase letter (A-Z)</li>
                            <li>At least 1 lowercase letter (a-z)</li>
                            <li>At least 1 number (0-9)</li>
                            <li>At least 1 special character: {{ allowed_special_chars }}</li>
                            <li>Only safe characters allowed (no spaces or unusual symbols)</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{{ password_setup_url }}" 
                           style="display: inline-block; background: #1ea8ff; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            Set Your Password Now
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0;">
                        This link expires in 24 hours for security reasons.
                    </p>
                </div>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Click the "Set Your Password" button above</li>
                        <li>Create a secure password following our requirements</li>
                        <li>Log in to Jupiter SIEM at <a href="https://projectjupiter.in">https://projectjupiter.in</a></li>
                        <li>Explore the security dashboard and available tools</li>
                    </ol>
                </div>
                
                <div style="text-align: center; padding: 20px; border-top: 2px solid #e5e7eb; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        Need help? Contact your administrator at <a href="mailto:{{ admin_email }}">{{ admin_email }}</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                        Jupiter SIEM - Advanced Security Information and Event Management
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"Jupiter SIEM <{self.smtp_config['username']}>"
            msg['To'] = email
            msg['Subject'] = "Welcome to Jupiter SIEM - Complete Your Registration"
            
            html_content = email_template.render(
                user_name=user_name,
                email=email,
                tenant_name=tenant_name,
                password_setup_url=password_setup_url,
                admin_email=admin_email,
                allowed_special_chars=PasswordValidator.ALLOWED_SPECIAL_CHARS
            )
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port'])
            if self.smtp_config.get('use_tls', True):
                server.starttls()
            server.login(self.smtp_config['username'], self.smtp_config['password'])
            server.send_message(msg)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            return False

class UserManagementSystem:
    """Complete user management system for Jupiter SIEM"""
    
    def __init__(self, db_path: str, smtp_config: Dict, jwt_secret: str):
        self.db_manager = get_db_manager()
        self.jwt_manager = JWTManager(jwt_secret)
        self.email_service = EmailService(smtp_config)
        
        # Create indexes
        self.db_manager.create_index("users", [("email", 1), ("tenant_id", 1)], unique=True)
        self.db_manager.create_index("tenants", [("name", 1)], unique=True)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_super_admin(self, email: str, password: str, tenant_name: str) -> Dict:
        """Create the super admin account"""
        
        # Validate password
        is_valid, errors = PasswordValidator.validate_password(password)
        if not is_valid:
            raise ValueError(f"Password validation failed: {'; '.join(errors)}")
        
        # Check if super admin exists
        existing = self.db_manager.find_one("users", {"email": email, "role": "super_admin"})
        if existing:
            raise ValueError("Super admin already exists")
        
        # Create tenant
        tenant_id = f"jupiter-main-{secrets.token_hex(4)}"
        tenant_doc = {
            "id": tenant_id,
            "name": tenant_name,
            "description": "Main tenant for Jupiter SIEM",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        self.db_manager.insert_one("tenants", tenant_doc)
        
        # Create super admin user
        user_id = str(uuid.uuid4())
        hashed_password = self.hash_password(password)
        
        user_doc = {
            "id": user_id,
            "email": email,
            "password_hash": hashed_password,
            "tenant_id": tenant_id,
            "role": "super_admin",
            "metadata": {"permissions": ["*"], "created_by": "system", "password_set": True},  # All permissions
            "created_at": datetime.utcnow(),
            "is_active": True,
            "last_login": None
        }
        self.db_manager.insert_one("users", user_doc)
        
        return {
            "user_id": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "tenant_name": tenant_name
        }
    
    def create_user(self, request: UserCreateRequest, created_by: str) -> Dict:
        """Create new user (admin only)"""
        
        # Check if user already exists
        existing = self.db_manager.find_one("users", {"email": request.email})
        if existing:
            raise ValueError(f"User with email {request.email} already exists")
        
        # Create or get tenant
        if request.tenant_name:
            tenant = self.db_manager.find_one("tenants", {"name": request.tenant_name})
            if not tenant:
                tenant_id = f"jupiter-{secrets.token_hex(6)}"
                tenant_doc = {
                    "id": tenant_id,
                    "name": request.tenant_name,
                    "description": f"Custom tenant: {request.tenant_name}",
                    "created_at": datetime.utcnow(),
                    "owner_id": created_by,
                    "is_active": True
                }
                self.db_manager.insert_one("tenants", tenant_doc)
            else:
                tenant_id = tenant["id"]
        else:
            # Use main tenant
            main_tenant = self.db_manager.find_one("tenants", {"name": "MainTenant"})
            tenant_id = main_tenant["id"]
            request.tenant_name = main_tenant["name"]
        
        # Create user
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": request.email,
            "password_hash": None,  # Will be set when user creates password
            "tenant_id": tenant_id,
            "role": request.role.value,
            "metadata": {"permissions": request.permissions, "created_by": created_by, "password_set": False},
            "created_at": datetime.utcnow(),
            "is_active": True,
            "last_login": None
        }
        self.db_manager.insert_one("users", user_doc)
        
        # Create password reset token
        password_token = self.jwt_manager.create_password_reset_token(user_id, request.email)
        
        # Store token in database
        token_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "tenant_id": tenant_id,
            "token_type": "password_reset",
            "token_value": password_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "is_used": False
        }
        self.db_manager.insert_one("tokens", token_doc)
        
        # Send welcome email
        if request.send_email:
            admin = self.db_manager.find_one("users", {"id": created_by})
            admin_email = admin["email"] if admin else "admin@projectjupiter.in"
            
            email_sent = self.email_service.send_welcome_email(
                email=request.email,
                user_name=request.email.split('@')[0],
                tenant_name=request.tenant_name,
                password_reset_token=password_token,
                admin_email=admin_email
            )
        else:
            email_sent = False
        
        return {
            "user_id": user_id,
            "email": request.email,
            "tenant_id": tenant_id,
            "tenant_name": request.tenant_name,
            "role": request.role.value,
            "password_token": password_token,
            "email_sent": email_sent
        }
    
    def set_user_password(self, token: str, password: str) -> bool:
        """Set user password using reset token"""
        
        # Validate password
        is_valid, errors = PasswordValidator.validate_password(password)
        if not is_valid:
            raise ValueError(f"Password validation failed: {'; '.join(errors)}")
        
        # Verify token
        payload = self.jwt_manager.verify_token(token)
        if not payload or payload.get("type") != "password_reset":
            raise ValueError("Invalid or expired token")
        
        # Check if token was already used
        token_doc = self.tokens.find_one({"token": token, "used": False})
        if not token_doc:
            raise ValueError("Token already used or invalid")
        
        # Update user password
        user_id = payload["user_id"]
        hashed_password = self.hash_password(password)
        
        result = self.users.update_one(
            {"_id": user_id},
            {"$set": {
                "password_hash": hashed_password,
                "password_set": True,
                "password_updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise ValueError("User not found")
        
        # Mark token as used
        self.tokens.update_one(
            {"token": token},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
        
        return True
    
    def authenticate_user(self, email: str, password: str, tenant_id: str = None) -> Optional[Dict]:
        """Authenticate user and return user data"""
        
        query = {"email": email, "is_active": True}
        if tenant_id:
            query["tenant_id"] = tenant_id
        
        user = self.users.find_one(query)
        if not user or not user.get("password_hash"):
            return None
        
        if not self.verify_password(password, user["password_hash"]):
            return None
        
        # Update last login
        self.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Get tenant info
        tenant = self.tenants.find_one({"_id": user["tenant_id"]})
        
        return {
            "user_id": user["_id"],
            "email": user["email"],
            "role": user["role"],
            "permissions": user.get("permissions", []),
            "tenant_id": user["tenant_id"],
            "tenant_name": tenant["name"] if tenant else "Unknown"
        }
    
    def get_password_requirements(self) -> Dict:
        """Get password requirements for frontend display"""
        return {
            "min_length": PasswordValidator.MIN_LENGTH,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_digit": True,
            "require_special": True,
            "allowed_special_chars": PasswordValidator.ALLOWED_SPECIAL_CHARS,
            "description": "Create a strong password with at least 10 characters including uppercase, lowercase, numbers, and special characters."
        }