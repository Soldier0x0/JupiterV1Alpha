#!/usr/bin/env python3
"""
Comprehensive Tenant Test - Verify all tenant-related functionality works
"""

import requests
import json
from datetime import datetime

class ComprehensiveTenantTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.dev_email = "admin@jupiter.com"
        self.dev_tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"
        self.dev_otp = "123456"
        
    def make_request(self, method, endpoint, data=None):
        """Make HTTP request"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return response.status_code, response_data
            
        except Exception as e:
            return 0, {"error": str(e)}

    def test_tenant_lookup_by_id(self):
        """Test GET /api/auth/tenant/{tenant_id}"""
        print(f"🔍 Testing tenant lookup by ID: {self.dev_tenant_id}")
        
        status, data = self.make_request('GET', f'auth/tenant/{self.dev_tenant_id}')
        
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if status == 200 and data.get('tenant_id') == self.dev_tenant_id:
            print(f"   ✅ Tenant lookup by ID successful")
            return True
        else:
            print(f"   ❌ Tenant lookup by ID failed")
            return False

    def test_otp_request_flow(self):
        """Test complete OTP request flow"""
        print(f"\n📧 Testing OTP request flow")
        print(f"   Email: {self.dev_email}")
        print(f"   Tenant ID: {self.dev_tenant_id}")
        
        otp_data = {
            "email": self.dev_email,
            "tenant_id": self.dev_tenant_id
        }
        
        status, data = self.make_request('POST', 'auth/request-otp', otp_data)
        
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if status == 200 and data.get('dev_otp') == self.dev_otp:
            print(f"   ✅ OTP request successful - received dev OTP: {data.get('dev_otp')}")
            return True
        else:
            print(f"   ❌ OTP request failed")
            return False

    def test_login_flow(self):
        """Test complete login flow"""
        print(f"\n🔐 Testing login flow")
        print(f"   Email: {self.dev_email}")
        print(f"   Tenant ID: {self.dev_tenant_id}")
        print(f"   OTP: {self.dev_otp}")
        
        login_data = {
            "email": self.dev_email,
            "otp": self.dev_otp,
            "tenant_id": self.dev_tenant_id
        }
        
        status, data = self.make_request('POST', 'auth/login', login_data)
        
        print(f"   Status: {status}")
        print(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        
        if status == 200 and 'token' in data:
            user_info = data.get('user', {})
            print(f"   ✅ Login successful!")
            print(f"   🎫 Token received: {data['token'][:20]}...")
            print(f"   👤 User ID: {user_info.get('id')}")
            print(f"   📧 Email: {user_info.get('email')}")
            print(f"   🏢 Tenant ID: {user_info.get('tenant_id')}")
            print(f"   👑 Is Owner: {user_info.get('is_owner')}")
            return True, data['token']
        else:
            print(f"   ❌ Login failed")
            return False, None

    def test_authenticated_endpoint(self, token):
        """Test an authenticated endpoint with the token"""
        print(f"\n🔒 Testing authenticated endpoint")
        
        url = f"{self.base_url}/dashboard/overview"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ Dashboard access successful!")
                print(f"   📊 Total Logs: {response_data.get('total_logs', 0)}")
                print(f"   🚨 Total Alerts: {response_data.get('total_alerts', 0)}")
                print(f"   ⚠️  Critical Alerts: {response_data.get('critical_alerts', 0)}")
                print(f"   👑 Owner View: {response_data.get('is_owner_view', False)}")
                return True
            else:
                print(f"   ❌ Dashboard access failed: {response_data}")
                return False
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
            return False

    def test_all_existing_tenants(self):
        """Test all existing tenants to show they work"""
        print(f"\n🏢 Testing all existing tenants")
        
        tenant_names = ["AdminTenant", "Jupiter Security", "test-org", "MainTenant"]
        
        for tenant_name in tenant_names:
            print(f"\n   Testing tenant: {tenant_name}")
            
            # Get tenant ID
            status, data = self.make_request('GET', f'auth/tenant/{tenant_name}')
            
            if status == 200:
                tenant_id = data.get('tenant_id')
                print(f"      ✅ Tenant ID: {tenant_id}")
                
                # Test if admin@jupiter.com exists in this tenant
                otp_data = {
                    "email": self.dev_email,
                    "tenant_id": tenant_id
                }
                
                otp_status, otp_response = self.make_request('POST', 'auth/request-otp', otp_data)
                
                if otp_status == 200:
                    print(f"      ✅ User exists in this tenant")
                else:
                    print(f"      ❌ User not found in this tenant")
            else:
                print(f"      ❌ Tenant not found")

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 COMPREHENSIVE TENANT TESTING")
        print("=" * 60)
        print("Testing the fixed dev_credentials.py functionality")
        print("=" * 60)
        
        # Test 1: Tenant lookup by ID
        tenant_lookup_success = self.test_tenant_lookup_by_id()
        
        # Test 2: OTP request flow
        otp_success = self.test_otp_request_flow()
        
        # Test 3: Login flow
        login_success, token = self.test_login_flow()
        
        # Test 4: Authenticated endpoint
        auth_success = False
        if token:
            auth_success = self.test_authenticated_endpoint(token)
        
        # Test 5: All existing tenants
        self.test_all_existing_tenants()
        
        # Summary
        print(f"\n📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tenant lookup by ID: {tenant_lookup_success}")
        print(f"✅ OTP request flow: {otp_success}")
        print(f"✅ Login flow: {login_success}")
        print(f"✅ Authenticated access: {auth_success}")
        
        all_tests_passed = all([tenant_lookup_success, otp_success, login_success, auth_success])
        
        if all_tests_passed:
            print(f"\n🎉 ALL TESTS PASSED!")
            print(f"✅ The 'Tenant not found' error has been RESOLVED!")
            print(f"\n🎯 USER CAN NOW LOGIN WITH:")
            print(f"   Email: {self.dev_email}")
            print(f"   Tenant ID: {self.dev_tenant_id}")
            print(f"   OTP: {self.dev_otp}")
        else:
            print(f"\n⚠️  Some tests failed - manual review needed")
        
        return all_tests_passed

if __name__ == "__main__":
    tester = ComprehensiveTenantTester()
    success = tester.run_comprehensive_test()