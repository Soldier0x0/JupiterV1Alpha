"""
Pytest configuration and fixtures for Jupiter SIEM testing
"""
import pytest
import os
import sys
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Test configuration
TEST_DATABASE_URL = "mongodb://localhost:27017/jupiter_test"
TEST_REDIS_URL = "redis://localhost:6379/1"

@pytest.fixture(scope="session")
def test_environment():
    """Setup test environment variables"""
    os.environ.update({
        "DATABASE_URL": TEST_DATABASE_URL,
        "REDIS_URL": TEST_REDIS_URL,
        "JWT_SECRET_KEY": "test_secret_key_for_testing_only",
        "ENVIRONMENT": "test",
        "LOG_LEVEL": "DEBUG"
    })
    yield
    # Cleanup after tests
    for key in ["DATABASE_URL", "REDIS_URL", "JWT_SECRET_KEY", "ENVIRONMENT", "LOG_LEVEL"]:
        os.environ.pop(key, None)

@pytest.fixture
def mock_user():
    """Mock user for testing"""
    return Mock(
        email="test@example.com",
        user_id="test_user_123",
        tenant_id="test_tenant_123",
        role="analyst",
        is_admin=False,
        is_active=True,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow()
    )

@pytest.fixture
def mock_admin_user():
    """Mock admin user for testing"""
    return Mock(
        email="admin@example.com",
        user_id="admin_user_123",
        tenant_id="test_tenant_123",
        role="admin",
        is_admin=True,
        is_active=True,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow()
    )

@pytest.fixture
def mock_tenant():
    """Mock tenant for testing"""
    return Mock(
        tenant_id="test_tenant_123",
        name="Test Organization",
        settings={
            "retention_days": 90,
            "alert_threshold": "medium",
            "timezone": "UTC"
        },
        created_at=datetime.utcnow(),
        is_active=True
    )

@pytest.fixture
def test_alert_data():
    """Test alert data"""
    return {
        "id": "alert_001",
        "title": "Suspicious Login Attempt",
        "severity": "high",
        "status": "open",
        "source_ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0",
        "timestamp": datetime.utcnow().isoformat(),
        "tenant_id": "test_tenant_123",
        "analyst_id": "test@example.com",
        "description": "Multiple failed login attempts detected",
        "category": "authentication",
        "confidence": 0.85
    }

@pytest.fixture
def test_log_data():
    """Test log data"""
    return {
        "activity_name": "User Login",
        "severity": "medium",
        "timestamp": datetime.utcnow().isoformat(),
        "user": {
            "name": "test_user",
            "uid": "user_123",
            "type": "User Account"
        },
        "device": {
            "name": "workstation-01",
            "ip": "192.168.1.100",
            "os": {
                "name": "Windows",
                "version": "10"
            }
        },
        "network": {
            "protocol": "HTTPS",
            "port": 443
        },
        "tenant_id": "test_tenant_123"
    }

@pytest.fixture
def mock_auth_headers():
    """Mock authentication headers"""
    return {
        "Authorization": "Bearer test_jwt_token_123",
        "Content-Type": "application/json"
    }

@pytest.fixture
def test_client():
    """FastAPI test client"""
    try:
        from main import app
        return TestClient(app)
    except ImportError:
        pytest.skip("Backend not available for testing")

@pytest.fixture
def mock_database():
    """Mock database connection"""
    with patch('backend.database.get_database') as mock_db:
        mock_collection = Mock()
        mock_db.return_value = mock_collection
        yield mock_collection

@pytest.fixture
def mock_redis():
    """Mock Redis connection"""
    with patch('backend.cache.get_redis') as mock_redis:
        mock_redis_client = Mock()
        mock_redis.return_value = mock_redis_client
        yield mock_redis_client

@pytest.fixture
def mock_ai_service():
    """Mock AI service"""
    with patch('backend.ai_services.AIService') as mock_ai:
        mock_ai_instance = Mock()
        mock_ai.return_value = mock_ai_instance
        mock_ai_instance.analyze_threat.return_value = {
            "threat_level": "medium",
            "confidence": 0.75,
            "recommendations": ["Monitor user activity", "Review access logs"]
        }
        yield mock_ai_instance

@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Cleanup test data after each test"""
    yield
    # Cleanup logic here if needed
    pass

# Test markers
pytestmark = [
    pytest.mark.critical,  # All tests are critical for deployment
]
