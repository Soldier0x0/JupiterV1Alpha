#!/usr/bin/env python3

import requests
import json

# Test admin login flow
BASE_URL = "http://localhost:8001"

def test_admin_login():
    print("🧪 Testing Admin Login Flow...")
    print("=" * 50)
    
    # Step 1: Request OTP
    print("📨 Step 1: Requesting OTP...")
    otp_response = requests.post(f"{BASE_URL}/api/auth/request-otp", 
                                json={
                                    "email": "admin@jupiter.com",
                                    "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786"
                                })
    
    if otp_response.status_code == 200:
        otp_data = otp_response.json()
        print(f"✅ OTP Request Success: {otp_data['message']}")
        print(f"🔑 Development OTP: {otp_data['dev_otp']}")
        
        # Step 2: Login with OTP
        print("\n🔐 Step 2: Logging in with OTP...")
        login_response = requests.post(f"{BASE_URL}/api/auth/login",
                                     json={
                                         "email": "admin@jupiter.com", 
                                         "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786",
                                         "otp": otp_data['dev_otp']
                                     })
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print(f"✅ Login Success!")
            print(f"👤 User: {login_data['user']['email']}")
            print(f"🏢 Tenant ID: {login_data['user']['tenant_id']}")
            print(f"👑 Is Owner: {login_data['user']['is_owner']}")
            print(f"🔐 2FA Enabled: {login_data['user']['twofa_enabled']}")
            
            # Step 3: Test dashboard access
            print("\n📊 Step 3: Testing dashboard access...")
            headers = {"Authorization": f"Bearer {login_data['token']}"}
            dashboard_response = requests.get(f"{BASE_URL}/api/dashboard/overview", 
                                            headers=headers)
            
            if dashboard_response.status_code == 200:
                dashboard_data = dashboard_response.json()
                print(f"✅ Dashboard Access Success!")
                print(f"📊 Total Alerts: {dashboard_data.get('total_alerts', 0)}")
                print(f"🔴 Critical Alerts: {dashboard_data.get('critical_alerts', 0)}")
                print(f"📝 Total Logs: {dashboard_data.get('total_logs', 0)}")
                return True
            else:
                print(f"❌ Dashboard Access Failed: {dashboard_response.status_code}")
                print(f"Error: {dashboard_response.text}")
        else:
            print(f"❌ Login Failed: {login_response.status_code}")
            print(f"Error: {login_response.text}")
    else:
        print(f"❌ OTP Request Failed: {otp_response.status_code}")
        print(f"Error: {otp_response.text}")
    
    return False

if __name__ == "__main__":
    test_admin_login()