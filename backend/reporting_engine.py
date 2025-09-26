#!/usr/bin/env python3
"""
Jupiter SIEM Reporting Engine
Advanced reporting and dashboard generation system
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field
from pathlib import Path
import io
import base64

# Report generation libraries
try:
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    from jinja2 import Template
    import pdfkit
    REPORTING_LIBS_AVAILABLE = True
except ImportError:
    REPORTING_LIBS_AVAILABLE = False

from query_manager import query_manager
from query_ast_schema import (
    JupiterQueryAST, ASTField, ASTSelectField, ASTFunction, 
    ASTOrderBy, ASTTimeRange, SortOrder, AggregateFunction
)

logger = logging.getLogger(__name__)

class ReportFormat(str, Enum):
    """Report output formats"""
    JSON = "json"
    CSV = "csv"
    HTML = "html"
    PDF = "pdf"
    MARKDOWN = "markdown"
    EXCEL = "xlsx"

class ReportFrequency(str, Enum):
    """Report generation frequency"""
    REALTIME = "realtime"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class ReportStatus(str, Enum):
    """Report generation status"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    SCHEDULED = "scheduled"

@dataclass
class ReportDefinition:
    """Report definition configuration"""
    id: str
    name: str
    description: str
    query_template: Dict[str, Any]
    format: ReportFormat = ReportFormat.HTML
    frequency: ReportFrequency = ReportFrequency.DAILY
    recipients: List[str] = field(default_factory=list)
    enabled: bool = True
    parameters: Dict[str, Any] = field(default_factory=dict)
    template_name: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

@dataclass
class ReportExecution:
    """Report execution record"""
    id: str
    report_id: str
    status: ReportStatus
    format: ReportFormat
    parameters: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    error_message: Optional[str] = None
    execution_time: Optional[float] = None

