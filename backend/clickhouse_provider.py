#!/usr/bin/env python3
"""
ClickHouse Query Provider Implementation
Converts Jupiter Query AST to ClickHouse SQL and executes queries
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json

try:
    import asynch
    from asynch import connect
    CLICKHOUSE_AVAILABLE = True
except ImportError:
    CLICKHOUSE_AVAILABLE = False
    
from query_ast_schema import (
    JupiterQueryAST, QueryProvider, ASTField, ASTLiteral, ASTFunction, 
    ASTCondition, ASTLogicalExpression, ASTSelectField, ASTGroupBy, ASTOrderBy,
    ComparisonOperator, LogicalOperator, AggregateFunction, FieldType, SortOrder
)

logger = logging.getLogger(__name__)

class ClickHouseSQLBuilder:
    """
    Builds ClickHouse SQL from Jupiter Query AST
    """
    
    def __init__(self):
        # OCSF field mapping to ClickHouse columns
        self.field_mapping = {
            # Core OCSF fields
            "time": "time",
            "event_uid": "event_uid", 
            "tenant_id": "tenant_id",
            "class_uid": "class_uid",
            "class_name": "class_name",
            "category_uid": "category_uid", 
            "category_name": "category_name",
            "activity_name": "activity_name",
            "severity": "severity",
            "message": "message",
            
            # Actor/User fields
            "user.name": "actor_user_name",
            "user.uid": "actor_user_uid",
            "user.type": "actor_user_type",
            "user.domain": "actor_user_domain",
            "user.email": "actor_user_email",
            "actor_user_name": "actor_user_name",
            
            # Device fields
            "device.name": "device_name",
            "device.type": "device_type", 
            "device.ip": "device_ip",
            "device.hostname": "device_hostname",
            "device.mac": "device_mac",
            "device.os.name": "device_os_name",
            "device.os.version": "device_os_version",
            
            # Network fields
            "src_endpoint.ip": "src_endpoint_ip",
            "src_endpoint.port": "src_endpoint_port",
            "dst_endpoint.ip": "dst_endpoint_ip", 
            "dst_endpoint.port": "dst_endpoint_port",
            "network.protocol": "network_protocol",
            "network.direction": "network_direction",
            
            # Process fields
            "process.name": "process_name",
            "process.pid": "process_pid",
            "process.cmd_line": "process_cmd_line",
            "process.parent.name": "process_parent_name",
            "process.parent.pid": "process_parent_pid",
            
            # File fields
            "file.name": "file_name",
            "file.path": "file_path",
            "file.size": "file_size",
            "file.hash.md5": "file_hash_md5",
            "file.hash.sha1": "file_hash_sha1", 
            "file.hash.sha256": "file_hash_sha256",
            
            # Registry fields
            "registry.key": "registry_key",
            "registry.value": "registry_value",
            "registry.type": "registry_type",
            
            # Authentication fields
            "auth.method": "auth_method",
            "auth.result": "auth_result",
            "logon_type": "logon_type",
            
            # HTTP fields
            "http.method": "http_method",
            "http.status_code": "http_status_code",
            "http.url": "http_url",
            "http.user_agent": "http_user_agent",
            "http.referrer": "http_referrer",
            
            # DNS fields
            "dns.query": "dns_query",
            "dns.response": "dns_response", 
            "dns.type": "dns_type",
            
            # Enrichment fields
            "enrichment.geo.country": "enrichment_geo_country",
            "enrichment.geo.city": "enrichment_geo_city",
            "enrichment.threat_score": "enrichment_threat_score",
            "enrichment.reputation": "enrichment_reputation",
            
            # MITRE ATT&CK fields
            "mitre.technique.id": "mitre_technique_id",
            "mitre.technique.name": "mitre_technique_name", 
            "mitre.tactic.id": "mitre_tactic_id",
            "mitre.tactic.name": "mitre_tactic_name",
            
            # Risk/Confidence
            "risk_score": "risk_score",
            "confidence": "confidence",
        }
    
    def build_sql(self, ast: JupiterQueryAST) -> str:
        """Build complete SQL query from AST"""
        sql_parts = []
        
        # SELECT clause
        select_clause = self._build_select_clause(ast.select, ast.group_by)
        sql_parts.append(f"SELECT {select_clause}")
        
        # FROM clause
        sql_parts.append("FROM jupiter_siem.ocsf_events")
        
        # WHERE clause
        where_conditions = []
        
        # Add tenant filtering
        if ast.tenant_id:
            where_conditions.append(f"tenant_id = '{self._escape_string(ast.tenant_id)}'")
        
        # Add time range filtering
        if ast.time_range:
            time_condition = self._build_time_condition(ast.time_range)
            if time_condition:
                where_conditions.append(time_condition)
        
        # Add custom WHERE conditions
        if ast.where:
            custom_where = self._build_where_clause(ast.where)
            if custom_where:
                where_conditions.append(custom_where)
        
        if where_conditions:
            sql_parts.append(f"WHERE {' AND '.join(where_conditions)}")
        
        # GROUP BY clause
        if ast.group_by:
            group_clause = self._build_group_by_clause(ast.group_by)
            sql_parts.append(f"GROUP BY {group_clause}")
            
            # HAVING clause
            if ast.group_by.having:
                having_clause = self._build_where_clause(ast.group_by.having)
                sql_parts.append(f"HAVING {having_clause}")
        
        # ORDER BY clause
        if ast.order_by:
            order_clause = self._build_order_by_clause(ast.order_by)
            sql_parts.append(f"ORDER BY {order_clause}")
        
        # LIMIT/OFFSET
        if ast.limit:
            if ast.offset:
                sql_parts.append(f"LIMIT {ast.offset}, {ast.limit}")
            else:
                sql_parts.append(f"LIMIT {ast.limit}")
        
        return ' '.join(sql_parts)
    
    def _build_select_clause(self, select_fields: List[ASTSelectField], group_by: Optional[ASTGroupBy]) -> str:
        """Build SELECT clause"""
        if not select_fields:
            if group_by:
                # For GROUP BY queries, select group fields + count
                fields = [self._map_field_name(field.name) for field in group_by.fields]
                fields.append("count() AS count")
                return ', '.join(fields)
            else:
                return "*"
        
        select_parts = []
        for select_field in select_fields:
            if isinstance(select_field.field, ASTField):
                if select_field.field.name == "*":
                    select_parts.append("*")
                else:
                    column_name = self._map_field_name(select_field.field.name)
                    if select_field.alias:
                        select_parts.append(f"{column_name} AS {select_field.alias}")
                    else:
                        select_parts.append(column_name)
            elif isinstance(select_field.field, ASTFunction):
                func_sql = self._build_function_sql(select_field.field)
                if select_field.alias:
                    select_parts.append(f"{func_sql} AS {select_field.alias}")
                else:
                    select_parts.append(func_sql)
        
        return ', '.join(select_parts)
    
    def _build_where_clause(self, condition: Union[ASTCondition, ASTLogicalExpression]) -> str:
        """Build WHERE clause from condition"""
        if isinstance(condition, ASTCondition):
            return self._build_simple_condition(condition)
        elif isinstance(condition, ASTLogicalExpression):
            return self._build_logical_expression(condition)
        return ""
    
    def _build_simple_condition(self, condition: ASTCondition) -> str:
        """Build simple condition SQL"""
        left_value = self._build_field_reference(condition.left)
        
        if isinstance(condition.right, ASTLiteral):
            right_value = self._build_literal_value(condition.right)
        elif isinstance(condition.right, list):
            # Handle IN/NOT IN with lists
            values = [self._build_literal_value(lit) for lit in condition.right]
            right_value = f"({', '.join(values)})"
        elif isinstance(condition.right, ASTField):
            right_value = self._build_field_reference(condition.right)
        else:
            right_value = "NULL"
        
        # Map operators to ClickHouse SQL
        op_mapping = {
            ComparisonOperator.EQUALS: "=",
            ComparisonOperator.NOT_EQUALS: "!=", 
            ComparisonOperator.GREATER_THAN: ">",
            ComparisonOperator.GREATER_EQUAL: ">=",
            ComparisonOperator.LESS_THAN: "<",
            ComparisonOperator.LESS_EQUAL: "<=",
            ComparisonOperator.CONTAINS: "LIKE",
            ComparisonOperator.STARTS_WITH: "LIKE", 
            ComparisonOperator.ENDS_WITH: "LIKE",
            ComparisonOperator.REGEX: "REGEXP",
            ComparisonOperator.IN: "IN",
            ComparisonOperator.NOT_IN: "NOT IN",
            ComparisonOperator.IS_NULL: "IS NULL",
            ComparisonOperator.IS_NOT_NULL: "IS NOT NULL",
            ComparisonOperator.IN_SUBNET: "isIPAddressInRange"
        }
        
        operator = op_mapping.get(condition.operator, "=")
        
        # Special handling for LIKE operators
        if condition.operator == ComparisonOperator.CONTAINS:
            right_value = f"'%{condition.right.value}%'"
        elif condition.operator == ComparisonOperator.STARTS_WITH:
            right_value = f"'{condition.right.value}%'"
        elif condition.operator == ComparisonOperator.ENDS_WITH:
            right_value = f"'%{condition.right.value}'"
        elif condition.operator in [ComparisonOperator.IS_NULL, ComparisonOperator.IS_NOT_NULL]:
            return f"{left_value} {operator}"
        elif condition.operator == ComparisonOperator.IN_SUBNET:
            # Special ClickHouse function for IP subnet matching
            return f"isIPAddressInRange({left_value}, '{condition.right.value}')"
        
        return f"{left_value} {operator} {right_value}"
    
    def _build_logical_expression(self, expr: ASTLogicalExpression) -> str:
        """Build logical expression SQL"""
        if not expr.conditions:
            return ""
        
        condition_sqls = []
        for condition in expr.conditions:
            condition_sql = self._build_where_clause(condition)
            if condition_sql:
                condition_sqls.append(f"({condition_sql})")
        
        if not condition_sqls:
            return ""
        
        if expr.operator == LogicalOperator.AND:
            return ' AND '.join(condition_sqls)
        elif expr.operator == LogicalOperator.OR:
            return ' OR '.join(condition_sqls)
        elif expr.operator == LogicalOperator.NOT:
            if condition_sqls:
                return f"NOT ({condition_sqls[0]})"
        
        return ""
    
    def _build_field_reference(self, field_ref: Union[ASTField, ASTFunction]) -> str:
        """Build field reference SQL"""
        if isinstance(field_ref, ASTField):
            return self._map_field_name(field_ref.name)
        elif isinstance(field_ref, ASTFunction):
            return self._build_function_sql(field_ref)
        return "NULL"
    
    def _build_function_sql(self, func: ASTFunction) -> str:
        """Build function SQL"""
        func_mapping = {
            AggregateFunction.COUNT: "count",
            AggregateFunction.SUM: "sum", 
            AggregateFunction.AVG: "avg",
            AggregateFunction.MIN: "min",
            AggregateFunction.MAX: "max",
            AggregateFunction.COUNT_DISTINCT: "uniq",
            AggregateFunction.FIRST: "any",
            AggregateFunction.LAST: "anyLast"
        }
        
        clickhouse_func = func_mapping.get(func.name, func.name)
        
        if not func.args:
            if func.name == AggregateFunction.COUNT:
                return "count()"
            else:
                return f"{clickhouse_func}()"
        
        args = []
        for arg in func.args:
            if isinstance(arg, ASTField):
                args.append(self._map_field_name(arg.name))
            elif isinstance(arg, ASTLiteral):
                args.append(self._build_literal_value(arg))
            elif isinstance(arg, ASTFunction):
                args.append(self._build_function_sql(arg))
        
        return f"{clickhouse_func}({', '.join(args)})"
    
    def _build_literal_value(self, literal: ASTLiteral) -> str:
        """Build literal value SQL"""
        if literal.value is None:
            return "NULL"
        elif literal.literal_type == FieldType.STRING:
            return f"'{self._escape_string(str(literal.value))}'"
        elif literal.literal_type in [FieldType.INTEGER, FieldType.FLOAT]:
            return str(literal.value)
        elif literal.literal_type == FieldType.BOOLEAN:
            return "1" if literal.value else "0"
        elif literal.literal_type == FieldType.TIMESTAMP:
            return f"'{literal.value}'"
        elif literal.literal_type == FieldType.IP_ADDRESS:
            return f"toIPv4('{literal.value}')"
        else:
            return f"'{self._escape_string(str(literal.value))}'"
    
    def _build_group_by_clause(self, group_by: ASTGroupBy) -> str:
        """Build GROUP BY clause"""
        fields = [self._map_field_name(field.name) for field in group_by.fields]
        return ', '.join(fields)
    
    def _build_order_by_clause(self, order_by: List[ASTOrderBy]) -> str:
        """Build ORDER BY clause"""
        order_parts = []
        for order in order_by:
            field_name = self._map_field_name(order.field.name)
            direction = "DESC" if order.direction == SortOrder.DESC else "ASC"
            order_parts.append(f"{field_name} {direction}")
        return ', '.join(order_parts)
    
    def _build_time_condition(self, time_range) -> Optional[str]:
        """Build time range condition"""
        if not time_range:
            return None
        
        conditions = []
        
        if time_range.start:
            start_str = time_range.start.strftime('%Y-%m-%d %H:%M:%S')
            conditions.append(f"time >= '{start_str}'")
        
        if time_range.end:
            end_str = time_range.end.strftime('%Y-%m-%d %H:%M:%S')
            conditions.append(f"time <= '{end_str}'")
        
        if time_range.last:
            # Parse relative time (e.g., "1h", "24h", "7d")
            if time_range.last.endswith('m'):
                minutes = int(time_range.last[:-1])
                cutoff = datetime.now() - timedelta(minutes=minutes)
            elif time_range.last.endswith('h'):
                hours = int(time_range.last[:-1])
                cutoff = datetime.now() - timedelta(hours=hours)
            elif time_range.last.endswith('d'):
                days = int(time_range.last[:-1])
                cutoff = datetime.now() - timedelta(days=days)
            else:
                return None
            
            cutoff_str = cutoff.strftime('%Y-%m-%d %H:%M:%S')
            conditions.append(f"time >= '{cutoff_str}'")
        
        return ' AND '.join(conditions) if conditions else None
    
    def _map_field_name(self, ocsf_field: str) -> str:
        """Map OCSF field name to ClickHouse column name"""
        return self.field_mapping.get(ocsf_field, ocsf_field)
    
    def _escape_string(self, value: str) -> str:
        """Escape string for SQL injection prevention"""
        return value.replace("'", "''").replace("\\", "\\\\")

class ClickHouseQueryProvider(QueryProvider):
    """
    ClickHouse implementation of QueryProvider
    Executes Jupiter Query AST against ClickHouse database
    """
    
    def __init__(self, connection_params: Dict[str, Any]):
        super().__init__(provider_type="clickhouse")
        self.connection_params = connection_params
        self.sql_builder = ClickHouseSQLBuilder()
        self.connection_pool = None
        
        if not CLICKHOUSE_AVAILABLE:
            raise ImportError("asynch package required for ClickHouse provider")
    
    async def _get_connection(self):
        """Get ClickHouse connection"""
        if not self.connection_pool:
            self.connection_pool = await connect(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 9000), 
                database=self.connection_params.get("database", "jupiter_siem"),
                user=self.connection_params.get("username", "default"),
                password=self.connection_params.get("password", "")
            )
        return self.connection_pool
    
    def execute_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Execute AST against ClickHouse"""
        try:
            # Run async method in sync context
            return asyncio.run(self._execute_ast_async(ast))
        except Exception as e:
            logger.error(f"ClickHouse query execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": "clickhouse"
            }
    
    async def _execute_ast_async(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Execute AST asynchronously"""
        start_time = datetime.now()
        
        try:
            # Build SQL query
            sql = self.sql_builder.build_sql(ast)
            logger.info(f"Executing ClickHouse query: {sql}")
            
            # Get connection
            connection = await self._get_connection()
            
            # Execute query
            cursor = await connection.cursor()
            await cursor.execute(sql)
            
            # Fetch results
            rows = await cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            
            # Convert to list of dictionaries
            results = []
            for row in rows:
                result_dict = {}
                for i, column in enumerate(columns):
                    value = row[i]
                    # Convert ClickHouse types to JSON-serializable types
                    if hasattr(value, 'isoformat'):  # datetime
                        value = value.isoformat()
                    elif isinstance(value, bytes):
                        value = value.decode('utf-8', errors='ignore')
                    result_dict[column] = value
                results.append(result_dict)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": True,
                "data": results,
                "total": len(results),
                "execution_time": execution_time,
                "sql": sql,
                "provider": "clickhouse"
            }
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"ClickHouse query failed: {e}")
            
            return {
                "success": False,
                "error": str(e),
                "execution_time": execution_time,
                "provider": "clickhouse"
            }
    
    def validate_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Validate AST for ClickHouse"""
        errors = []
        warnings = []
        
        try:
            # Try to build SQL to validate syntax
            sql = self.sql_builder.build_sql(ast)
            
            # Basic validation checks
            if len(sql) > 100000:  # 100KB limit
                warnings.append("Query is very large, may impact performance")
            
            if ast.limit and ast.limit > 10000:
                warnings.append("Large LIMIT may impact performance")
            
            # Check for potentially expensive operations
            if not ast.where and not ast.time_range and not ast.tenant_id:
                warnings.append("Query without filters may be slow on large datasets")
            
        except Exception as e:
            errors.append(f"Failed to build SQL: {str(e)}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }