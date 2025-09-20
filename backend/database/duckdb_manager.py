#!/usr/bin/env python3
"""
DuckDB Database Manager for Jupiter SIEM
Provides a unified interface for all database operations
"""

import duckdb
import json
import logging
import os
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

class DuckDBManager:
    """
    Unified database manager for Jupiter SIEM using DuckDB
    Provides MongoDB-like interface with SQL backend
    """
    
    def __init__(self, db_path: str = "data/jupiter_siem.db"):
        """Initialize DuckDB connection and create tables"""
        self.db_path = db_path
        self.conn = None
        self._ensure_data_directory()
        self._connect()
        self._create_tables()
        self._create_indexes()
    
    def _ensure_data_directory(self):
        """Ensure data directory exists"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    
    def _connect(self):
        """Connect to DuckDB database"""
        try:
            self.conn = duckdb.connect(self.db_path)
            logger.info(f"Connected to DuckDB: {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to connect to DuckDB: {e}")
            raise
    
    def _create_tables(self):
        """Create all required tables"""
        tables = {
            'users': '''
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR PRIMARY KEY,
                    email VARCHAR UNIQUE NOT NULL,
                    password_hash VARCHAR,
                    tenant_id VARCHAR NOT NULL,
                    role VARCHAR DEFAULT 'analyst',
                    is_active BOOLEAN DEFAULT true,
                    is_owner BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    two_fa_secret VARCHAR,
                    two_fa_enabled BOOLEAN DEFAULT false,
                    metadata JSON
                )
            ''',
            'tenants': '''
                CREATE TABLE IF NOT EXISTS tenants (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR UNIQUE NOT NULL,
                    description TEXT,
                    settings JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    owner_id VARCHAR,
                    metadata JSON
                )
            ''',
            'alerts': '''
                CREATE TABLE IF NOT EXISTS alerts (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    severity VARCHAR NOT NULL,
                    status VARCHAR DEFAULT 'open',
                    source VARCHAR,
                    category VARCHAR,
                    tags JSON,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP,
                    assigned_to VARCHAR,
                    created_by VARCHAR
                )
            ''',
            'logs': '''
                CREATE TABLE IF NOT EXISTS logs (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    timestamp TIMESTAMP NOT NULL,
                    source VARCHAR NOT NULL,
                    event_type VARCHAR NOT NULL,
                    severity VARCHAR,
                    message TEXT,
                    raw_data JSON,
                    parsed_data JSON,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'cases': '''
                CREATE TABLE IF NOT EXISTS cases (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    status VARCHAR DEFAULT 'open',
                    priority VARCHAR DEFAULT 'medium',
                    assigned_to VARCHAR,
                    created_by VARCHAR,
                    tags JSON,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    closed_at TIMESTAMP
                )
            ''',
            'iocs': '''
                CREATE TABLE IF NOT EXISTS iocs (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    type VARCHAR NOT NULL,
                    value VARCHAR NOT NULL,
                    confidence DECIMAL(3,2) DEFAULT 0.5,
                    source VARCHAR,
                    description TEXT,
                    tags JSON,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_seen TIMESTAMP
                )
            ''',
            'automations': '''
                CREATE TABLE IF NOT EXISTS automations (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    description TEXT,
                    trigger_conditions JSON,
                    actions JSON,
                    is_active BOOLEAN DEFAULT true,
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_executed TIMESTAMP
                )
            ''',
            'api_keys': '''
                CREATE TABLE IF NOT EXISTS api_keys (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    key_hash VARCHAR NOT NULL,
                    permissions JSON,
                    is_active BOOLEAN DEFAULT true,
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    last_used TIMESTAMP
                )
            ''',
            'sessions': '''
                CREATE TABLE IF NOT EXISTS sessions (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL,
                    tenant_id VARCHAR NOT NULL,
                    token_hash VARCHAR NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address VARCHAR,
                    user_agent TEXT,
                    is_active BOOLEAN DEFAULT true
                )
            ''',
            'roles': '''
                CREATE TABLE IF NOT EXISTS roles (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    permissions JSON NOT NULL,
                    description TEXT,
                    is_system BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'tokens': '''
                CREATE TABLE IF NOT EXISTS tokens (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL,
                    tenant_id VARCHAR NOT NULL,
                    token_type VARCHAR NOT NULL,
                    token_value VARCHAR NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_used BOOLEAN DEFAULT false
                )
            ''',
            'ai_chats': '''
                CREATE TABLE IF NOT EXISTS ai_chats (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR NOT NULL,
                    session_id VARCHAR,
                    message TEXT NOT NULL,
                    response TEXT,
                    model VARCHAR,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'ai_configs': '''
                CREATE TABLE IF NOT EXISTS ai_configs (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    config_name VARCHAR NOT NULL,
                    config_data JSON NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'vector_documents': '''
                CREATE TABLE IF NOT EXISTS vector_documents (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    document_type VARCHAR NOT NULL,
                    content TEXT NOT NULL,
                    metadata JSON,
                    embedding_id VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'reports': '''
                CREATE TABLE IF NOT EXISTS reports (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    query_data JSON,
                    results JSON,
                    status VARCHAR DEFAULT 'draft',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'saved_reports': '''
                CREATE TABLE IF NOT EXISTS saved_reports (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR NOT NULL,
                    report_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    description TEXT,
                    is_public BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'flags': '''
                CREATE TABLE IF NOT EXISTS flags (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR NOT NULL,
                    entity_type VARCHAR NOT NULL,
                    entity_id VARCHAR NOT NULL,
                    flag_type VARCHAR NOT NULL,
                    reason TEXT,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'audit_logs': '''
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR,
                    action VARCHAR NOT NULL,
                    resource_type VARCHAR NOT NULL,
                    resource_id VARCHAR,
                    details JSON,
                    ip_address VARCHAR,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'points': '''
                CREATE TABLE IF NOT EXISTS points (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    user_id VARCHAR NOT NULL,
                    points INTEGER DEFAULT 0,
                    source VARCHAR,
                    reason TEXT,
                    metadata JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'noise_buckets': '''
                CREATE TABLE IF NOT EXISTS noise_buckets (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    bucket_name VARCHAR NOT NULL,
                    threshold INTEGER DEFAULT 10,
                    time_window INTEGER DEFAULT 3600,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'pivot_templates': '''
                CREATE TABLE IF NOT EXISTS pivot_templates (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    template_type VARCHAR NOT NULL,
                    query_template TEXT NOT NULL,
                    parameters JSON,
                    is_public BOOLEAN DEFAULT false,
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'webhooks': '''
                CREATE TABLE IF NOT EXISTS webhooks (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    name VARCHAR NOT NULL,
                    url VARCHAR NOT NULL,
                    events JSON,
                    headers JSON,
                    is_active BOOLEAN DEFAULT true,
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'incident_replays': '''
                CREATE TABLE IF NOT EXISTS incident_replays (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    incident_id VARCHAR NOT NULL,
                    replay_data JSON NOT NULL,
                    status VARCHAR DEFAULT 'pending',
                    created_by VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    executed_at TIMESTAMP
                )
            ''',
            'tenant_health': '''
                CREATE TABLE IF NOT EXISTS tenant_health (
                    id VARCHAR PRIMARY KEY,
                    tenant_id VARCHAR NOT NULL,
                    health_metrics JSON NOT NULL,
                    status VARCHAR NOT NULL,
                    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            '''
        }
        
        for table_name, create_sql in tables.items():
            try:
                self.conn.execute(create_sql)
                logger.info(f"Created table: {table_name}")
            except Exception as e:
                logger.error(f"Failed to create table {table_name}: {e}")
                raise
    
    def _create_indexes(self):
        """Create indexes for better performance"""
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            "CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_logs_tenant ON logs(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source)",
            "CREATE INDEX IF NOT EXISTS idx_cases_tenant ON cases(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_iocs_tenant ON iocs(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type)",
            "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)",
            "CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id)",
            "CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)"
        ]
        
        for index_sql in indexes:
            try:
                self.conn.execute(index_sql)
            except Exception as e:
                logger.warning(f"Failed to create index: {e}")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("DuckDB connection closed")
    
    # Collection-like interface methods
    def find_one(self, table: str, filter_dict: Dict = None) -> Optional[Dict]:
        """Find one document (MongoDB-like interface)"""
        try:
            if not filter_dict:
                sql = f"SELECT * FROM {table} LIMIT 1"
                result = self.conn.execute(sql).fetchone()
            else:
                where_clause = self._build_where_clause(filter_dict)
                sql = f"SELECT * FROM {table} WHERE {where_clause} LIMIT 1"
                result = self.conn.execute(sql, list(filter_dict.values())).fetchone()
            
            if result:
                columns = [desc[0] for desc in self.conn.description]
                return dict(zip(columns, result))
            return None
        except Exception as e:
            logger.error(f"Error in find_one for {table}: {e}")
            return None
    
    def find(self, table: str, filter_dict: Dict = None, limit: int = None, sort: Dict = None) -> List[Dict]:
        """Find multiple documents (MongoDB-like interface)"""
        try:
            sql = f"SELECT * FROM {table}"
            params = []
            
            if filter_dict:
                where_clause = self._build_where_clause(filter_dict)
                sql += f" WHERE {where_clause}"
                params.extend(list(filter_dict.values()))
            
            if sort:
                order_clause = self._build_order_clause(sort)
                sql += f" ORDER BY {order_clause}"
            
            if limit:
                sql += f" LIMIT {limit}"
            
            results = self.conn.execute(sql, params).fetchall()
            columns = [desc[0] for desc in self.conn.description]
            return [dict(zip(columns, row)) for row in results]
        except Exception as e:
            logger.error(f"Error in find for {table}: {e}")
            return []
    
    def insert_one(self, table: str, document: Dict) -> str:
        """Insert one document (MongoDB-like interface)"""
        try:
            # Generate ID if not provided
            if 'id' not in document:
                document['id'] = str(uuid.uuid4())
            
            # Add timestamps
            now = datetime.utcnow()
            if 'created_at' not in document:
                document['created_at'] = now
            if 'updated_at' not in document:
                document['updated_at'] = now
            
            # Convert JSON fields
            document = self._prepare_document(document)
            
            columns = list(document.keys())
            placeholders = ', '.join(['?' for _ in columns])
            values = list(document.values())
            
            sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"
            self.conn.execute(sql, values)
            self.conn.commit()
            
            logger.info(f"Inserted document into {table} with ID: {document['id']}")
            return document['id']
        except Exception as e:
            logger.error(f"Error inserting into {table}: {e}")
            raise
    
    def update_one(self, table: str, filter_dict: Dict, update_dict: Dict) -> bool:
        """Update one document (MongoDB-like interface)"""
        try:
            update_dict['updated_at'] = datetime.utcnow()
            update_dict = self._prepare_document(update_dict)
            
            set_clause = ', '.join([f"{k} = ?" for k in update_dict.keys()])
            where_clause = self._build_where_clause(filter_dict)
            
            sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
            params = list(update_dict.values()) + list(filter_dict.values())
            
            result = self.conn.execute(sql, params)
            self.conn.commit()
            
            return result.rowcount > 0
        except Exception as e:
            logger.error(f"Error updating {table}: {e}")
            return False
    
    def delete_one(self, table: str, filter_dict: Dict) -> bool:
        """Delete one document (MongoDB-like interface)"""
        try:
            where_clause = self._build_where_clause(filter_dict)
            sql = f"DELETE FROM {table} WHERE {where_clause}"
            
            result = self.conn.execute(sql, list(filter_dict.values()))
            self.conn.commit()
            
            return result.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting from {table}: {e}")
            return False
    
    def count(self, table: str, filter_dict: Dict = None) -> int:
        """Count documents (MongoDB-like interface)"""
        try:
            sql = f"SELECT COUNT(*) FROM {table}"
            params = []
            
            if filter_dict:
                where_clause = self._build_where_clause(filter_dict)
                sql += f" WHERE {where_clause}"
                params.extend(list(filter_dict.values()))
            
            result = self.conn.execute(sql, params).fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error counting {table}: {e}")
            return 0
    
    def create_index(self, table: str, index_spec: List[tuple], unique: bool = False):
        """Create index (MongoDB-like interface)"""
        try:
            index_name = f"idx_{table}_{'_'.join([col[0] for col in index_spec])}"
            columns = ', '.join([col[0] for col in index_spec])
            unique_clause = "UNIQUE " if unique else ""
            
            sql = f"CREATE {unique_clause}INDEX IF NOT EXISTS {index_name} ON {table}({columns})"
            self.conn.execute(sql)
            logger.info(f"Created index: {index_name}")
        except Exception as e:
            logger.error(f"Error creating index on {table}: {e}")
    
    def _build_where_clause(self, filter_dict: Dict) -> str:
        """Build WHERE clause from filter dictionary"""
        conditions = []
        for key, value in filter_dict.items():
            if isinstance(value, dict):
                # Handle operators like {'$gt': 10}
                for op, op_value in value.items():
                    if op == '$gt':
                        conditions.append(f"{key} > ?")
                    elif op == '$lt':
                        conditions.append(f"{key} < ?")
                    elif op == '$gte':
                        conditions.append(f"{key} >= ?")
                    elif op == '$lte':
                        conditions.append(f"{key} <= ?")
                    elif op == '$ne':
                        conditions.append(f"{key} != ?")
                    elif op == '$in':
                        placeholders = ', '.join(['?' for _ in op_value])
                        conditions.append(f"{key} IN ({placeholders})")
                    elif op == '$regex':
                        conditions.append(f"{key} LIKE ?")
                        # Convert regex to SQL LIKE pattern
                        filter_dict[key] = op_value.replace('.*', '%').replace('.+', '%')
            else:
                conditions.append(f"{key} = ?")
        
        return ' AND '.join(conditions)
    
    def _build_order_clause(self, sort_dict: Dict) -> str:
        """Build ORDER BY clause from sort dictionary"""
        orders = []
        for key, direction in sort_dict.items():
            direction = 'DESC' if direction == -1 else 'ASC'
            orders.append(f"{key} {direction}")
        return ', '.join(orders)
    
    def _prepare_document(self, document: Dict) -> Dict:
        """Prepare document for database insertion"""
        prepared = {}
        for key, value in document.items():
            if isinstance(value, (dict, list)):
                prepared[key] = json.dumps(value)
            else:
                prepared[key] = value
        return prepared
    
    def execute_query(self, sql: str, params: List = None) -> List[Dict]:
        """Execute raw SQL query"""
        try:
            if params:
                results = self.conn.execute(sql, params).fetchall()
            else:
                results = self.conn.execute(sql).fetchall()
            
            columns = [desc[0] for desc in self.conn.description]
            return [dict(zip(columns, row)) for row in results]
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            return []
    
    def export_table(self, table: str, format: str = 'csv', file_path: str = None) -> str:
        """Export table to file"""
        try:
            if not file_path:
                file_path = f"exports/{table}.{format}"
            
            Path(file_path).parent.mkdir(parents=True, exist_ok=True)
            
            if format.lower() == 'csv':
                sql = f"COPY {table} TO '{file_path}' (HEADER, DELIMITER ',')"
            elif format.lower() == 'json':
                sql = f"COPY {table} TO '{file_path}' (FORMAT JSON)"
            elif format.lower() == 'parquet':
                sql = f"COPY {table} TO '{file_path}' (FORMAT PARQUET)"
            else:
                raise ValueError(f"Unsupported format: {format}")
            
            self.conn.execute(sql)
            logger.info(f"Exported {table} to {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error exporting {table}: {e}")
            raise
    
    def import_table(self, table: str, file_path: str, format: str = 'csv') -> int:
        """Import table from file"""
        try:
            if format.lower() == 'csv':
                sql = f"COPY {table} FROM '{file_path}' (HEADER, DELIMITER ',')"
            elif format.lower() == 'json':
                sql = f"COPY {table} FROM '{file_path}' (FORMAT JSON)"
            elif format.lower() == 'parquet':
                sql = f"COPY {table} FROM '{file_path}' (FORMAT PARQUET)"
            else:
                raise ValueError(f"Unsupported format: {format}")
            
            result = self.conn.execute(sql)
            self.conn.commit()
            logger.info(f"Imported data into {table} from {file_path}")
            return result.rowcount
        except Exception as e:
            logger.error(f"Error importing {table}: {e}")
            raise

# Global database instance
db_manager = None

def get_db_manager() -> DuckDBManager:
    """Get global database manager instance"""
    global db_manager
    if db_manager is None:
        db_path = os.getenv("DUCKDB_PATH", "data/jupiter_siem.db")
        db_manager = DuckDBManager(db_path)
    return db_manager

def close_db_manager():
    """Close global database manager"""
    global db_manager
    if db_manager:
        db_manager.close()
        db_manager = None
