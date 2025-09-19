#!/usr/bin/env python3
"""
Jupiter SIEM Extended Cybersecurity Frameworks
Comprehensive integration of additional security frameworks and threat modeling tools
"""

import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import requests
from pathlib import Path

class ExtendedFrameworkType(Enum):
    """Extended cybersecurity frameworks"""
    OWASP_TOP_10 = "owasp_top_10"
    STRIDE = "stride"
    PASTA = "pasta"
    NIST_CSF = "nist_csf"
    ATOMIC_RED_TEAM = "atomic_red_team"
    CWE = "cwe"
    CONTAINERS_MATRIX = "containers_matrix"
    CISA_DECIDER = "cisa_decider"
    MITRE_ATLAS = "mitre_atlas"
    THREAT_MODELING = "threat_modeling"

@dataclass
class OWASPVulnerability:
    """OWASP Top 10 vulnerability"""
    id: str
    name: str
    description: str
    category: str
    risk_level: str
    examples: List[str]
    mitigations: List[str]
    detection_rules: List[str]

@dataclass
class STRIDEThreat:
    """STRIDE threat model"""
    category: str  # Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
    description: str
    impact: str
    likelihood: str
    mitigations: List[str]
    detection_indicators: List[str]

@dataclass
class NISTCSFControl:
    """NIST Cybersecurity Framework control"""
    id: str
    function: str  # Identify, Protect, Detect, Respond, Recover
    category: str
    subcategory: str
    description: str
    implementation_tiers: List[str]
    outcomes: List[str]

