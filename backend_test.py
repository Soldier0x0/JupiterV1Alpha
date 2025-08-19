#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Project Jupiter SIEM/SOAR Platform
Tests all authentication, dashboard, alerts, threat intelligence, and settings endpoints
"""

import requests
import sys
import json
from datetime import datetime
import time

class JupiterAPITester:
    def __init__(self, base_url="/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"  # From test data
        self.test_email = "admin@jupiter.com"  # From test data

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
    def make_request(self, method, endpoint, data=None, expected_status=200, auth_required=True):
        """Make HTTP request with proper headers"""
        # Use absolute URL for external access
        if self.base_url.startswith('http'):
            url = f"{self.base_url}/{endpoint}"
        else:
            # Use localhost for internal testing
            url = f"http://localhost:8001{self.base_url}/{endpoint}"
        
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return success, response.status_code, response_data
            
        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_health_check(self):
        """Test basic health endpoint"""
        success, status, data = self.make_request('GET', 'health', auth_required=False)
        self.log_test("Health Check", success and status == 200, 
                     f"Status: {status}, Response: {data}")
        return success

    def test_register_user(self):
        """Test user registration (should fail since user exists)"""
        register_data = {
            "email": self.test_email,
            "tenant_name": "Jupiter Security",
            "is_owner": True
        }
        
        success, status, data = self.make_request('POST', 'auth/register', register_data, 
                                                expected_status=400, auth_required=False)
        
        # We expect this to fail with 400 since user already exists
        expected_failure = status == 400 and "already exists" in data.get("detail", "")
        self.log_test("User Registration (Expected Failure)", expected_failure, 
                     f"Status: {status}, Response: {data}")
        return expected_failure

    def test_request_otp(self):
        """Test OTP request"""
        otp_data = {
            "email": self.test_email,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/request-otp', otp_data, 
                                                expected_status=200, auth_required=False)
        
        self.log_test("Request OTP", success, f"Status: {status}, Response: {data}")
        
        if success:
            print("📧 Check backend logs for OTP (printed to console)")
            time.sleep(2)  # Give time for OTP generation
        
        return success

    def test_login_with_actual_otp(self):
        """Test login with actual OTP from development response"""
        # First request OTP and get it from the response (development mode)
        otp_data = {
            "email": self.test_email,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/request-otp', otp_data, 
                                                expected_status=200, auth_required=False)
        
        if not success or "dev_otp" not in data:
            self.log_test("Login with Actual OTP", False, "Could not get OTP from development response")
            return False
        
        otp = data["dev_otp"]
        
        login_data = {
            "email": self.test_email,
            "otp": otp,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/login', login_data, 
                                                expected_status=200, auth_required=False)
        
        if success and "token" in data:
            self.token = data["token"]
            self.user_data = data.get("user", {})
            self.log_test(f"Login with OTP {otp}", True, f"Token received")
            return True
        else:
            self.log_test(f"Login with OTP {otp}", False, f"Status: {status}, Response: {data}")
            return False

    def test_dashboard_overview(self):
        """Test dashboard overview endpoint"""
        if not self.token:
            self.log_test("Dashboard Overview", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'dashboard/overview')
        self.log_test("Dashboard Overview", success, f"Status: {status}")
        
        if success:
            print(f"   📊 Total Logs: {data.get('total_logs', 0)}")
            print(f"   🚨 Total Alerts: {data.get('total_alerts', 0)}")
            print(f"   ⚠️  Critical Alerts: {data.get('critical_alerts', 0)}")
            print(f"   👑 Owner View: {data.get('is_owner_view', False)}")
        
        return success

    def test_system_health(self):
        """Test system health endpoint (owner only)"""
        if not self.token:
            self.log_test("System Health", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'system/health')
        
        # This should work if user is owner, fail with 403 if not
        if status == 403:
            self.log_test("System Health (Non-Owner)", True, "Correctly denied access")
            return True
        elif success:
            self.log_test("System Health (Owner)", True, f"Database: {data.get('database', 'unknown')}")
            return True
        else:
            self.log_test("System Health", False, f"Status: {status}, Response: {data}")
            return False

    def test_get_alerts(self):
        """Test getting alerts"""
        if not self.token:
            self.log_test("Get Alerts", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'alerts')
        self.log_test("Get Alerts", success, f"Status: {status}")
        
        if success:
            alerts_count = len(data.get('alerts', []))
            print(f"   📋 Found {alerts_count} alerts")
        
        return success

    def test_create_alert(self):
        """Test creating an alert"""
        if not self.token:
            self.log_test("Create Alert", False, "No authentication token")
            return False
            
        alert_data = {
            "severity": "high",
            "source": "test_system",
            "entity": "192.168.1.100",
            "message": "Test alert from API testing",
            "metadata": {
                "test": True,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        success, status, data = self.make_request('POST', 'alerts', alert_data, expected_status=200)
        self.log_test("Create Alert", success, f"Status: {status}")
        
        if success:
            print(f"   🆔 Alert ID: {data.get('alert_id', 'unknown')}")
        
        return success

    def test_get_iocs(self):
        """Test getting IOCs"""
        if not self.token:
            self.log_test("Get IOCs", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'threat-intel/iocs')
        self.log_test("Get IOCs", success, f"Status: {status}")
        
        if success:
            iocs_count = len(data.get('iocs', []))
            print(f"   🎯 Found {iocs_count} IOCs")
        
        return success

    def test_create_ioc(self):
        """Test creating an IOC"""
        if not self.token:
            self.log_test("Create IOC", False, "No authentication token")
            return False
            
        ioc_data = {
            "ioc_type": "ip",
            "value": "192.168.1.200",
            "threat_level": "medium",
            "tags": ["test", "api_testing"],
            "description": "Test IOC created during API testing"
        }
        
        success, status, data = self.make_request('POST', 'threat-intel/iocs', ioc_data, expected_status=200)
        self.log_test("Create IOC", success, f"Status: {status}")
        
        if success:
            print(f"   🆔 IOC ID: {data.get('ioc_id', 'unknown')}")
        
        return success

    def test_threat_intel_lookup(self):
        """Test threat intelligence lookup"""
        if not self.token:
            self.log_test("Threat Intel Lookup", False, "No authentication token")
            return False
            
        # Send data as JSON body since it's a POST endpoint
        lookup_data = {
            'indicator': '8.8.8.8',
            'ioc_type': 'ip'
        }
        
        success, status, data = self.make_request('POST', 'threat-intel/lookup', lookup_data)
        
        if success:
            results = data.get('results', {})
            print(f"   🔍 Lookup results: {len(results)} services")
            self.log_test("Threat Intel Lookup", True, f"Status: {status}")
        else:
            self.log_test("Threat Intel Lookup", False, f"Status: {status}, Response: {data}")
        
        return success

    def test_get_api_keys(self):
        """Test getting API keys"""
        if not self.token:
            self.log_test("Get API Keys", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'settings/api-keys')
        self.log_test("Get API Keys", success, f"Status: {status}")
        
        if success:
            keys_count = len(data.get('api_keys', []))
            print(f"   🔑 Found {keys_count} API keys")
        
        return success

    def test_save_api_key(self):
        """Test saving an API key"""
        if not self.token:
            self.log_test("Save API Key", False, "No authentication token")
            return False
            
        api_key_data = {
            "name": "test_service",
            "api_key": "test_key_12345",
            "endpoint": "https://api.test-service.com",
            "enabled": True
        }
        
        success, status, data = self.make_request('POST', 'settings/api-keys', api_key_data, expected_status=200)
        self.log_test("Save API Key", success, f"Status: {status}")
        
        return success

    def test_get_automations(self):
        """Test getting automation rules"""
        if not self.token:
            self.log_test("Get Automations", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'automations')
        self.log_test("Get Automations", success, f"Status: {status}")
        
        if success:
            rules_count = len(data.get('automation_rules', []))
            print(f"   🤖 Found {rules_count} automation rules")
        
        return success

    def test_get_cases(self):
        """Test getting cases"""
        if not self.token:
            self.log_test("Get Cases", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'cases')
        self.log_test("Get Cases", success, f"Status: {status}")
        
        if success:
            cases_count = len(data.get('cases', []))
            print(f"   📁 Found {cases_count} cases")
        
        return success

    # AI Endpoints Testing
    def test_ai_models(self):
        """Test AI models endpoint"""
        if not self.token:
            self.log_test("AI Models", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'ai/models')
        self.log_test("AI Models", success, f"Status: {status}")
        
        if success:
            local_models = data.get('local_models', [])
            cloud_providers = data.get('cloud_providers', [])
            print(f"   🤖 Local models: {len(local_models)}")
            print(f"   ☁️  Cloud providers: {len(cloud_providers)}")
            print(f"   🔑 Emergent key available: {data.get('emergent_key_available', False)}")
        
        return success

    def test_ai_threat_analysis(self):
        """Test AI threat analysis endpoint"""
        if not self.token:
            self.log_test("AI Threat Analysis", False, "No authentication token")
            return False
            
        threat_data = {
            "source_ip": "192.168.1.100",
            "technique": "T1055.012",
            "severity": "high",
            "indicators": ["suspicious_process.exe", "192.168.1.100", "malicious.domain.com"],
            "timeline": "2024-01-15T10:30:00Z",
            "metadata": {
                "attack_vector": "phishing_email",
                "affected_systems": ["workstation-01", "server-02"]
            },
            "model_preference": "auto"
        }
        
        success, status, data = self.make_request('POST', 'ai/analyze/threat', threat_data)
        self.log_test("AI Threat Analysis", success, f"Status: {status}")
        
        if success:
            analysis_id = data.get('analysis_id', 'unknown')
            confidence = data.get('ai_analysis', {}).get('confidence', 0)
            threat_type = data.get('ai_analysis', {}).get('threat_type', 'unknown')
            print(f"   🆔 Analysis ID: {analysis_id}")
            print(f"   📊 Confidence: {confidence}%")
            print(f"   🎯 Threat Type: {threat_type}")
        
        return success

    def test_ai_chat(self):
        """Test AI chat endpoint"""
        if not self.token:
            self.log_test("AI Chat", False, "No authentication token")
            return False
            
        chat_data = {
            "message": "I'm seeing suspicious network activity from IP 10.0.1.50. Can you help me analyze this threat?",
            "session_id": "test-session-123",
            "model_preference": "auto",
            "context_type": "security"
        }
        
        success, status, data = self.make_request('POST', 'ai/chat', chat_data)
        self.log_test("AI Chat", success, f"Status: {status}")
        
        if success:
            session_id = data.get('session_id', 'unknown')
            response_text = data.get('response', {}).get('response', '')
            confidence = data.get('response', {}).get('confidence', 0)
            print(f"   💬 Session ID: {session_id}")
            print(f"   📊 Confidence: {confidence}%")
            print(f"   🤖 Response preview: {response_text[:100]}...")
        
        return success

    def test_ai_config_save(self):
        """Test AI config save endpoint"""
        if not self.token:
            self.log_test("AI Config Save", False, "No authentication token")
            return False
            
        config_data = {
            "provider": "openai",
            "api_key": "sk-test-key-12345",
            "model_name": "gpt-4o-mini",
            "enabled": True
        }
        
        success, status, data = self.make_request('POST', 'ai/config/api-key', config_data)
        self.log_test("AI Config Save", success, f"Status: {status}")
        
        if success:
            provider = data.get('provider', 'unknown')
            print(f"   🔧 Provider configured: {provider}")
        
        return success

    def test_ai_config_get(self):
        """Test AI config get endpoint"""
        if not self.token:
            self.log_test("AI Config Get", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'ai/config')
        self.log_test("AI Config Get", success, f"Status: {status}")
        
        if success:
            configs = data.get('ai_configurations', [])
            print(f"   ⚙️  AI configurations: {len(configs)}")
            for config in configs:
                provider = config.get('provider', 'unknown')
                enabled = config.get('enabled', False)
                print(f"      - {provider}: {'enabled' if enabled else 'disabled'}")
        
        return success

    def test_ai_intelligence_summary(self):
        """Test AI intelligence summary endpoint"""
        if not self.token:
            self.log_test("AI Intelligence Summary", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'ai/intelligence/summary')
        self.log_test("AI Intelligence Summary", success, f"Status: {status}")
        
        if success:
            recent_analyses = data.get('recent_analyses', 0)
            threat_assessments = data.get('threat_assessments_today', 0)
            high_confidence = data.get('high_confidence_alerts', 0)
            cognitive_load = data.get('cognitive_load', 0)
            print(f"   📊 Recent analyses: {recent_analyses}")
            print(f"   🎯 Threat assessments today: {threat_assessments}")
            print(f"   ⚠️  High confidence alerts: {high_confidence}")
            print(f"   🧠 Cognitive load: {cognitive_load}%")
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Project Jupiter API Testing")
        print(f"🎯 Target: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Authentication flow
        print("\n🔐 Testing Authentication Flow...")
        self.test_register_user()  # Expected to fail
        
        if not self.test_login_with_actual_otp():
            print("⚠️  Login failed - continuing with other tests but auth-required tests will fail")
        
        # Dashboard tests
        print("\n📊 Testing Dashboard Endpoints...")
        self.test_dashboard_overview()
        self.test_system_health()
        
        # Alerts tests
        print("\n🚨 Testing Alerts Endpoints...")
        self.test_get_alerts()
        self.test_create_alert()
        
        # Threat Intelligence tests
        print("\n🎯 Testing Threat Intelligence Endpoints...")
        self.test_get_iocs()
        self.test_create_ioc()
        self.test_threat_intel_lookup()
        
        # Settings tests
        print("\n⚙️  Testing Settings Endpoints...")
        self.test_get_api_keys()
        self.test_save_api_key()
        
        # Additional endpoints
        print("\n🔧 Testing Additional Endpoints...")
        self.test_get_automations()
        self.test_get_cases()
        
        # AI endpoints testing
        print("\n🤖 Testing AI Endpoints...")
        self.test_ai_models()
        self.test_ai_threat_analysis()
        self.test_ai_chat()
        self.test_ai_config_save()
        self.test_ai_config_get()
        self.test_ai_intelligence_summary()
        
        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            failed = self.tests_run - self.tests_passed
            print(f"⚠️  {failed} test(s) failed")
            return False

def main():
    """Main test execution"""
    # Use the configured backend URL from environment
    base_url = "/api"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = JupiterAPITester(base_url)
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())