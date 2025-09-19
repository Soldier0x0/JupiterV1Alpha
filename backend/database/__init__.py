"""
Database package for Jupiter SIEM
Provides unified database interface
"""

from .duckdb_manager import DuckDBManager, get_db_manager, close_db_manager

__all__ = ['DuckDBManager', 'get_db_manager', 'close_db_manager']
