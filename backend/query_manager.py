#!/usr/bin/env python3
"""
Jupiter SIEM Query Manager
Central orchestrator for query execution across different providers
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum

from query_ast_schema import JupiterQueryAST, EXAMPLE_ASTS
from query_providers import QUERY_PROVIDERS, MockQueryProvider
from clickhouse_provider import ClickHouseQueryProvider

logger = logging.getLogger(__name__)

class QueryBackend(str, Enum):
    """Available query backends"""
    MOCK = "mock"
    CLICKHOUSE = "clickhouse"
    AUTO = "auto"

class QueryManager:
    """
    Central query manager that routes queries to appropriate providers
    Handles provider selection, caching, and result aggregation
    """
    
    def __init__(self):
        self.providers = {}
        self.default_backend = QueryBackend.MOCK
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available query providers"""
        try:
            # Always initialize mock provider
            self.providers[QueryBackend.MOCK] = MockQueryProvider()
            logger.info("Mock provider initialized")
            
            # Initialize ClickHouse if configured
            clickhouse_url = os.getenv("CLICKHOUSE_URL")
            if clickhouse_url:
                clickhouse_params = {
                    "url": clickhouse_url,
                    "database": os.getenv("CLICKHOUSE_DB", "jupiter_siem"),
                    "username": os.getenv("CLICKHOUSE_USER", "default"),
                    "password": os.getenv("CLICKHOUSE_PASSWORD", "")
                }
                self.providers[QueryBackend.CLICKHOUSE] = ClickHouseQueryProvider(clickhouse_params)
                self.default_backend = QueryBackend.CLICKHOUSE
                logger.info("ClickHouse provider initialized")
            else:
                logger.info("ClickHouse not configured, using mock provider")
                
        except Exception as e:
            logger.error(f"Failed to initialize query providers: {e}")
    
    def execute_query(self, ast: JupiterQueryAST, backend: Optional[QueryBackend] = None, 
                     user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a query AST using the specified or default backend
        """
        try:
            # Determine backend to use
            selected_backend = backend or self._select_backend(user_id)
            
            # Get provider
            provider = self.providers.get(selected_backend)
            if not provider:
                raise ValueError(f"Provider {selected_backend} not available")
            
            # Add metadata to AST
            if not ast.query_id:
                ast.query_id = f"query_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
            
            # Execute query
            start_time = datetime.now()
            result = provider.execute_ast(ast)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Add execution metadata
            result["query_id"] = ast.query_id
            result["backend"] = selected_backend.value
            result["execution_time"] = execution_time
            result["timestamp"] = datetime.now().isoformat()
            
            # Log query execution
            self._log_query_execution(ast, result, user_id, selected_backend)
            
            return result
            
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "backend": selected_backend.value if 'selected_backend' in locals() else "unknown",
                "timestamp": datetime.now().isoformat()
            }
    
    def validate_query(self, ast: JupiterQueryAST, backend: Optional[QueryBackend] = None) -> Dict[str, Any]:
        """Validate a query AST"""
        try:
            selected_backend = backend or self.default_backend
            provider = self.providers.get(selected_backend)
            
            if not provider:
                return {
                    "valid": False,
                    "errors": [f"Provider {selected_backend} not available"],
                    "warnings": []
                }
            
            return provider.validate_ast(ast)
            
        except Exception as e:
            return {
                "valid": False,
                "errors": [str(e)],
                "warnings": []
            }
    
    def get_available_backends(self, user_id: Optional[str] = None) -> List[str]:
        """Get list of available backends for a user"""
        available = list(self.providers.keys())
        
        # Filter based on user permissions
        # TODO: Implement user-based backend filtering
        
        return [backend.value for backend in available]
    
    def get_backend_info(self, backend: QueryBackend) -> Dict[str, Any]:
        """Get information about a specific backend"""
        provider = self.providers.get(backend)
        if not provider:
            return {"available": False}
        
        return {
            "available": True,
            "provider_type": provider.provider_type,
            "description": self._get_backend_description(backend)
        }
    
    def _select_backend(self, user_id: Optional[str] = None) -> QueryBackend:
        """Select appropriate backend based on configuration and user"""
        # Check environment configuration
        configured_backend = os.getenv("JUPITER_QUERY_BACKEND", "auto").lower()
        
        if configured_backend == "mock":
            return QueryBackend.MOCK
        elif configured_backend == "clickhouse" and QueryBackend.CLICKHOUSE in self.providers:
            return QueryBackend.CLICKHOUSE
        elif configured_backend == "auto":
            # Auto-select best available backend
            if QueryBackend.CLICKHOUSE in self.providers:
                return QueryBackend.CLICKHOUSE
            else:
                return QueryBackend.MOCK
        else:
            return self.default_backend
    
    def _get_backend_description(self, backend: QueryBackend) -> str:
        """Get human-readable description of backend"""
        descriptions = {
            QueryBackend.MOCK: "Mock provider with sample OCSF data for development",
            QueryBackend.CLICKHOUSE: "Production ClickHouse database with real log data"
        }
        return descriptions.get(backend, "Unknown backend")
    
    def _log_query_execution(self, ast: JupiterQueryAST, result: Dict[str, Any], 
                           user_id: Optional[str], backend: QueryBackend):
        """Log query execution for audit purposes"""
        try:
            log_entry = {
                "query_id": ast.query_id,
                "user_id": user_id,
                "tenant_id": ast.tenant_id,
                "backend": backend.value,
                "success": result.get("success", False),
                "execution_time": result.get("execution_time", 0),
                "result_count": len(result.get("data", [])),
                "timestamp": datetime.now().isoformat()
            }
            
            # TODO: Store in audit log (ClickHouse query_audit table or file)
            logger.info(f"Query executed: {log_entry}")
            
        except Exception as e:
            logger.error(f"Failed to log query execution: {e}")

class OCSFQueryParser:
    """
    Parser that converts OCSF text queries to Jupiter Query AST
    Integrates with existing query builder
    """
    
    @staticmethod
    def parse_ocsf_query(query_string: str, tenant_id: Optional[str] = None) -> JupiterQueryAST:
        """
        Parse OCSF query string into Jupiter Query AST
        This replaces the existing parse_ocsf_query function in query_routes.py
        """
        from query_ast_schema import (
            ASTField, ASTLiteral, ASTCondition, ASTLogicalExpression,
            ASTSelectField, ASTOrderBy, ASTTimeRange,
            ComparisonOperator, LogicalOperator, FieldType, SortOrder
        )
        
        # Initialize AST
        ast = JupiterQueryAST(tenant_id=tenant_id, source_query=query_string)
        
        try:
            # Simple parser for basic OCSF queries
            # TODO: Implement more sophisticated parsing
            
            # Parse conditions
            conditions = []
            
            # Split by AND/OR operators
            import re
            parts = re.split(r'\s+(?:AND|OR)\s+', query_string, flags=re.IGNORECASE)
            
            for part in parts:
                part = part.strip()
                condition = OCSFQueryParser._parse_condition(part)
                if condition:
                    conditions.append(condition)
            
            # Combine conditions with AND (simplified)
            if len(conditions) == 1:
                ast.where = conditions[0]
            elif len(conditions) > 1:
                ast.where = ASTLogicalExpression(
                    operator=LogicalOperator.AND,
                    conditions=conditions
                )
            
            # Default select all fields if no specific fields mentioned
            # TODO: Parse SELECT clause from query
            ast.select = [
                ASTSelectField(field=ASTField(name="*"))
            ]
            
        except Exception as e:
            logger.error(f"Failed to parse OCSF query '{query_string}': {e}")
            # Return basic AST on parse error
            pass
        
        return ast
    
    @staticmethod
    def _parse_condition(condition_str: str):
        """Parse a single condition string"""
        from query_ast_schema import (
            ASTField, ASTLiteral, ASTCondition,
            ComparisonOperator, FieldType
        )
        
        # Parse different operator types
        if ' = ' in condition_str:
            field, value = condition_str.split(' = ', 1)
            return ASTCondition(
                left=ASTField(name=field.strip()),
                operator=ComparisonOperator.EQUALS,
                right=ASTLiteral(value=value.strip().strip('"\''), literal_type=FieldType.STRING)
            )
        elif ' CONTAINS ' in condition_str:
            field, value = condition_str.split(' CONTAINS ', 1)
            return ASTCondition(
                left=ASTField(name=field.strip()),
                operator=ComparisonOperator.CONTAINS,
                right=ASTLiteral(value=value.strip().strip('"\''), literal_type=FieldType.STRING)
            )
        elif ' > ' in condition_str:
            field, value = condition_str.split(' > ', 1)
            return ASTCondition(
                left=ASTField(name=field.strip()),
                operator=ComparisonOperator.GREATER_THAN,
                right=ASTLiteral(value=float(value.strip()), literal_type=FieldType.FLOAT)
            )
        # TODO: Add more operators
        
        return None

# Global query manager instance
query_manager = QueryManager()

# Export functions for backward compatibility
def execute_ocsf_query(query_string: str, tenant_id: Optional[str] = None, 
                      user_id: Optional[str] = None, backend: Optional[str] = None) -> Dict[str, Any]:
    """Execute OCSF query string (backward compatibility function)"""
    ast = OCSFQueryParser.parse_ocsf_query(query_string, tenant_id)
    backend_enum = QueryBackend(backend) if backend else None
    return query_manager.execute_query(ast, backend_enum, user_id)

def get_example_queries() -> Dict[str, JupiterQueryAST]:
    """Get example queries for testing"""
    return EXAMPLE_ASTS