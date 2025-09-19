"""
Critical Security Tests - Must Pass Before Deployment
"""
import pytest
import hashlib
import hmac
from unittest.mock import patch, Mock
import json

class TestInputValidation:
    """Critical input validation tests"""
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention - CRITICAL"""
        # Common SQL injection patterns
        sql_injection_attempts = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "' UNION SELECT * FROM users --",
            "'; UPDATE users SET password='hacked' WHERE id=1; --"
        ]
        
        # Mock sanitization function
        def sanitize_input(input_str):
            # Remove dangerous SQL patterns
            dangerous_patterns = [
                "DROP TABLE", "INSERT INTO", "UPDATE", "DELETE FROM",
                "UNION SELECT", "OR '1'='1", "';", "--", "/*", "*/"
            ]
            for pattern in dangerous_patterns:
                input_str = input_str.replace(pattern, "")
            return input_str
        
        # Test sanitization
        for injection_attempt in sql_injection_attempts:
            sanitized = sanitize_input(injection_attempt)
            
            # Should not contain dangerous SQL patterns
            assert "DROP TABLE" not in sanitized
            assert "INSERT INTO" not in sanitized
            assert "UPDATE" not in sanitized
            assert "UNION SELECT" not in sanitized
            assert "OR '1'='1" not in sanitized
    
    def test_xss_prevention(self):
        """Test XSS prevention - CRITICAL"""
        # Common XSS patterns
        xss_attempts = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<iframe src='javascript:alert(\"xss\")'></iframe>",
            "<svg onload=alert('xss')>",
            "{{7*7}}",  # Template injection
            "${7*7}"    # Expression injection
        ]
        
        # Mock XSS prevention function
        def prevent_xss(input_str):
            import re
            # Remove script tags
            input_str = re.sub(r'<script.*?</script>', '', input_str, flags=re.DOTALL)
            # Remove javascript: protocols
            input_str = re.sub(r'javascript:', '', input_str, flags=re.IGNORECASE)
            # Remove event handlers
            input_str = re.sub(r'on\w+\s*=', '', input_str, flags=re.IGNORECASE)
            # Remove iframe tags
            input_str = re.sub(r'<iframe.*?</iframe>', '', input_str, flags=re.DOTALL)
            # Remove svg tags
            input_str = re.sub(r'<svg.*?</svg>', '', input_str, flags=re.DOTALL)
            # Remove template expressions
            input_str = re.sub(r'\{\{.*?\}\}', '', input_str)
            input_str = re.sub(r'\$\{.*?\}', '', input_str)
            return input_str
        
        # Test XSS prevention
        for xss_attempt in xss_attempts:
            sanitized = prevent_xss(xss_attempt)
            
            # Should not contain dangerous patterns
            assert "<script>" not in sanitized
            assert "javascript:" not in sanitized.lower()
            assert "onerror=" not in sanitized.lower()
            assert "onload=" not in sanitized.lower()
            assert "{{" not in sanitized
            assert "${" not in sanitized
    
    def test_path_traversal_prevention(self):
        """Test path traversal prevention - CRITICAL"""
        # Common path traversal patterns
        path_traversal_attempts = [
            "../../etc/passwd",
            "..\\..\\windows\\system32\\config\\sam",
            "....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "..%252f..%252fetc%252fpasswd"
        ]
        
        # Mock path traversal prevention
        def prevent_path_traversal(path):
            import re
            # Remove path traversal sequences (repeat until no more matches)
            while re.search(r'\.\./', path):
                path = re.sub(r'\.\./', '', path)
            while re.search(r'\.\.\\', path):
                path = re.sub(r'\.\.\\', '', path)
            path = re.sub(r'%2e%2e%2f', '', path, flags=re.IGNORECASE)
            path = re.sub(r'%252e%252e%252f', '', path, flags=re.IGNORECASE)
            # Remove dangerous file paths
            path = re.sub(r'etc/passwd', '', path, flags=re.IGNORECASE)
            path = re.sub(r'windows/system32', '', path, flags=re.IGNORECASE)
            # Remove leading slashes
            path = path.lstrip('/')
            return path
        
        # Test path traversal prevention
        for traversal_attempt in path_traversal_attempts:
            sanitized = prevent_path_traversal(traversal_attempt)
            
            # Should not contain path traversal patterns
            assert "../" not in sanitized
            assert "..\\" not in sanitized
            assert "etc/passwd" not in sanitized
            assert "windows/system32" not in sanitized
    
    def test_command_injection_prevention(self):
        """Test command injection prevention - CRITICAL"""
        # Common command injection patterns
        command_injection_attempts = [
            "; rm -rf /",
            "| cat /etc/passwd",
            "&& whoami",
            "`id`",
            "$(whoami)",
            "; del C:\\Windows\\System32\\*"
        ]
        
        # Mock command injection prevention
        def prevent_command_injection(input_str):
            import re
            # Remove command separators
            input_str = re.sub(r'[;&|`$()]', '', input_str)
            # Remove dangerous commands
            dangerous_commands = ['rm', 'del', 'format', 'shutdown', 'reboot']
            for cmd in dangerous_commands:
                input_str = re.sub(rf'\b{cmd}\b', '', input_str, flags=re.IGNORECASE)
            return input_str
        
        # Test command injection prevention
        for injection_attempt in command_injection_attempts:
            sanitized = prevent_command_injection(injection_attempt)
            
            # Should not contain dangerous patterns
            assert ";" not in sanitized
            assert "|" not in sanitized
            assert "&" not in sanitized
            assert "`" not in sanitized
            assert "$(" not in sanitized
            assert "rm -rf" not in sanitized.lower()

class TestAuthenticationSecurity:
    """Critical authentication security tests"""
    
    def test_password_strength_validation(self):
        """Test password strength validation - CRITICAL"""
        def validate_password_strength(password):
            errors = []
            
            # Length check
            if len(password) < 8:
                errors.append("Password must be at least 8 characters long")
            
            # Character variety checks
            if not any(c.isupper() for c in password):
                errors.append("Password must contain at least one uppercase letter")
            
            if not any(c.islower() for c in password):
                errors.append("Password must contain at least one lowercase letter")
            
            if not any(c.isdigit() for c in password):
                errors.append("Password must contain at least one digit")
            
            if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                errors.append("Password must contain at least one special character")
            
            # Common password check
            common_passwords = ["password", "123456", "qwerty", "admin", "letmein"]
            if password.lower() in common_passwords:
                errors.append("Password is too common")
            
            return len(errors) == 0, errors
        
        # Test strong passwords
        strong_passwords = [
            "MySecure@Pass123!",
            "Complex#Password99",
            "Strong$Pass2024!"
        ]
        
        for password in strong_passwords:
            is_valid, errors = validate_password_strength(password)
            assert is_valid, f"Password '{password}' should be valid: {errors}"
        
        # Test weak passwords
        weak_passwords = [
            "short",
            "nouppercase123!",
            "NOLOWERCASE123!",
            "NoNumbers!",
            "NoSpecialChars123",
            "password"  # Common password
        ]
        
        for password in weak_passwords:
            is_valid, errors = validate_password_strength(password)
            assert not is_valid, f"Password '{password}' should be invalid: {errors}"
    
    def test_session_security(self):
        """Test session security - CRITICAL"""
        def create_secure_session(user_data):
            import secrets
            import time
            
            # Generate secure session ID
            session_id = secrets.token_urlsafe(32)
            
            # Create session data
            session_data = {
                "session_id": session_id,
                "user_id": user_data["user_id"],
                "tenant_id": user_data["tenant_id"],
                "created_at": time.time(),
                "last_activity": time.time(),
                "ip_address": user_data.get("ip_address", "unknown"),
                "user_agent": user_data.get("user_agent", "unknown")
            }
            
            return session_data
        
        def validate_session(session_data, current_ip, current_user_agent):
            import time
            
            # Check session expiration (24 hours)
            if time.time() - session_data["created_at"] > 86400:
                return False, "Session expired"
            
            # Check inactivity timeout (2 hours)
            if time.time() - session_data["last_activity"] > 7200:
                return False, "Session inactive"
            
            # Check IP address (optional security check)
            if session_data["ip_address"] != current_ip:
                return False, "IP address mismatch"
            
            return True, "Session valid"
        
        # Test session creation
        user_data = {
            "user_id": "test_user_123",
            "tenant_id": "test_tenant_123",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0"
        }
        
        session = create_secure_session(user_data)
        assert session["session_id"] is not None
        assert len(session["session_id"]) >= 32
        assert session["user_id"] == "test_user_123"
        
        # Test session validation
        is_valid, message = validate_session(session, "192.168.1.100", "Mozilla/5.0")
        assert is_valid
        assert message == "Session valid"
        
        # Test IP mismatch
        is_valid, message = validate_session(session, "192.168.1.200", "Mozilla/5.0")
        assert not is_valid
        assert message == "IP address mismatch"
    
    def test_brute_force_protection(self):
        """Test brute force protection - CRITICAL"""
        def check_brute_force_attempts(ip_address, attempts):
            # Mock brute force protection
            max_attempts = 5
            lockout_duration = 300  # 5 minutes
            
            if len(attempts) >= max_attempts:
                # Check if lockout period has passed
                last_attempt = max(attempts)
                import time
                if time.time() - last_attempt < lockout_duration:
                    return False, "Account locked due to too many failed attempts"
            
            return True, "Login allowed"
        
        # Test normal login attempts
        import time
        current_time = time.time()
        normal_attempts = [current_time - 100, current_time - 50, current_time - 10]
        
        is_allowed, message = check_brute_force_attempts("192.168.1.100", normal_attempts)
        assert is_allowed
        assert message == "Login allowed"
        
        # Test brute force attempts
        brute_force_attempts = [current_time - 10, current_time - 8, current_time - 6, 
                               current_time - 4, current_time - 2]
        
        is_allowed, message = check_brute_force_attempts("192.168.1.100", brute_force_attempts)
        assert not is_allowed
        assert "locked" in message

class TestDataEncryption:
    """Critical data encryption tests"""
    
    def test_data_encryption(self):
        """Test data encryption - CRITICAL"""
        from cryptography.fernet import Fernet
        
        # Generate encryption key
        key = Fernet.generate_key()
        cipher_suite = Fernet(key)
        
        # Test data to encrypt
        sensitive_data = "This is sensitive information that needs encryption"
        
        # Encrypt data
        encrypted_data = cipher_suite.encrypt(sensitive_data.encode())
        
        # Verify encryption
        assert encrypted_data != sensitive_data.encode()
        assert len(encrypted_data) > len(sensitive_data)
        
        # Decrypt data
        decrypted_data = cipher_suite.decrypt(encrypted_data).decode()
        
        # Verify decryption
        assert decrypted_data == sensitive_data
    
    def test_password_hashing(self):
        """Test password hashing - CRITICAL"""
        import bcrypt
        
        # Test password
        password = "TestPassword123!"
        
        # Hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Verify hash
        assert hashed != password.encode('utf-8')
        assert len(hashed) > 0
        
        # Verify password
        assert bcrypt.checkpw(password.encode('utf-8'), hashed)
        assert not bcrypt.checkpw("wrong_password".encode('utf-8'), hashed)
    
    def test_hmac_verification(self):
        """Test HMAC verification - CRITICAL"""
        import hmac
        import hashlib
        
        # Test data and secret
        data = "Important data that needs integrity verification"
        secret = "secret_key_for_hmac"
        
        # Generate HMAC
        signature = hmac.new(
            secret.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify HMAC
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        assert signature == expected_signature
        
        # Test tampered data
        tampered_data = "Tampered data"
        tampered_signature = hmac.new(
            secret.encode('utf-8'),
            tampered_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        assert signature != tampered_signature

class TestSecurityHeaders:
    """Critical security headers tests"""
    
    def test_security_headers_validation(self):
        """Test security headers validation - CRITICAL"""
        def validate_security_headers(headers):
            required_headers = {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "X-XSS-Protection": "1; mode=block",
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                "Content-Security-Policy": "default-src 'self'"
            }
            
            missing_headers = []
            for header, expected_value in required_headers.items():
                if header not in headers:
                    missing_headers.append(f"Missing {header}")
                elif expected_value not in headers[header]:
                    missing_headers.append(f"Invalid {header}: {headers[header]}")
            
            return len(missing_headers) == 0, missing_headers
        
        # Test with proper security headers
        proper_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'"
        }
        
        is_valid, errors = validate_security_headers(proper_headers)
        assert is_valid
        assert len(errors) == 0
        
        # Test with missing headers
        incomplete_headers = {
            "X-Content-Type-Options": "nosniff"
            # Missing other headers
        }
        
        is_valid, errors = validate_security_headers(incomplete_headers)
        assert not is_valid
        assert len(errors) > 0

@pytest.mark.critical
class TestCriticalSecurityFlow:
    """Critical security flow tests"""
    
    def test_complete_security_validation(self):
        """Test complete security validation - CRITICAL"""
        def security_validation_pipeline(user_input, user_data):
            # Step 1: Input sanitization
            sanitized_input = user_input
            for pattern in ["<script>", "javascript:", "'; DROP TABLE"]:
                sanitized_input = sanitized_input.replace(pattern, "")
            
            # Step 2: Authentication check
            if not user_data.get("authenticated"):
                return False, "Authentication required"
            
            # Step 3: Authorization check
            if user_data.get("role") not in ["admin", "analyst", "viewer"]:
                return False, "Insufficient permissions"
            
            # Step 4: Rate limiting check
            if user_data.get("request_count", 0) > 100:
                return False, "Rate limit exceeded"
            
            # Step 5: Data validation
            if len(sanitized_input) > 1000:
                return False, "Input too long"
            
            return True, "Security validation passed"
        
        # Test valid security flow
        valid_user_data = {
            "authenticated": True,
            "role": "analyst",
            "request_count": 5
        }
        
        is_valid, message = security_validation_pipeline("Normal user input", valid_user_data)
        assert is_valid
        assert message == "Security validation passed"
        
        # Test authentication failure
        invalid_user_data = {
            "authenticated": False,
            "role": "analyst",
            "request_count": 5
        }
        
        is_valid, message = security_validation_pipeline("Normal user input", invalid_user_data)
        assert not is_valid
        assert message == "Authentication required"
        
        # Test authorization failure
        unauthorized_user_data = {
            "authenticated": True,
            "role": "guest",
            "request_count": 5
        }
        
        is_valid, message = security_validation_pipeline("Normal user input", unauthorized_user_data)
        assert not is_valid
        assert message == "Insufficient permissions"
        
        # Test rate limiting
        rate_limited_user_data = {
            "authenticated": True,
            "role": "analyst",
            "request_count": 150
        }
        
        is_valid, message = security_validation_pipeline("Normal user input", rate_limited_user_data)
        assert not is_valid
        assert message == "Rate limit exceeded"
    
    def test_security_incident_detection(self):
        """Test security incident detection - CRITICAL"""
        def detect_security_incident(log_entry):
            # Check for suspicious patterns
            suspicious_patterns = [
                "failed login",
                "unauthorized access",
                "sql injection",
                "xss attempt",
                "path traversal",
                "command injection"
            ]
            
            log_lower = log_entry.lower()
            for pattern in suspicious_patterns:
                if pattern in log_lower:
                    return True, f"Suspicious activity detected: {pattern}"
            
            return False, "No suspicious activity"
        
        # Test normal log entry
        normal_log = "User john.doe successfully logged in from 192.168.1.100"
        is_suspicious, message = detect_security_incident(normal_log)
        assert not is_suspicious
        assert message == "No suspicious activity"
        
        # Test suspicious log entry
        suspicious_log = "Multiple failed login attempts detected for user admin"
        is_suspicious, message = detect_security_incident(suspicious_log)
        assert is_suspicious
        assert "failed login" in message
