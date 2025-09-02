#!/usr/bin/env python3
"""
Tenant Investigation Test - Specific test for the "Tenant not found" error
Testing the exact credentials from dev_credentials.py:
- Email: admin@jupiter.com
- Tenant ID: b48d69da-51a1-4d08-9f0a-deb736a23c25
- OTP: 123456
"""

import requests
import json
from datetime import datetime

class TenantInvestigationTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.dev_email = "admin@jupiter.com"
        self.dev_tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"
        self.dev_otp = "123456"
        
    def make_request(self, method, endpoint, data=None, expected_status=None):
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

    def test_direct_tenant_lookup(self):
        """Test direct tenant lookup by ID"""
        print(f"\n🔍 TESTING DIRECT TENANT LOOKUP")
        print(f"   Tenant ID from dev_credentials.py: {self.dev_tenant_id}")
        
        # Try to get tenant by ID (this endpoint might not exist, but let's try)
        status, data = self.make_request('GET', f'auth/tenant/{self.dev_tenant_id}')
        
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if status == 404:
            print("   ❌ TENANT NOT FOUND - This is the root cause!")
            return False
        elif status == 200:
            print("   ✅ Tenant found")
            return True
        else:
            print(f"   ⚠️  Unexpected status: {status}")
            return False

    def test_request_otp_with_dev_credentials(self):
        """Test OTP request with exact dev credentials"""
        print(f"\n📧 TESTING OTP REQUEST WITH DEV CREDENTIALS")
        print(f"   Email: {self.dev_email}")
        print(f"   Tenant ID: {self.dev_tenant_id}")
        
        otp_data = {
            "email": self.dev_email,
            "tenant_id": self.dev_tenant_id
        }
        
        status, data = self.make_request('POST', 'auth/request-otp', otp_data)
        
        print(f"   Status: {status}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if status == 404 and "User not found" in data.get("detail", ""):
            print("   ❌ USER NOT FOUND - User doesn't exist with this tenant ID")
            return False
        elif status == 404 and "Tenant not found" in data.get("detail", ""):
            print("   ❌ TENANT NOT FOUND - Tenant ID doesn't exist")
            return False
        elif status == 200:
            print("   ✅ OTP request successful")
            return True
        else:
            print(f"   ⚠️  Unexpected response")
            return False

    def test_login_with_dev_credentials(self):
        """Test login with exact dev credentials"""
        print(f"\n🔐 TESTING LOGIN WITH DEV CREDENTIALS")
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
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        if status == 404 and "User not found" in data.get("detail", ""):
            print("   ❌ USER NOT FOUND - This is the exact error user is experiencing!")
            return False
        elif status == 200:
            print("   ✅ Login successful")
            return True
        else:
            print(f"   ⚠️  Other error")
            return False

    def investigate_existing_tenants(self):
        """Check what tenants actually exist in the database"""
        print(f"\n🏢 INVESTIGATING EXISTING TENANTS")
        
        # We need to check via MongoDB or find another way
        # Let's try to get tenant info by trying different tenant names
        
        common_tenant_names = [
            "AdminTenant", 
            "Jupiter Security", 
            "test-org", 
            "MainTenant",
            "jupiter-main-001",
            "secureinsight-1"
        ]
        
        existing_tenants = []
        
        for tenant_name in common_tenant_names:
            status, data = self.make_request('GET', f'auth/tenant/{tenant_name}')
            if status == 200:
                existing_tenants.append({
                    "name": tenant_name,
                    "id": data.get("tenant_id"),
                    "response": data
                })
                print(f"   ✅ Found tenant: {tenant_name} -> {data.get('tenant_id')}")
            else:
                print(f"   ❌ Not found: {tenant_name}")
        
        print(f"\n   📊 SUMMARY: Found {len(existing_tenants)} existing tenants")
        return existing_tenants

    def test_working_credentials(self, existing_tenants):
        """Test login with working tenant IDs"""
        print(f"\n🧪 TESTING WORKING CREDENTIALS")
        
        working_credentials = []
        
        for tenant in existing_tenants:
            tenant_id = tenant["id"]
            tenant_name = tenant["name"]
            
            print(f"\n   Testing with tenant: {tenant_name} ({tenant_id})")
            
            # Test OTP request
            otp_data = {
                "email": self.dev_email,
                "tenant_id": tenant_id
            }
            
            status, data = self.make_request('POST', 'auth/request-otp', otp_data)
            
            if status == 200:
                print(f"      ✅ OTP request successful for {tenant_name}")
                
                # Test login
                login_data = {
                    "email": self.dev_email,
                    "otp": self.dev_otp,
                    "tenant_id": tenant_id
                }
                
                login_status, login_data_response = self.make_request('POST', 'auth/login', login_data)
                
                if login_status == 200:
                    print(f"      ✅ LOGIN SUCCESSFUL for {tenant_name}!")
                    working_credentials.append({
                        "email": self.dev_email,
                        "tenant_name": tenant_name,
                        "tenant_id": tenant_id,
                        "otp": self.dev_otp
                    })
                else:
                    print(f"      ❌ Login failed: {login_data_response.get('detail', 'Unknown error')}")
            else:
                print(f"      ❌ OTP request failed: {data.get('detail', 'Unknown error')}")
        
        return working_credentials

    def run_investigation(self):
        """Run complete investigation"""
        print("🚨 TENANT CREDENTIALS INVESTIGATION")
        print("=" * 60)
        print("Investigating 'Tenant not found' error with dev_credentials.py")
        print(f"Target credentials:")
        print(f"  Email: {self.dev_email}")
        print(f"  Tenant ID: {self.dev_tenant_id}")
        print(f"  OTP: {self.dev_otp}")
        print("=" * 60)
        
        # Step 1: Test direct tenant lookup
        tenant_exists = self.test_direct_tenant_lookup()
        
        # Step 2: Test OTP request
        otp_works = self.test_request_otp_with_dev_credentials()
        
        # Step 3: Test login
        login_works = self.test_login_with_dev_credentials()
        
        # Step 4: Investigate existing tenants
        existing_tenants = self.investigate_existing_tenants()
        
        # Step 5: Test working credentials
        working_credentials = self.test_working_credentials(existing_tenants)
        
        # Summary
        print(f"\n📋 INVESTIGATION SUMMARY")
        print("=" * 60)
        print(f"❌ Dev credentials tenant exists: {tenant_exists}")
        print(f"❌ Dev credentials OTP works: {otp_works}")
        print(f"❌ Dev credentials login works: {login_works}")
        print(f"✅ Found {len(existing_tenants)} existing tenants")
        print(f"✅ Found {len(working_credentials)} working credential combinations")
        
        if working_credentials:
            print(f"\n🎯 WORKING CREDENTIALS:")
            for i, cred in enumerate(working_credentials, 1):
                print(f"   {i}. Email: {cred['email']}")
                print(f"      Tenant Name: {cred['tenant_name']}")
                print(f"      Tenant ID: {cred['tenant_id']}")
                print(f"      OTP: {cred['otp']}")
                print()
        
        print(f"\n🔧 RECOMMENDED SOLUTION:")
        if working_credentials:
            best_cred = working_credentials[0]
            print(f"   Use these working credentials:")
            print(f"   Email: {best_cred['email']}")
            print(f"   Tenant Name: {best_cred['tenant_name']} (instead of tenant ID)")
            print(f"   OTP: {best_cred['otp']}")
        else:
            print(f"   No working credentials found - need to create user/tenant")
        
        return {
            "dev_credentials_work": tenant_exists and otp_works and login_works,
            "existing_tenants": existing_tenants,
            "working_credentials": working_credentials
        }

if __name__ == "__main__":
    tester = TenantInvestigationTester()
    results = tester.run_investigation()