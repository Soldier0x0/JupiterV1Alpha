from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

# Development mode credentials
DEV_CREDENTIALS = {
    "email": "admin@jupiter.com",
    "tenant_id": "b48d69da-51a1-4d08-9f0a-deb736a23c25",
    "is_owner": True,
    "dev_otp": "123456"  # Fixed OTP for development
}

def verify_dev_credentials(email: str, tenant_id: str) -> bool:
    """Verify if the credentials match development credentials"""
    return email == DEV_CREDENTIALS["email"] and tenant_id == DEV_CREDENTIALS["tenant_id"]

async def handle_dev_login(email: str, tenant_id: str, otp: str = None) -> dict:
    """Handle development mode login"""
    if verify_dev_credentials(email, tenant_id):
        if otp is None:
            # OTP request
            return {
                "message": "Development OTP sent",
                "dev_otp": DEV_CREDENTIALS["dev_otp"],
                "tenant_id": DEV_CREDENTIALS["tenant_id"]
            }
        elif otp == DEV_CREDENTIALS["dev_otp"]:
            # Login with OTP
            return {
                "message": "Development login successful",
                "token": "dev_token",
                "user": {
                    "id": "dev_user_id",
                    "email": DEV_CREDENTIALS["email"],
                    "tenant_id": DEV_CREDENTIALS["tenant_id"],
                    "is_owner": DEV_CREDENTIALS["is_owner"]
                }
            }
    return None
