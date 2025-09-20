#!/usr/bin/env python3
"""
Focused Backend Health Check for Project Jupiter SIEM Platform
Tests core functionality as requested: API endpoints, Dashboard API, Authentication, Database
"""

import requests
import sys
import json
from datetime import datetime
import time

class JupiterHealthChecker:
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
        url = f"http://localhost:8001{self.base_url}/{endpoint}"
        
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return success, response.status_code, response_data
            
        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_health_endpoint(self):
        """Test basic health endpoint"""
        success, status, data = self.make_request('GET', 'health', auth_required=False)
        
        if success and 'status' in data and 'timestamp' in data:
            self.log_test("Health Endpoint", True, f"Status: {data['status']}")
            return True
        else:
            self.log_test("Health Endpoint", False, f"Status: {status}, Response: {data}")
            return False

    def test_authentication_flow(self):
        """Test complete authentication flow"""
        print("   🔐 Testing OTP Request...")
        
        # Request OTP
        otp_data = {
            "email": self.test_email,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/request-otp', otp_data, 
                                                expected_status=200, auth_required=False)
        
        if not success or "dev_otp" not in data:
            self.log_test("Authentication Flow", False, "Could not get OTP from development response")
            return False
        
        otp = data["dev_otp"]
        print(f"   📧 OTP Generated: {otp}")
        
        # Login with OTP
        print("   🔑 Testing Login...")
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
            self.log_test("Authentication Flow", True, "JWT token received and stored")
            return True
        else:
            self.log_test("Authentication Flow", False, f"Login failed - Status: {status}")
            return False

    def test_dashboard_api(self):
        """Test dashboard overview API specifically"""
        if not self.token:
            self.log_test("Dashboard API", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'dashboard/overview')
        
        if success:
            # Verify expected dashboard data structure
            required_fields = ['total_logs', 'total_alerts', 'critical_alerts', 'recent_alerts', 'health_metrics', 'is_owner_view']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_test("Dashboard API", True, f"All required fields present")
                print(f"   📊 Total Logs: {data.get('total_logs', 0)}")
                print(f"   🚨 Total Alerts: {data.get('total_alerts', 0)}")
                print(f"   ⚠️  Critical Alerts: {data.get('critical_alerts', 0)}")
                print(f"   👑 Owner View: {data.get('is_owner_view', False)}")
                print(f"   🏥 Health Metrics: {len(data.get('health_metrics', []))} services")
                return True
            else:
                self.log_test("Dashboard API", False, f"Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("Dashboard API", False, f"Status: {status}, Response: {data}")
            return False

    def test_database_connectivity(self):
        """Test database connectivity through system health endpoint"""
        if not self.token:
            self.log_test("Database Connectivity", False, "No authentication token")
            return False
            
        success, status, data = self.make_request('GET', 'system/health')
        
        if success:
            db_status = data.get('database', 'unknown')
            collections = data.get('collections', {})
            
            if db_status == 'healthy' and collections:
                self.log_test("Database Connectivity", True, f"Database: {db_status}")
                print(f"   🗄️  Users: {collections.get('users', 0)}")
                print(f"   🏢 Tenants: {collections.get('tenants', 0)}")
                print(f"   🚨 Alerts: {collections.get('alerts', 0)}")
                print(f"   🎯 IOCs: {collections.get('iocs', 0)}")
                print(f"   🤖 Automations: {collections.get('automations', 0)}")
                return True
            else:
                self.log_test("Database Connectivity", False, f"Database status: {db_status}")
                return False
        else:
            self.log_test("Database Connectivity", False, f"Status: {status}")
            return False

    def test_core_api_endpoints(self):
        """Test core API endpoints functionality"""
        if not self.token:
            self.log_test("Core API Endpoints", False, "No authentication token")
            return False
        
        endpoints_to_test = [
            ('GET', 'alerts', 'Alerts'),
            ('GET', 'threat-intel/iocs', 'IOCs'),
            ('GET', 'settings/api-keys', 'API Keys'),
            ('GET', 'automations', 'Automations'),
            ('GET', 'cases', 'Cases'),
            ('GET', 'ai/models', 'AI Models'),
            ('GET', 'ai/intelligence/summary', 'AI Intelligence')
        ]
        
        all_passed = True
        results = []
        
        for method, endpoint, name in endpoints_to_test:
            success, status, data = self.make_request(method, endpoint)
            results.append((name, success, status))
            if not success:
                all_passed = False
        
        if all_passed:
            self.log_test("Core API Endpoints", True, f"All {len(endpoints_to_test)} endpoints responding")
            for name, success, status in results:
                print(f"   ✅ {name}: {status}")
        else:
            failed_endpoints = [name for name, success, status in results if not success]
            self.log_test("Core API Endpoints", False, f"Failed endpoints: {failed_endpoints}")
        
        return all_passed

    def run_health_check(self):
        """Run focused health check"""
        print("🏥 Project Jupiter Backend Health Check")
        print("🎯 Focus: Core APIs, Dashboard, Authentication, Database")
        print("=" * 60)
        
        # Test 1: Health Endpoint
        print("\n1️⃣ Testing Health Endpoint...")
        health_ok = self.test_health_endpoint()
        
        # Test 2: Authentication
        print("\n2️⃣ Testing Authentication (JWT)...")
        auth_ok = self.test_authentication_flow()
        
        # Test 3: Dashboard API
        print("\n3️⃣ Testing Dashboard API...")
        dashboard_ok = self.test_dashboard_api()
        
        # Test 4: Database Connectivity
        print("\n4️⃣ Testing Database Connectivity...")
        db_ok = self.test_database_connectivity()
        
        # Test 5: Core API Endpoints
        print("\n5️⃣ Testing Core API Endpoints...")
        api_ok = self.test_core_api_endpoints()
        
        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 Health Check Results: {self.tests_passed}/{self.tests_run} passed")
        
        all_critical_passed = health_ok and auth_ok and dashboard_ok and db_ok and api_ok
        
        if all_critical_passed:
            print("🎉 Backend Health Check: ALL SYSTEMS OPERATIONAL")
            print("✅ Ready for dashboard customization features")
            return True
        else:
            print("⚠️  Backend Health Check: ISSUES DETECTED")
            if not health_ok:
                print("   ❌ Health endpoint not responding")
            if not auth_ok:
                print("   ❌ Authentication system issues")
            if not dashboard_ok:
                print("   ❌ Dashboard API problems")
            if not db_ok:
                print("   ❌ Database connectivity issues")
            if not api_ok:
                print("   ❌ Core API endpoints failing")
            return False

def main():
    """Main health check execution"""
    checker = JupiterHealthChecker()
    success = checker.run_health_check()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())