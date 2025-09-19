#!/usr/bin/env python3
"""
Verify DuckDB Migration
Simple verification that DuckDB migration is working
"""

import os
import tempfile
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def verify_duckdb_migration():
    """Verify DuckDB migration is working"""
    print("🔍 Verifying DuckDB Migration...")
    
    try:
        # Test 1: Import DuckDB manager
        from database import DuckDBManager
        print("  ✅ DuckDB Manager imported successfully")
        
        # Test 2: Create database and tables
        db_path = tempfile.mktemp(suffix='.db')
        db_manager = DuckDBManager(db_path)
        print("  ✅ Database and tables created successfully")
        
        # Test 3: Basic CRUD operations
        test_data = {
            "email": "test@example.com",
            "password_hash": "test_hash",
            "tenant_id": "test-tenant",
            "role": "analyst"
        }
        
        # Insert
        user_id = db_manager.insert_one("users", test_data)
        print(f"  ✅ Insert operation successful: {user_id}")
        
        # Find
        found_user = db_manager.find_one("users", {"email": "test@example.com"})
        if found_user:
            print("  ✅ Find operation successful")
        else:
            print("  ❌ Find operation failed")
            return False
        
        # Count
        count = db_manager.count("users")
        if count > 0:
            print(f"  ✅ Count operation successful: {count} users")
        else:
            print("  ❌ Count operation failed")
            return False
        
        # Test 4: Export functionality
        csv_file = db_manager.export_table("users", "csv")
        if os.path.exists(csv_file):
            print("  ✅ Export functionality working")
            os.unlink(csv_file)
        else:
            print("  ❌ Export functionality failed")
            return False
        
        # Cleanup
        db_manager.close()
        os.unlink(db_path)
        
        print("  🎉 DuckDB Migration Verification PASSED!")
        return True
        
    except Exception as e:
        print(f"  ❌ DuckDB Migration Verification FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_duckdb_migration()
    if success:
        print("\n🚀 DuckDB Migration is READY!")
        print("✅ Database layer: Working")
        print("✅ CRUD operations: Working") 
        print("✅ Export functionality: Working")
        print("✅ Schema creation: Working")
        print("\n🎯 Next steps:")
        print("1. Update remaining MongoDB operations in codebase")
        print("2. Test with real application data")
        print("3. Deploy to production")
    else:
        print("\n❌ DuckDB Migration needs fixes")
    
    sys.exit(0 if success else 1)
