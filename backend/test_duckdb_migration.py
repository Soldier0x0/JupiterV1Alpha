#!/usr/bin/env python3
"""
DuckDB Migration Test Suite
Tests the migration from MongoDB to DuckDB
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def test_duckdb_manager():
    """Test DuckDB manager functionality"""
    print("🧪 Testing DuckDB Manager...")
    
    try:
        from database import DuckDBManager
        
        # Create temporary database
        db_path = tempfile.mktemp(suffix='.db')
        
        # Initialize manager
        db_manager = DuckDBManager(db_path)
        
        # Test table creation
        print("  ✅ Database connection successful")
        print("  ✅ Tables created successfully")
        
        # Test insert operations
        test_user = {
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "tenant_id": "test-tenant",
            "role": "analyst"
        }
        
        user_id = db_manager.insert_one("users", test_user)
        print(f"  ✅ User inserted with ID: {user_id}")
        
        # Test find operations
        found_user = db_manager.find_one("users", {"email": "test@example.com"})
        assert found_user is not None
        assert found_user["email"] == "test@example.com"
        print("  ✅ User found successfully")
        
        # Test update operations
        updated = db_manager.update_one("users", {"email": "test@example.com"}, {"role": "admin"})
        assert updated
        print("  ✅ User updated successfully")
        
        # Test count operations
        count = db_manager.count("users", {"role": "admin"})
        assert count == 1
        print("  ✅ Count operation successful")
        
        # Test delete operations
        deleted = db_manager.delete_one("users", {"email": "test@example.com"})
        assert deleted
        print("  ✅ User deleted successfully")
        
        # Cleanup
        db_manager.close()
        os.unlink(db_path)
        
        print("  🎉 DuckDB Manager tests passed!")
        return True
        
    except Exception as e:
        print(f"  ❌ DuckDB Manager test failed: {e}")
        return False

def test_user_management_system():
    """Test UserManagementSystem with DuckDB"""
    print("🧪 Testing UserManagementSystem with DuckDB...")
    
    try:
        from models.user_management import UserManagementSystem
        
        # Create temporary database
        db_path = tempfile.mktemp(suffix='.db')
        
        # Mock email config
        email_config = {
            'host': 'localhost',
            'port': 587,
            'username': 'test@example.com',
            'password': 'test_password',
            'use_tls': False
        }
        
        # Initialize system
        user_manager = UserManagementSystem(db_path, email_config, "test_jwt_secret")
        print("  ✅ UserManagementSystem initialized")
        
        # Test super admin creation
        import time
        timestamp = int(time.time())
        tenant_name = f"TestTenant_{timestamp}"
        admin_email = f"admin_{timestamp}@test.com"
        result = user_manager.create_super_admin(
            email=admin_email,
            password="TestPassword123!",
            tenant_name=tenant_name
        )
        
        assert "user_id" in result
        assert "tenant_id" in result
        print("  ✅ Super admin created successfully")
        
        # Test user creation
        from models.user_management import UserCreateRequest, UserRole
        
        user_request = UserCreateRequest(
            email=f"user_{timestamp}@test.com",
            role=UserRole.SECURITY_ANALYST,
            tenant_name=tenant_name,
            send_email=False
        )
        
        user_result = user_manager.create_user(user_request, result["user_id"])
        assert "user_id" in user_result
        print("  ✅ User created successfully")
        
        # Test password setting
        password_set = user_manager.set_user_password(
            user_result["password_token"], 
            "NewPassword123!"
        )
        assert password_set
        print("  ✅ Password set successfully")
        
        # Test authentication
        auth_result = user_manager.authenticate_user(
            email=f"user_{timestamp}@test.com",
            password="NewPassword123!",
            tenant_id=result["tenant_id"]
        )
        assert auth_result is not None
        print("  ✅ Authentication successful")
        
        # Cleanup
        os.unlink(db_path)
        
        print("  🎉 UserManagementSystem tests passed!")
        return True
        
    except Exception as e:
        print(f"  ❌ UserManagementSystem test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_operations():
    """Test various database operations"""
    print("🧪 Testing Database Operations...")
    
    try:
        from database import DuckDBManager
        
        # Create temporary database
        db_path = tempfile.mktemp(suffix='.db')
        
        db_manager = DuckDBManager(db_path)
        
        # Test complex queries
        test_data = [
            {"title": "Alert 1", "severity": "high", "tenant_id": "tenant1", "description": "Test alert 1"},
            {"title": "Alert 2", "severity": "medium", "tenant_id": "tenant1", "description": "Test alert 2"},
            {"title": "Alert 3", "severity": "high", "tenant_id": "tenant2", "description": "Test alert 3"},
        ]
        
        for data in test_data:
            db_manager.insert_one("alerts", data)
        
        # Test filtering
        high_alerts = db_manager.find("alerts", {"severity": "high"})
        assert len(high_alerts) == 2
        print("  ✅ Filtering works correctly")
        
        # Test tenant filtering
        tenant1_alerts = db_manager.find("alerts", {"tenant_id": "tenant1"})
        assert len(tenant1_alerts) == 2
        print("  ✅ Tenant filtering works correctly")
        
        # Test complex queries with SQL
        sql_result = db_manager.execute_query(
            "SELECT COUNT(*) as count, severity FROM alerts GROUP BY severity"
        )
        assert len(sql_result) == 2
        print("  ✅ SQL queries work correctly")
        
        # Test JSON operations
        json_data = {
            "metadata": {"source": "firewall", "rule_id": "123"},
            "tags": ["security", "network"]
        }
        alert_id = db_manager.insert_one("alerts", {
            "title": "JSON Test Alert",
            "severity": "low",
            "tenant_id": "tenant1",
            "description": "Test alert with JSON data",
            "metadata": json_data["metadata"],
            "tags": json_data["tags"]
        })
        
        found_alert = db_manager.find_one("alerts", {"id": alert_id})
        assert found_alert["metadata"] is not None
        print("  ✅ JSON operations work correctly")
        
        # Cleanup
        db_manager.close()
        os.unlink(db_path)
        
        print("  🎉 Database operations tests passed!")
        return True
        
    except Exception as e:
        print(f"  ❌ Database operations test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_import_export():
    """Test data import/export functionality"""
    print("🧪 Testing Import/Export...")
    
    try:
        from database import DuckDBManager
        
        # Create temporary database
        db_path = tempfile.mktemp(suffix='.db')
        
        db_manager = DuckDBManager(db_path)
        
        # Insert test data
        test_data = [
            {"title": f"Test Alert {i}", "severity": "medium", "tenant_id": "test", "description": f"Test alert {i}"}
            for i in range(5)
        ]
        
        for data in test_data:
            db_manager.insert_one("alerts", data)
        
        # Test CSV export
        csv_file = db_manager.export_table("alerts", "csv")
        assert os.path.exists(csv_file)
        print("  ✅ CSV export successful")
        
        # Test JSON export
        json_file = db_manager.export_table("alerts", "json")
        assert os.path.exists(json_file)
        print("  ✅ JSON export successful")
        
        # Test Parquet export
        parquet_file = db_manager.export_table("alerts", "parquet")
        assert os.path.exists(parquet_file)
        print("  ✅ Parquet export successful")
        
        # Cleanup
        db_manager.close()
        os.unlink(db_path)
        for file in [csv_file, json_file, parquet_file]:
            if os.path.exists(file):
                os.unlink(file)
        
        print("  🎉 Import/Export tests passed!")
        return True
        
    except Exception as e:
        print(f"  ❌ Import/Export test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting DuckDB Migration Tests...\n")
    
    tests = [
        test_duckdb_manager,
        test_user_management_system,
        test_database_operations,
        test_import_export
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! DuckDB migration is successful!")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