class ReportingEngine:
    """Advanced reporting engine for Jupiter SIEM"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.reports = {}  # In production, store in MongoDB
        self.executions = {}
        self.templates = {}
        self.output_dir = Path(config.get("output_dir", "/app/reports"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        if not REPORTING_LIBS_AVAILABLE:
            logger.warning("Reporting libraries not available - limited functionality")
        
        self._load_default_reports()
        self._load_templates()
    
    def _load_default_reports(self):
        """Load default report definitions"""
        
        # Security Summary Report
        security_summary = ReportDefinition(
            id="security_summary",
            name="Daily Security Summary",
            description="Daily summary of security events and threats",
            query_template={
                "timeframe": "24h",
                "queries": [
                    {
                        "name": "total_events",
                        "ast": {
                            "select": [{"field": {"name": "count"}, "alias": "total_events"}],
                            "time_range": {"last": "24h"}
                        }
                    },
                    {
                        "name": "events_by_severity",
                        "ast": {
                            "select": [
                                {"field": {"name": "severity"}},
                                {"field": {"name": "count"}, "alias": "count"}
                            ],
                            "group_by": {"fields": [{"name": "severity"}]},
                            "time_range": {"last": "24h"}
                        }
                    },
                    {
                        "name": "top_threats",
                        "ast": {
                            "select": [
                                {"field": {"name": "activity_name"}},
                                {"field": {"name": "count"}, "alias": "count"}
                            ],
                            "group_by": {"fields": [{"name": "activity_name"}]},
                            "order_by": [{"field": {"name": "count"}, "direction": "desc"}],
                            "limit": 10,
                            "time_range": {"last": "24h"}
                        }
                    }
                ]
            },
            frequency=ReportFrequency.DAILY,
            format=ReportFormat.HTML,
            template_name="security_summary"
        )
        
        # Threat Intelligence Report
        threat_intel_report = ReportDefinition(
            id="threat_intelligence",
            name="Weekly Threat Intelligence",
            description="Weekly threat intelligence analysis and IOCs",
            query_template={
                "timeframe": "7d",
                "queries": [
                    {
                        "name": "malicious_ips",
                        "ast": {
                            "select": [
                                {"field": {"name": "src_endpoint_ip"}},
                                {"field": {"name": "count"}, "alias": "count"}
                            ],
                            "where": {
                                "operator": "and",
                                "conditions": [
                                    {
                                        "left": {"name": "threat_intelligence.max_threat_level"},
                                        "operator": "in",
                                        "right": [
                                            {"value": "critical", "literal_type": "string"},
                                            {"value": "high", "literal_type": "string"}
                                        ]
                                    }
                                ]
                            },
                            "group_by": {"fields": [{"name": "src_endpoint_ip"}]},
                            "order_by": [{"field": {"name": "count"}, "direction": "desc"}],
                            "limit": 20,
                            "time_range": {"last": "7d"}
                        }
                    }
                ]
            },
            frequency=ReportFrequency.WEEKLY,
            format=ReportFormat.PDF,
            template_name="threat_intelligence"
        )
        
        # User Activity Report
        user_activity_report = ReportDefinition(
            id="user_activity",
            name="User Activity Analysis",
            description="Analysis of user behavior and potential risks",
            query_template={
                "timeframe": "7d",
                "queries": [
                    {
                        "name": "top_users_by_activity",
                        "ast": {
                            "select": [
                                {"field": {"name": "actor_user_name"}},
                                {"field": {"name": "count"}, "alias": "activity_count"}
                            ],
                            "group_by": {"fields": [{"name": "actor_user_name"}]},
                            "order_by": [{"field": {"name": "activity_count"}, "direction": "desc"}],
                            "limit": 25,
                            "time_range": {"last": "7d"}
                        }
                    },
                    {
                        "name": "failed_logins_by_user",
                        "ast": {
                            "select": [
                                {"field": {"name": "actor_user_name"}},
                                {"field": {"name": "count"}, "alias": "failed_attempts"}
                            ],
                            "where": {
                                "left": {"name": "activity_name"},
                                "operator": "eq",
                                "right": {"value": "failed_login", "literal_type": "string"}
                            },
                            "group_by": {"fields": [{"name": "actor_user_name"}]},
                            "order_by": [{"field": {"name": "failed_attempts"}, "direction": "desc"}],
                            "limit": 15,
                            "time_range": {"last": "7d"}
                        }
                    }
                ]
            },
            frequency=ReportFrequency.WEEKLY,
            format=ReportFormat.HTML,
            template_name="user_activity"
        )
        
        self.reports = {
            "security_summary": security_summary,
            "threat_intelligence": threat_intel_report,
            "user_activity": user_activity_report
        }
    
    def _load_templates(self):
        """Load report templates"""
        
        # Security Summary HTML Template
        security_summary_template = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ report_title }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .summary-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .metric-label { font-size: 0.9em; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: bold; }
        .severity-critical { color: #dc2626; font-weight: bold; }
        .severity-high { color: #ea580c; font-weight: bold; }
        .severity-medium { color: #d97706; }
        .severity-low { color: #65a30d; }
        .chart-container { text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ report_title }}</h1>
        <p>Report Period: {{ start_date }} to {{ end_date }}</p>
        <p>Generated: {{ generated_at }}</p>
    </div>
    
    <div class="summary-box">
        <h2>Executive Summary</h2>
        {% for metric in summary_metrics %}
        <div class="metric">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
        </div>
        {% endfor %}
    </div>
    
    <h2>Events by Severity</h2>
    <table>
        <thead>
            <tr><th>Severity</th><th>Count</th><th>Percentage</th></tr>
        </thead>
        <tbody>
            {% for severity in events_by_severity %}
            <tr>
                <td class="severity-{{ severity.severity.lower() }}">{{ severity.severity }}</td>
                <td>{{ severity.count }}</td>
                <td>{{ "%.1f" | format(severity.percentage) }}%</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    
    <h2>Top Security Activities</h2>
    <table>
        <thead>
            <tr><th>Activity</th><th>Count</th><th>Risk Level</th></tr>
        </thead>
        <tbody>
            {% for activity in top_activities %}
            <tr>
                <td>{{ activity.activity_name }}</td>
                <td>{{ activity.count }}</td>
                <td>{{ activity.risk_level }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    
    {% if charts %}
    <h2>Trend Analysis</h2>
    <div class="chart-container">
        {% for chart in charts %}
        <img src="data:image/png;base64,{{ chart.data }}" alt="{{ chart.title }}" />
        <p><strong>{{ chart.title }}</strong></p>
        {% endfor %}
    </div>
    {% endif %}
    
    <div style="margin-top: 40px; font-size: 0.9em; color: #6b7280;">
        <p>This report was automatically generated by Jupiter SIEM</p>
        <p>For questions or concerns, contact the Security Operations Center</p>
    </div>
</body>
</html>
        """
        
        # Threat Intelligence Template
        threat_intel_template = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ report_title }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .ioc-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .ioc-table th, .ioc-table td { padding: 10px; border: 1px solid #e5e7eb; }
        .ioc-table th { background: #fee2e2; }
        .threat-critical { background: #fef2f2; }
        .threat-high { background: #fef7ff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ report_title }}</h1>
        <p>Threat Intelligence Report</p>
        <p>Period: {{ start_date }} to {{ end_date }}</p>
    </div>
    
    <h2>Indicators of Compromise (IOCs)</h2>
    <table class="ioc-table">
        <thead>
            <tr>
                <th>Indicator</th>
                <th>Type</th>
                <th>Threat Level</th>
                <th>First Seen</th>
                <th>Occurrences</th>
            </tr>
        </thead>
        <tbody>
            {% for ioc in iocs %}
            <tr class="threat-{{ ioc.threat_level }}">
                <td>{{ ioc.indicator }}</td>
                <td>{{ ioc.type }}</td>
                <td>{{ ioc.threat_level | upper }}</td>
                <td>{{ ioc.first_seen }}</td>
                <td>{{ ioc.count }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</body>
</html>
        """
        
        self.templates = {
            "security_summary": Template(security_summary_template),
            "threat_intelligence": Template(threat_intel_template),
            "user_activity": Template(security_summary_template)  # Reuse for now
        }
    
    async def generate_report(self, report_id: str, parameters: Optional[Dict[str, Any]] = None) -> ReportExecution:
        """Generate a report"""
        if report_id not in self.reports:
            raise ValueError(f"Report {report_id} not found")
        
        report_def = self.reports[report_id]
        execution_id = f"exec_{report_id}_{int(datetime.now().timestamp())}"
        
        execution = ReportExecution(
            id=execution_id,
            report_id=report_id,
            status=ReportStatus.GENERATING,
            format=report_def.format,
            parameters=parameters or {},
            started_at=datetime.now()
        )
        
        self.executions[execution_id] = execution
        
        try:
            # Execute queries
            query_results = await self._execute_report_queries(report_def, parameters)
            
            # Process data
            processed_data = self._process_query_results(query_results, report_def)
            
            # Generate charts if needed
            charts = []
            if REPORTING_LIBS_AVAILABLE and report_def.format in [ReportFormat.HTML, ReportFormat.PDF]:
                charts = await self._generate_charts(processed_data, report_def)
            
            # Generate report content
            content = await self._generate_report_content(processed_data, charts, report_def)
            
            # Save report
            file_path = await self._save_report(content, execution)
            
            # Update execution
            execution.status = ReportStatus.COMPLETED
            execution.completed_at = datetime.now()
            execution.file_path = str(file_path)
            execution.file_size = file_path.stat().st_size
            execution.execution_time = (execution.completed_at - execution.started_at).total_seconds()
            
            # Update report definition
            report_def.last_run = execution.completed_at
            
            logger.info(f"Report {report_id} generated successfully: {file_path}")
            
        except Exception as e:
            logger.error(f"Report generation failed for {report_id}: {e}")
            execution.status = ReportStatus.FAILED
            execution.completed_at = datetime.now()
            execution.error_message = str(e)
        
        return execution
    
    async def _execute_report_queries(self, report_def: ReportDefinition, parameters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute queries defined in report template"""
        results = {}
        
        queries = report_def.query_template.get("queries", [])
        
        for query_def in queries:
            query_name = query_def["name"]
            ast_dict = query_def["ast"]
            
            # Apply parameters to AST
            if parameters:
                ast_dict = self._apply_parameters_to_ast(ast_dict, parameters)
            
            # Convert to AST object
            try:
                ast = JupiterQueryAST.parse_obj(ast_dict)
                
                # Execute query
                result = query_manager.execute_query(ast)
                
                if result["success"]:
                    results[query_name] = result["data"]
                else:
                    logger.error(f"Query {query_name} failed: {result.get('error')}")
                    results[query_name] = []
            
            except Exception as e:
                logger.error(f"Failed to execute query {query_name}: {e}")
                results[query_name] = []
        
        return results
    
    def _apply_parameters_to_ast(self, ast_dict: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Apply runtime parameters to AST template"""
        # Simple parameter substitution - in production, use proper templating
        if "tenant_id" in parameters:
            ast_dict["tenant_id"] = parameters["tenant_id"]
        
        if "timeframe" in parameters and "time_range" in ast_dict:
            ast_dict["time_range"]["last"] = parameters["timeframe"]
        
        return ast_dict
    
    def _process_query_results(self, query_results: Dict[str, Any], report_def: ReportDefinition) -> Dict[str, Any]:
        """Process raw query results for report generation"""
        processed = {
            "report_title": report_def.name,
            "report_description": report_def.description,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "start_date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "end_date": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Process specific result types
        if "total_events" in query_results:
            total = query_results["total_events"]
            processed["total_events"] = total[0]["total_events"] if total else 0
        
        if "events_by_severity" in query_results:
            severity_data = query_results["events_by_severity"]
            total_events = sum(item["count"] for item in severity_data)
            
            processed["events_by_severity"] = []
            for item in severity_data:
                processed["events_by_severity"].append({
                    "severity": item["severity"],
                    "count": item["count"],
                    "percentage": (item["count"] / total_events * 100) if total_events > 0 else 0
                })
        
        if "top_threats" in query_results or "top_activities" in query_results:
            activities = query_results.get("top_threats", query_results.get("top_activities", []))
            processed["top_activities"] = []
            for activity in activities:
                processed["top_activities"].append({
                    "activity_name": activity["activity_name"],
                    "count": activity["count"],
                    "risk_level": self._assess_activity_risk(activity["activity_name"])
                })
        
        # Generate summary metrics
        processed["summary_metrics"] = [
            {
                "label": "Total Events",
                "value": processed.get("total_events", 0)
            },
            {
                "label": "High Severity",
                "value": sum(1 for s in processed.get("events_by_severity", []) if s["severity"] in ["High", "Critical"])
            },
            {
                "label": "Unique Activities", 
                "value": len(processed.get("top_activities", []))
            }
        ]
        
        return processed
    
    async def _generate_charts(self, data: Dict[str, Any], report_def: ReportDefinition) -> List[Dict[str, Any]]:
        """Generate charts for reports"""
        if not REPORTING_LIBS_AVAILABLE:
            return []
        
        charts = []
        
        try:
            # Set style
            plt.style.use('seaborn-v0_8')
            
            # Events by Severity Pie Chart
            if "events_by_severity" in data:
                severity_data = data["events_by_severity"]
                if severity_data:
                    labels = [item["severity"] for item in severity_data]
                    sizes = [item["count"] for item in severity_data]
                    colors = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#3b82f6"]
                    
                    fig, ax = plt.subplots(figsize=(8, 6))
                    ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
                    ax.set_title("Events by Severity")
                    
                    # Convert to base64
                    img_buffer = io.BytesIO()
                    plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
                    img_buffer.seek(0)
                    chart_data = base64.b64encode(img_buffer.getvalue()).decode()
                    
                    charts.append({
                        "title": "Events by Severity Distribution",
                        "data": chart_data
                    })
                    
                    plt.close()
            
            # Top Activities Bar Chart
            if "top_activities" in data:
                activities = data["top_activities"][:10]  # Top 10
                if activities:
                    names = [item["activity_name"] for item in activities]
                    counts = [item["count"] for item in activities]
                    
                    fig, ax = plt.subplots(figsize=(12, 6))
                    bars = ax.bar(names, counts, color='#1e40af')
                    ax.set_title("Top Security Activities")
                    ax.set_xlabel("Activity")
                    ax.set_ylabel("Count")
                    plt.xticks(rotation=45, ha='right')
                    
                    # Add value labels on bars
                    for bar in bars:
                        height = bar.get_height()
                        ax.text(bar.get_x() + bar.get_width()/2., height,
                               f'{int(height)}', ha='center', va='bottom')
                    
                    img_buffer = io.BytesIO()
                    plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
                    img_buffer.seek(0)
                    chart_data = base64.b64encode(img_buffer.getvalue()).decode()
                    
                    charts.append({
                        "title": "Top Security Activities",
                        "data": chart_data
                    })
                    
                    plt.close()
        
        except Exception as e:
            logger.error(f"Chart generation failed: {e}")
        
        return charts
    
    async def _generate_report_content(self, data: Dict[str, Any], charts: List[Dict[str, Any]], report_def: ReportDefinition) -> Union[str, bytes]:
        """Generate report content in specified format"""
        
        # Add charts to data
        data["charts"] = charts
        
        if report_def.format == ReportFormat.JSON:
            return json.dumps(data, indent=2, default=str)
        
        elif report_def.format == ReportFormat.CSV:
            # Convert to CSV format (simplified)
            if REPORTING_LIBS_AVAILABLE:
                df = pd.DataFrame(data.get("events_by_severity", []))
                return df.to_csv(index=False)
            else:
                return "CSV generation requires pandas"
        
        elif report_def.format == ReportFormat.HTML:
            template = self.templates.get(report_def.template_name)
            if template:
                return template.render(**data)
            else:
                return f"<html><body><h1>{data['report_title']}</h1><pre>{json.dumps(data, indent=2, default=str)}</pre></body></html>"
        
        elif report_def.format == ReportFormat.PDF:
            # Generate HTML first, then convert to PDF
            html_content = await self._generate_report_content(data, charts, 
                ReportDefinition(report_def.id, report_def.name, report_def.description, 
                               report_def.query_template, ReportFormat.HTML, 
                               template_name=report_def.template_name))
            
            try:
                if REPORTING_LIBS_AVAILABLE:
                    return pdfkit.from_string(html_content, False)
                else:
                    return html_content.encode('utf-8')
            except Exception as e:
                logger.error(f"PDF generation failed: {e}")
                return html_content.encode('utf-8')
        
        elif report_def.format == ReportFormat.MARKDOWN:
            # Generate Markdown format
            md_content = f"# {data['report_title']}\n\n"
            md_content += f"**Generated:** {data['generated_at']}\n\n"
            md_content += f"## Summary\n\n"
            
            for metric in data.get("summary_metrics", []):
                md_content += f"- **{metric['label']}:** {metric['value']}\n"
            
            if "events_by_severity" in data:
                md_content += f"\n## Events by Severity\n\n"
                md_content += "| Severity | Count | Percentage |\n"
                md_content += "|----------|-------|------------|\n"
                for item in data["events_by_severity"]:
                    md_content += f"| {item['severity']} | {item['count']} | {item['percentage']:.1f}% |\n"
            
            return md_content
        
        else:
            return json.dumps(data, indent=2, default=str)
    
    async def _save_report(self, content: Union[str, bytes], execution: ReportExecution) -> Path:
        """Save report content to file"""
        timestamp = execution.started_at.strftime("%Y%m%d_%H%M%S")
        
        # Determine file extension
        ext_map = {
            ReportFormat.JSON: "json",
            ReportFormat.CSV: "csv", 
            ReportFormat.HTML: "html",
            ReportFormat.PDF: "pdf",
            ReportFormat.MARKDOWN: "md",
            ReportFormat.EXCEL: "xlsx"
        }
        
        ext = ext_map.get(execution.format, "txt")
        filename = f"{execution.report_id}_{timestamp}.{ext}"
        file_path = self.output_dir / filename
        
        # Write content
        if isinstance(content, str):
            file_path.write_text(content, encoding='utf-8')
        else:
            file_path.write_bytes(content)
        
        return file_path
    
    def _assess_activity_risk(self, activity_name: str) -> str:
        """Assess risk level of activity"""
        high_risk = ["malware_detected", "lateral_movement", "privilege_escalation", "data_exfiltration"]
        medium_risk = ["failed_login", "suspicious_process", "unauthorized_access"]
        
        if activity_name in high_risk:
            return "HIGH"
        elif activity_name in medium_risk:
            return "MEDIUM"
        else:
            return "LOW"
    
    def schedule_report(self, report_id: str, parameters: Optional[Dict[str, Any]] = None):
        """Schedule a report for generation"""
        if report_id not in self.reports:
            raise ValueError(f"Report {report_id} not found")
        
        # In production, this would integrate with a job scheduler like Celery
        logger.info(f"Scheduled report {report_id} for generation")
    
    def get_report_history(self, report_id: str) -> List[ReportExecution]:
        """Get execution history for a report"""
        return [exec for exec in self.executions.values() if exec.report_id == report_id]
    
    def get_execution_status(self, execution_id: str) -> Optional[ReportExecution]:
        """Get status of specific execution"""
        return self.executions.get(execution_id)

# Global reporting engine instance
reporting_engine = None

def initialize_reporting_engine(config: Dict[str, Any]):
    """Initialize reporting engine"""
    global reporting_engine
    reporting_engine = ReportingEngine(config)
    logger.info("Reporting Engine initialized")

async def generate_report_async(report_id: str, parameters: Optional[Dict[str, Any]] = None) -> ReportExecution:
    """Generate report asynchronously (convenience function)"""
    if reporting_engine:
        return await reporting_engine.generate_report(report_id, parameters)
    raise RuntimeError("Reporting engine not initialized")