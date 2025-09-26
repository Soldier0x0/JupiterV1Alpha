#!/usr/bin/env python3
"""
Jupiter SIEM SOAR Engine
Security Orchestration, Automation and Response workflows
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field
from uuid import uuid4
import aiohttp

logger = logging.getLogger(__name__)

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertStatus(str, Enum):
    """Alert status"""
    OPEN = "open"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"
    FALSE_POSITIVE = "false_positive"

class PlaybookStatus(str, Enum):
    """Playbook execution status"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Alert:
    """Security alert"""
    id: str = field(default_factory=lambda: str(uuid4()))
    title: str = ""
    description: str = ""
    severity: AlertSeverity = AlertSeverity.MEDIUM
    status: AlertStatus = AlertStatus.OPEN
    source_event: Dict[str, Any] = field(default_factory=dict)
    indicators: List[Dict[str, Any]] = field(default_factory=list)
    mitre_tactics: List[str] = field(default_factory=list)
    mitre_techniques: List[str] = field(default_factory=list)
    affected_assets: List[str] = field(default_factory=list)
    assigned_to: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    tags: List[str] = field(default_factory=list)
    playbooks_executed: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert alert to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity.value,
            "status": self.status.value,
            "source_event": self.source_event,
            "indicators": self.indicators,
            "mitre_tactics": self.mitre_tactics,
            "mitre_techniques": self.mitre_techniques,
            "affected_assets": self.affected_assets,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "tags": self.tags,
            "playbooks_executed": self.playbooks_executed
        }

@dataclass
class PlaybookAction:
    """Individual action in a playbook"""
    name: str
    action_type: str  # "enrichment", "containment", "notification", "investigation"
    parameters: Dict[str, Any] = field(default_factory=dict)
    timeout_seconds: int = 300
    retry_count: int = 3
    condition: Optional[str] = None  # Condition for execution

@dataclass
class Playbook:
    """Security response playbook"""
    id: str
    name: str
    description: str
    trigger_conditions: Dict[str, Any]
    actions: List[PlaybookAction] = field(default_factory=list)
    enabled: bool = True
    priority: int = 1
    created_at: datetime = field(default_factory=datetime.now)

