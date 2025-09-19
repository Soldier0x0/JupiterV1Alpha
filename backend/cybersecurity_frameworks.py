#!/usr/bin/env python3
"""
Jupiter SIEM Cybersecurity Framework Mapping
Comprehensive mapping of attacks and logs to cybersecurity frameworks
"""

import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import requests
from pathlib import Path

class FrameworkType(Enum):
    """Supported cybersecurity frameworks"""
    MITRE_ATTACK = "mitre_attack"
    DIAMOND_MODEL = "diamond_model"
    KILL_CHAIN = "kill_chain"
    NIST_CSF = "nist_csf"
    ISO_27001 = "iso_27001"
    OWASP_TOP_10 = "owasp_top_10"
    CIS_CONTROLS = "cis_controls"

@dataclass
class AttackTechnique:
    """Attack technique from MITRE ATT&CK"""
    id: str
    name: str
    description: str
    tactics: List[str]
    platforms: List[str]
    data_sources: List[str]
    detection_rules: List[str]
    mitigations: List[str]
    sub_techniques: List[str] = None

@dataclass
class DiamondModel:
    """Diamond Model of Intrusion Analysis"""
    adversary: str
    capability: str
    infrastructure: str
    victim: str
    phase: str
    result: str
    direction: str
    methodology: str
    resources: str
    timestamp: datetime

@dataclass
class KillChainPhase:
    """Kill Chain phase mapping"""
    phase: str
    description: str
    indicators: List[str]
    detection_methods: List[str]
    mitigations: List[str]

