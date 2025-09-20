from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Development credentials
DEV_CREDENTIALS = {
    "email": "admin@jupiter.com",
    "tenant_id": "b48d69da-51a1-4d08-9f0a-deb736a23c25",
    "is_owner": True,
    "dev_otp": "123456"  # Fixed OTP for development
}

def get_dev_user():
    """Get development user with hashed password"""
    return {
        "email": DEV_CREDENTIALS["email"],
        "is_admin": True,
        "full_name": "Development Admin",
        "tenant_id": DEV_CREDENTIALS["tenant_id"],
        "is_owner": DEV_CREDENTIALS["is_owner"],
        "hashed_password": pwd_context.hash("admin123")  # Fixed development password
    }
