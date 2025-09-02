#!/usr/bin/env python3
"""
Check what tenant name was created for the dev credentials tenant ID
"""

from pymongo import MongoClient

def check_tenant_info():
    try:
        # Connect to MongoDB
        mongo_url = "mongodb://localhost:27017/jupiter_siem"
        client = MongoClient(mongo_url)
        db = client.jupiter_siem
        
        # Find the tenant by ID
        tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"
        tenant = db.tenants.find_one({"_id": tenant_id})
        
        if tenant:
            print(f"✅ Found tenant:")
            print(f"   ID: {tenant['_id']}")
            print(f"   Name: {tenant['name']}")
            print(f"   Created: {tenant.get('created_at', 'Unknown')}")
            print(f"   Enabled: {tenant.get('enabled', 'Unknown')}")
            
            # Test the tenant lookup API with the name
            tenant_name = tenant['name']
            print(f"\n🔍 Testing tenant lookup API with name: {tenant_name}")
            
            import requests
            url = f"http://localhost:8001/api/auth/tenant/{tenant_name}"
            response = requests.get(url, timeout=10)
            
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {data}")
                print(f"   ✅ Tenant lookup by name works!")
            else:
                print(f"   ❌ Tenant lookup by name failed: {response.text}")
        else:
            print(f"❌ Tenant not found with ID: {tenant_id}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_tenant_info()