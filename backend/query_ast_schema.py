#!/usr/bin/env python3
"""
Jupiter SIEM Query AST Schema Definition
Defines the JSON structure for abstract syntax trees that represent OCSF queries.
This AST can be executed by different providers (Mock, ClickHouse, etc.)
"""

from typing import Dict, List, Any, Optional, Union, Literal
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class FieldType(str, Enum):
    """OCSF field data types"""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    TIMESTAMP = "timestamp"
    IP_ADDRESS = "ip_address"
    JSON = "json"
    ARRAY = "array"
    BOOLEAN = "boolean"

class ComparisonOperator(str, Enum):
    """Comparison operators for WHERE conditions"""
    EQUALS = "eq"
    NOT_EQUALS = "ne"
    GREATER_THAN = "gt"
    GREATER_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_EQUAL = "lte"
    CONTAINS = "contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    REGEX = "regex"
    IN = "in"
    NOT_IN = "not_in"
    BETWEEN = "between"
    IS_NULL = "is_null"
    IS_NOT_NULL = "is_not_null"
    IN_SUBNET = "in_subnet"

class LogicalOperator(str, Enum):
    """Logical operators for combining conditions"""
    AND = "and"
    OR = "or"
    NOT = "not"

class AggregateFunction(str, Enum):
    """Aggregate functions for GROUP BY queries"""
    COUNT = "count"
    SUM = "sum"
    AVG = "avg"
    MIN = "min"
    MAX = "max"
    COUNT_DISTINCT = "count_distinct"
    FIRST = "first"
    LAST = "last"

class SortOrder(str, Enum):
    """Sort order for ORDER BY"""
    ASC = "asc"
    DESC = "desc"

class ASTField(BaseModel):
    """Represents a field reference in the AST"""
    name: str = Field(..., description="OCSF field name (e.g., 'activity_name')")
    alias: Optional[str] = Field(None, description="Field alias for SELECT")
    field_type: FieldType = Field(FieldType.STRING, description="Expected field type")

class ASTLiteral(BaseModel):
    """Represents a literal value in the AST"""
    value: Union[str, int, float, bool, None] = Field(..., description="Literal value")
    literal_type: FieldType = Field(..., description="Type of the literal")

class ASTFunction(BaseModel):
    """Represents a function call in the AST"""
    name: str = Field(..., description="Function name")
    args: List[Union[ASTField, ASTLiteral, 'ASTFunction']] = Field(default_factory=list)
    return_type: FieldType = Field(FieldType.STRING, description="Return type")

class ASTCondition(BaseModel):
    """Represents a WHERE condition"""
    left: Union[ASTField, ASTFunction] = Field(..., description="Left operand")
    operator: ComparisonOperator = Field(..., description="Comparison operator")
    right: Union[ASTLiteral, ASTField, ASTFunction, List[ASTLiteral]] = Field(..., description="Right operand")

class ASTLogicalExpression(BaseModel):
    """Represents logical combinations of conditions"""
    operator: LogicalOperator = Field(..., description="Logical operator")
    conditions: List[Union[ASTCondition, 'ASTLogicalExpression']] = Field(..., description="Child conditions")

class ASTSelectField(BaseModel):
    """Represents a field in SELECT clause"""
    field: Union[ASTField, ASTFunction] = Field(..., description="Field or function to select")
    alias: Optional[str] = Field(None, description="Alias for the field")

class ASTGroupBy(BaseModel):
    """Represents GROUP BY clause"""
    fields: List[ASTField] = Field(..., description="Fields to group by")
    having: Optional[Union[ASTCondition, ASTLogicalExpression]] = Field(None, description="HAVING clause")

class ASTOrderBy(BaseModel):
    """Represents ORDER BY clause"""
    field: ASTField = Field(..., description="Field to order by")
    direction: SortOrder = Field(SortOrder.ASC, description="Sort direction")

class ASTTimeRange(BaseModel):
    """Represents time range for queries"""
    start: Optional[datetime] = Field(None, description="Start time")
    end: Optional[datetime] = Field(None, description="End time")
    last: Optional[str] = Field(None, description="Last N time (e.g., '1h', '24h', '7d')")

