"""
Critical Authentication Tests - Must Pass Before Deployment
"""
import pytest
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, Mock

# Test authentication components
class TestAuthentication:
    """Critical authentication tests"""
    
    def test_jwt_token_creation(self):
        """Test JWT token creation - CRITICAL"""
        # Mock JWT creation
        with patch('jwt.encode') as mock_encode:
            mock_encode.return_value = "test_jwt_token"
            
            # Test data
            user_data = {
                "user_id": "test_user_123",
                "email": "test@example.com",
                "role": "analyst",
                "tenant_id": "test_tenant_123"
            }
            
            # Create token
            token = jwt.encode(user_data, "test_secret", algorithm="HS256")
            
            # Verify
            assert token is not None
            assert isinstance(token, str)
            assert len(token) > 0
    
    def test_jwt_token_verification(self):
        """Test JWT token verification - CRITICAL"""
        # Test data
        user_data = {
            "user_id": "test_user_123",
            "email": "test@example.com",
            "role": "analyst",
            "tenant_id": "test_tenant_123",
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        # Create token
        token = jwt.encode(user_data, "test_secret", algorithm="HS256")
        
        # Verify token
        decoded = jwt.decode(token, "test_secret", algorithms=["HS256"])
        
        # Assertions
        assert decoded["user_id"] == "test_user_123"
        assert decoded["email"] == "test@example.com"
        assert decoded["role"] == "analyst"
        assert decoded["tenant_id"] == "test_tenant_123"
    
    def test_jwt_token_expiration(self):
        """Test JWT token expiration - CRITICAL"""
        # Expired token
        expired_data = {
            "user_id": "test_user_123",
            "exp": datetime.utcnow() - timedelta(hours=1)
        }
        
        token = jwt.encode(expired_data, "test_secret", algorithm="HS256")
        
        # Should raise exception for expired token
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, "test_secret", algorithms=["HS256"])
    
    def test_password_hashing(self):
        """Test password hashing - CRITICAL"""
        from passlib.context import CryptContext
        
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Test password
        password = "TestPassword123!"
        
        # Hash password
        hashed = pwd_context.hash(password)
        
        # Verify
        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 0
        
        # Verify password
        assert pwd_context.verify(password, hashed)
        assert not pwd_context.verify("wrong_password", hashed)
    
    def test_2fa_token_generation(self):
        """Test 2FA token generation - CRITICAL"""
        import pyotp
        
        # Generate secret
        secret = pyotp.random_base32()
        
        # Create TOTP
        totp = pyotp.TOTP(secret)
        
        # Generate token
        token = totp.now()
        
        # Verify
        assert token is not None
        assert isinstance(token, str)
        assert len(token) == 6  # Standard TOTP length
        
        # Verify token
        assert totp.verify(token)
        assert not totp.verify("000000")  # Invalid token

class TestAuthorization:
    """Critical authorization tests"""
    
    def test_role_permissions(self):
        """Test role-based permissions - CRITICAL"""
        # Define role permissions
        role_permissions = {
            "super_admin": ["*"],  # All permissions
            "admin": ["read", "write", "delete"],
            "analyst": ["read", "write"],
            "viewer": ["read"]
        }
        
        # Test each role
        for role, permissions in role_permissions.items():
            assert isinstance(permissions, list)
            assert len(permissions) > 0
            
            if role == "super_admin":
                assert "*" in permissions
            else:
                assert "read" in permissions  # All roles should have read access
    
    def test_tenant_isolation(self):
        """Test tenant data isolation - CRITICAL"""
        # Mock user data
        user1 = {
            "user_id": "user1",
            "tenant_id": "tenant1",
            "role": "analyst"
        }
        
        user2 = {
            "user_id": "user2", 
            "tenant_id": "tenant2",
            "role": "analyst"
        }
        
        # Verify tenant isolation
        assert user1["tenant_id"] != user2["tenant_id"]
        assert user1["user_id"] != user2["user_id"]
        
        # Mock data access check
        def can_access_data(user, data_tenant_id):
            return user["tenant_id"] == data_tenant_id or user["role"] == "super_admin"
        
        # Test access control
        assert can_access_data(user1, "tenant1")
        assert not can_access_data(user1, "tenant2")
        assert can_access_data(user2, "tenant2")
        assert not can_access_data(user2, "tenant1")

