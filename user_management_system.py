#!/usr/bin/env python3
"""
Jupiter SIEM Advanced User Management System
Handles user registration, authentication, role-based access control (RBAC)
"""

import os
import uuid
import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass
from pymongo import MongoClient
from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class UserRole(Enum):
    """User roles with hierarchy levels"""
    SUPER_ADMIN = 0      # System-wide access
    TENANT_OWNER = 1     # Full tenant access
    ADMIN = 2            # Administrative access within tenant
    ANALYST = 3          # Security analyst with operational access
    VIEWER = 4           # Read-only access
    GUEST = 5            # Limited read access

class PermissionCategory(Enum):
    """Permission categories for granular access control"""
    SYSTEM = "system"
    TENANTS = "tenants"
    USERS = "users"
    ROLES = "roles"
    DASHBOARDS = "dashboards"
    ALERTS = "alerts"
    INTEL = "intel"
    AUTOMATIONS = "automations"
    CASES = "cases"
    SETTINGS = "settings"
    AI = "ai"
    REPORTS = "reports"

@dataclass
class Permission:
    """Individual permission definition"""
    category: PermissionCategory
    action: str  # view, create, update, delete, manage
    description: str
    
    @property
    def full_name(self) -> str:
        return f"{self.category.value}:{self.action}"

@dataclass
class RoleDefinition:
    """Role definition with permissions and metadata"""
    name: str
    display_name: str
    description: str
    level: int
    permissions: List[str]
    tenant_scoped: bool = True
    system_role: bool = False