class SOAREngine:
    """Main SOAR engine for Jupiter SIEM"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.alerts = {}  # In production, this would be MongoDB
        self.playbooks = {}
        self.execution_history = []
        self.action_handlers = {}
        self.n8n_webhook_url = config.get("n8n_webhook_url", "http://n8n:5678/webhook")
        self._register_default_actions()
        self._load_default_playbooks()
    
    def _register_default_actions(self):
        """Register default SOAR actions"""
        self.action_handlers.update({
            "enrich_with_threat_intel": self._enrich_with_threat_intel,
            "block_ip_address": self._block_ip_address,
            "isolate_host": self._isolate_host,
            "notify_security_team": self._notify_security_team,
            "create_ticket": self._create_ticket,
            "gather_forensics": self._gather_forensics,
            "hunt_indicators": self._hunt_indicators,
            "update_firewall": self._update_firewall,
            "disable_user_account": self._disable_user_account,
            "quarantine_file": self._quarantine_file
        })
    
    def _load_default_playbooks(self):
        """Load default incident response playbooks"""
        
        # Malware Detection Playbook
        malware_playbook = Playbook(
            id="malware_detection",
            name="Malware Detection Response",
            description="Automated response to malware detection events",
            trigger_conditions={
                "class_uid": [1003],  # File system activity
                "activity_name": ["file_created", "file_modified"],
                "threat_intelligence.max_threat_level": ["critical", "high"]
            },
            actions=[
                PlaybookAction(
                    name="Enrich with threat intelligence",
                    action_type="enrichment",
                    parameters={"sources": ["virustotal", "hybrid_analysis"]}
                ),
                PlaybookAction(
                    name="Quarantine malicious file",
                    action_type="containment",
                    parameters={"action": "quarantine"}
                ),
                PlaybookAction(
                    name="Isolate affected host",
                    action_type="containment", 
                    parameters={"isolation_type": "network"}
                ),
                PlaybookAction(
                    name="Notify security team",
                    action_type="notification",
                    parameters={
                        "recipients": ["security-team@company.com"],
                        "urgency": "high"
                    }
                ),
                PlaybookAction(
                    name="Create incident ticket",
                    action_type="investigation",
                    parameters={"priority": "high", "category": "malware"}
                )
            ]
        )
        
        # Brute Force Attack Playbook
        brute_force_playbook = Playbook(
            id="brute_force_response",
            name="Brute Force Attack Response",
            description="Automated response to brute force attacks",
            trigger_conditions={
                "activity_name": ["failed_login"],
                "event_count": {"threshold": 10, "timeframe": "5m"}
            },
            actions=[
                PlaybookAction(
                    name="Block source IP",
                    action_type="containment",
                    parameters={"duration": "1h", "scope": "global"}
                ),
                PlaybookAction(
                    name="Disable targeted account",
                    action_type="containment",
                    parameters={"duration": "2h", "require_approval": True}
                ),
                PlaybookAction(
                    name="Hunt for lateral movement",
                    action_type="investigation",
                    parameters={"timeframe": "24h", "scope": "network"}
                ),
                PlaybookAction(
                    name="Generate forensic report", 
                    action_type="investigation",
                    parameters={"include_timeline": True}
                )
            ]
        )
        
        # Suspicious Process Activity Playbook
        process_playbook = Playbook(
            id="suspicious_process_response",
            name="Suspicious Process Response",
            description="Response to suspicious process execution",
            trigger_conditions={
                "class_uid": [1002],  # Process activity
                "process.name": ["powershell.exe", "cmd.exe", "wscript.exe"],
                "risk_score": {"min": 0.7}
            },
            actions=[
                PlaybookAction(
                    name="Terminate suspicious process",
                    action_type="containment",
                    parameters={"force": True}
                ),
                PlaybookAction(
                    name="Collect process artifacts",
                    action_type="investigation",
                    parameters={"include_memory_dump": True}
                ),
                PlaybookAction(
                    name="Scan process parent chain", 
                    action_type="investigation",
                    parameters={"depth": 5}
                ),
                PlaybookAction(
                    name="Update detection rules",
                    action_type="enrichment",
                    parameters={"rule_type": "behavioral"}
                )
            ]
        )
        
        self.playbooks = {
            "malware_detection": malware_playbook,
            "brute_force_response": brute_force_playbook,
            "suspicious_process_response": process_playbook
        }
    
    async def process_security_event(self, event: Dict[str, Any]) -> Optional[Alert]:
        """Process security event and trigger appropriate playbooks"""
        try:
            # Check if event should generate an alert
            alert = await self._create_alert_from_event(event)
            if not alert:
                return None
            
            # Store alert
            self.alerts[alert.id] = alert
            
            # Find and execute matching playbooks
            matching_playbooks = self._find_matching_playbooks(event, alert)
            for playbook in matching_playbooks:
                await self._execute_playbook(playbook, alert, event)
            
            return alert
            
        except Exception as e:
            logger.error(f"Error processing security event: {e}")
            return None
    
    async def _create_alert_from_event(self, event: Dict[str, Any]) -> Optional[Alert]:
        """Create alert from security event if conditions are met"""
        
        # Alert generation rules
        should_alert = False
        severity = AlertSeverity.LOW
        
        # High-risk events automatically create alerts
        risk_score = event.get("risk_score", 0)
        if risk_score > 0.7:
            should_alert = True
            severity = AlertSeverity.HIGH
        elif risk_score > 0.5:
            should_alert = True
            severity = AlertSeverity.MEDIUM
        
        # Threat intelligence indicators
        threat_intel = event.get("threat_intelligence", {})
        if threat_intel.get("max_threat_level") in ["critical", "high"]:
            should_alert = True
            severity = AlertSeverity.CRITICAL if threat_intel.get("max_threat_level") == "critical" else AlertSeverity.HIGH
        
        # Critical activities
        critical_activities = [
            "malware_detected", "lateral_movement", "privilege_escalation",
            "data_exfiltration", "persistence_mechanism"
        ]
        if event.get("activity_name") in critical_activities:
            should_alert = True
            severity = AlertSeverity.HIGH
        
        if not should_alert:
            return None
        
        # Create alert
        alert = Alert(
            title=self._generate_alert_title(event),
            description=self._generate_alert_description(event),
            severity=severity,
            source_event=event,
            indicators=threat_intel.get("indicators", []),
            mitre_tactics=self._extract_mitre_tactics(event),
            mitre_techniques=self._extract_mitre_techniques(event),
            affected_assets=self._extract_affected_assets(event),
            tags=self._generate_alert_tags(event)
        )
        
        return alert
    
    def _find_matching_playbooks(self, event: Dict[str, Any], alert: Alert) -> List[Playbook]:
        """Find playbooks that match the event/alert"""
        matching_playbooks = []
        
        for playbook in self.playbooks.values():
            if not playbook.enabled:
                continue
                
            if self._check_trigger_conditions(playbook.trigger_conditions, event, alert):
                matching_playbooks.append(playbook)
        
        # Sort by priority
        matching_playbooks.sort(key=lambda p: p.priority, reverse=True)
        return matching_playbooks
    
    def _check_trigger_conditions(self, conditions: Dict[str, Any], event: Dict[str, Any], alert: Alert) -> bool:
        """Check if trigger conditions are met"""
        for key, expected_values in conditions.items():
            if key == "class_uid":
                if event.get("class_uid") not in expected_values:
                    return False
            elif key == "activity_name":
                if event.get("activity_name") not in expected_values:
                    return False
            elif key == "threat_intelligence.max_threat_level":
                threat_level = event.get("threat_intelligence", {}).get("max_threat_level")
                if threat_level not in expected_values:
                    return False
            elif key == "risk_score":
                risk_score = event.get("risk_score", 0)
                if "min" in expected_values and risk_score < expected_values["min"]:
                    return False
                if "max" in expected_values and risk_score > expected_values["max"]:
                    return False
        
        return True
    
    async def _execute_playbook(self, playbook: Playbook, alert: Alert, event: Dict[str, Any]):
        """Execute playbook actions"""
        execution_id = str(uuid4())
        
        logger.info(f"Executing playbook '{playbook.name}' for alert {alert.id}")
        
        execution_log = {
            "execution_id": execution_id,
            "playbook_id": playbook.id,
            "alert_id": alert.id,
            "started_at": datetime.now().isoformat(),
            "status": PlaybookStatus.RUNNING,
            "actions_completed": 0,
            "actions_total": len(playbook.actions),
            "results": []
        }
        
        try:
            for i, action in enumerate(playbook.actions):
                logger.info(f"Executing action: {action.name}")
                
                # Check condition if specified
                if action.condition and not self._evaluate_condition(action.condition, event, alert):
                    logger.info(f"Skipping action '{action.name}' - condition not met")
                    continue
                
                # Execute action
                action_result = await self._execute_action(action, alert, event)
                execution_log["results"].append({
                    "action": action.name,
                    "status": "success" if action_result.get("success") else "failed",
                    "result": action_result,
                    "timestamp": datetime.now().isoformat()
                })
                
                execution_log["actions_completed"] = i + 1
                
                # Stop on critical failure
                if not action_result.get("success") and action_result.get("critical", False):
                    logger.error(f"Critical action failed: {action.name}")
                    break
            
            execution_log["status"] = PlaybookStatus.SUCCESS
            execution_log["completed_at"] = datetime.now().isoformat()
            
            # Update alert
            alert.playbooks_executed.append(execution_id)
            alert.updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"Playbook execution failed: {e}")
            execution_log["status"] = PlaybookStatus.FAILED
            execution_log["error"] = str(e)
            execution_log["completed_at"] = datetime.now().isoformat()
        
        self.execution_history.append(execution_log)
    
    async def _execute_action(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual SOAR action"""
        handler = self.action_handlers.get(action.action_type)
        if not handler:
            # Try n8n webhook for custom actions
            return await self._execute_n8n_webhook(action, alert, event)
        
        try:
            result = await handler(action, alert, event)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Action execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    # Action Handlers
    async def _enrich_with_threat_intel(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich alert with additional threat intelligence"""
        # This would integrate with threat_intelligence.py
        return {"enriched": True, "sources": action.parameters.get("sources", [])}
    
    async def _block_ip_address(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Block IP address in firewall"""
        ip_address = event.get("src_endpoint_ip")
        if not ip_address:
            return {"blocked": False, "reason": "No IP address found"}
        
        # In production, this would integrate with firewall APIs
        logger.info(f"Blocking IP address: {ip_address}")
        return {
            "blocked": True,
            "ip_address": ip_address,
            "duration": action.parameters.get("duration", "1h")
        }
    
    async def _isolate_host(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Isolate compromised host"""
        hostname = event.get("device_name")
        if not hostname:
            return {"isolated": False, "reason": "No hostname found"}
        
        isolation_type = action.parameters.get("isolation_type", "network")
        logger.info(f"Isolating host {hostname} ({isolation_type})")
        return {"isolated": True, "hostname": hostname, "type": isolation_type}
    
    async def _notify_security_team(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification to security team"""
        recipients = action.parameters.get("recipients", [])
        urgency = action.parameters.get("urgency", "medium")
        
        notification = {
            "alert_id": alert.id,
            "title": alert.title,
            "severity": alert.severity.value,
            "urgency": urgency,
            "recipients": recipients,
            "timestamp": datetime.now().isoformat()
        }
        
        # In production, integrate with email/Slack/Teams
        logger.info(f"Sending notification: {notification}")
        return {"sent": True, "notification": notification}
    
    async def _create_ticket(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Create incident ticket"""
        ticket = {
            "title": f"Security Incident: {alert.title}",
            "description": alert.description,
            "priority": action.parameters.get("priority", "medium"),
            "category": action.parameters.get("category", "security"),
            "assignee": action.parameters.get("assignee"),
            "alert_id": alert.id
        }
        
        # In production, integrate with ITSM system
        logger.info(f"Creating ticket: {ticket}")
        return {"created": True, "ticket": ticket}
    
    async def _gather_forensics(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Gather forensic artifacts"""
        artifacts = ["system_logs", "network_captures", "memory_dumps", "file_hashes"]
        return {"gathered": True, "artifacts": artifacts}
    
    async def _hunt_indicators(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Hunt for indicators of compromise"""
        indicators = alert.indicators
        hunt_results = {"indicators_found": len(indicators), "additional_compromises": 0}
        return hunt_results
    
    async def _update_firewall(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Update firewall rules"""
        return {"updated": True, "rules_added": 1}
    
    async def _disable_user_account(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Disable user account"""
        username = event.get("actor_user_name")
        if not username:
            return {"disabled": False, "reason": "No username found"}
        
        logger.info(f"Disabling user account: {username}")
        return {"disabled": True, "username": username}
    
    async def _quarantine_file(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Quarantine malicious file"""
        file_path = event.get("file_path")
        if not file_path:
            return {"quarantined": False, "reason": "No file path found"}
        
        logger.info(f"Quarantining file: {file_path}")
        return {"quarantined": True, "file_path": file_path}
    
    async def _execute_n8n_webhook(self, action: PlaybookAction, alert: Alert, event: Dict[str, Any]) -> Dict[str, Any]:
        """Execute action via n8n webhook"""
        webhook_payload = {
            "action": action.name,
            "action_type": action.action_type,
            "parameters": action.parameters,
            "alert": alert.to_dict(),
            "event": event
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.n8n_webhook_url}/soar-action",
                    json=webhook_payload,
                    timeout=aiohttp.ClientTimeout(total=action.timeout_seconds)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {"success": True, "result": result}
                    else:
                        return {"success": False, "error": f"HTTP {response.status}"}
        
        except Exception as e:
            logger.error(f"n8n webhook execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _evaluate_condition(self, condition: str, event: Dict[str, Any], alert: Alert) -> bool:
        """Evaluate action condition"""
        # Simple condition evaluation - in production, use a proper expression parser
        try:
            # Replace placeholders with actual values
            condition = condition.replace("${risk_score}", str(event.get("risk_score", 0)))
            condition = condition.replace("${severity}", f"'{alert.severity.value}'")
            return eval(condition)  # SECURITY: Never use eval in production!
        except:
            return True
    
    # Utility methods for alert generation
    def _generate_alert_title(self, event: Dict[str, Any]) -> str:
        """Generate alert title from event"""
        activity = event.get("activity_name", "Unknown Activity")
        device = event.get("device_name", "Unknown Device")
        return f"{activity.title()} on {device}"
    
    def _generate_alert_description(self, event: Dict[str, Any]) -> str:
        """Generate alert description from event"""
        description_parts = []
        
        if event.get("message"):
            description_parts.append(f"Event: {event['message']}")
        
        if event.get("actor_user_name"):
            description_parts.append(f"User: {event['actor_user_name']}")
        
        if event.get("src_endpoint_ip"):
            description_parts.append(f"Source IP: {event['src_endpoint_ip']}")
        
        if event.get("process_name"):
            description_parts.append(f"Process: {event['process_name']}")
        
        return " | ".join(description_parts)
    
    def _extract_mitre_tactics(self, event: Dict[str, Any]) -> List[str]:
        """Extract MITRE ATT&CK tactics from event"""
        mitre = event.get("mitre_attack", {})
        tactics = []
        for technique_data in mitre.values():
            if isinstance(technique_data, dict) and "tactic" in technique_data:
                tactics.append(technique_data["tactic"])
        return list(set(tactics))
    
    def _extract_mitre_techniques(self, event: Dict[str, Any]) -> List[str]:
        """Extract MITRE ATT&CK techniques from event"""
        mitre = event.get("mitre_attack", {})
        return list(mitre.keys())
    
    def _extract_affected_assets(self, event: Dict[str, Any]) -> List[str]:
        """Extract affected assets from event"""
        assets = []
        if event.get("device_name"):
            assets.append(event["device_name"])
        if event.get("src_endpoint_ip"):
            assets.append(event["src_endpoint_ip"])
        return assets
    
    def _generate_alert_tags(self, event: Dict[str, Any]) -> List[str]:
        """Generate tags for alert"""
        tags = []
        
        # Add class-based tags
        class_uid = event.get("class_uid")
        if class_uid == 1001:
            tags.append("authentication")
        elif class_uid == 1002:
            tags.append("process-activity")
        elif class_uid == 1003:
            tags.append("file-activity")
        elif class_uid == 1004:
            tags.append("network-activity")
        
        # Add threat intelligence tags
        threat_intel = event.get("threat_intelligence", {})
        if threat_intel.get("indicators"):
            tags.append("threat-intelligence")
        
        # Add severity tags
        risk_score = event.get("risk_score", 0)
        if risk_score > 0.7:
            tags.append("high-risk")
        
        return tags

# Global SOAR engine instance
soar_engine = None

def initialize_soar_engine(config: Dict[str, Any]):
    """Initialize SOAR engine"""
    global soar_engine
    soar_engine = SOAREngine(config)
    logger.info("SOAR Engine initialized")

async def process_event_for_soar(event: Dict[str, Any]) -> Optional[Alert]:
    """Process event through SOAR engine (convenience function)"""
    if soar_engine:
        return await soar_engine.process_security_event(event)
    return None