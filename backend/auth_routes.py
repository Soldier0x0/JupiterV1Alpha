from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from .auth_middleware import create_access_token, verify_password
from .dev_credentials import DEV_CREDENTIALS, get_dev_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    tenant_id: str
    otp: Optional[str] = None

class LoginResponse(BaseModel):
    message: str
    token: Optional[str] = None
    dev_otp: Optional[str] = None
    user: Optional[dict] = None

@router.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    # Check if credentials match development credentials
    if request.email == DEV_CREDENTIALS["email"] and request.tenant_id == DEV_CREDENTIALS["tenant_id"]:
        if not request.otp:
            # First phase - return development OTP
            return LoginResponse(
                message="Development OTP sent",
                dev_otp=DEV_CREDENTIALS["dev_otp"]
            )
        elif request.otp == DEV_CREDENTIALS["dev_otp"]:
            # Second phase - verify OTP and return token
            user = get_dev_user()
            token = create_access_token({
                "sub": user["email"],
                "tenant_id": user["tenant_id"],
                "is_admin": user["is_admin"],
                "is_owner": user["is_owner"]
            })
            
            # Set cookie and return response
            response.set_cookie(
                key="access_token",
                value=token,
                httponly=True,
                secure=True,
                samesite="strict",
                max_age=1800  # 30 minutes
            )
            
            return LoginResponse(
                message="Login successful",
                token=token,
                user=user
            )
        
    raise HTTPException(status_code=401, detail="Invalid credentials")