class OWASPTop10Mapper:
    """OWASP Top 10 2021 mapping and analysis"""
    
    def __init__(self):
        self.vulnerabilities = self._load_owasp_top_10()
    
    def _load_owasp_top_10(self) -> Dict[str, OWASPVulnerability]:
        """Load OWASP Top 10 2021 data"""
        return {
            "A01": OWASPVulnerability(
                id="A01",
                name="Broken Access Control",
                description="Access control enforces policy such that users cannot act outside of their intended permissions",
                category="Access Control",
                risk_level="High",
                examples=[
                    "Bypassing access control checks by modifying the URL",
                    "Privilege escalation by acting as a user without being logged in",
                    "Metadata manipulation to access or modify another user's data"
                ],
                mitigations=[
                    "Implement proper access control checks",
                    "Use role-based access control (RBAC)",
                    "Validate permissions on every request"
                ],
                detection_rules=[
                    "Monitor for privilege escalation attempts",
                    "Detect unauthorized access to sensitive resources",
                    "Alert on failed access control checks"
                ]
            ),
            "A02": OWASPVulnerability(
                id="A02",
                name="Cryptographic Failures",
                description="Failures related to cryptography which often lead to exposure of sensitive data",
                category="Cryptography",
                risk_level="High",
                examples=[
                    "Transmission of data in clear text",
                    "Use of weak cryptographic algorithms",
                    "Improper key management"
                ],
                mitigations=[
                    "Use strong encryption algorithms",
                    "Implement proper key management",
                    "Encrypt data in transit and at rest"
                ],
                detection_rules=[
                    "Monitor for weak encryption usage",
                    "Detect unencrypted sensitive data transmission",
                    "Alert on cryptographic failures"
                ]
            ),
            "A03": OWASPVulnerability(
                id="A03",
                name="Injection",
                description="Injection flaws allow attackers to send malicious data to an interpreter",
                category="Injection",
                risk_level="Critical",
                examples=[
                    "SQL injection",
                    "NoSQL injection",
                    "Command injection",
                    "LDAP injection"
                ],
                mitigations=[
                    "Use parameterized queries",
                    "Input validation and sanitization",
                    "Use least privilege principle"
                ],
                detection_rules=[
                    "Monitor for injection patterns in requests",
                    "Detect suspicious database queries",
                    "Alert on command execution attempts"
                ]
            ),
            "A04": OWASPVulnerability(
                id="A04",
                name="Insecure Design",
                description="Risks related to design and architectural flaws",
                category="Design",
                risk_level="Medium",
                examples=[
                    "Missing security controls",
                    "Insecure default configurations",
                    "Lack of threat modeling"
                ],
                mitigations=[
                    "Implement secure design principles",
                    "Conduct threat modeling",
                    "Use secure coding practices"
                ],
                detection_rules=[
                    "Monitor for insecure configurations",
                    "Detect missing security controls",
                    "Alert on design vulnerabilities"
                ]
            ),
            "A05": OWASPVulnerability(
                id="A05",
                name="Security Misconfiguration",
                description="Insecure default configurations, incomplete configurations, or misconfigured HTTP headers",
                category="Configuration",
                risk_level="Medium",
                examples=[
                    "Unnecessary features enabled",
                    "Default accounts and passwords",
                    "Verbose error messages"
                ],
                mitigations=[
                    "Implement secure configuration management",
                    "Disable unnecessary features",
                    "Use security headers"
                ],
                detection_rules=[
                    "Monitor for misconfigured services",
                    "Detect default credentials usage",
                    "Alert on security misconfigurations"
                ]
            ),
            "A06": OWASPVulnerability(
                id="A06",
                name="Vulnerable and Outdated Components",
                description="Components with known vulnerabilities",
                category="Dependencies",
                risk_level="High",
                examples=[
                    "Outdated libraries",
                    "Unpatched software",
                    "Known vulnerable components"
                ],
                mitigations=[
                    "Keep components updated",
                    "Monitor for vulnerabilities",
                    "Use dependency scanning"
                ],
                detection_rules=[
                    "Monitor for outdated components",
                    "Detect known vulnerabilities",
                    "Alert on vulnerable dependencies"
                ]
            ),
            "A07": OWASPVulnerability(
                id="A07",
                name="Identification and Authentication Failures",
                description="Confirmation of user identity, authentication, and session management",
                category="Authentication",
                risk_level="High",
                examples=[
                    "Weak password policies",
                    "Session fixation",
                    "Brute force attacks"
                ],
                mitigations=[
                    "Implement strong authentication",
                    "Use multi-factor authentication",
                    "Secure session management"
                ],
                detection_rules=[
                    "Monitor for authentication failures",
                    "Detect brute force attempts",
                    "Alert on session anomalies"
                ]
            ),
            "A08": OWASPVulnerability(
                id="A08",
                name="Software and Data Integrity Failures",
                description="Failures related to software and data integrity",
                category="Integrity",
                risk_level="Medium",
                examples=[
                    "Code tampering",
                    "Data corruption",
                    "Supply chain attacks"
                ],
                mitigations=[
                    "Implement code signing",
                    "Use integrity checks",
                    "Secure supply chain"
                ],
                detection_rules=[
                    "Monitor for code tampering",
                    "Detect data integrity violations",
                    "Alert on supply chain attacks"
                ]
            ),
            "A09": OWASPVulnerability(
                id="A09",
                name="Security Logging and Monitoring Failures",
                description="Insufficient logging and monitoring",
                category="Logging",
                risk_level="Medium",
                examples=[
                    "Insufficient logging",
                    "Log tampering",
                    "Inadequate monitoring"
                ],
                mitigations=[
                    "Implement comprehensive logging",
                    "Use log integrity protection",
                    "Deploy security monitoring"
                ],
                detection_rules=[
                    "Monitor for logging failures",
                    "Detect log tampering",
                    "Alert on monitoring gaps"
                ]
            ),
            "A10": OWASPVulnerability(
                id="A10",
                name="Server-Side Request Forgery (SSRF)",
                description="SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL",
                category="SSRF",
                risk_level="High",
                examples=[
                    "Internal network scanning",
                    "Cloud metadata access",
                    "Local file inclusion"
                ],
                mitigations=[
                    "Validate and sanitize URLs",
                    "Use allowlists for URLs",
                    "Implement network segmentation"
                ],
                detection_rules=[
                    "Monitor for SSRF attempts",
                    "Detect internal network access",
                    "Alert on metadata access"
                ]
            )
        }
    
    def map_log_to_owasp(self, log_data: Dict[str, Any]) -> List[OWASPVulnerability]:
        """Map log data to OWASP Top 10 vulnerabilities"""
        matched_vulnerabilities = []
        
        activity_name = log_data.get('activity_name', '').lower()
        url = log_data.get('url', '').lower()
        user_agent = log_data.get('user_agent', '').lower()
        
        # A01 - Broken Access Control
        if any(keyword in activity_name for keyword in ['unauthorized', 'access denied', 'permission denied']):
            matched_vulnerabilities.append(self.vulnerabilities['A01'])
        
        # A02 - Cryptographic Failures
        if any(keyword in activity_name for keyword in ['ssl', 'tls', 'encryption', 'certificate']):
            if any(keyword in activity_name for keyword in ['weak', 'expired', 'invalid']):
                matched_vulnerabilities.append(self.vulnerabilities['A02'])
        
        # A03 - Injection
        if any(keyword in activity_name for keyword in ['injection', 'sql', 'xss', 'command']):
            matched_vulnerabilities.append(self.vulnerabilities['A03'])
        
        # A05 - Security Misconfiguration
        if any(keyword in activity_name for keyword in ['misconfiguration', 'default', 'admin', 'root']):
            matched_vulnerabilities.append(self.vulnerabilities['A05'])
        
        # A07 - Authentication Failures
        if any(keyword in activity_name for keyword in ['login', 'authentication', 'brute force', 'password']):
            if any(keyword in activity_name for keyword in ['failed', 'invalid', 'attack']):
                matched_vulnerabilities.append(self.vulnerabilities['A07'])
        
        # A10 - SSRF
        if any(keyword in activity_name for keyword in ['ssrf', 'request forgery', 'internal', 'metadata']):
            matched_vulnerabilities.append(self.vulnerabilities['A10'])
        
        return matched_vulnerabilities

