#!/usr/bin/env python3
"""
Jupiter SIEM Analyst Features Tests
Comprehensive test suite for all analyst features
"""

import pytest
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app
from models.analyst_features import (
    ReportModel, SavedReportModel, FlagModel, AIExplanationRequest,
    PointsModel, NoiseBucketModel, PivotTemplate
)

client = TestClient(app)

# Mock authentication
@pytest.fixture
def mock_auth():
    with patch('auth_middleware.get_current_user') as mock:
        mock_user = MagicMock()
        mock_user.email = "test@example.com"
        mock_user.tenant_id = "test_tenant"
        mock_user.is_admin = True
        mock.return_value = mock_user
        yield mock_user

class TestAnalystFeatures:
    """Test suite for analyst features"""

    def test_add_to_report(self, mock_auth):
        """Test adding data to report"""
        report_data = {
            "tenant_id": "test_tenant",
            "analyst_id": "test@example.com",
            "widget_id": "log_viewer",
            "title": "Test Report",
            "content": {"alerts": 5, "severity": "high"},
            "status": "draft"
        }
        
        response = client.post("/api/analyst/reports/add", json=report_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "report_id" in data

    def test_export_report(self, mock_auth):
        """Test exporting reports"""
        # First add a report
        report_data = {
            "tenant_id": "test_tenant",
            "analyst_id": "test@example.com",
            "title": "Test Export Report",
            "content": {"test": "data"}
        }
        
        add_response = client.post("/api/analyst/reports/add", json=report_data)
        report_id = add_response.json()["report_id"]
        
        # Export the report
        response = client.get(f"/api/analyst/reports/export?report_ids={report_id}&format=pdf")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data

    def test_flag_to_admin(self, mock_auth):
        """Test flagging content to admin"""
        flag_data = {
            "tenant_id": "test_tenant",
            "analyst_id": "test@example.com",
            "widget_id": "log_viewer",
            "reason": "Suspicious activity detected",
            "priority": "high",
            "data": {"alert": "test_alert"}
        }
        
        response = client.post("/api/analyst/flags", json=flag_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "flag_id" in data

    def test_get_flags_admin(self, mock_auth):
        """Test getting flags (admin only)"""
        response = client.get("/api/analyst/flags")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "flags" in data

    def test_explain_log_ai(self, mock_auth):
        """Test AI log explanation"""
        log_data = {
            "activity_name": "SQL Injection",
            "severity": "high",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        explanation_request = {
            "log_data": log_data,
            "format": "eli5",
            "analyst_id": "test@example.com",
            "tenant_id": "test_tenant"
        }
        
        response = client.post("/api/analyst/logs/explain", json=explanation_request)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "explanation" in data

    def test_noise_buckets(self, mock_auth):
        """Test noise bucket management"""
        response = client.get("/api/analyst/noise-buckets")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "buckets" in data

    def test_pivot_query(self, mock_auth):
        """Test pivot query execution"""
        pivot_data = {
            "pivot_type": "ip",
            "value": "192.168.1.100"
        }
        
        response = client.post("/api/analyst/pivot", json=pivot_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "results" in data

    def test_analyst_points(self, mock_auth):
        """Test analyst points system"""
        response = client.get("/api/analyst/points")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "points" in data

    def test_leaderboard(self, mock_auth):
        """Test analyst leaderboard"""
        response = client.get("/api/analyst/leaderboard")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "leaderboard" in data

class TestSecurityOps:
    """Test suite for security operations"""

    def test_rbac_audit(self, mock_auth):
        """Test RBAC audit"""
        response = client.get("/api/security-ops/admin/rbac-audit")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "results" in data

    def test_tenant_segregation(self, mock_auth):
        """Test tenant segregation audit"""
        response = client.get("/api/security-ops/admin/tenant-segregation")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "segregation_results" in data

    def test_config_drift(self, mock_auth):
        """Test configuration drift detection"""
        response = client.get("/api/security-ops/admin/config-drift")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "results" in data

    def test_webhook_trigger(self, mock_auth):
        """Test webhook triggering"""
        webhook_data = {
            "alert_data": {"test": "alert"},
            "webhook_id": "test_webhook"
        }
        
        response = client.post("/api/security-ops/alerts/webhook", json=webhook_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True

    def test_incident_replay(self, mock_auth):
        """Test incident replay"""
        response = client.get("/api/security-ops/incidents/replay?incident_id=test_incident")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True

    def test_attack_simulation(self, mock_auth):
        """Test attack simulation"""
        simulation_config = {
            "attack_type": "sql_injection",
            "target": "test_target"
        }
        
        response = client.post("/api/security-ops/incidents/simulate", json=simulation_config)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "simulation_id" in data

    def test_tenant_health(self, mock_auth):
        """Test tenant health monitoring"""
        response = client.get("/api/security-ops/tenants/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "health_data" in data

    def test_compliance_report(self, mock_auth):
        """Test compliance report generation"""
        response = client.get("/api/security-ops/reports/compliance?compliance_type=ISO")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "report" in data

    def test_custom_report(self, mock_auth):
        """Test custom report creation"""
        report_config = {
            "title": "Custom Security Report",
            "sections": ["alerts", "users", "incidents"]
        }
        
        response = client.post("/api/security-ops/reports/custom", json=report_config)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "report_id" in data

    def test_key_rotation(self, mock_auth):
        """Test key rotation"""
        response = client.post("/api/security-ops/admin/rotate-keys")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "rotation_result" in data

    def test_panic_mode(self, mock_auth):
        """Test panic mode activation"""
        response = client.post("/api/security-ops/admin/panic")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["panic_mode"] is True

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/security-ops/healthz")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data

    def test_readiness_check(self):
        """Test readiness check endpoint"""
        response = client.get("/api/security-ops/readyz")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data

class TestDataModels:
    """Test data model validation"""

    def test_report_model(self):
        """Test ReportModel validation"""
        report = ReportModel(
            tenant_id="test_tenant",
            analyst_id="test@example.com",
            title="Test Report",
            content={"test": "data"}
        )
        
        assert report.tenant_id == "test_tenant"
        assert report.title == "Test Report"
        assert report.status.value == "draft"

    def test_flag_model(self):
        """Test FlagModel validation"""
        flag = FlagModel(
            tenant_id="test_tenant",
            analyst_id="test@example.com",
            widget_id="test_widget",
            reason="Test reason",
            data={"test": "data"}
        )
        
        assert flag.tenant_id == "test_tenant"
        assert flag.reason == "Test reason"
        assert flag.status.value == "open"

    def test_points_model(self):
        """Test PointsModel validation"""
        points = PointsModel(
            analyst_id="test@example.com",
            tenant_id="test_tenant",
            xp=100
        )
        
        assert points.xp == 100
        assert points.level == 2  # 100 XP = level 2

    def test_noise_bucket_model(self):
        """Test NoiseBucketModel validation"""
        bucket = NoiseBucketModel(
            tenant_id="test_tenant",
            bucket_key="test_bucket",
            alert_type="brute_force",
            count=5
        )
        
        assert bucket.tenant_id == "test_tenant"
        assert bucket.count == 5
        assert bucket.resolved is False

class TestIntegration:
    """Integration tests"""

    def test_end_to_end_analyst_workflow(self, mock_auth):
        """Test complete analyst workflow"""
        # 1. Add log to report
        report_data = {
            "tenant_id": "test_tenant",
            "analyst_id": "test@example.com",
            "title": "Workflow Test Report",
            "content": {"workflow": "test"}
        }
        
        add_response = client.post("/api/analyst/reports/add", json=report_data)
        assert add_response.status_code == 200
        
        # 2. Export report
        report_id = add_response.json()["report_id"]
        export_response = client.get(f"/api/analyst/reports/export?report_ids={report_id}&format=pdf")
        assert export_response.status_code == 200
        
        # 3. Flag suspicious content
        flag_data = {
            "tenant_id": "test_tenant",
            "analyst_id": "test@example.com",
            "widget_id": "test_widget",
            "reason": "Workflow test flag",
            "data": {"test": "flag"}
        }
        
        flag_response = client.post("/api/analyst/flags", json=flag_data)
        assert flag_response.status_code == 200
        
        # 4. Get analyst points
        points_response = client.get("/api/analyst/points")
        assert points_response.status_code == 200

    def test_admin_security_workflow(self, mock_auth):
        """Test complete admin security workflow"""
        # 1. Run RBAC audit
        rbac_response = client.get("/api/security-ops/admin/rbac-audit")
        assert rbac_response.status_code == 200
        
        # 2. Check tenant segregation
        seg_response = client.get("/api/security-ops/admin/tenant-segregation")
        assert seg_response.status_code == 200
        
        # 3. Detect config drift
        drift_response = client.get("/api/security-ops/admin/config-drift")
        assert drift_response.status_code == 200
        
        # 4. Check system health
        health_response = client.get("/api/security-ops/tenants/health")
        assert health_response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