class MITREAttackMapper:
    """MITRE ATT&CK Framework mapping and analysis"""
    
    def __init__(self):
        self.techniques = {}
        self.tactics = {}
        self.mitigations = {}
        self.software = {}
        self.groups = {}
        self.campaigns = {}
        self.load_mitre_data()
    
    def load_mitre_data(self):
        """Load MITRE ATT&CK data from local files or API"""
        try:
            # Try to load from local files first
            self._load_local_mitre_data()
        except FileNotFoundError:
            # Fallback to API or create minimal dataset
            self._create_minimal_mitre_data()
    
    def _load_local_mitre_data(self):
        """Load MITRE data from local JSON files"""
        base_path = Path(__file__).parent / "data" / "mitre_attack"
        
        # Load techniques
        with open(base_path / "techniques.json", 'r') as f:
            techniques_data = json.load(f)
            for tech in techniques_data:
                self.techniques[tech['id']] = AttackTechnique(
                    id=tech['id'],
                    name=tech['name'],
                    description=tech['description'],
                    tactics=tech.get('tactics', []),
                    platforms=tech.get('platforms', []),
                    data_sources=tech.get('data_sources', []),
                    detection_rules=tech.get('detection_rules', []),
                    mitigations=tech.get('mitigations', [])
                )
        
        # Load tactics
        with open(base_path / "tactics.json", 'r') as f:
            self.tactics = json.load(f)
    
    def _create_minimal_mitre_data(self):
        """Create minimal MITRE ATT&CK dataset for testing"""
        # Common attack techniques
        common_techniques = {
            "T1071": {
                "name": "Application Layer Protocol",
                "description": "Adversaries may communicate using application layer protocols to avoid detection",
                "tactics": ["Command and Control"],
                "platforms": ["Windows", "Linux", "macOS"],
                "data_sources": ["Network Traffic", "Process Monitoring"],
                "detection_rules": ["Monitor for unusual network connections", "Analyze protocol usage patterns"],
                "mitigations": ["Network Segmentation", "Network Monitoring"]
            },
            "T1055": {
                "name": "Process Injection",
                "description": "Adversaries may inject code into processes to evade detection",
                "tactics": ["Defense Evasion", "Privilege Escalation"],
                "platforms": ["Windows", "Linux"],
                "data_sources": ["Process Monitoring", "API Monitoring"],
                "detection_rules": ["Monitor for process injection APIs", "Analyze process behavior"],
                "mitigations": ["Process Monitoring", "Code Signing"]
            },
            "T1083": {
                "name": "File and Directory Discovery",
                "description": "Adversaries may enumerate files and directories to gather information",
                "tactics": ["Discovery"],
                "platforms": ["Windows", "Linux", "macOS"],
                "data_sources": ["File Monitoring", "Process Monitoring"],
                "detection_rules": ["Monitor file system access patterns", "Detect enumeration commands"],
                "mitigations": ["File System Monitoring", "Access Controls"]
            },
            "T1021": {
                "name": "Remote Services",
                "description": "Adversaries may use remote services to gain access to systems",
                "tactics": ["Lateral Movement"],
                "platforms": ["Windows", "Linux", "macOS"],
                "data_sources": ["Network Traffic", "Authentication Logs"],
                "detection_rules": ["Monitor remote service connections", "Analyze authentication patterns"],
                "mitigations": ["Network Segmentation", "Multi-Factor Authentication"]
            },
            "T1047": {
                "name": "Windows Management Instrumentation",
                "description": "Adversaries may abuse WMI to execute malicious commands",
                "tactics": ["Execution"],
                "platforms": ["Windows"],
                "data_sources": ["WMI Logs", "Process Monitoring"],
                "detection_rules": ["Monitor WMI event creation", "Analyze WMI command execution"],
                "mitigations": ["WMI Monitoring", "Process Restrictions"]
            }
        }
        
        for tech_id, tech_data in common_techniques.items():
            self.techniques[tech_id] = AttackTechnique(
                id=tech_id,
                name=tech_data["name"],
                description=tech_data["description"],
                tactics=tech_data["tactics"],
                platforms=tech_data["platforms"],
                data_sources=tech_data["data_sources"],
                detection_rules=tech_data["detection_rules"],
                mitigations=tech_data["mitigations"]
            )
        
        # Common tactics
        self.tactics = {
            "Initial Access": "The adversary is trying to get into your network",
            "Execution": "The adversary is trying to run malicious code",
            "Persistence": "The adversary is trying to maintain their foothold",
            "Privilege Escalation": "The adversary is trying to gain higher-level permissions",
            "Defense Evasion": "The adversary is trying to avoid being detected",
            "Credential Access": "The adversary is trying to steal account names and passwords",
            "Discovery": "The adversary is trying to figure out your environment",
            "Lateral Movement": "The adversary is trying to move through your environment",
            "Collection": "The adversary is trying to gather data of interest",
            "Command and Control": "The adversary is trying to communicate with compromised systems",
            "Exfiltration": "The adversary is trying to steal data",
            "Impact": "The adversary is trying to manipulate, interrupt, or destroy your systems"
        }
    
    def map_log_to_techniques(self, log_data: Dict[str, Any]) -> List[AttackTechnique]:
        """Map log data to MITRE ATT&CK techniques"""
        matched_techniques = []
        
        # Extract key information from log
        activity_name = log_data.get('activity_name', '').lower()
        process_name = log_data.get('process', {}).get('name', '').lower()
        network_protocol = log_data.get('network', {}).get('protocol', '').lower()
        file_path = log_data.get('file', {}).get('path', '').lower()
        user_name = log_data.get('user', {}).get('name', '').lower()
        
        # Pattern matching for techniques
        for tech_id, technique in self.techniques.items():
            score = 0
            matched_indicators = []
            
            # Check activity name patterns
            if any(keyword in activity_name for keyword in ['injection', 'inject']):
                if tech_id == "T1055":
                    score += 0.8
                    matched_indicators.append("Process injection activity detected")
            
            # Check for file discovery patterns
            if any(keyword in activity_name for keyword in ['discovery', 'enumeration', 'list']):
                if tech_id == "T1083":
                    score += 0.7
                    matched_indicators.append("File and directory discovery activity")
            
            # Check for remote service usage
            if any(keyword in activity_name for keyword in ['remote', 'rpc', 'smb', 'ssh']):
                if tech_id == "T1021":
                    score += 0.6
                    matched_indicators.append("Remote service usage detected")
            
            # Check for WMI usage
            if 'wmi' in activity_name or 'wmiprvse' in process_name:
                if tech_id == "T1047":
                    score += 0.9
                    matched_indicators.append("WMI usage detected")
            
            # Check for network protocol usage
            if network_protocol and tech_id == "T1071":
                score += 0.5
                matched_indicators.append(f"Network protocol: {network_protocol}")
            
            # Add technique if score is above threshold
            if score > 0.5:
                technique_copy = AttackTechnique(
                    id=technique.id,
                    name=technique.name,
                    description=technique.description,
                    tactics=technique.tactics,
                    platforms=technique.platforms,
                    data_sources=technique.data_sources,
                    detection_rules=technique.detection_rules,
                    mitigations=technique.mitigations
                )
                technique_copy.matched_indicators = matched_indicators
                technique_copy.confidence_score = score
                matched_techniques.append(technique_copy)
        
        return matched_techniques
    
    def get_technique_by_id(self, technique_id: str) -> Optional[AttackTechnique]:
        """Get technique by ID"""
        return self.techniques.get(technique_id)
    
    def get_techniques_by_tactic(self, tactic: str) -> List[AttackTechnique]:
        """Get all techniques for a specific tactic"""
        return [tech for tech in self.techniques.values() if tactic in tech.tactics]

