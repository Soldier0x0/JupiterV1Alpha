#!/usr/bin/env python3
"""
Test all found credentials to provide complete working options
"""

import requests
import json

def test_credential_set(email, tenant_id, tenant_name):
    """Test a specific credential set"""
    base_url = "http://localhost:8001/api"
    
    print(f"\n🧪 Testing: {email} with tenant '{tenant_name}' (ID: {tenant_id})")
    
    try:
        # Step 1: Request OTP
        otp_data = {
            "email": email,
            "tenant_id": tenant_id
        }
        
        response = requests.post(f"{base_url}/auth/request-otp", json=otp_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ OTP request successful")
            
            if "dev_otp" in data:
                otp = data["dev_otp"]
                print(f"   🔑 Development OTP: {otp}")
                
                # Step 2: Try login with OTP
                login_data = {
                    "email": email,
                    "otp": otp,
                    "tenant_id": tenant_id
                }
                
                login_response = requests.post(f"{base_url}/auth/login", json=login_data, timeout=10)
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    print(f"   ✅ LOGIN SUCCESSFUL!")
                    print(f"   🎫 Token received")
                    
                    return {
                        "email": email,
                        "tenant_id": tenant_id,
                        "tenant_name": tenant_name,
                        "otp": otp,
                        "status": "SUCCESS"
                    }
                else:
                    print(f"   ❌ Login failed: {login_response.status_code}")
                    return {"status": "LOGIN_FAILED", "error": login_response.text}
            else:
                print(f"   ⚠️  No dev_otp in response")
                return {"status": "NO_DEV_OTP"}
        else:
            print(f"   ❌ OTP request failed: {response.status_code}")
            return {"status": "OTP_FAILED", "error": response.text}
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return {"status": "ERROR", "error": str(e)}

def main():
    print("🔐 TESTING ALL FOUND CREDENTIAL COMBINATIONS")
    print("=" * 60)
    
    # All credential combinations found in the database
    credentials = [
        ("admin@jupiter.com", "70d9c900-af02-4d81-9c6c-97ecf4ecf786", "AdminTenant"),
        ("admin@jupiter.com", "3dd59e40-40d3-4e7b-8d95-d51ab25fb838", "Jupiter Security"),
        ("admin@projectjupiter.in", "d3a8180f-b885-4437-aa65-47dc90655352", "test-org"),
        ("admin@projectjupiter.in", "3dd59e40-40d3-4e7b-8d95-d51ab25fb838", "Jupiter Security"),
        ("admin@projectjupiter.in", "jupiter-main-001", "MainTenant"),
    ]
    
    working_credentials = []
    
    for email, tenant_id, tenant_name in credentials:
        result = test_credential_set(email, tenant_id, tenant_name)
        if result.get("status") == "SUCCESS":
            working_credentials.append(result)
    
    print("\n" + "=" * 60)
    print("📋 FINAL RESULTS - WORKING CREDENTIALS")
    print("=" * 60)
    
    if working_credentials:
        print(f"✅ Found {len(working_credentials)} working credential set(s):")
        
        for i, creds in enumerate(working_credentials, 1):
            print(f"\n{i}. WORKING CREDENTIALS:")
            print(f"   📧 Email: {creds['email']}")
            print(f"   🏢 Tenant Name: {creds['tenant_name']}")
            print(f"   🆔 Tenant ID: {creds['tenant_id']}")
            print(f"   🔑 OTP: {creds['otp']} (development mode)")
            
            print(f"\n   📝 LOGIN INSTRUCTIONS:")
            print(f"   1. Go to login page")
            print(f"   2. Enter email: {creds['email']}")
            print(f"   3. Enter tenant: {creds['tenant_name']}")
            print(f"   4. Click 'Request OTP'")
            print(f"   5. Enter OTP: {creds['otp']}")
            print(f"   6. Click 'Login'")
    else:
        print("❌ NO WORKING CREDENTIALS FOUND")
        print("   All authentication attempts failed")
    
    print(f"\n🎯 RECOMMENDATION:")
    if working_credentials:
        best_cred = working_credentials[0]
        print(f"   Use: {best_cred['email']} with tenant '{best_cred['tenant_name']}'")
        print(f"   OTP: {best_cred['otp']}")
    else:
        print("   Check backend server status and database connectivity")

if __name__ == "__main__":
    main()