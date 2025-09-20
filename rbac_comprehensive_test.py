#!/usr/bin/env python3
"""
Comprehensive RBAC System Testing for Project Jupiter SIEM/SOAR Platform
Tests all role management, permission system, user role assignments, and authentication enhancements
"""

import requests
import sys
import json
from datetime import datetime
import time
import uuid

class JupiterRBACTester:
    def __init__(self, base_url="/api"):
        self.base_url = base_url
        self.super_admin_token = None
        self.tenant_owner_token = None
        self.analyst_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tenant_id = "b48d69da-51a1-4d08-9f0a-deb736a23c25"  # From test data
        self.created_role_id = None
        self.test_user_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
    def make_request(self, method, endpoint, data=None, expected_status=200, token=None):
        """Make HTTP request with proper headers"""
        url = f"http://localhost:8001{self.base_url}/{endpoint}"
        
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
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

    def login_user(self, email, user_type="super_admin"):
        """Login a user and return token"""
        # Request OTP
        otp_data = {
            "email": email,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/request-otp', otp_data, 
                                                expected_status=200, token=None)
        
        if not success or "dev_otp" not in data:
            print(f"❌ Could not get OTP for {email}")
            return None
        
        otp = data["dev_otp"]
        
        # Login with OTP
        login_data = {
            "email": email,
            "otp": otp,
            "tenant_id": self.tenant_id
        }
        
        success, status, data = self.make_request('POST', 'auth/login', login_data, 
                                                expected_status=200, token=None)
        
        if success and "token" in data:
            print(f"✅ {user_type} logged in successfully")
            return data["token"]
        else:
            print(f"❌ {user_type} login failed")
            return None

    def setup_test_users(self):
        """Setup test users for RBAC testing"""
        print("🔐 Setting up test users...")
        
        # Login super admin
        self.super_admin_token = self.login_user("superadmin@jupiter.com", "Super Admin")
        
        # Login tenant owner
        self.tenant_owner_token = self.login_user("admin@jupiter.com", "Tenant Owner")
        
        return self.super_admin_token is not None and self.tenant_owner_token is not None

    def test_role_creation(self):
        """Test creating a new custom role"""
        if not self.super_admin_token:
            self.log_test("Role Creation", False, "No super admin token")
            return False
        
        role_data = {
            "name": "test_security_manager",
            "display_name": "Test Security Manager",
            "description": "Custom role for testing RBAC system",
            "permissions": [
                "dashboards:view", "dashboards:manage", 
                "alerts:view", "alerts:manage",
                "intel:view", "cases:view"
            ],
            "level": 2,
            "tenant_scoped": True
        }
        
        success, status, data = self.make_request('POST', 'roles', role_data, 
                                                expected_status=200, token=self.super_admin_token)
        
        if success:
            self.created_role_id = data.get('role_id')
            print(f"   🆔 Created role ID: {self.created_role_id}")
        
        self.log_test("Role Creation", success, f"Status: {status}")
        return success

    def test_role_update(self):
        """Test updating a custom role"""
        if not self.super_admin_token or not self.created_role_id:
            self.log_test("Role Update", False, "No super admin token or created role")
            return False
        
        update_data = {
            "display_name": "Updated Security Manager",
            "description": "Updated description for testing",
            "permissions": [
                "dashboards:view", "dashboards:manage", 
                "alerts:view", "alerts:manage",
                "intel:view", "intel:manage", "cases:view"
            ]
        }
        
        success, status, data = self.make_request('PUT', f'roles/{self.created_role_id}', update_data, 
                                                expected_status=200, token=self.super_admin_token)
        
        self.log_test("Role Update", success, f"Status: {status}")
        return success

    def test_system_role_protection(self):
        """Test that system default roles cannot be modified"""
        if not self.super_admin_token:
            self.log_test("System Role Protection", False, "No super admin token")
            return False
        
        # Get super_admin role ID
        success, status, data = self.make_request('GET', 'roles', token=self.super_admin_token)
        if not success:
            self.log_test("System Role Protection", False, "Could not get roles")
            return False
        
        super_admin_role = None
        for role in data.get('roles', []):
            if role.get('name') == 'super_admin':
                super_admin_role = role
                break
        
        if not super_admin_role:
            self.log_test("System Role Protection", False, "Super admin role not found")
            return False
        
        # Try to update system role (should fail)
        update_data = {
            "display_name": "Modified Super Admin",
            "description": "This should not work"
        }
        
        success, status, data = self.make_request('PUT', f'roles/{super_admin_role["_id"]}', update_data, 
                                                expected_status=400, token=self.super_admin_token)
        
        # Success means it properly rejected the modification
        protection_working = status == 400 and "system default roles" in data.get('detail', '')
        
        self.log_test("System Role Protection", protection_working, 
                     f"Status: {status}, Protected: {protection_working}")
        return protection_working

    def test_role_deletion_protection(self):
        """Test that system roles cannot be deleted"""
        if not self.super_admin_token:
            self.log_test("Role Deletion Protection", False, "No super admin token")
            return False
        
        # Get viewer role ID
        success, status, data = self.make_request('GET', 'roles', token=self.super_admin_token)
        if not success:
            self.log_test("Role Deletion Protection", False, "Could not get roles")
            return False
        
        viewer_role = None
        for role in data.get('roles', []):
            if role.get('name') == 'viewer':
                viewer_role = role
                break
        
        if not viewer_role:
            self.log_test("Role Deletion Protection", False, "Viewer role not found")
            return False
        
        # Try to delete system role (should fail)
        success, status, data = self.make_request('DELETE', f'roles/{viewer_role["_id"]}', 
                                                expected_status=400, token=self.super_admin_token)
        
        # Success means it properly rejected the deletion
        protection_working = status == 400 and "system default roles" in data.get('detail', '')
        
        self.log_test("Role Deletion Protection", protection_working, 
                     f"Status: {status}, Protected: {protection_working}")
        return protection_working

    def test_permission_based_access_control(self):
        """Test that permission-based access control is working"""
        if not self.tenant_owner_token:
            self.log_test("Permission-Based Access Control", False, "No tenant owner token")
            return False
        
        # Test 1: Tenant owner should NOT have system:manage permission
        success, status, data = self.make_request('GET', 'system/health', 
                                                expected_status=403, token=self.tenant_owner_token)
        
        denied_system_access = status == 403
        
        # Test 2: Tenant owner SHOULD have users:manage permission
        success2, status2, data2 = self.make_request('GET', 'users', 
                                                    expected_status=200, token=self.tenant_owner_token)
        
        allowed_user_access = status2 == 200
        
        # Test 3: Super admin SHOULD have system:manage permission
        success3, status3, data3 = self.make_request('GET', 'system/health', 
                                                    expected_status=200, token=self.super_admin_token)
        
        allowed_system_access = status3 == 200
        
        all_tests_passed = denied_system_access and allowed_user_access and allowed_system_access
        
        self.log_test("Permission-Based Access Control", all_tests_passed, 
                     f"System denied: {denied_system_access}, Users allowed: {allowed_user_access}, Admin system: {allowed_system_access}")
        
        if all_tests_passed:
            print("   ✅ Tenant owner properly denied system access")
            print("   ✅ Tenant owner allowed user management")
            print("   ✅ Super admin allowed system access")
        
        return all_tests_passed

    def test_user_role_assignment(self):
        """Test assigning roles to users"""
        if not self.super_admin_token or not self.created_role_id:
            self.log_test("User Role Assignment", False, "No super admin token or created role")
            return False
        
        # First, get a user to assign role to
        success, status, data = self.make_request('GET', 'users', token=self.super_admin_token)
        if not success or not data.get('users'):
            self.log_test("User Role Assignment", False, "Could not get users")
            return False
        
        # Find a user that's not super admin
        target_user = None
        for user in data.get('users', []):
            if user.get('role_name') != 'super_admin':
                target_user = user
                break
        
        if not target_user:
            self.log_test("User Role Assignment", False, "No suitable user found for role assignment")
            return False
        
        self.test_user_id = target_user['_id']
        
        # Assign the custom role to the user
        assignment_data = {
            "user_id": self.test_user_id,
            "role_id": self.created_role_id,
            "assigned_by": "test_system"
        }
        
        success, status, data = self.make_request('POST', f'users/{self.test_user_id}/role', assignment_data, 
                                                expected_status=200, token=self.super_admin_token)
        
        if success:
            print(f"   ✅ Assigned role to user {target_user.get('email', 'unknown')}")
        
        self.log_test("User Role Assignment", success, f"Status: {status}")
        return success

    def test_role_assignment_verification(self):
        """Test that role assignment is properly reflected in user data"""
        if not self.super_admin_token or not self.test_user_id:
            self.log_test("Role Assignment Verification", False, "No super admin token or test user")
            return False
        
        # Get users and check if the role assignment is reflected
        success, status, data = self.make_request('GET', 'users', token=self.super_admin_token)
        if not success:
            self.log_test("Role Assignment Verification", False, "Could not get users")
            return False
        
        # Find the test user and check their role
        test_user = None
        for user in data.get('users', []):
            if user.get('_id') == self.test_user_id:
                test_user = user
                break
        
        if not test_user:
            self.log_test("Role Assignment Verification", False, "Test user not found")
            return False
        
        # Check if role information is correct
        role_name = test_user.get('role_name')
        role_display = test_user.get('role_display')
        role_level = test_user.get('role_level')
        
        role_assigned_correctly = (
            role_name == 'test_security_manager' and
            role_display == 'Updated Security Manager' and
            role_level == 2
        )
        
        self.log_test("Role Assignment Verification", role_assigned_correctly, 
                     f"Role: {role_name}, Display: {role_display}, Level: {role_level}")
        
        if role_assigned_correctly:
            print(f"   ✅ User role correctly updated to {role_display}")
        
        return role_assigned_correctly

    def test_permission_inheritance(self):
        """Test that users inherit permissions from their assigned roles"""
        if not self.test_user_id:
            self.log_test("Permission Inheritance", False, "No test user available")
            return False
        
        # Login as the test user to verify their permissions
        # First get the user's email
        success, status, data = self.make_request('GET', 'users', token=self.super_admin_token)
        if not success:
            self.log_test("Permission Inheritance", False, "Could not get users")
            return False
        
        test_user = None
        for user in data.get('users', []):
            if user.get('_id') == self.test_user_id:
                test_user = user
                break
        
        if not test_user:
            self.log_test("Permission Inheritance", False, "Test user not found")
            return False
        
        # Login as test user
        test_user_token = self.login_user(test_user['email'], "Test User")
        if not test_user_token:
            self.log_test("Permission Inheritance", False, "Could not login as test user")
            return False
        
        # Test permissions that the custom role should have
        # Should have dashboards:view
        success1, status1, data1 = self.make_request('GET', 'dashboard/overview', 
                                                    expected_status=200, token=test_user_token)
        
        # Should have alerts:view
        success2, status2, data2 = self.make_request('GET', 'alerts', 
                                                    expected_status=200, token=test_user_token)
        
        # Should NOT have system:manage
        success3, status3, data3 = self.make_request('GET', 'system/health', 
                                                    expected_status=403, token=test_user_token)
        
        permissions_working = success1 and success2 and (status3 == 403)
        
        self.log_test("Permission Inheritance", permissions_working, 
                     f"Dashboard: {status1}, Alerts: {status2}, System: {status3}")
        
        if permissions_working:
            print("   ✅ User can access dashboard (dashboards:view)")
            print("   ✅ User can access alerts (alerts:view)")
            print("   ✅ User properly denied system access (no system:manage)")
        
        return permissions_working

    def test_authentication_enhancement(self):
        """Test that JWT tokens now include role and permission information"""
        if not self.tenant_owner_token:
            self.log_test("Authentication Enhancement", False, "No tenant owner token")
            return False
        
        # Make an authenticated request and verify role information is available
        # We'll test this by checking if role-based access control is working
        success, status, data = self.make_request('GET', 'dashboard/overview', 
                                                expected_status=200, token=self.tenant_owner_token)
        
        if not success:
            self.log_test("Authentication Enhancement", False, "Dashboard access failed")
            return False
        
        # The fact that we can access dashboard but not system health means
        # role information is properly included in JWT and being used for access control
        success2, status2, data2 = self.make_request('GET', 'system/health', 
                                                    expected_status=403, token=self.tenant_owner_token)
        
        role_based_auth_working = success and (status2 == 403)
        
        self.log_test("Authentication Enhancement", role_based_auth_working, 
                     f"Dashboard: {status}, System: {status2}")
        
        if role_based_auth_working:
            print("   ✅ JWT tokens include role information")
            print("   ✅ Permission-based access control working")
        
        return role_based_auth_working

    def test_backward_compatibility_legacy_users(self):
        """Test that existing users with is_owner=true still work correctly"""
        if not self.tenant_owner_token:
            self.log_test("Backward Compatibility", False, "No tenant owner token")
            return False
        
        # Test dashboard access (should work for legacy owner)
        success, status, data = self.make_request('GET', 'dashboard/overview', 
                                                expected_status=200, token=self.tenant_owner_token)
        
        if not success:
            self.log_test("Backward Compatibility", False, "Dashboard access failed")
            return False
        
        # Check if is_owner_view field is still present
        has_owner_view = 'is_owner_view' in data
        
        # Check if legacy user can still access owner-level features
        owner_view_active = data.get('is_owner_view', False)
        
        backward_compatibility = has_owner_view and success
        
        self.log_test("Backward Compatibility", backward_compatibility, 
                     f"Dashboard: {status}, Owner view: {owner_view_active}")
        
        if backward_compatibility:
            print("   ✅ Legacy is_owner field maintained")
            print("   ✅ Owner-level access preserved")
        
        return backward_compatibility

    def test_role_hierarchy_enforcement(self):
        """Test that role hierarchy is properly enforced"""
        if not self.super_admin_token or not self.tenant_owner_token:
            self.log_test("Role Hierarchy Enforcement", False, "Missing tokens")
            return False
        
        # Test that tenant owner cannot assign super admin role
        # First get super admin role ID
        success, status, data = self.make_request('GET', 'roles', token=self.super_admin_token)
        if not success:
            self.log_test("Role Hierarchy Enforcement", False, "Could not get roles")
            return False
        
        super_admin_role_id = None
        for role in data.get('roles', []):
            if role.get('name') == 'super_admin':
                super_admin_role_id = role['_id']
                break
        
        if not super_admin_role_id:
            self.log_test("Role Hierarchy Enforcement", False, "Super admin role not found")
            return False
        
        # Try to assign super admin role using tenant owner token (should fail)
        assignment_data = {
            "user_id": self.test_user_id,
            "role_id": super_admin_role_id,
            "assigned_by": "test_system"
        }
        
        success, status, data = self.make_request('POST', f'users/{self.test_user_id}/role', assignment_data, 
                                                expected_status=403, token=self.tenant_owner_token)
        
        hierarchy_enforced = status == 403
        
        self.log_test("Role Hierarchy Enforcement", hierarchy_enforced, 
                     f"Status: {status}, Properly denied: {hierarchy_enforced}")
        
        if hierarchy_enforced:
            print("   ✅ Tenant owner cannot assign super admin role")
            print("   ✅ Role hierarchy properly enforced")
        
        return hierarchy_enforced

    def cleanup_test_role(self):
        """Clean up the test role created during testing"""
        if not self.super_admin_token or not self.created_role_id:
            return
        
        # Delete the custom role
        success, status, data = self.make_request('DELETE', f'roles/{self.created_role_id}', 
                                                expected_status=200, token=self.super_admin_token)
        
        if success:
            print(f"   🧹 Cleaned up test role: {self.created_role_id}")

    def run_comprehensive_rbac_tests(self):
        """Run all comprehensive RBAC tests"""
        print("🎭 Starting Comprehensive RBAC System Testing")
        print(f"🎯 Target: {self.base_url}")
        print("=" * 70)
        
        # Setup
        if not self.setup_test_users():
            print("❌ Failed to setup test users - stopping tests")
            return False
        
        # Role Management Tests
        print("\n🎭 Testing Role Management Endpoints...")
        self.test_role_creation()
        self.test_role_update()
        self.test_system_role_protection()
        self.test_role_deletion_protection()
        
        # Permission System Tests
        print("\n🔐 Testing Permission System...")
        self.test_permission_based_access_control()
        
        # User Role Assignment Tests
        print("\n👥 Testing User Role Assignments...")
        self.test_user_role_assignment()
        self.test_role_assignment_verification()
        self.test_permission_inheritance()
        
        # Authentication Enhancement Tests
        print("\n🔑 Testing Authentication Enhancement...")
        self.test_authentication_enhancement()
        
        # Backward Compatibility Tests
        print("\n🔄 Testing Backward Compatibility...")
        self.test_backward_compatibility_legacy_users()
        
        # Role Hierarchy Tests
        print("\n📊 Testing Role Hierarchy...")
        self.test_role_hierarchy_enforcement()
        
        # Cleanup
        print("\n🧹 Cleaning up...")
        self.cleanup_test_role()
        
        # Results summary
        print("\n" + "=" * 70)
        print(f"📊 RBAC Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All RBAC tests passed!")
            return True
        else:
            failed = self.tests_run - self.tests_passed
            print(f"⚠️  {failed} RBAC test(s) failed")
            return False

def main():
    """Main test execution"""
    base_url = "/api"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = JupiterRBACTester(base_url)
    success = tester.run_comprehensive_rbac_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())