class UserManagementSystem:
    """
    Comprehensive user management system for Jupiter SIEM
    """
    
    def __init__(self, mongo_url: str, smtp_config: Dict = None):
        self.client = MongoClient(mongo_url)
        self.db = self.client.jupiter_siem
        
        # Collections
        self.users = self.db.users
        self.tenants = self.db.tenants
        self.roles = self.db.roles
        self.sessions = self.db.sessions
        self.audit_logs = self.db.audit_logs
        
        # SMTP configuration for emails
        self.smtp_config = smtp_config or self._load_smtp_config()
        
        # Initialize default roles and permissions
        self._initialize_permissions()
        self._initialize_default_roles()
    
    def _load_smtp_config(self) -> Dict:
        """Load SMTP configuration from environment"""
        return {
            'host': os.getenv('EMAIL_HOST', 'smtp.outlook.com'),
            'port': int(os.getenv('EMAIL_PORT', 587)),
            'username': os.getenv('EMAIL_USER', 'harsha@projectjupiter.in'),
            'password': os.getenv('EMAIL_PASSWORD'),
            'use_tls': os.getenv('EMAIL_USE_TLS', 'true').lower() == 'true'
        }
    
    def _initialize_permissions(self):
        """Initialize all available permissions"""
        self.all_permissions = [
            # System permissions
            Permission(PermissionCategory.SYSTEM, "manage", "Complete system administration"),
            
            # Tenant management
            Permission(PermissionCategory.TENANTS, "create", "Create new tenants"),
            Permission(PermissionCategory.TENANTS, "delete", "Delete tenants"),
            Permission(PermissionCategory.TENANTS, "manage", "Manage tenant settings"),
            Permission(PermissionCategory.TENANTS, "view", "View tenant information"),
            
            # User management
            Permission(PermissionCategory.USERS, "create", "Create new users"),
            Permission(PermissionCategory.USERS, "delete", "Delete users"),
            Permission(PermissionCategory.USERS, "manage", "Manage user accounts"),
            Permission(PermissionCategory.USERS, "view", "View user information"),
            Permission(PermissionCategory.USERS, "invite", "Send user invitations"),
            
            # Role management
            Permission(PermissionCategory.ROLES, "manage", "Manage roles and permissions"),
            Permission(PermissionCategory.ROLES, "assign", "Assign roles to users"),
            Permission(PermissionCategory.ROLES, "view", "View role information"),
            
            # Dashboard access
            Permission(PermissionCategory.DASHBOARDS, "view", "View dashboards"),
            Permission(PermissionCategory.DASHBOARDS, "manage", "Customize and manage dashboards"),
            Permission(PermissionCategory.DASHBOARDS, "create", "Create new dashboards"),
            
            # Alerts
            Permission(PermissionCategory.ALERTS, "view", "View alerts"),
            Permission(PermissionCategory.ALERTS, "create", "Create alerts"),
            Permission(PermissionCategory.ALERTS, "manage", "Manage and update alerts"),
            Permission(PermissionCategory.ALERTS, "delete", "Delete alerts"),
            
            # Threat Intelligence
            Permission(PermissionCategory.INTEL, "view", "View threat intelligence"),
            Permission(PermissionCategory.INTEL, "create", "Create threat intelligence entries"),
            Permission(PermissionCategory.INTEL, "manage", "Full threat intelligence management"),
            Permission(PermissionCategory.INTEL, "delete", "Delete threat intelligence"),
            
            # Automations
            Permission(PermissionCategory.AUTOMATIONS, "view", "View automation rules"),
            Permission(PermissionCategory.AUTOMATIONS, "create", "Create automation rules"),
            Permission(PermissionCategory.AUTOMATIONS, "manage", "Manage automation rules"),
            Permission(PermissionCategory.AUTOMATIONS, "delete", "Delete automation rules"),
            
            # Cases
            Permission(PermissionCategory.CASES, "view", "View cases"),
            Permission(PermissionCategory.CASES, "create", "Create new cases"),
            Permission(PermissionCategory.CASES, "manage", "Manage and update cases"),
            Permission(PermissionCategory.CASES, "delete", "Delete cases"),
            
            # Settings
            Permission(PermissionCategory.SETTINGS, "view", "View system settings"),
            Permission(PermissionCategory.SETTINGS, "manage", "Modify system settings"),
            
            # AI Features
            Permission(PermissionCategory.AI, "view", "Access AI features"),
            Permission(PermissionCategory.AI, "manage", "Configure AI settings"),
            
            # Reports
            Permission(PermissionCategory.REPORTS, "generate", "Generate reports"),
            Permission(PermissionCategory.REPORTS, "schedule", "Schedule automated reports"),
            Permission(PermissionCategory.REPORTS, "manage", "Manage report templates")
        ]
        
        self.permission_map = {perm.full_name: perm for perm in self.all_permissions}
    
    def _initialize_default_roles(self):
        """Initialize default system roles"""
        default_roles = [
            RoleDefinition(
                name="super_admin",
                display_name="Super Administrator",
                description="Complete system access across all tenants",
                level=0,
                permissions=["system:manage"],  # This grants all permissions
                tenant_scoped=False,
                system_role=True
            ),
            RoleDefinition(
                name="tenant_owner",
                display_name="Tenant Owner",
                description="Full access within tenant scope",
                level=1,
                permissions=[
                    "users:create", "users:manage", "users:view", "users:invite",
                    "roles:assign", "roles:view",
                    "dashboards:view", "dashboards:manage", "dashboards:create",
                    "alerts:view", "alerts:create", "alerts:manage", "alerts:delete",
                    "intel:view", "intel:create", "intel:manage", "intel:delete",
                    "automations:view", "automations:create", "automations:manage", "automations:delete",
                    "cases:view", "cases:create", "cases:manage", "cases:delete",
                    "settings:view", "settings:manage",
                    "ai:view", "ai:manage",
                    "reports:generate", "reports:schedule", "reports:manage"
                ],
                tenant_scoped=True,
                system_role=True
            ),
            RoleDefinition(
                name="admin", 
                display_name="Administrator",
                description="Administrative access to security operations",
                level=2,
                permissions=[
                    "users:view", "users:invite",
                    "dashboards:view", "dashboards:manage", "dashboards:create",
                    "alerts:view", "alerts:create", "alerts:manage",
                    "intel:view", "intel:create", "intel:manage",
                    "automations:view", "automations:create", "automations:manage",
                    "cases:view", "cases:create", "cases:manage",
                    "settings:view",
                    "ai:view", "ai:manage",
                    "reports:generate", "reports:schedule"
                ],
                tenant_scoped=True,
                system_role=True
            ),
            RoleDefinition(
                name="analyst",
                display_name="Security Analyst", 
                description="Operational access for threat analysis and response",
                level=3,
                permissions=[
                    "dashboards:view",
                    "alerts:view", "alerts:create", "alerts:manage", 
                    "intel:view", "intel:create",
                    "cases:view", "cases:create", "cases:manage",
                    "ai:view",
                    "reports:generate"
                ],
                tenant_scoped=True,
                system_role=True
            ),
            RoleDefinition(
                name="viewer",
                display_name="Viewer",
                description="Read-only access to security data",
                level=4,
                permissions=[
                    "dashboards:view",
                    "alerts:view",
                    "intel:view", 
                    "cases:view"
                ],
                tenant_scoped=True,
                system_role=True
            ),
            RoleDefinition(
                name="guest",
                display_name="Guest User",
                description="Limited read access for external users",
                level=5,
                permissions=[
                    "dashboards:view"
                ],
                tenant_scoped=True,
                system_role=True
            )
        ]
        
        # Create roles in database if they don't exist
        for role_def in default_roles:
            existing = self.roles.find_one({"name": role_def.name})
            if not existing:
                role_doc = {
                    "_id": str(uuid.uuid4()),
                    "name": role_def.name,
                    "display_name": role_def.display_name,
                    "description": role_def.description,
                    "level": role_def.level,
                    "permissions": role_def.permissions,
                    "tenant_scoped": role_def.tenant_scoped,
                    "system_role": role_def.system_role,
                    "enabled": True,
                    "created_at": datetime.utcnow(),
                    "created_by": "system"
                }
                self.roles.insert_one(role_doc)
    
    def create_super_admin(self, email: str, tenant_name: str = "MainTenant") -> Dict:
        """Create the initial super administrator"""
        # Check if super admin already exists
        existing_super = self.users.find_one({"email": email})
        if existing_super:
            raise HTTPException(status_code=400, detail="Super admin already exists")
        
        # Create main tenant
        tenant_id = self.create_tenant(tenant_name, created_by="system")
        
        # Get super admin role
        super_admin_role = self.roles.find_one({"name": "super_admin"})
        if not super_admin_role:
            raise HTTPException(status_code=500, detail="Super admin role not found")
        
        # Create super admin user
        user_id = str(uuid.uuid4())
        user_doc = {
            "_id": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "role_id": super_admin_role["_id"],
            "is_owner": True,  # Legacy compatibility
            "is_super_admin": True,
            "email_verified": True,
            "created_at": datetime.utcnow(),
            "created_by": "system",
            "last_login": None,
            "failed_login_attempts": 0,
            "account_locked": False,
            "twofa_enabled": False,
            "twofa_verified": False
        }
        
        self.users.insert_one(user_doc)
        
        # Log the creation
        self._log_audit_event("user_created", user_id, "system", {
            "email": email,
            "role": "super_admin",
            "tenant_id": tenant_id
        })
        
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "email": email,
            "role": "super_admin"
        }
    
    def create_tenant(self, name: str, created_by: str = None) -> str:
        """Create a new tenant organization"""
        # Check if tenant name already exists
        existing = self.tenants.find_one({"name": name})
        if existing:
            raise HTTPException(status_code=400, detail="Tenant name already exists")
        
        tenant_id = str(uuid.uuid4())
        tenant_doc = {
            "_id": tenant_id,
            "name": name,
            "display_name": name,
            "description": f"Tenant organization: {name}",
            "enabled": True,
            "created_at": datetime.utcnow(),
            "created_by": created_by or "system",
            "settings": {
                "max_users": 100,
                "retention_days": 365,
                "api_rate_limits": {}
            }
        }
        
        self.tenants.insert_one(tenant_doc)
        
        if created_by:
            self._log_audit_event("tenant_created", tenant_id, created_by, {"name": name})
        
        return tenant_id
    
    def create_user(self, email: str, tenant_id: str, role_name: str = "viewer", 
                   created_by: str = None, send_invitation: bool = True) -> Dict:
        """Create a new user with specified role"""
        # Validate tenant exists
        tenant = self.tenants.find_one({"_id": tenant_id, "enabled": True})
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Check if user already exists in this tenant
        existing = self.users.find_one({"email": email, "tenant_id": tenant_id})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists in this tenant")
        
        # Get role
        role = self.roles.find_one({"name": role_name, "enabled": True})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Create user
        user_id = str(uuid.uuid4())
        invitation_token = secrets.token_urlsafe(32) if send_invitation else None
        
        user_doc = {
            "_id": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "role_id": role["_id"],
            "is_owner": role_name == "tenant_owner",
            "email_verified": False,
            "invitation_token": invitation_token,
            "invitation_expires": datetime.utcnow() + timedelta(days=7) if send_invitation else None,
            "created_at": datetime.utcnow(),
            "created_by": created_by,
            "last_login": None,
            "failed_login_attempts": 0,
            "account_locked": False,
            "twofa_enabled": False,
            "twofa_verified": False
        }
        
        self.users.insert_one(user_doc)
        
        # Send invitation email if requested
        if send_invitation and self.smtp_config.get('password'):
            self._send_invitation_email(email, invitation_token, tenant['name'])
        
        # Log the creation
        if created_by:
            self._log_audit_event("user_created", user_id, created_by, {
                "email": email,
                "role": role_name,
                "tenant_id": tenant_id
            })
        
        return {
            "user_id": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "role": role_name,
            "invitation_token": invitation_token if send_invitation else None
        }
    
    def assign_role(self, user_id: str, role_name: str, assigned_by: str) -> bool:
        """Assign a new role to an existing user"""
        # Get user
        user = self.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get new role
        new_role = self.roles.find_one({"name": role_name, "enabled": True})
        if not new_role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Get assigner's role for validation
        assigner = self.users.find_one({"_id": assigned_by})
        if not assigner:
            raise HTTPException(status_code=404, detail="Assigner not found")
        
        assigner_role = self.roles.find_one({"_id": assigner.get("role_id")})
        
        # Permission check: can only assign roles at same or lower level
        if (assigner_role and 
            new_role["level"] < assigner_role["level"] and 
            not assigner.get("is_super_admin")):
            raise HTTPException(status_code=403, detail="Cannot assign role with higher privileges")
        
        # Update user role
        old_role_id = user.get("role_id")
        self.users.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "role_id": new_role["_id"],
                    "is_owner": role_name == "tenant_owner",
                    "role_assigned_at": datetime.utcnow(),
                    "role_assigned_by": assigned_by
                }
            }
        )
        
        # Log the role change
        self._log_audit_event("role_assigned", user_id, assigned_by, {
            "new_role": role_name,
            "old_role_id": old_role_id,
            "user_email": user["email"]
        })
        
        return True
    
    def get_user_permissions(self, user_id: str) -> List[str]:
        """Get all effective permissions for a user"""
        user = self.users.find_one({"_id": user_id})
        if not user:
            return []
        
        # Super admin has all permissions
        if user.get("is_super_admin"):
            return [perm.full_name for perm in self.all_permissions]
        
        # Get role permissions
        role = self.roles.find_one({"_id": user.get("role_id"), "enabled": True})
        if not role:
            return []
        
        permissions = role.get("permissions", [])
        
        # If user has system:manage, expand to all permissions
        if "system:manage" in permissions:
            return [perm.full_name for perm in self.all_permissions]
        
        return permissions
    
    def check_permission(self, user_id: str, required_permission: str) -> bool:
        """Check if user has a specific permission"""
        user_permissions = self.get_user_permissions(user_id)
        
        # System manage grants all permissions
        if "system:manage" in user_permissions:
            return True
        
        return required_permission in user_permissions
    
    def _send_invitation_email(self, email: str, token: str, tenant_name: str):
        """Send invitation email to new user"""
        if not self.smtp_config.get('password'):
            return  # Skip if SMTP not configured
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config['username']
            msg['To'] = email
            msg['Subject'] = f"Welcome to Jupiter SIEM - {tenant_name}"
            
            invitation_url = f"https://projectjupiter.in/invite/{token}"
            
            body = f"""
            Welcome to Jupiter SIEM!
            
            You have been invited to join the {tenant_name} organization.
            
            Click the link below to complete your registration:
            {invitation_url}
            
            This invitation will expire in 7 days.
            
            If you have any questions, please contact your system administrator.
            
            Best regards,
            Jupiter SIEM Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port'])
            if self.smtp_config['use_tls']:
                server.starttls()
            server.login(self.smtp_config['username'], self.smtp_config['password'])
            server.send_message(msg)
            server.quit()
            
        except Exception as e:
            print(f"Failed to send invitation email: {e}")
    
    def _log_audit_event(self, event_type: str, target_id: str, actor_id: str, metadata: Dict):
        """Log audit events for compliance and security"""
        audit_doc = {
            "_id": str(uuid.uuid4()),
            "event_type": event_type,
            "target_id": target_id,
            "actor_id": actor_id,
            "timestamp": datetime.utcnow(),
            "metadata": metadata,
            "ip_address": None,  # Would be filled by middleware
            "user_agent": None   # Would be filled by middleware
        }
        
        self.audit_logs.insert_one(audit_doc)
    
    def get_tenant_users(self, tenant_id: str, include_roles: bool = True) -> List[Dict]:
        """Get all users for a specific tenant"""
        users = list(self.users.find({"tenant_id": tenant_id}))
        
        if include_roles:
            # Enrich with role information
            for user in users:
                user["_id"] = str(user["_id"])
                if user.get("role_id"):
                    role = self.roles.find_one({"_id": user["role_id"]})
                    if role:
                        user["role_name"] = role["name"]
                        user["role_display"] = role["display_name"]
                        user["role_level"] = role["level"]
                
                # Clean sensitive data
                user.pop("invitation_token", None)
                user.pop("twofa_secret", None)
                
                # Format dates
                for date_field in ["created_at", "last_login", "invitation_expires"]:
                    if user.get(date_field) and hasattr(user[date_field], "isoformat"):
                        user[date_field] = user[date_field].isoformat()
        
        return users