class STRIDEMapper:
    """STRIDE threat modeling framework"""
    
    def __init__(self):
        self.threats = self._load_stride_threats()
    
    def _load_stride_threats(self) -> Dict[str, STRIDEThreat]:
        """Load STRIDE threat categories"""
        return {
            "Spoofing": STRIDEThreat(
                category="Spoofing",
                description="Impersonating someone or something else",
                impact="Identity theft, unauthorized access",
                likelihood="Medium",
                mitigations=[
                    "Strong authentication",
                    "Digital certificates",
                    "Multi-factor authentication"
                ],
                detection_indicators=[
                    "Unusual login patterns",
                    "IP address anomalies",
                    "Certificate validation failures"
                ]
            ),
            "Tampering": STRIDEThreat(
                category="Tampering",
                description="Modifying data or code",
                impact="Data corruption, system compromise",
                likelihood="Medium",
                mitigations=[
                    "Data integrity checks",
                    "Code signing",
                    "Access controls"
                ],
                detection_indicators=[
                    "File modification attempts",
                    "Data integrity violations",
                    "Unauthorized code changes"
                ]
            ),
            "Repudiation": STRIDEThreat(
                category="Repudiation",
                description="Denying that an action occurred",
                impact="Legal issues, accountability loss",
                likelihood="Low",
                mitigations=[
                    "Comprehensive logging",
                    "Digital signatures",
                    "Audit trails"
                ],
                detection_indicators=[
                    "Log tampering attempts",
                    "Missing audit records",
                    "Signature validation failures"
                ]
            ),
            "Information_Disclosure": STRIDEThreat(
                category="Information Disclosure",
                description="Exposing information to unauthorized parties",
                impact="Data breach, privacy violation",
                likelihood="High",
                mitigations=[
                    "Data encryption",
                    "Access controls",
                    "Data classification"
                ],
                detection_indicators=[
                    "Unauthorized data access",
                    "Information leakage",
                    "Privilege escalation"
                ]
            ),
            "Denial_of_Service": STRIDEThreat(
                category="Denial of Service",
                description="Making a service unavailable",
                impact="Service disruption, business impact",
                likelihood="High",
                mitigations=[
                    "Rate limiting",
                    "Resource monitoring",
                    "Load balancing"
                ],
                detection_indicators=[
                    "High resource usage",
                    "Unusual traffic patterns",
                    "Service unavailability"
                ]
            ),
            "Elevation_of_Privilege": STRIDEThreat(
                category="Elevation of Privilege",
                description="Gaining more privileges than authorized",
                impact="System compromise, data access",
                likelihood="Medium",
                mitigations=[
                    "Principle of least privilege",
                    "Regular access reviews",
                    "Privilege monitoring"
                ],
                detection_indicators=[
                    "Privilege escalation attempts",
                    "Unauthorized admin access",
                    "Permission changes"
                ]
            )
        }
    
    def map_log_to_stride(self, log_data: Dict[str, Any]) -> List[STRIDEThreat]:
        """Map log data to STRIDE threats"""
        matched_threats = []
        
        activity_name = log_data.get('activity_name', '').lower()
        severity = log_data.get('severity', '').lower()
        
        # Spoofing
        if any(keyword in activity_name for keyword in ['spoof', 'impersonat', 'fake', 'forged']):
            matched_threats.append(self.threats['Spoofing'])
        
        # Tampering
        if any(keyword in activity_name for keyword in ['modify', 'tamper', 'alter', 'change']):
            matched_threats.append(self.threats['Tampering'])
        
        # Information Disclosure
        if any(keyword in activity_name for keyword in ['disclose', 'leak', 'expose', 'unauthorized access']):
            matched_threats.append(self.threats['Information_Disclosure'])
        
        # Denial of Service
        if any(keyword in activity_name for keyword in ['dos', 'ddos', 'flood', 'overload']):
            matched_threats.append(self.threats['Denial_of_Service'])
        
        # Elevation of Privilege
        if any(keyword in activity_name for keyword in ['escalat', 'privilege', 'admin', 'root']):
            matched_threats.append(self.threats['Elevation_of_Privilege'])
        
        return matched_threats