class JupiterQueryAST(BaseModel):
    """
    Jupiter SIEM Query Abstract Syntax Tree
    This is the universal query representation that can be executed by different providers
    """
    
    # Core query structure
    select: List[ASTSelectField] = Field(default_factory=list, description="SELECT clause fields")
    where: Optional[Union[ASTCondition, ASTLogicalExpression]] = Field(None, description="WHERE clause")
    group_by: Optional[ASTGroupBy] = Field(None, description="GROUP BY clause")
    order_by: List[ASTOrderBy] = Field(default_factory=list, description="ORDER BY clauses")
    
    # Query constraints
    limit: Optional[int] = Field(None, ge=1, le=10000, description="LIMIT clause")
    offset: Optional[int] = Field(0, ge=0, description="OFFSET clause")
    time_range: Optional[ASTTimeRange] = Field(None, description="Time range filter")
    
    # Metadata
    tenant_id: Optional[str] = Field(None, description="Tenant isolation")
    query_id: Optional[str] = Field(None, description="Unique query identifier")
    source_query: Optional[str] = Field(None, description="Original query string")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class QueryProvider(BaseModel):
    """Base class for query execution providers"""
    provider_type: str = Field(..., description="Provider type (mock, clickhouse, etc.)")
    
    def execute_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Execute AST and return results"""
        raise NotImplementedError("Subclasses must implement execute_ast")
    
    def validate_ast(self, ast: JupiterQueryAST) -> Dict[str, Any]:
        """Validate AST for this provider"""
        raise NotImplementedError("Subclasses must implement validate_ast")

# Example AST for common OCSF queries
EXAMPLE_ASTS = {
    "failed_logins": JupiterQueryAST(
        select=[
            ASTSelectField(field=ASTField(name="activity_name")),
            ASTSelectField(field=ASTField(name="src_endpoint.ip"), alias="source_ip"),
            ASTSelectField(field=ASTField(name="user.name"), alias="username"),
            ASTSelectField(field=ASTFunction(name="count", args=[], return_type=FieldType.INTEGER), alias="count")
        ],
        where=ASTLogicalExpression(
            operator=LogicalOperator.AND,
            conditions=[
                ASTCondition(
                    left=ASTField(name="activity_name"),
                    operator=ComparisonOperator.EQUALS,
                    right=ASTLiteral(value="failed_login", literal_type=FieldType.STRING)
                ),
                ASTCondition(
                    left=ASTField(name="time"),
                    operator=ComparisonOperator.GREATER_EQUAL,
                    right=ASTLiteral(value="2024-01-01T00:00:00Z", literal_type=FieldType.TIMESTAMP)
                )
            ]
        ),
        group_by=ASTGroupBy(
            fields=[
                ASTField(name="src_endpoint.ip"),
                ASTField(name="user.name")
            ]
        ),
        order_by=[
            ASTOrderBy(field=ASTField(name="count"), direction=SortOrder.DESC)
        ],
        limit=100,
        time_range=ASTTimeRange(last="24h")
    ),
    
    "suspicious_processes": JupiterQueryAST(
        select=[
            ASTSelectField(field=ASTField(name="process.name")),
            ASTSelectField(field=ASTField(name="process.cmd_line")),
            ASTSelectField(field=ASTField(name="device.name")),
            ASTSelectField(field=ASTField(name="time"))
        ],
        where=ASTLogicalExpression(
            operator=LogicalOperator.AND,
            conditions=[
                ASTCondition(
                    left=ASTField(name="class_uid"),
                    operator=ComparisonOperator.EQUALS,
                    right=ASTLiteral(value=1002, literal_type=FieldType.INTEGER)
                ),
                ASTCondition(
                    left=ASTField(name="process.name"),
                    operator=ComparisonOperator.IN,
                    right=[
                        ASTLiteral(value="powershell.exe", literal_type=FieldType.STRING),
                        ASTLiteral(value="cmd.exe", literal_type=FieldType.STRING),
                        ASTLiteral(value="wscript.exe", literal_type=FieldType.STRING)
                    ]
                )
            ]
        ),
        order_by=[
            ASTOrderBy(field=ASTField(name="time"), direction=SortOrder.DESC)
        ],
        time_range=ASTTimeRange(last="1h")
    )
}

# Update forward references
ASTLogicalExpression.model_rebuild()
ASTFunction.model_rebuild()