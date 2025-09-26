#!/usr/bin/env python3
"""
Jupiter SIEM Query Providers
Implements different backends for executing Jupiter Query AST
"""

import json
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import re
from pathlib import Path
import logging

from query_ast_schema import (
    JupiterQueryAST, QueryProvider, ASTField, ASTLiteral, ASTFunction, 
    ASTCondition, ASTLogicalExpression, ASTSelectField,
    ComparisonOperator, LogicalOperator, AggregateFunction, FieldType
)

logger = logging.getLogger(__name__)

class MockQueryProvider(QueryProvider):
    """
    Mock provider that executes queries against sample OCSF data
    Used for development and testing
    """
    
    def __init__(self, data_path: str = "/app/data/mock_ocsf_logs.json"):
        super().__init__(provider_type="mock")
        self.data_path = data_path
        self._load_mock_data()
    
    def _load_mock_data(self):
        """Load mock OCSF data"""
        try:
            if Path(self.data_path).exists():
                with open(self.data_path, 'r') as f:
                    self.data = json.load(f)
            else:
                # Create default mock data if file doesn't exist
                self.data = self._generate_default_mock_data()
                self._save_mock_data()
        except Exception as e:
            logger.warning(f"Failed to load mock data: {e}. Using default data.")
            self.data = self._generate_default_mock_data()
    
    def _generate_default_mock_data(self) -> List[Dict[str, Any]]:
        """Generate default OCSF mock data"""
        base_time = datetime.now()
        
        return [
            {
                "metadata": {"version": "1.0.0"},
                "time": (base_time - timedelta(minutes=5)).isoformat() + "Z",
                "tenant_id": "main_tenant",
                "class_uid": 1001,
                "category_uid": 1,
                "activity_name": "failed_login",
                "severity": "Medium",
                "user": {"name": "john.doe", "uid": "1001"},
                "src_endpoint": {"ip": "192.168.1.100", "port": 0},
                "dst_endpoint": {"ip": "192.168.1.10", "port": 22},
                "device": {"name": "WORKSTATION-01", "type": "Desktop"},
                "message": "Failed SSH login attempt"
            },
            {
                "metadata": {"version": "1.0.0"},
                "time": (base_time - timedelta(minutes=3)).isoformat() + "Z",
                "tenant_id": "main_tenant", 
                "class_uid": 1002,
                "category_uid": 1,
                "activity_name": "process_started",
                "severity": "Low",
                "process": {
                    "name": "powershell.exe",
                    "cmd_line": "powershell.exe -ExecutionPolicy Bypass -File malware.ps1",
                    "pid": 1234
                },
                "user": {"name": "admin", "uid": "500"},
                "device": {"name": "SERVER-01", "type": "Server"},
                "message": "Suspicious PowerShell process started"
            },
            {
                "metadata": {"version": "1.0.0"},
                "time": (base_time - timedelta(minutes=1)).isoformat() + "Z",
                "tenant_id": "main_tenant",
                "class_uid": 1003,
                "category_uid": 2,
                "activity_name": "file_created",
                "severity": "High",
                "file": {
                    "name": "ransomware.exe",
                    "path": "C:\\temp\\ransomware.exe",
                    "size": 1048576,
                    "hash": {"sha256": "a1b2c3d4e5f6..."}
                },
                "user": {"name": "user1", "uid": "1002"},
                "device": {"name": "WORKSTATION-02", "type": "Desktop"},
                "message": "Suspicious executable created"
            },
            {
                "metadata": {"version": "1.0.0"},
                "time": base_time.isoformat() + "Z",
                "tenant_id": "tenant_2",
                "class_uid": 1004,
                "category_uid": 3,
                "activity_name": "network_connection",
                "severity": "Medium",
                "src_endpoint": {"ip": "10.0.0.50", "port": 12345},
                "dst_endpoint": {"ip": "185.199.108.153", "port": 443},
                "network": {"protocol": "TCP"},
                "device": {"name": "LAPTOP-01", "type": "Laptop"},
                "message": "Outbound connection to suspicious IP"
            }
        ]
    
    def _save_mock_data(self):
        """Save mock data to file"""
        try:
            Path(self.data_path).parent.mkdir(parents=True, exist_ok=True)
            with open(self.data_path, 'w') as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save mock data: {e}")
    
    def execute_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Execute AST against mock data"""
        try:
            # Start with all data
            results = self.data.copy()
            
            # Apply tenant filtering
            if ast.tenant_id:
                results = [r for r in results if r.get('tenant_id') == ast.tenant_id]
            
            # Apply WHERE clause
            if ast.where:
                results = [r for r in results if self._evaluate_condition(r, ast.where)]
            
            # Apply time range filter
            if ast.time_range:
                results = self._apply_time_filter(results, ast.time_range)
            
            # Apply GROUP BY (if specified)
            if ast.group_by:
                results = self._apply_group_by(results, ast)
            else:
                # Apply SELECT projection
                results = self._apply_select(results, ast.select)
            
            # Apply ORDER BY
            if ast.order_by:
                results = self._apply_order_by(results, ast.order_by)
            
            # Apply LIMIT/OFFSET
            total_count = len(results)
            if ast.offset:
                results = results[ast.offset:]
            if ast.limit:
                results = results[:ast.limit]
            
            return {
                "success": True,
                "data": results,
                "total": total_count,
                "execution_time": 0.1,  # Mock execution time
                "provider": "mock"
            }
            
        except Exception as e:
            logger.error(f"Mock query execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": "mock"
            }
    
    def _evaluate_condition(self, record: Dict[str, Any], condition) -> bool:
        """Evaluate a condition against a record"""
        if isinstance(condition, ASTCondition):
            return self._evaluate_simple_condition(record, condition)
        elif isinstance(condition, ASTLogicalExpression):
            return self._evaluate_logical_expression(record, condition)
        return False
    
    def _evaluate_simple_condition(self, record: Dict[str, Any], condition: ASTCondition) -> bool:
        """Evaluate a simple condition"""
        # Get left value
        left_value = self._get_field_value(record, condition.left)
        
        # Get right value
        if isinstance(condition.right, ASTLiteral):
            right_value = condition.right.value
        elif isinstance(condition.right, list):
            right_value = [lit.value for lit in condition.right]
        else:
            right_value = self._get_field_value(record, condition.right)
        
        # Apply operator
        return self._apply_operator(left_value, condition.operator, right_value)
    
    def _evaluate_logical_expression(self, record: Dict[str, Any], expr: ASTLogicalExpression) -> bool:
        """Evaluate logical expression"""
        if expr.operator == LogicalOperator.AND:
            return all(self._evaluate_condition(record, cond) for cond in expr.conditions)
        elif expr.operator == LogicalOperator.OR:
            return any(self._evaluate_condition(record, cond) for cond in expr.conditions)
        elif expr.operator == LogicalOperator.NOT:
            return not self._evaluate_condition(record, expr.conditions[0])
        return False
    
    def _get_field_value(self, record: Dict[str, Any], field) -> Any:
        """Get field value from record using dot notation"""
        if isinstance(field, ASTField):
            field_name = field.name
        else:
            return None
            
        # Handle nested field access (e.g., "user.name", "src_endpoint.ip")
        value = record
        for part in field_name.split('.'):
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
        return value
    
    def _apply_operator(self, left: Any, operator: ComparisonOperator, right: Any) -> bool:
        """Apply comparison operator"""
        if left is None:
            return operator in [ComparisonOperator.IS_NULL]
        
        try:
            if operator == ComparisonOperator.EQUALS:
                return str(left).lower() == str(right).lower()
            elif operator == ComparisonOperator.NOT_EQUALS:
                return str(left).lower() != str(right).lower()
            elif operator == ComparisonOperator.CONTAINS:
                return str(right).lower() in str(left).lower()
            elif operator == ComparisonOperator.STARTS_WITH:
                return str(left).lower().startswith(str(right).lower())
            elif operator == ComparisonOperator.ENDS_WITH:
                return str(left).lower().endswith(str(right).lower())
            elif operator == ComparisonOperator.REGEX:
                return bool(re.search(str(right), str(left), re.IGNORECASE))
            elif operator == ComparisonOperator.IN:
                return str(left).lower() in [str(v).lower() for v in right]
            elif operator == ComparisonOperator.NOT_IN:
                return str(left).lower() not in [str(v).lower() for v in right]
            elif operator == ComparisonOperator.GREATER_THAN:
                return float(left) > float(right)
            elif operator == ComparisonOperator.LESS_THAN:
                return float(left) < float(right)
            elif operator == ComparisonOperator.GREATER_EQUAL:
                return float(left) >= float(right)
            elif operator == ComparisonOperator.LESS_EQUAL:
                return float(left) <= float(right)
            elif operator == ComparisonOperator.IS_NULL:
                return left is None
            elif operator == ComparisonOperator.IS_NOT_NULL:
                return left is not None
            else:
                return False
        except (ValueError, TypeError):
            return False
    
    def _apply_time_filter(self, results: List[Dict], time_range) -> List[Dict]:
        """Apply time range filter"""
        if not time_range:
            return results
        
        now = datetime.now()
        
        # Parse time range
        if time_range.last:
            # Handle relative time (e.g., "1h", "24h", "7d")
            if time_range.last.endswith('m'):
                delta = timedelta(minutes=int(time_range.last[:-1]))
            elif time_range.last.endswith('h'):
                delta = timedelta(hours=int(time_range.last[:-1]))
            elif time_range.last.endswith('d'):
                delta = timedelta(days=int(time_range.last[:-1]))
            else:
                return results
            
            cutoff = now - delta
            
            filtered = []
            for record in results:
                try:
                    record_time = datetime.fromisoformat(record['time'].replace('Z', '+00:00'))
                    if record_time >= cutoff:
                        filtered.append(record)
                except (ValueError, KeyError):
                    continue
            
            return filtered
        
        return results
    
    def _apply_select(self, results: List[Dict], select_fields: List[ASTSelectField]) -> List[Dict]:
        """Apply SELECT projection"""
        if not select_fields:
            return results
        
        projected = []
        for record in results:
            projected_record = {}
            for select_field in select_fields:
                if isinstance(select_field.field, ASTField):
                    value = self._get_field_value(record, select_field.field)
                    field_name = select_field.alias or select_field.field.name
                    projected_record[field_name] = value
                # TODO: Handle functions
            projected.append(projected_record)
        
        return projected
    
    def _apply_group_by(self, results: List[Dict], ast: JupiterQueryAST) -> List[Dict]:
        """Apply GROUP BY aggregation"""
        # This is a simplified GROUP BY implementation
        # In production, you'd want more sophisticated aggregation
        grouped = {}
        
        for record in results:
            # Create group key
            group_key = tuple(
                self._get_field_value(record, field) 
                for field in ast.group_by.fields
            )
            
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(record)
        
        # Apply aggregations
        aggregated = []
        for group_key, group_records in grouped.items():
            agg_record = {}
            
            # Add group fields
            for i, field in enumerate(ast.group_by.fields):
                agg_record[field.name] = group_key[i]
            
            # Apply aggregation functions
            for select_field in ast.select:
                if isinstance(select_field.field, ASTFunction):
                    func_name = select_field.field.name
                    field_name = select_field.alias or func_name
                    
                    if func_name == "count":
                        agg_record[field_name] = len(group_records)
                    # TODO: Add more aggregation functions
            
            aggregated.append(agg_record)
        
        return aggregated
    
    def _apply_order_by(self, results: List[Dict], order_by) -> List[Dict]:
        """Apply ORDER BY sorting"""
        if not order_by:
            return results
        
        # Sort by first order_by field (simplified)
        order_field = order_by[0]
        field_name = order_field.field.name
        reverse = order_field.direction.value == "desc"
        
        try:
            return sorted(results, key=lambda x: x.get(field_name, ''), reverse=reverse)
        except (TypeError, KeyError):
            return results
    
    def validate_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Validate AST for mock provider"""
        warnings = []
        errors = []
        
        # Basic validation
        if not ast.select and not ast.group_by:
            warnings.append("No SELECT fields specified, will return all fields")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

class ClickHouseQueryProvider(QueryProvider):
    """
    ClickHouse provider for executing queries against ClickHouse database
    """
    
    def __init__(self, connection_params: Dict[str, Any]):
        super().__init__(provider_type="clickhouse")
        self.connection_params = connection_params
        # TODO: Initialize ClickHouse connection
    
    def execute_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Execute AST by converting to ClickHouse SQL"""
        # TODO: Implement ClickHouse query execution
        return {
            "success": False,
            "error": "ClickHouse provider not yet implemented",
            "provider": "clickhouse"
        }
    
    def validate_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Validate AST for ClickHouse provider"""
        # TODO: Implement ClickHouse-specific validation
        return {
            "valid": True,
            "errors": [],
            "warnings": ["ClickHouse provider not yet implemented"]
        }

# Provider registry
QUERY_PROVIDERS = {
    "mock": MockQueryProvider,
    "clickhouse": ClickHouseQueryProvider
}