class NISTCSFMapper:
    """NIST Cybersecurity Framework mapping"""
    
    def __init__(self):
        self.controls = self._load_nist_csf()
    
    def _load_nist_csf(self) -> Dict[str, NISTCSFControl]:
        """Load NIST CSF controls"""
        return {
            "ID.AM": NISTCSFControl(
                id="ID.AM",
                function="Identify",
                category="Asset Management",
                subcategory="ID.AM-1",
                description="Physical devices and systems within the organization are inventoried",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Asset inventory maintained", "System configurations documented"]
            ),
            "ID.AM-2": NISTCSFControl(
                id="ID.AM-2",
                function="Identify",
                category="Asset Management",
                subcategory="ID.AM-2",
                description="Software platforms and applications within the organization are inventoried",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Software inventory maintained", "Application dependencies documented"]
            ),
            "PR.AC": NISTCSFControl(
                id="PR.AC",
                function="Protect",
                category="Access Control",
                subcategory="PR.AC-1",
                description="Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Identity management implemented", "Access controls enforced"]
            ),
            "DE.CM": NISTCSFControl(
                id="DE.CM",
                function="Detect",
                category="Continuous Monitoring",
                subcategory="DE.CM-1",
                description="The network is monitored to detect potential cybersecurity events",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Network monitoring active", "Anomalies detected"]
            ),
            "RS.RP": NISTCSFControl(
                id="RS.RP",
                function="Respond",
                category="Response Planning",
                subcategory="RS.RP-1",
                description="Response plan is executed during or after a cybersecurity incident",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Incident response executed", "Containment measures applied"]
            ),
            "RC.RP": NISTCSFControl(
                id="RC.RP",
                function="Recover",
                category="Recovery Planning",
                subcategory="RC.RP-1",
                description="Recovery plan is executed during or after a cybersecurity incident",
                implementation_tiers=["Partial", "Risk Informed", "Repeatable", "Adaptive"],
                outcomes=["Recovery procedures executed", "Systems restored"]
            )
        }
    
    def map_log_to_nist_csf(self, log_data: Dict[str, Any]) -> List[NISTCSFControl]:
        """Map log data to NIST CSF controls"""
        matched_controls = []
        
        activity_name = log_data.get('activity_name', '').lower()
        
        # Asset Management
        if any(keyword in activity_name for keyword in ['inventory', 'asset', 'device', 'system']):
            matched_controls.append(self.controls['ID.AM'])
        
        # Access Control
        if any(keyword in activity_name for keyword in ['access', 'authentication', 'authorization', 'login']):
            matched_controls.append(self.controls['PR.AC'])
        
        # Continuous Monitoring
        if any(keyword in activity_name for keyword in ['monitor', 'detect', 'scan', 'probe']):
            matched_controls.append(self.controls['DE.CM'])
        
        # Response Planning
        if any(keyword in activity_name for keyword in ['incident', 'response', 'alert', 'threat']):
            matched_controls.append(self.controls['RS.RP'])
        
        return matched_controls