class DiamondModelMapper:
    """Diamond Model mapping and analysis"""
    
    def __init__(self):
        self.phases = [
            "Reconnaissance",
            "Weaponization", 
            "Delivery",
            "Exploitation",
            "Installation",
            "Command and Control",
            "Actions on Objectives"
        ]
    
    def map_log_to_diamond_model(self, log_data: Dict[str, Any]) -> DiamondModel:
        """Map log data to Diamond Model"""
        
        # Extract information from log
        src_ip = log_data.get('src_endpoint', {}).get('ip', 'Unknown')
        dst_ip = log_data.get('dst_endpoint', {}).get('ip', 'Unknown')
        activity = log_data.get('activity_name', 'Unknown')
        severity = log_data.get('severity', 'Unknown')
        
        # Determine phase based on activity
        phase = self._determine_phase(activity, log_data)
        
        # Determine direction
        direction = self._determine_direction(log_data)
        
        # Determine result
        result = self._determine_result(severity, log_data)
        
        return DiamondModel(
            adversary=src_ip,
            capability=activity,
            infrastructure=src_ip,
            victim=dst_ip,
            phase=phase,
            result=result,
            direction=direction,
            methodology=self._determine_methodology(activity),
            resources=self._determine_resources(log_data),
            timestamp=datetime.utcnow()
        )
    
    def _determine_phase(self, activity: str, log_data: Dict[str, Any]) -> str:
        """Determine Diamond Model phase based on activity"""
        activity_lower = activity.lower()
        
        if any(keyword in activity_lower for keyword in ['scan', 'probe', 'reconnaissance']):
            return "Reconnaissance"
        elif any(keyword in activity_lower for keyword in ['malware', 'payload', 'exploit']):
            return "Weaponization"
        elif any(keyword in activity_lower for keyword in ['email', 'download', 'attachment']):
            return "Delivery"
        elif any(keyword in activity_lower for keyword in ['exploit', 'vulnerability', 'buffer']):
            return "Exploitation"
        elif any(keyword in activity_lower for keyword in ['install', 'persist', 'backdoor']):
            return "Installation"
        elif any(keyword in activity_lower for keyword in ['command', 'control', 'c2', 'beacon']):
            return "Command and Control"
        elif any(keyword in activity_lower for keyword in ['exfiltrate', 'steal', 'data']):
            return "Actions on Objectives"
        else:
            return "Unknown"
    
    def _determine_direction(self, log_data: Dict[str, Any]) -> str:
        """Determine attack direction"""
        src_ip = log_data.get('src_endpoint', {}).get('ip', '')
        dst_ip = log_data.get('dst_endpoint', {}).get('ip', '')
        
        # Simple heuristic: external to internal is inbound
        if self._is_external_ip(src_ip) and self._is_internal_ip(dst_ip):
            return "Inbound"
        elif self._is_internal_ip(src_ip) and self._is_external_ip(dst_ip):
            return "Outbound"
        else:
            return "Lateral"
    
    def _determine_result(self, severity: str, log_data: Dict[str, Any]) -> str:
        """Determine attack result"""
        if severity in ['Critical', 'High']:
            return "Success"
        elif severity in ['Medium', 'Low']:
            return "Failure"
        else:
            return "Unknown"
    
    def _determine_methodology(self, activity: str) -> str:
        """Determine attack methodology"""
        activity_lower = activity.lower()
        
        if 'sql' in activity_lower:
            return "SQL Injection"
        elif 'xss' in activity_lower:
            return "Cross-Site Scripting"
        elif 'buffer' in activity_lower:
            return "Buffer Overflow"
        elif 'phishing' in activity_lower:
            return "Phishing"
        elif 'brute' in activity_lower:
            return "Brute Force"
        else:
            return "Unknown"
    
    def _determine_resources(self, log_data: Dict[str, Any]) -> str:
        """Determine resources used in attack"""
        resources = []
        
        if log_data.get('network'):
            resources.append("Network")
        if log_data.get('process'):
            resources.append("Process")
        if log_data.get('file'):
            resources.append("File System")
        if log_data.get('registry'):
            resources.append("Registry")
        
        return ", ".join(resources) if resources else "Unknown"
    
    def _is_external_ip(self, ip: str) -> bool:
        """Check if IP is external (simplified)"""
        if not ip:
            return False
        
        # Simple check for private IP ranges
        private_ranges = [
            "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.",
            "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
            "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."
        ]
        
        return not any(ip.startswith(prefix) for prefix in private_ranges)
    
    def _is_internal_ip(self, ip: str) -> bool:
        """Check if IP is internal"""
        return not self._is_external_ip(ip)

