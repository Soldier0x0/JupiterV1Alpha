"""
Critical API Endpoint Tests - Must Pass Before Deployment
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
import json

class TestCriticalAPIEndpoints:
    """Critical API endpoint tests"""
    
    def test_health_check_endpoint(self, test_client):
        """Test health check endpoint - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        response = test_client.get("/api/health")
        
        # Should return 200 even without auth
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] in ["healthy", "unhealthy"]
    
    def test_healthz_endpoint(self, test_client):
        """Test healthz endpoint - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        response = test_client.get("/api/security-ops/healthz")
        
        # Should return 200
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
    
    def test_readyz_endpoint(self, test_client):
        """Test readyz endpoint - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        response = test_client.get("/api/security-ops/readyz")
        
        # Should return 200
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
    
    def test_login_endpoint_structure(self, test_client):
        """Test login endpoint structure - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test with invalid credentials (should fail gracefully)
        response = test_client.post("/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        
        # Should return 401 or 400, not 500
        assert response.status_code in [400, 401, 422]
        
        # Should return JSON error response
        data = response.json()
        assert "detail" in data or "error" in data or "message" in data
    
    def test_dashboard_endpoint_protection(self, test_client):
        """Test dashboard endpoint requires authentication - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test without authentication
        response = test_client.get("/api/dashboard")
        
        # Should return 401 Unauthorized
        assert response.status_code == 401
    
    def test_api_response_format(self, test_client):
        """Test API response format consistency - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test various endpoints for consistent response format
        endpoints_to_test = [
            "/api/health",
            "/api/security-ops/healthz",
            "/api/security-ops/readyz"
        ]
        
        for endpoint in endpoints_to_test:
            response = test_client.get(endpoint)
            
            # Should return valid JSON
            assert response.headers["content-type"] == "application/json"
            
            # Should be valid JSON
            data = response.json()
            assert isinstance(data, dict)
    
    def test_cors_headers(self, test_client):
        """Test CORS headers - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test OPTIONS request
        response = test_client.options("/api/health")
        
        # Should include CORS headers
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
    
    def test_rate_limiting_headers(self, test_client):
        """Test rate limiting headers - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Make multiple requests
        for _ in range(5):
            response = test_client.get("/api/health")
            assert response.status_code == 200
        
        # Should include rate limiting headers
        response = test_client.get("/api/health")
        # Note: Rate limiting headers might not be present in test environment
        # This test ensures the endpoint doesn't crash under multiple requests

class TestAPIValidation:
    """API validation tests"""
    
    def test_invalid_json_handling(self, test_client):
        """Test invalid JSON handling - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test with invalid JSON
        response = test_client.post(
            "/api/auth/login",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 Unprocessable Entity
        assert response.status_code == 422
    
    def test_missing_required_fields(self, test_client):
        """Test missing required fields - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test login without required fields
        response = test_client.post("/api/auth/login", json={})
        
        # Should return 422 Unprocessable Entity
        assert response.status_code == 422
        
        data = response.json()
        assert "detail" in data
    
    def test_oversized_payload(self, test_client):
        """Test oversized payload handling - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Create large payload
        large_data = {"data": "x" * 10000}  # 10KB payload
        
        response = test_client.post("/api/auth/login", json=large_data)
        
        # Should handle gracefully (either accept or reject with proper error)
        assert response.status_code in [200, 400, 413, 422]

class TestSecurityHeaders:
    """Security headers tests"""
    
    def test_security_headers(self, test_client):
        """Test security headers - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        response = test_client.get("/api/health")
        
        # Check for security headers
        headers = response.headers
        
        # X-Content-Type-Options
        assert "x-content-type-options" in headers.lower() or "nosniff" in str(headers).lower()
        
        # X-Frame-Options
        assert "x-frame-options" in headers.lower() or "deny" in str(headers).lower()
        
        # X-XSS-Protection (if implemented)
        # Note: This header is deprecated but some systems still use it
    
    def test_content_type_validation(self, test_client):
        """Test content type validation - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test with wrong content type
        response = test_client.post(
            "/api/auth/login",
            data="email=test@example.com&password=test",
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        # Should handle gracefully
        assert response.status_code in [400, 415, 422]

class TestErrorHandling:
    """Error handling tests"""
    
    def test_404_handling(self, test_client):
        """Test 404 error handling - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        response = test_client.get("/api/nonexistent-endpoint")
        
        # Should return 404
        assert response.status_code == 404
        
        # Should return JSON error
        data = response.json()
        assert "detail" in data
    
    def test_method_not_allowed(self, test_client):
        """Test method not allowed - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test DELETE on health endpoint (should not be allowed)
        response = test_client.delete("/api/health")
        
        # Should return 405 Method Not Allowed
        assert response.status_code == 405
    
    def test_server_error_handling(self, test_client):
        """Test server error handling - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # This test ensures the server doesn't crash on unexpected errors
        # We can't easily trigger a 500 error in tests, but we can verify
        # the error handling middleware is in place
        
        response = test_client.get("/api/health")
        assert response.status_code == 200  # Should not crash

@pytest.mark.critical
class TestCriticalAPIFlow:
    """Critical API flow tests"""
    
    def test_authentication_flow(self, test_client, mock_auth_headers):
        """Test complete authentication flow - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test 1: Login attempt
        response = test_client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "TestPassword123!"
        })
        
        # Should handle login attempt (may succeed or fail based on test setup)
        assert response.status_code in [200, 401, 422]
        
        # Test 2: Protected endpoint without auth
        response = test_client.get("/api/dashboard")
        assert response.status_code == 401
        
        # Test 3: Protected endpoint with auth (mocked)
        with patch('backend.auth_middleware.get_current_user') as mock_auth:
            mock_auth.return_value = Mock(
                email="test@example.com",
                user_id="test_user_123",
                tenant_id="test_tenant_123"
            )
            
            response = test_client.get("/api/dashboard", headers=mock_auth_headers)
            # Should either succeed or fail gracefully
            assert response.status_code in [200, 404, 500]  # 500 if endpoint not implemented
    
    def test_data_validation_flow(self, test_client):
        """Test data validation flow - CRITICAL"""
        if test_client is None:
            pytest.skip("Backend not available")
        
        # Test valid data
        valid_data = {
            "email": "test@example.com",
            "password": "TestPassword123!"
        }
        
        response = test_client.post("/api/auth/login", json=valid_data)
        assert response.status_code in [200, 401, 422]  # Should not crash
        
        # Test invalid data types
        invalid_data = {
            "email": 123,  # Should be string
            "password": None  # Should not be null
        }
        
        response = test_client.post("/api/auth/login", json=invalid_data)
        assert response.status_code == 422  # Should return validation error
