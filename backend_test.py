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
    def __init__(self, base_url="http://localhost:8001/api"):
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
        url = f"{self.base_url}/{endpoint}"
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
        """Test login with actual OTP from logs"""
        # Get the OTP from backend logs
        import subprocess
        try:
            result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True)
            log_lines = result.stdout.split('\n')
            
            # Find the most recent OTP for our email
            otp = None
            for line in reversed(log_lines):
                if f"OTP for {self.test_email}:" in line:
                    otp = line.split(":")[-1].strip()
                    break
            
            if not otp:
                self.log_test("Login with Actual OTP", False, "No OTP found in logs")
                return False
            
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
                
        except Exception as e:
            self.log_test("Login with Actual OTP", False, f"Error reading logs: {str(e)}")
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
            
        # The endpoint expects form parameters
        url = f"{self.base_url}/threat-intel/lookup"
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Bearer {self.token}'
        }
        
        form_data = {
            'indicator': '8.8.8.8',
            'ioc_type': 'ip'
        }
        
        try:
            response = requests.post(url, data=form_data, headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                results = data.get('results', {})
                print(f"   🔍 Lookup results: {len(results)} services")
                self.log_test("Threat Intel Lookup", True, f"Status: {response.status_code}")
            else:
                try:
                    error_data = response.json()
                    self.log_test("Threat Intel Lookup", False, f"Status: {response.status_code}, Error: {error_data}")
                except:
                    self.log_test("Threat Intel Lookup", False, f"Status: {response.status_code}, Response: {response.text}")
            
            return success
            
        except Exception as e:
            self.log_test("Threat Intel Lookup", False, f"Error: {str(e)}")
            return False

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
        
        if not self.test_request_otp():
            print("❌ OTP request failed - cannot continue with login tests")
        else:
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
    # Check if custom URL provided
    base_url = "http://localhost:8001/api"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = JupiterAPITester(base_url)
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())