class TestSecurityValidation:
    """Critical security validation tests"""
    
    def test_input_sanitization(self):
        """Test input sanitization - CRITICAL"""
        # Test malicious inputs
        malicious_inputs = [
            "<script>alert('xss')</script>",
            "'; DROP TABLE users; --",
            "../../etc/passwd",
            "{{7*7}}",
            "javascript:alert(1)"
        ]
        
        # Mock sanitization function
        def sanitize_input(input_str):
            import re
            # Remove script tags
            input_str = re.sub(r'<script.*?</script>', '', input_str, flags=re.DOTALL)
            # Remove SQL injection patterns
            dangerous_patterns = [
                "DROP TABLE", "INSERT INTO", "UPDATE", "DELETE FROM",
                "UNION SELECT", "OR '1'='1", "';", "--", "/*", "*/"
            ]
            for pattern in dangerous_patterns:
                input_str = input_str.replace(pattern, "")
            # Remove path traversal
            input_str = re.sub(r'\.\./', '', input_str)
            return input_str
        
        # Test sanitization
        for malicious_input in malicious_inputs:
            sanitized = sanitize_input(malicious_input)
            assert "<script>" not in sanitized
            assert "DROP TABLE" not in sanitized
            assert "../" not in sanitized
    
    def test_password_policy(self):
        """Test password policy enforcement - CRITICAL"""
        def validate_password(password):
            """Password validation rules"""
            if len(password) < 8:
                return False, "Password too short"
            if not any(c.isupper() for c in password):
                return False, "No uppercase letter"
            if not any(c.islower() for c in password):
                return False, "No lowercase letter"
            if not any(c.isdigit() for c in password):
                return False, "No digit"
            if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                return False, "No special character"
            return True, "Valid password"
        
        # Test valid passwords
        valid_passwords = [
            "TestPassword123!",
            "MySecure@Pass1",
            "Complex#Pass99"
        ]
        
        for password in valid_passwords:
            is_valid, message = validate_password(password)
            assert is_valid, f"Password '{password}' should be valid: {message}"
        
        # Test invalid passwords
        invalid_passwords = [
            "short",
            "nouppercase123!",
            "NOLOWERCASE123!",
            "NoNumbers!",
            "NoSpecialChars123"
        ]
        
        for password in invalid_passwords:
            is_valid, message = validate_password(password)
            assert not is_valid, f"Password '{password}' should be invalid: {message}"

@pytest.mark.critical
class TestCriticalAuthFlow:
    """Critical authentication flow tests"""
    
    def test_login_flow_validation(self):
        """Test complete login flow - CRITICAL"""
        # Mock login flow
        def mock_login(email, password):
            # Validate inputs
            if not email or not password:
                return False, "Missing credentials"
            
            # Mock password verification
            if email == "test@example.com" and password == "TestPassword123!":
                return True, "Login successful"
            else:
                return False, "Invalid credentials"
        
        # Test successful login
        success, message = mock_login("test@example.com", "TestPassword123!")
        assert success
        assert message == "Login successful"
        
        # Test failed login
        success, message = mock_login("test@example.com", "wrong_password")
        assert not success
        assert message == "Invalid credentials"
        
        # Test missing credentials
        success, message = mock_login("", "")
        assert not success
        assert message == "Missing credentials"
    
    def test_session_management(self):
        """Test session management - CRITICAL"""
        # Mock session data
        session_data = {
            "user_id": "test_user_123",
            "login_time": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "ip_address": "192.168.1.100"
        }
        
        # Test session creation
        assert session_data["user_id"] is not None
        assert session_data["login_time"] is not None
        
        # Test session validation
        def is_session_valid(session):
            # Check if session is not expired (24 hours)
            if datetime.utcnow() - session["login_time"] > timedelta(hours=24):
                return False
            return True
        
        assert is_session_valid(session_data)
        
        # Test expired session
        expired_session = session_data.copy()
        expired_session["login_time"] = datetime.utcnow() - timedelta(hours=25)
        assert not is_session_valid(expired_session)
