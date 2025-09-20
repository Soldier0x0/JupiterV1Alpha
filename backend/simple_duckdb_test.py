#!/usr/bin/env python3
"""
Simple DuckDB Test
Tests basic DuckDB functionality
"""

import os
import tempfile
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def test_simple_duckdb():
    """Test basic DuckDB functionality"""
    print("🧪 Testing Simple DuckDB...")
    
    try:
        from database import DuckDBManager
        
        # Create temporary database
        db_path = tempfile.mktemp(suffix='.db')
        
        # Initialize manager
        db_manager = DuckDBManager(db_path)
        
        # Test basic operations
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
        
        print("  🎉 Simple DuckDB test passed!")
        return True
        
    except Exception as e:
        print(f"  ❌ Simple DuckDB test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_simple_duckdb()
    sys.exit(0 if success else 1)