class KillChainMapper:
    """Lockheed Martin Kill Chain mapping"""
    
    def __init__(self):
        self.phases = {
            "Reconnaissance": KillChainPhase(
                phase="Reconnaissance",
                description="Research, identification, and selection of targets",
                indicators=["Port scans", "Network probes", "OSINT gathering"],
                detection_methods=["Network monitoring", "DNS analysis", "Social media monitoring"],
                mitigations=["Network segmentation", "Information security awareness"]
            ),
            "Weaponization": KillChainPhase(
                phase="Weaponization",
                description="Malware creation and preparation for delivery",
                indicators=["Malware samples", "Exploit development", "Payload creation"],
                detection_methods=["Sandbox analysis", "Static analysis", "Behavioral analysis"],
                mitigations=["Application whitelisting", "Code signing", "Sandboxing"]
            ),
            "Delivery": KillChainPhase(
                phase="Delivery",
                description="Transmission of weapon to target environment",
                indicators=["Email attachments", "Malicious websites", "USB drops"],
                detection_methods=["Email security", "Web filtering", "Endpoint monitoring"],
                mitigations=["Email filtering", "Web filtering", "USB restrictions"]
            ),
            "Exploitation": KillChainPhase(
                phase="Exploitation",
                description="Triggering of malicious code on target system",
                indicators=["Exploit execution", "Vulnerability exploitation", "Code execution"],
                detection_methods=["Vulnerability scanning", "Behavioral analysis", "Memory analysis"],
                mitigations=["Patch management", "Application security", "Memory protection"]
            ),
            "Installation": KillChainPhase(
                phase="Installation",
                description="Establishment of persistent access to target system",
                indicators=["Backdoor installation", "Persistence mechanisms", "System modifications"],
                detection_methods=["File system monitoring", "Registry monitoring", "Process monitoring"],
                mitigations=["System hardening", "Access controls", "Change management"]
            ),
            "Command and Control": KillChainPhase(
                phase="Command and Control",
                description="Establishment of communication channel with compromised system",
                indicators=["C2 communications", "Beacon traffic", "Data exfiltration"],
                detection_methods=["Network monitoring", "DNS analysis", "Traffic analysis"],
                mitigations=["Network segmentation", "DNS filtering", "Traffic inspection"]
            ),
            "Actions on Objectives": KillChainPhase(
                phase="Actions on Objectives",
                description="Achievement of attacker's goals",
                indicators=["Data theft", "System destruction", "Service disruption"],
                detection_methods=["Data loss prevention", "System monitoring", "User behavior analysis"],
                mitigations=["Data encryption", "Backup systems", "Incident response"]
            )
        }
    
    def map_log_to_kill_chain(self, log_data: Dict[str, Any]) -> KillChainPhase:
        """Map log data to Kill Chain phase"""
        activity = log_data.get('activity_name', '').lower()
        severity = log_data.get('severity', '')
        
        # Determine phase based on activity patterns
        for phase_name, phase in self.phases.items():
            if self._matches_phase(activity, phase_name):
                return phase
        
        # Default to first phase if no match
        return self.phases["Reconnaissance"]
    
    def _matches_phase(self, activity: str, phase: str) -> bool:
        """Check if activity matches a specific phase"""
        phase_keywords = {
            "Reconnaissance": ["scan", "probe", "reconnaissance", "enumeration"],
            "Weaponization": ["malware", "payload", "exploit", "weapon"],
            "Delivery": ["email", "download", "attachment", "delivery"],
            "Exploitation": ["exploit", "vulnerability", "buffer", "overflow"],
            "Installation": ["install", "persist", "backdoor", "rootkit"],
            "Command and Control": ["command", "control", "c2", "beacon", "communication"],
            "Actions on Objectives": ["exfiltrate", "steal", "data", "destroy", "disrupt"]
        }
        
        keywords = phase_keywords.get(phase, [])
        return any(keyword in activity for keyword in keywords)