class AtomicRedTeamMapper:
    """Atomic Red Team technique mapping"""
    
    def __init__(self):
        self.techniques = self._load_atomic_techniques()
    
    def _load_atomic_techniques(self) -> Dict[str, Dict[str, Any]]:
        """Load Atomic Red Team techniques"""
        return {
            "T1055": {
                "name": "Process Injection",
                "description": "Adversaries may inject code into processes to evade detection",
                "atomic_tests": [
                    "Process Injection via mavinject.exe",
                    "Process Injection via PowerShell",
                    "Process Injection via C#"
                ],
                "detection_rules": [
                    "Monitor for process injection APIs",
                    "Detect unusual process behavior",
                    "Alert on code injection attempts"
                ]
            },
            "T1059": {
                "name": "Command and Scripting Interpreter",
                "description": "Adversaries may abuse command and script interpreters to execute commands",
                "atomic_tests": [
                    "PowerShell Execution",
                    "Command Prompt Execution",
                    "Bash Script Execution"
                ],
                "detection_rules": [
                    "Monitor command line execution",
                    "Detect script execution",
                    "Alert on suspicious commands"
                ]
            },
            "T1083": {
                "name": "File and Directory Discovery",
                "description": "Adversaries may enumerate files and directories to gather information",
                "atomic_tests": [
                    "File and Directory Discovery",
                    "PowerShell File and Directory Discovery",
                    "Nix File and Directory Discovery"
                ],
                "detection_rules": [
                    "Monitor file system access",
                    "Detect enumeration commands",
                    "Alert on suspicious file access"
                ]
            }
        }
    
    def map_log_to_atomic(self, log_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map log data to Atomic Red Team techniques"""
        matched_techniques = []
        
        activity_name = log_data.get('activity_name', '').lower()
        
        for technique_id, technique in self.techniques.items():
            if any(keyword in activity_name for keyword in technique['name'].lower().split()):
                matched_techniques.append({
                    'id': technique_id,
                    'name': technique['name'],
                    'description': technique['description'],
                    'atomic_tests': technique['atomic_tests'],
                    'detection_rules': technique['detection_rules']
                })
        
        return matched_techniques

class AnalystFatigueManager:
    """Analyst fatigue prevention and management system"""
    
    def __init__(self):
        self.fatigue_indicators = {
            'high_volume': 100,  # alerts per hour
            'low_severity_ratio': 0.7,  # 70% low severity alerts
            'repetitive_patterns': 5,  # same alert type 5+ times
            'time_based_fatigue': 8  # hours of continuous monitoring
        }
    
    def assess_fatigue_risk(self, alerts: List[Dict[str, Any]], analyst_id: str) -> Dict[str, Any]:
        """Assess analyst fatigue risk"""
        current_time = datetime.utcnow()
        
        # Calculate fatigue metrics
        total_alerts = len(alerts)
        high_severity_alerts = len([a for a in alerts if a.get('severity') in ['Critical', 'High']])
        low_severity_ratio = (total_alerts - high_severity_alerts) / total_alerts if total_alerts > 0 else 0
        
        # Check for repetitive patterns
        alert_types = {}
        for alert in alerts:
            alert_type = alert.get('type', 'unknown')
            alert_types[alert_type] = alert_types.get(alert_type, 0) + 1
        
        repetitive_patterns = max(alert_types.values()) if alert_types else 0
        
        # Calculate fatigue score
        fatigue_score = 0
        fatigue_factors = []
        
        if total_alerts > self.fatigue_indicators['high_volume']:
            fatigue_score += 30
            fatigue_factors.append("High alert volume")
        
        if low_severity_ratio > self.fatigue_indicators['low_severity_ratio']:
            fatigue_score += 25
            fatigue_factors.append("High ratio of low-severity alerts")
        
        if repetitive_patterns > self.fatigue_indicators['repetitive_patterns']:
            fatigue_score += 20
            fatigue_factors.append("Repetitive alert patterns")
        
        # Determine fatigue level
        if fatigue_score >= 70:
            fatigue_level = "High"
        elif fatigue_score >= 40:
            fatigue_level = "Medium"
        else:
            fatigue_level = "Low"
        
        return {
            'analyst_id': analyst_id,
            'fatigue_score': fatigue_score,
            'fatigue_level': fatigue_level,
            'fatigue_factors': fatigue_factors,
            'total_alerts': total_alerts,
            'high_severity_ratio': high_severity_alerts / total_alerts if total_alerts > 0 else 0,
            'repetitive_patterns': repetitive_patterns,
            'recommendations': self._get_fatigue_recommendations(fatigue_level, fatigue_factors)
        }
    
    def _get_fatigue_recommendations(self, fatigue_level: str, fatigue_factors: List[str]) -> List[str]:
        """Get recommendations to reduce analyst fatigue"""
        recommendations = []
        
        if fatigue_level == "High":
            recommendations.extend([
                "Implement alert prioritization and filtering",
                "Enable automated response for low-risk alerts",
                "Schedule analyst breaks and rotation",
                "Reduce alert noise through tuning"
            ])
        elif fatigue_level == "Medium":
            recommendations.extend([
                "Review and tune alert rules",
                "Implement alert correlation",
                "Consider automated triage"
            ])
        
        if "High alert volume" in fatigue_factors:
            recommendations.append("Implement rate limiting and alert batching")
        
        if "High ratio of low-severity alerts" in fatigue_factors:
            recommendations.append("Adjust severity thresholds and filtering")
        
        if "Repetitive alert patterns" in fatigue_factors:
            recommendations.append("Implement alert correlation and grouping")
        
        return recommendations
    
    def optimize_alert_display(self, alerts: List[Dict[str, Any]], analyst_id: str) -> List[Dict[str, Any]]:
        """Optimize alert display to reduce fatigue"""
        fatigue_assessment = self.assess_fatigue_risk(alerts, analyst_id)
        
        if fatigue_assessment['fatigue_level'] == "High":
            # Show only high-priority alerts
            filtered_alerts = [a for a in alerts if a.get('severity') in ['Critical', 'High']]
            return filtered_alerts[:20]  # Limit to 20 alerts
        elif fatigue_assessment['fatigue_level'] == "Medium":
            # Show high and medium priority alerts
            filtered_alerts = [a for a in alerts if a.get('severity') in ['Critical', 'High', 'Medium']]
            return filtered_alerts[:50]  # Limit to 50 alerts
        else:
            # Show all alerts but limit total
            return alerts[:100]  # Limit to 100 alerts

class ExtendedFrameworkAnalyzer:
    """Extended framework analyzer with fatigue management"""
    
    def __init__(self):
        self.owasp_mapper = OWASPTop10Mapper()
        self.stride_mapper = STRIDEMapper()
        self.nist_csf_mapper = NISTCSFMapper()
        self.atomic_mapper = AtomicRedTeamMapper()
        self.fatigue_manager = AnalystFatigueManager()
    
    def analyze_log_extended(self, log_data: Dict[str, Any], analyst_id: str = None) -> Dict[str, Any]:
        """Comprehensive log analysis with extended frameworks"""
        
        analysis = {
            "log_id": log_data.get("_id", "unknown"),
            "timestamp": datetime.utcnow().isoformat(),
            "frameworks": {}
        }
        
        # OWASP Top 10 Analysis
        owasp_vulnerabilities = self.owasp_mapper.map_log_to_owasp(log_data)
        analysis["frameworks"]["owasp_top_10"] = {
            "vulnerabilities": [
                {
                    "id": vuln.id,
                    "name": vuln.name,
                    "description": vuln.description,
                    "risk_level": vuln.risk_level,
                    "examples": vuln.examples,
                    "mitigations": vuln.mitigations
                }
                for vuln in owasp_vulnerabilities
            ],
            "total_vulnerabilities": len(owasp_vulnerabilities)
        }
        
        # STRIDE Analysis
        stride_threats = self.stride_mapper.map_log_to_stride(log_data)
        analysis["frameworks"]["stride"] = {
            "threats": [
                {
                    "category": threat.category,
                    "description": threat.description,
                    "impact": threat.impact,
                    "likelihood": threat.likelihood,
                    "mitigations": threat.mitigations
                }
                for threat in stride_threats
            ],
            "total_threats": len(stride_threats)
        }
        
        # NIST CSF Analysis
        nist_controls = self.nist_csf_mapper.map_log_to_nist_csf(log_data)
        analysis["frameworks"]["nist_csf"] = {
            "controls": [
                {
                    "id": control.id,
                    "function": control.function,
                    "category": control.category,
                    "description": control.description,
                    "implementation_tiers": control.implementation_tiers
                }
                for control in nist_controls
            ],
            "total_controls": len(nist_controls)
        }
        
        # Atomic Red Team Analysis
        atomic_techniques = self.atomic_mapper.map_log_to_atomic(log_data)
        analysis["frameworks"]["atomic_red_team"] = {
            "techniques": atomic_techniques,
            "total_techniques": len(atomic_techniques)
        }
        
        # Overall threat assessment
        analysis["threat_assessment"] = self._assess_extended_threat(analysis)
        
        # Analyst fatigue management
        if analyst_id:
            analysis["fatigue_management"] = {
                "analyst_id": analyst_id,
                "recommendations": self.fatigue_manager._get_fatigue_recommendations("Low", [])
            }
        
        return analysis
    
    def _assess_extended_threat(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall threat level across extended frameworks"""
        
        threat_score = 0
        threat_indicators = []
        
        # OWASP scoring
        owasp_data = analysis["frameworks"].get("owasp_top_10", {})
        for vuln in owasp_data.get("vulnerabilities", []):
            if vuln["risk_level"] == "Critical":
                threat_score += 4
                threat_indicators.append(f"Critical OWASP vulnerability: {vuln['name']}")
            elif vuln["risk_level"] == "High":
                threat_score += 3
                threat_indicators.append(f"High OWASP vulnerability: {vuln['name']}")
            elif vuln["risk_level"] == "Medium":
                threat_score += 2
        
        # STRIDE scoring
        stride_data = analysis["frameworks"].get("stride", {})
        for threat in stride_data.get("threats", []):
            if threat["likelihood"] == "High":
                threat_score += 3
                threat_indicators.append(f"High likelihood STRIDE threat: {threat['category']}")
            elif threat["likelihood"] == "Medium":
                threat_score += 2
        
        # Determine overall risk level
        if threat_score >= 8:
            risk_level = "Critical"
        elif threat_score >= 5:
            risk_level = "High"
        elif threat_score >= 3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            "risk_level": risk_level,
            "threat_score": threat_score,
            "threat_indicators": threat_indicators,
            "framework_coverage": len([f for f in analysis["frameworks"].keys() if analysis["frameworks"][f]])
        }

# Export main classes
__all__ = [
    'ExtendedFrameworkType',
    'OWASPVulnerability',
    'STRIDEThreat',
    'NISTCSFControl',
    'OWASPTop10Mapper',
    'STRIDEMapper',
    'NISTCSFMapper',
    'AtomicRedTeamMapper',
    'AnalystFatigueManager',
    'ExtendedFrameworkAnalyzer'
]
