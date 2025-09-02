#!/usr/bin/env python3
"""
Fix Dev Credentials Test - Create the missing tenant and user from dev_credentials.py
"""

import requests
import json
from datetime import datetime

class DevCredentialsFixer:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.dev_email = "admin@jupiter.com"
        self.dev_tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"
        self.dev_otp = "123456"
        self.admin_token = None
        
    def make_request(self, method, endpoint, data=None, auth_token=None):
        """Make HTTP request"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'
        
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

    def get_admin_token(self):
        """Get admin token using working credentials"""
        print("🔑 Getting admin token using working credentials...")
        
        # Use AdminTenant credentials that we know work
        otp_data = {
            "email": "admin@jupiter.com",
            "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786"  # AdminTenant ID
        }
        
        # Request OTP
        status, data = self.make_request('POST', 'auth/request-otp', otp_data)
        if status != 200:
            print(f"   ❌ Failed to request OTP: {data}")
            return False
        
        # Login
        login_data = {
            "email": "admin@jupiter.com",
            "otp": "123456",
            "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786"
        }
        
        status, data = self.make_request('POST', 'auth/login', login_data)
        if status == 200 and 'token' in data:
            self.admin_token = data['token']
            print("   ✅ Admin token obtained")
            return True
        else:
            print(f"   ❌ Failed to login: {data}")
            return False

    def create_dev_tenant(self):
        """Create the tenant from dev_credentials.py"""
        print(f"\n🏢 Creating dev credentials tenant...")
        print(f"   Target Tenant ID: {self.dev_tenant_id}")
        
        # We need to manually insert into MongoDB since there's no direct API
        # Let's try to register a user with a new tenant name that will create the tenant
        
        register_data = {
            "email": "temp@jupiter.com",  # Temporary email
            "tenant_name": "DevCredentialsTenant",  # This will create a new tenant
            "is_owner": True
        }
        
        status, data = self.make_request('POST', 'auth/register', register_data)
        
        if status == 200:
            created_tenant_id = data.get('tenant_id')
            print(f"   ✅ Created new tenant: {created_tenant_id}")
            return created_tenant_id
        else:
            print(f"   ⚠️  Registration response: {status} - {data}")
            return None

    def create_dev_user(self):
        """Create the user from dev_credentials.py"""
        print(f"\n👤 Creating dev credentials user...")
        print(f"   Email: {self.dev_email}")
        print(f"   Tenant ID: {self.dev_tenant_id}")
        
        # Try to register the user with the exact tenant ID from dev_credentials
        # This won't work directly, but let's see what happens
        
        register_data = {
            "email": self.dev_email,
            "tenant_name": "DevCredentialsTenant",  # Use a tenant name instead
            "is_owner": True
        }
        
        status, data = self.make_request('POST', 'auth/register', register_data)
        
        if status == 200:
            print(f"   ✅ User created successfully")
            return True
        elif status == 400 and "already exists" in data.get("detail", ""):
            print(f"   ✅ User already exists")
            return True
        else:
            print(f"   ❌ Failed to create user: {data}")
            return False

    def test_mongodb_direct_insert(self):
        """Test if we can insert directly into MongoDB"""
        print(f"\n🗄️  Testing MongoDB direct access...")
        
        try:
            from pymongo import MongoClient
            import uuid
            
            # Connect to MongoDB
            mongo_url = "mongodb://localhost:27017/jupiter_siem"
            client = MongoClient(mongo_url)
            db = client.jupiter_siem
            
            # Check if tenant exists
            existing_tenant = db.tenants.find_one({"_id": self.dev_tenant_id})
            if existing_tenant:
                print(f"   ✅ Tenant already exists: {existing_tenant}")
            else:
                # Create the tenant
                tenant_doc = {
                    "_id": self.dev_tenant_id,
                    "name": "DevCredentialsTenant",
                    "created_at": datetime.utcnow(),
                    "enabled": True
                }
                
                result = db.tenants.insert_one(tenant_doc)
                print(f"   ✅ Created tenant: {result.inserted_id}")
            
            # Check if user exists
            existing_user = db.users.find_one({"email": self.dev_email, "tenant_id": self.dev_tenant_id})
            if existing_user:
                print(f"   ✅ User already exists: {existing_user['_id']}")
            else:
                # Create the user
                user_id = str(uuid.uuid4())
                user_doc = {
                    "_id": user_id,
                    "email": self.dev_email,
                    "tenant_id": self.dev_tenant_id,
                    "is_owner": True,
                    "created_at": datetime.utcnow(),
                    "last_login": None,
                    "otp": None,
                    "otp_expires": None
                }
                
                result = db.users.insert_one(user_doc)
                print(f"   ✅ Created user: {result.inserted_id}")
            
            client.close()
            return True
            
        except Exception as e:
            print(f"   ❌ MongoDB access failed: {e}")
            return False

    def test_fixed_credentials(self):
        """Test if the dev credentials now work"""
        print(f"\n🧪 Testing fixed dev credentials...")
        
        # Test OTP request
        otp_data = {
            "email": self.dev_email,
            "tenant_id": self.dev_tenant_id
        }
        
        status, data = self.make_request('POST', 'auth/request-otp', otp_data)
        
        if status == 200:
            print(f"   ✅ OTP request successful")
            
            # Test login
            login_data = {
                "email": self.dev_email,
                "otp": self.dev_otp,
                "tenant_id": self.dev_tenant_id
            }
            
            login_status, login_data_response = self.make_request('POST', 'auth/login', login_data)
            
            if login_status == 200:
                print(f"   ✅ LOGIN SUCCESSFUL with dev credentials!")
                print(f"   🎯 User can now login with:")
                print(f"      Email: {self.dev_email}")
                print(f"      Tenant ID: {self.dev_tenant_id}")
                print(f"      OTP: {self.dev_otp}")
                return True
            else:
                print(f"   ❌ Login failed: {login_data_response}")
                return False
        else:
            print(f"   ❌ OTP request failed: {data}")
            return False

    def run_fix(self):
        """Run the complete fix process"""
        print("🔧 DEV CREDENTIALS FIX PROCESS")
        print("=" * 50)
        print("Creating missing tenant and user from dev_credentials.py")
        print("=" * 50)
        
        # Step 1: Try MongoDB direct insert
        mongodb_success = self.test_mongodb_direct_insert()
        
        if mongodb_success:
            # Step 2: Test if credentials now work
            credentials_work = self.test_fixed_credentials()
            
            if credentials_work:
                print(f"\n✅ SUCCESS! Dev credentials are now working!")
                print(f"\n🎯 SOLUTION SUMMARY:")
                print(f"   The tenant ID from dev_credentials.py didn't exist in the database.")
                print(f"   Created missing tenant: {self.dev_tenant_id}")
                print(f"   Created missing user: {self.dev_email}")
                print(f"   User can now login with the exact dev_credentials.py values!")
                return True
            else:
                print(f"\n❌ Credentials still don't work after fix attempt")
                return False
        else:
            print(f"\n❌ Could not access MongoDB to create missing data")
            return False

if __name__ == "__main__":
    fixer = DevCredentialsFixer()
    success = fixer.run_fix()
    
    if success:
        print(f"\n🚀 READY FOR USER!")
        print(f"   The user can now login with:")
        print(f"   Email: admin@jupiter.com")
        print(f"   Tenant ID: b48d69da-51a1-4d08-9f0a-deb736a23c25")
        print(f"   OTP: 123456")
    else:
        print(f"\n⚠️  Manual intervention required")