class FrameworkAnalyzer:
    """Main framework analyzer that combines all frameworks"""
    
    def __init__(self):
        self.mitre_mapper = MITREAttackMapper()
        self.diamond_mapper = DiamondModelMapper()
        self.kill_chain_mapper = KillChainMapper()
    
    def analyze_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive analysis of log data across all frameworks"""
        
        analysis = {
            "log_id": log_data.get("_id", "unknown"),
            "timestamp": datetime.utcnow().isoformat(),
            "frameworks": {}
        }
        
        # MITRE ATT&CK analysis
        mitre_techniques = self.mitre_mapper.map_log_to_techniques(log_data)
        analysis["frameworks"]["mitre_attack"] = {
            "techniques": [
                {
                    "id": tech.id,
                    "name": tech.name,
                    "description": tech.description,
                    "tactics": tech.tactics,
                    "confidence_score": getattr(tech, 'confidence_score', 0.0),
                    "matched_indicators": getattr(tech, 'matched_indicators', [])
                }
                for tech in mitre_techniques
            ],
            "primary_tactic": self._get_primary_tactic(mitre_techniques),
            "threat_level": self._calculate_threat_level(mitre_techniques)
        }
        
        # Diamond Model analysis
        diamond_model = self.diamond_mapper.map_log_to_diamond_model(log_data)
        analysis["frameworks"]["diamond_model"] = {
            "adversary": diamond_model.adversary,
            "capability": diamond_model.capability,
            "infrastructure": diamond_model.infrastructure,
            "victim": diamond_model.victim,
            "phase": diamond_model.phase,
            "result": diamond_model.result,
            "direction": diamond_model.direction,
            "methodology": diamond_model.methodology,
            "resources": diamond_model.resources
        }
        
        # Kill Chain analysis
        kill_chain_phase = self.kill_chain_mapper.map_log_to_kill_chain(log_data)
        analysis["frameworks"]["kill_chain"] = {
            "phase": kill_chain_phase.phase,
            "description": kill_chain_phase.description,
            "indicators": kill_chain_phase.indicators,
            "detection_methods": kill_chain_phase.detection_methods,
            "mitigations": kill_chain_phase.mitigations
        }
        
        # Overall threat assessment
        analysis["threat_assessment"] = self._assess_overall_threat(analysis)
        
        return analysis
    
    def _get_primary_tactic(self, techniques: List[AttackTechnique]) -> str:
        """Get the primary tactic from techniques"""
        if not techniques:
            return "Unknown"
        
        # Count tactic occurrences
        tactic_counts = {}
        for tech in techniques:
            for tactic in tech.tactics:
                tactic_counts[tactic] = tactic_counts.get(tactic, 0) + 1
        
        # Return most common tactic
        return max(tactic_counts.items(), key=lambda x: x[1])[0] if tactic_counts else "Unknown"
    
    def _calculate_threat_level(self, techniques: List[AttackTechnique]) -> str:
        """Calculate overall threat level"""
        if not techniques:
            return "Low"
        
        # High-impact techniques
        high_impact = ["T1055", "T1021", "T1047", "T1071"]
        medium_impact = ["T1083", "T1059", "T1064"]
        
        high_count = sum(1 for tech in techniques if tech.id in high_impact)
        medium_count = sum(1 for tech in techniques if tech.id in medium_impact)
        
        if high_count > 0:
            return "High"
        elif medium_count > 0:
            return "Medium"
        else:
            return "Low"
    
    def _assess_overall_threat(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall threat level across frameworks"""
        
        threat_indicators = []
        risk_score = 0
        
        # MITRE ATT&CK threat indicators
        mitre_data = analysis["frameworks"].get("mitre_attack", {})
        if mitre_data.get("threat_level") == "High":
            threat_indicators.append("High-impact MITRE techniques detected")
            risk_score += 3
        elif mitre_data.get("threat_level") == "Medium":
            threat_indicators.append("Medium-impact MITRE techniques detected")
            risk_score += 2
        
        # Diamond Model threat indicators
        diamond_data = analysis["frameworks"].get("diamond_model", {})
        if diamond_data.get("result") == "Success":
            threat_indicators.append("Successful attack execution detected")
            risk_score += 2
        
        if diamond_data.get("direction") == "Inbound":
            threat_indicators.append("External attack detected")
            risk_score += 1
        
        # Kill Chain threat indicators
        kill_chain_data = analysis["frameworks"].get("kill_chain", {})
        advanced_phases = ["Command and Control", "Actions on Objectives"]
        if kill_chain_data.get("phase") in advanced_phases:
            threat_indicators.append("Advanced attack phase detected")
            risk_score += 2
        
        # Determine overall risk level
        if risk_score >= 5:
            risk_level = "Critical"
        elif risk_score >= 3:
            risk_level = "High"
        elif risk_score >= 1:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "threat_indicators": threat_indicators,
            "recommendations": self._get_recommendations(risk_level, analysis)
        }
    
    def _get_recommendations(self, risk_level: str, analysis: Dict[str, Any]) -> List[str]:
        """Get security recommendations based on analysis"""
        recommendations = []
        
        if risk_level in ["Critical", "High"]:
            recommendations.extend([
                "Immediate incident response required",
                "Isolate affected systems",
                "Notify security team",
                "Preserve evidence for analysis"
            ])
        
        # Framework-specific recommendations
        mitre_data = analysis["frameworks"].get("mitre_attack", {})
        for technique in mitre_data.get("techniques", []):
            recommendations.extend(technique.get("mitigations", []))
        
        kill_chain_data = analysis["frameworks"].get("kill_chain", {})
        recommendations.extend(kill_chain_data.get("mitigations", []))
        
        return list(set(recommendations))  # Remove duplicates

# Export main classes
__all__ = [
    'FrameworkType',
    'AttackTechnique', 
    'DiamondModel',
    'KillChainPhase',
    'MITREAttackMapper',
    'DiamondModelMapper', 
    'KillChainMapper',
    'FrameworkAnalyzer'
]
