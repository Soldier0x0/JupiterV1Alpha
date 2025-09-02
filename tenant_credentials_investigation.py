#!/usr/bin/env python3
"""
Tenant and Credentials Investigation Script
Investigates the "Tenant not found" error and finds correct admin login credentials
"""

import requests
import sys
import json
from datetime import datetime
import os
from pymongo import MongoClient

class TenantCredentialsInvestigator:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        # MongoDB connection using same URL as backend
        self.mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/jupiter_siem")
        self.client = None
        self.db = None
        
    def connect_to_database(self):
        """Connect to MongoDB database"""
        try:
            self.client = MongoClient(self.mongo_url)
            self.db = self.client.jupiter_siem
            # Test connection
            self.db.command("ping")
            print("✅ Successfully connected to MongoDB")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            return False
    
    def investigate_tenants(self):
        """Query MongoDB to see what tenants actually exist"""
        print("\n🏢 INVESTIGATING TENANTS IN DATABASE")
        print("=" * 50)
        
        try:
            tenants_collection = self.db.tenants
            tenants = list(tenants_collection.find({}))
            
            print(f"📊 Total tenants found: {len(tenants)}")
            
            if len(tenants) == 0:
                print("⚠️  NO TENANTS FOUND IN DATABASE!")
                print("   This explains the 'Tenant not found' error")
                return []
            
            print("\n📋 EXISTING TENANTS:")
            for i, tenant in enumerate(tenants, 1):
                tenant_id = tenant.get('_id', 'unknown')
                tenant_name = tenant.get('name', 'unknown')
                created_at = tenant.get('created_at', 'unknown')
                enabled = tenant.get('enabled', 'unknown')
                
                print(f"   {i}. Tenant Name: '{tenant_name}'")
                print(f"      Tenant ID: {tenant_id}")
                print(f"      Created: {created_at}")
                print(f"      Enabled: {enabled}")
                print()
            
            return tenants
            
        except Exception as e:
            print(f"❌ Error querying tenants: {e}")
            return []
    
    def investigate_users(self):
        """Query MongoDB to see what admin users actually exist"""
        print("\n👥 INVESTIGATING USERS IN DATABASE")
        print("=" * 50)
        
        try:
            users_collection = self.db.users
            users = list(users_collection.find({}))
            
            print(f"📊 Total users found: {len(users)}")
            
            if len(users) == 0:
                print("⚠️  NO USERS FOUND IN DATABASE!")
                return []
            
            print("\n📋 EXISTING USERS:")
            for i, user in enumerate(users, 1):
                user_id = user.get('_id', 'unknown')
                email = user.get('email', 'unknown')
                tenant_id = user.get('tenant_id', 'unknown')
                is_owner = user.get('is_owner', False)
                created_at = user.get('created_at', 'unknown')
                last_login = user.get('last_login', 'never')
                
                print(f"   {i}. Email: {email}")
                print(f"      User ID: {user_id}")
                print(f"      Tenant ID: {tenant_id}")
                print(f"      Is Owner: {is_owner}")
                print(f"      Created: {created_at}")
                print(f"      Last Login: {last_login}")
                print()
            
            return users
            
        except Exception as e:
            print(f"❌ Error querying users: {e}")
            return []
    
    def compare_dev_credentials_vs_database(self):
        """Compare dev_credentials.py with actual database"""
        print("\n🔍 COMPARING DEV_CREDENTIALS.PY VS DATABASE")
        print("=" * 50)
        
        # Load dev credentials
        try:
            sys.path.append('/app/backend')
            from dev_credentials import DEV_CREDENTIALS
            
            print("📄 DEV_CREDENTIALS.PY contains:")
            print(f"   Email: {DEV_CREDENTIALS['email']}")
            print(f"   Tenant ID: {DEV_CREDENTIALS['tenant_id']}")
            print(f"   Is Owner: {DEV_CREDENTIALS['is_owner']}")
            print(f"   Dev OTP: {DEV_CREDENTIALS['dev_otp']}")
            
            # Check if this tenant exists in database
            tenants_collection = self.db.tenants
            dev_tenant = tenants_collection.find_one({"_id": DEV_CREDENTIALS['tenant_id']})
            
            if dev_tenant:
                print(f"✅ Dev tenant '{dev_tenant.get('name', 'unknown')}' EXISTS in database")
            else:
                print(f"❌ Dev tenant ID '{DEV_CREDENTIALS['tenant_id']}' NOT FOUND in database")
            
            # Check if this user exists in database
            users_collection = self.db.users
            dev_user = users_collection.find_one({
                "email": DEV_CREDENTIALS['email'],
                "tenant_id": DEV_CREDENTIALS['tenant_id']
            })
            
            if dev_user:
                print(f"✅ Dev user '{DEV_CREDENTIALS['email']}' EXISTS in database")
            else:
                print(f"❌ Dev user '{DEV_CREDENTIALS['email']}' NOT FOUND in database")
                
        except Exception as e:
            print(f"❌ Error loading dev_credentials.py: {e}")
    
    def test_tenant_resolution_api(self, tenant_names):
        """Test tenant name resolution API with various tenant names"""
        print("\n🔗 TESTING TENANT NAME RESOLUTION API")
        print("=" * 50)
        
        test_names = tenant_names + ["MainTenant", "test-org", "Jupiter Security", "jupiter-main-001"]
        
        for tenant_name in test_names:
            try:
                url = f"{self.base_url}/auth/tenant/{tenant_name}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ '{tenant_name}' → Tenant ID: {data.get('tenant_id', 'unknown')}")
                else:
                    print(f"❌ '{tenant_name}' → {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ '{tenant_name}' → Error: {e}")
    
    def test_authentication_with_found_credentials(self, users, tenants):
        """Test authentication with actual credentials found in database"""
        print("\n🔐 TESTING AUTHENTICATION WITH FOUND CREDENTIALS")
        print("=" * 50)
        
        if not users or not tenants:
            print("⚠️  No users or tenants found - cannot test authentication")
            return
        
        # Try authentication with each user
        for user in users:
            email = user.get('email')
            tenant_id = user.get('tenant_id')
            
            print(f"\n🧪 Testing authentication for: {email}")
            print(f"   Using tenant ID: {tenant_id}")
            
            # Step 1: Request OTP
            try:
                otp_data = {
                    "email": email,
                    "tenant_id": tenant_id
                }
                
                response = requests.post(f"{self.base_url}/auth/request-otp", json=otp_data, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ OTP request successful")
                    
                    # In development mode, we should get the OTP
                    if "dev_otp" in data:
                        otp = data["dev_otp"]
                        print(f"   🔑 Development OTP: {otp}")
                        
                        # Step 2: Try login with OTP
                        login_data = {
                            "email": email,
                            "otp": otp,
                            "tenant_id": tenant_id
                        }
                        
                        login_response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=10)
                        
                        if login_response.status_code == 200:
                            login_result = login_response.json()
                            print(f"   ✅ LOGIN SUCCESSFUL!")
                            print(f"   🎫 Token received: {login_result.get('token', 'unknown')[:20]}...")
                            
                            # This is a working credential set!
                            print(f"\n🎯 WORKING CREDENTIALS FOUND:")
                            print(f"   Email: {email}")
                            print(f"   Tenant ID: {tenant_id}")
                            print(f"   OTP: {otp} (development mode)")
                            
                            return {
                                "email": email,
                                "tenant_id": tenant_id,
                                "otp": otp,
                                "token": login_result.get('token')
                            }
                        else:
                            print(f"   ❌ Login failed: {login_response.status_code} - {login_response.text}")
                    else:
                        print(f"   ⚠️  No dev_otp in response (production mode?)")
                else:
                    print(f"   ❌ OTP request failed: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"   ❌ Authentication test error: {e}")
        
        return None
    
    def create_missing_tenant_and_user(self):
        """Create missing tenant and user if needed"""
        print("\n🛠️  CREATING MISSING TENANT AND USER")
        print("=" * 50)
        
        try:
            # Create MainTenant if it doesn't exist
            tenants_collection = self.db.tenants
            main_tenant = tenants_collection.find_one({"name": "MainTenant"})
            
            if not main_tenant:
                print("📝 Creating MainTenant...")
                import uuid
                tenant_id = str(uuid.uuid4())
                
                tenant_doc = {
                    "_id": tenant_id,
                    "name": "MainTenant",
                    "created_at": datetime.utcnow(),
                    "enabled": True
                }
                
                tenants_collection.insert_one(tenant_doc)
                print(f"✅ Created MainTenant with ID: {tenant_id}")
            else:
                tenant_id = main_tenant["_id"]
                print(f"✅ MainTenant already exists with ID: {tenant_id}")
            
            # Create admin user if it doesn't exist
            users_collection = self.db.users
            admin_user = users_collection.find_one({
                "email": "admin@projectjupiter.in",
                "tenant_id": tenant_id
            })
            
            if not admin_user:
                print("📝 Creating admin@projectjupiter.in user...")
                import uuid
                user_id = str(uuid.uuid4())
                
                user_doc = {
                    "_id": user_id,
                    "email": "admin@projectjupiter.in",
                    "tenant_id": tenant_id,
                    "is_owner": True,
                    "created_at": datetime.utcnow(),
                    "last_login": None,
                    "otp": None,
                    "otp_expires": None
                }
                
                users_collection.insert_one(user_doc)
                print(f"✅ Created admin user with ID: {user_id}")
                
                return {
                    "email": "admin@projectjupiter.in",
                    "tenant_id": tenant_id,
                    "tenant_name": "MainTenant"
                }
            else:
                print(f"✅ Admin user already exists")
                return {
                    "email": "admin@projectjupiter.in",
                    "tenant_id": tenant_id,
                    "tenant_name": "MainTenant"
                }
                
        except Exception as e:
            print(f"❌ Error creating tenant/user: {e}")
            return None
    
    def run_investigation(self):
        """Run complete investigation"""
        print("🔍 JUPITER SIEM - TENANT & CREDENTIALS INVESTIGATION")
        print("=" * 60)
        print("🎯 Goal: Find correct admin login credentials and resolve 'Tenant not found' error")
        print()
        
        # Step 1: Connect to database
        if not self.connect_to_database():
            print("❌ Cannot proceed without database connection")
            return
        
        # Step 2: Investigate tenants
        tenants = self.investigate_tenants()
        tenant_names = [t.get('name', '') for t in tenants if t.get('name')]
        
        # Step 3: Investigate users
        users = self.investigate_users()
        
        # Step 4: Compare with dev_credentials.py
        self.compare_dev_credentials_vs_database()
        
        # Step 5: Test tenant resolution API
        self.test_tenant_resolution_api(tenant_names)
        
        # Step 6: Test authentication with found credentials
        working_creds = self.test_authentication_with_found_credentials(users, tenants)
        
        # Step 7: Create missing tenant/user if needed
        if not working_creds:
            print("\n⚠️  No working credentials found - attempting to create them...")
            created_creds = self.create_missing_tenant_and_user()
            
            if created_creds:
                print(f"\n🎯 CREATED CREDENTIALS - TRY THESE:")
                print(f"   Email: {created_creds['email']}")
                print(f"   Tenant Name: {created_creds['tenant_name']}")
                print(f"   Tenant ID: {created_creds['tenant_id']}")
                print(f"   OTP: 123456 (development mode)")
        
        # Step 8: Final summary
        print("\n" + "=" * 60)
        print("📋 INVESTIGATION SUMMARY")
        print("=" * 60)
        
        if working_creds:
            print("✅ WORKING CREDENTIALS FOUND:")
            print(f"   Email: {working_creds['email']}")
            print(f"   Tenant ID: {working_creds['tenant_id']}")
            print(f"   OTP: {working_creds['otp']}")
        else:
            print("❌ NO WORKING CREDENTIALS FOUND")
            print("   Recommendations:")
            print("   1. Check if backend server is running")
            print("   2. Verify MongoDB connection")
            print("   3. Run user registration to create new tenant/user")
            print("   4. Check backend logs for errors")
        
        print(f"\n📊 Database Status:")
        print(f"   Tenants: {len(tenants)}")
        print(f"   Users: {len(users)}")
        
        if tenants:
            print(f"\n🏢 Available Tenants:")
            for tenant in tenants:
                print(f"   - '{tenant.get('name', 'unknown')}' (ID: {tenant.get('_id', 'unknown')})")
        
        if users:
            print(f"\n👥 Available Users:")
            for user in users:
                print(f"   - {user.get('email', 'unknown')} (Tenant: {user.get('tenant_id', 'unknown')})")

if __name__ == "__main__":
    investigator = TenantCredentialsInvestigator()
    investigator.run_investigation()