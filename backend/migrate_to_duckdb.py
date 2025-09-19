#!/usr/bin/env python3
"""
Migration script to convert MongoDB operations to DuckDB operations
This script updates all database operations in the codebase
"""

import os
import re
from pathlib import Path

def update_file_mongodb_to_duckdb(file_path: str):
    """Update a single file to use DuckDB instead of MongoDB"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace imports
    content = re.sub(
        r'from pymongo import MongoClient',
        'from database import get_db_manager',
        content
    )
    
    content = re.sub(
        r'import pymongo',
        'from database import get_db_manager',
        content
    )
    
    # Replace MongoDB connection patterns
    content = re.sub(
        r'MONGO_URL = os\.getenv\("MONGO_URL".*?\)',
        'DUCKDB_PATH = os.getenv("DUCKDB_PATH", "data/jupiter_siem.db")',
        content
    )
    
    content = re.sub(
        r'self\.mongo_url = os\.getenv\("MONGO_URL".*?\)',
        'self.db_path = os.getenv("DUCKDB_PATH", "data/jupiter_siem.db")',
        content
    )
    
    # Replace client initialization
    content = re.sub(
        r'client = MongoClient\([^)]+\)',
        'db_manager = get_db_manager()',
        content
    )
    
    content = re.sub(
        r'self\.client = MongoClient\([^)]+\)',
        'self.db_manager = get_db_manager()',
        content
    )
    
    # Replace database access
    content = re.sub(
        r'db = client\.jupiter_siem',
        '# Database accessed via db_manager',
        content
    )
    
    content = re.sub(
        r'self\.db = self\.client\.jupiter_siem',
        '# Database accessed via self.db_manager',
        content
    )
    
    # Replace collection access patterns
    collection_patterns = [
        'users_collection', 'tenants_collection', 'alerts_collection',
        'iocs_collection', 'automations_collection', 'api_keys_collection',
        'logs_collection', 'cases_collection', 'sessions_collection',
        'roles_collection', 'tokens_collection', 'ai_chats_collection',
        'ai_configs_collection', 'vector_documents_collection'
    ]
    
    for collection in collection_patterns:
        # Replace collection variable assignments
        content = re.sub(
            rf'{collection} = db\.{collection.replace("_collection", "")}',
            f'# {collection} accessed via db_manager',
            content
        )
        
        # Replace self.collection patterns
        collection_name = collection.replace('_collection', '')
        content = re.sub(
            rf'self\.{collection_name} = self\.db\.{collection_name}',
            f'# {collection_name} accessed via self.db_manager',
            content
        )
    
    # Replace MongoDB operations with DuckDB operations
    # find_one operations
    content = re.sub(
        r'(\w+)\.find_one\(([^)]+)\)',
        r'db_manager.find_one("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.find_one\(([^)]+)\)',
        r'self.db_manager.find_one("\1", \2)',
        content
    )
    
    # find operations
    content = re.sub(
        r'(\w+)\.find\(([^)]+)\)',
        r'db_manager.find("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.find\(([^)]+)\)',
        r'self.db_manager.find("\1", \2)',
        content
    )
    
    # insert_one operations
    content = re.sub(
        r'(\w+)\.insert_one\(([^)]+)\)',
        r'db_manager.insert_one("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.insert_one\(([^)]+)\)',
        r'self.db_manager.insert_one("\1", \2)',
        content
    )
    
    # update_one operations
    content = re.sub(
        r'(\w+)\.update_one\(([^)]+)\)',
        r'db_manager.update_one("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.update_one\(([^)]+)\)',
        r'self.db_manager.update_one("\1", \2)',
        content
    )
    
    # delete_one operations
    content = re.sub(
        r'(\w+)\.delete_one\(([^)]+)\)',
        r'db_manager.delete_one("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.delete_one\(([^)]+)\)',
        r'self.db_manager.delete_one("\1", \2)',
        content
    )
    
    # count operations
    content = re.sub(
        r'(\w+)\.count_documents\(([^)]+)\)',
        r'db_manager.count("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.count_documents\(([^)]+)\)',
        r'self.db_manager.count("\1", \2)',
        content
    )
    
    # create_index operations
    content = re.sub(
        r'(\w+)\.create_index\(([^)]+)\)',
        r'db_manager.create_index("\1", \2)',
        content
    )
    
    content = re.sub(
        r'self\.(\w+)\.create_index\(([^)]+)\)',
        r'self.db_manager.create_index("\1", \2)',
        content
    )
    
    # Replace _id with id in document operations
    content = re.sub(r'"_id":', '"id":', content)
    content = re.sub(r'"id":\s*ObjectId\([^)]+\)', '"id": str(uuid.uuid4())', content)
    content = re.sub(r'ObjectId\([^)]+\)', 'str(uuid.uuid4())', content)
    
    # Add uuid import if needed
    if 'uuid.uuid4()' in content and 'import uuid' not in content:
        content = re.sub(
            r'(from typing import[^\n]*)',
            r'\1\nimport uuid',
            content
        )
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")
        return True
    else:
        print(f"No changes needed: {file_path}")
        return False

def migrate_backend_files():
    """Migrate all backend files from MongoDB to DuckDB"""
    
    backend_dir = Path("backend")
    files_to_update = [
        "main.py",
        "server.py", 
        "models/user_management.py",
        "ai_services.py",
        "ai_models.py",
        "analyst_features_routes.py",
        "security_ops_routes.py",
        "extended_framework_routes.py"
    ]
    
    updated_files = []
    
    for file_path in files_to_update:
        full_path = backend_dir / file_path
        if full_path.exists():
            if update_file_mongodb_to_duckdb(str(full_path)):
                updated_files.append(file_path)
    
    return updated_files

if __name__ == "__main__":
    print("Starting MongoDB to DuckDB migration...")
    updated_files = migrate_backend_files()
    
    print(f"\nMigration completed!")
    print(f"Updated {len(updated_files)} files:")
    for file in updated_files:
        print(f"  - {file}")
    
    print("\nNext steps:")
    print("1. Update requirements.txt to include duckdb")
    print("2. Update environment configuration")
    print("3. Test the migration")
    print("4. Update Docker configuration")
