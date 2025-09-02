#!/usr/bin/env python3
"""
Final Verification Test - Complete end-to-end test of the fixed dev credentials
"""

import requests
import json

class FinalVerificationTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.dev_email = "admin@jupiter.com"
        self.dev_tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"
        self.dev_tenant_name = "DevCredentialsTenant"
        self.dev_otp = "123456"
        
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
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

    def test_scenario_1_tenant_lookup_by_name(self):
        """Test 1: Tenant lookup by name (correct way)"""
        print(f"🔍 Test 1: Tenant lookup by name")
        print(f"   GET /api/auth/tenant/{self.dev_tenant_name}")
        
        status, data = self.make_request('GET', f'auth/tenant/{self.dev_tenant_name}')
        
        success = status == 200 and data.get('tenant_id') == self.dev_tenant_id
        
        print(f"   Status: {status}")
        print(f"   Success: {success}")
        if success:
            print(f"   ✅ Tenant name '{self.dev_tenant_name}' resolves to ID '{self.dev_tenant_id}'")
        else:
            print(f"   ❌ Failed: {data}")
        
        return success

    def test_scenario_2_direct_login_with_tenant_id(self):
        """Test 2: Direct login with tenant ID (user's scenario)"""
        print(f"\n🔐 Test 2: Direct login with tenant ID (user's exact scenario)")
        print(f"   Email: {self.dev_email}")
        print(f"   Tenant ID: {self.dev_tenant_id}")
        print(f"   OTP: {self.dev_otp}")
        
        # Step 1: Request OTP
        otp_data = {
            "email": self.dev_email,
            "tenant_id": self.dev_tenant_id
        }
        
        otp_status, otp_response = self.make_request('POST', 'auth/request-otp', otp_data)
        print(f"   OTP Request Status: {otp_status}")
        
        if otp_status != 200:
            print(f"   ❌ OTP request failed: {otp_response}")
            return False
        
        # Step 2: Login
        login_data = {
            "email": self.dev_email,
            "otp": self.dev_otp,
            "tenant_id": self.dev_tenant_id
        }
        
        login_status, login_response = self.make_request('POST', 'auth/login', login_data)
        print(f"   Login Status: {login_status}")
        
        if login_status == 200 and 'token' in login_response:
            print(f"   ✅ Login successful with exact dev_credentials.py values!")
            return True, login_response['token']
        else:
            print(f"   ❌ Login failed: {login_response}")
            return False, None

    def test_scenario_3_dashboard_access(self, token):
        """Test 3: Dashboard access with the token"""
        print(f"\n📊 Test 3: Dashboard access with JWT token")
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        url = f"{self.base_url}/dashboard/overview"
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Dashboard access successful!")
                print(f"   📊 Total Alerts: {data.get('total_alerts', 0)}")
                print(f"   👑 Owner View: {data.get('is_owner_view', False)}")
                return True
            else:
                print(f"   ❌ Dashboard access failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
            return False

    def test_scenario_4_alternative_working_credentials(self):
        """Test 4: Show alternative working credentials"""
        print(f"\n🎯 Test 4: Alternative working credentials")
        
        alternatives = [
            {"name": "AdminTenant", "id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786"},
            {"name": "Jupiter Security", "id": "3dd59e40-40d3-4e7b-8d95-d51ab25fb838"}
        ]
        
        working_alternatives = []
        
        for alt in alternatives:
            print(f"\n   Testing: {alt['name']}")
            
            # Test OTP request
            otp_data = {
                "email": self.dev_email,
                "tenant_id": alt['id']
            }
            
            otp_status, _ = self.make_request('POST', 'auth/request-otp', otp_data)
            
            if otp_status == 200:
                # Test login
                login_data = {
                    "email": self.dev_email,
                    "otp": self.dev_otp,
                    "tenant_id": alt['id']
                }
                
                login_status, _ = self.make_request('POST', 'auth/login', login_data)
                
                if login_status == 200:
                    print(f"      ✅ {alt['name']} works!")
                    working_alternatives.append(alt)
                else:
                    print(f"      ❌ {alt['name']} login failed")
            else:
                print(f"      ❌ {alt['name']} OTP failed")
        
        return working_alternatives

    def run_final_verification(self):
        """Run complete final verification"""
        print("🎯 FINAL VERIFICATION - DEV CREDENTIALS FIX")
        print("=" * 70)
        print("Verifying that the 'Tenant not found' error has been resolved")
        print("Testing the exact credentials from dev_credentials.py")
        print("=" * 70)
        
        # Test 1: Tenant lookup by name
        tenant_lookup_success = self.test_scenario_1_tenant_lookup_by_name()
        
        # Test 2: Direct login (user's exact scenario)
        login_success, token = self.test_scenario_2_direct_login_with_tenant_id()
        
        # Test 3: Dashboard access
        dashboard_success = False
        if token:
            dashboard_success = self.test_scenario_3_dashboard_access(token)
        
        # Test 4: Alternative credentials
        alternatives = self.test_scenario_4_alternative_working_credentials()
        
        # Final summary
        print(f"\n📋 FINAL VERIFICATION RESULTS")
        print("=" * 70)
        print(f"✅ Tenant lookup by name: {tenant_lookup_success}")
        print(f"✅ Direct login with dev credentials: {login_success}")
        print(f"✅ Dashboard access: {dashboard_success}")
        print(f"✅ Alternative credentials available: {len(alternatives)}")
        
        all_critical_tests_passed = login_success and dashboard_success
        
        if all_critical_tests_passed:
            print(f"\n🎉 SUCCESS! THE 'TENANT NOT FOUND' ERROR IS FIXED!")
            print(f"\n🚀 USER CAN NOW LOGIN WITH EXACT DEV_CREDENTIALS.PY VALUES:")
            print(f"   📧 Email: {self.dev_email}")
            print(f"   🆔 Tenant ID: {self.dev_tenant_id}")
            print(f"   🔑 OTP: {self.dev_otp}")
            
            print(f"\n💡 EXPLANATION:")
            print(f"   • The tenant ID from dev_credentials.py didn't exist in the database")
            print(f"   • Created missing tenant with ID: {self.dev_tenant_id}")
            print(f"   • Created missing user: {self.dev_email}")
            print(f"   • User can now access their system immediately!")
            
            if alternatives:
                print(f"\n🔄 ALTERNATIVE WORKING CREDENTIALS:")
                for alt in alternatives:
                    print(f"   • Email: {self.dev_email} + Tenant: '{alt['name']}'")
        else:
            print(f"\n⚠️  CRITICAL TESTS FAILED - Manual intervention needed")
        
        return all_critical_tests_passed

if __name__ == "__main__":
    tester = FinalVerificationTester()
    success = tester.run_final_verification()