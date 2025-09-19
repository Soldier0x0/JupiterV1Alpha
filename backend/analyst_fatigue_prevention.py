#!/usr/bin/env python3
"""
Jupiter SIEM Analyst Fatigue Prevention System
Comprehensive system to prevent and manage analyst fatigue in SOC environments
"""

import json
import time
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import statistics

class FatigueLevel(Enum):
    """Analyst fatigue levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertPriority(Enum):
    """Alert priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

@dataclass
class AnalystProfile:
    """Analyst profile for fatigue management"""
    analyst_id: str
    name: str
    experience_level: str  # junior, mid, senior
    shift_start: datetime
    shift_end: datetime
    max_alerts_per_hour: int
    preferred_alert_types: List[str]
    fatigue_threshold: float

@dataclass
class AlertContext:
    """Contextual information for alerts"""
    alert_id: str
    timestamp: datetime
    severity: str
    category: str
    source_ip: str
    destination_ip: str
    user: str
    description: str
    framework_mappings: List[str]
    confidence_score: float
    false_positive_likelihood: float

class IntelligentAlertPrioritizer:
    """Intelligent alert prioritization to reduce noise"""
    
    def __init__(self):
        self.priority_weights = {
            'severity': 0.3,
            'confidence': 0.25,
            'context': 0.2,
            'frequency': 0.15,
            'analyst_experience': 0.1
        }
    
    def prioritize_alerts(self, alerts: List[AlertContext], analyst_profile: AnalystProfile) -> List[AlertContext]:
        """Prioritize alerts based on multiple factors"""
        
        # Calculate priority scores for each alert
        prioritized_alerts = []
        
        for alert in alerts:
            priority_score = self._calculate_priority_score(alert, analyst_profile)
            alert.priority_score = priority_score
            prioritized_alerts.append(alert)
        
        # Sort by priority score (highest first)
        prioritized_alerts.sort(key=lambda x: x.priority_score, reverse=True)
        
        # Apply analyst-specific filtering
        filtered_alerts = self._apply_analyst_filtering(prioritized_alerts, analyst_profile)
        
        return filtered_alerts
    
    def _calculate_priority_score(self, alert: AlertContext, analyst_profile: AnalystProfile) -> float:
        """Calculate priority score for an alert"""
        
        score = 0.0
        
        # Severity scoring
        severity_scores = {
            'Critical': 1.0,
            'High': 0.8,
            'Medium': 0.6,
            'Low': 0.4,
            'Info': 0.2
        }
        score += severity_scores.get(alert.severity, 0.2) * self.priority_weights['severity']
        
        # Confidence scoring
        score += alert.confidence_score * self.priority_weights['confidence']
        
        # Context scoring (based on framework mappings)
        context_score = min(len(alert.framework_mappings) / 5.0, 1.0)  # Normalize to 0-1
        score += context_score * self.priority_weights['context']
        
        # Frequency scoring (lower frequency = higher priority)
        frequency_score = 1.0 - alert.false_positive_likelihood
        score += frequency_score * self.priority_weights['frequency']
        
        # Analyst experience scoring
        experience_scores = {
            'junior': 0.8,  # Show more alerts to junior analysts
            'mid': 0.6,
            'senior': 0.4   # Show fewer, higher-quality alerts to senior analysts
        }
        score += experience_scores.get(analyst_profile.experience_level, 0.6) * self.priority_weights['analyst_experience']
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _apply_analyst_filtering(self, alerts: List[AlertContext], analyst_profile: AnalystProfile) -> List[AlertContext]:
        """Apply analyst-specific filtering"""
        
        # Calculate time-based filtering
        current_time = datetime.utcnow()
        shift_duration = (current_time - analyst_profile.shift_start).total_seconds() / 3600  # hours
        
        # Adjust filtering based on shift duration
        if shift_duration > 6:  # After 6 hours, be more selective
            max_alerts = analyst_profile.max_alerts_per_hour // 2
        else:
            max_alerts = analyst_profile.max_alerts_per_hour
        
        # Filter alerts based on analyst preferences and limits
        filtered_alerts = []
        for alert in alerts:
            if len(filtered_alerts) >= max_alerts:
                break
            
            # Check if alert type matches analyst preferences
            if alert.category in analyst_profile.preferred_alert_types or len(filtered_alerts) < max_alerts // 2:
                filtered_alerts.append(alert)
        
        return filtered_alerts

class ContextualAlertCorrelator:
    """Contextual alert correlation to reduce noise"""
    
    def __init__(self):
        self.correlation_rules = self._load_correlation_rules()
    
    def _load_correlation_rules(self) -> List[Dict[str, Any]]:
        """Load alert correlation rules"""
        return [
            {
                "name": "Brute Force Attack",
                "pattern": ["failed_login", "authentication_failure"],
                "threshold": 5,
                "time_window": 300,  # 5 minutes
                "correlation_action": "group_and_prioritize"
            },
            {
                "name": "Port Scan",
                "pattern": ["port_scan", "network_scan"],
                "threshold": 10,
                "time_window": 600,  # 10 minutes
                "correlation_action": "group_and_prioritize"
            },
            {
                "name": "Data Exfiltration",
                "pattern": ["large_data_transfer", "suspicious_upload"],
                "threshold": 3,
                "time_window": 1800,  # 30 minutes
                "correlation_action": "escalate"
            }
        ]
    
    def correlate_alerts(self, alerts: List[AlertContext]) -> List[Dict[str, Any]]:
        """Correlate related alerts to reduce noise"""
        
        correlated_groups = []
        processed_alerts = set()
        
        for rule in self.correlation_rules:
            matching_alerts = []
            
            for alert in alerts:
                if alert.alert_id in processed_alerts:
                    continue
                
                if any(pattern in alert.description.lower() for pattern in rule["pattern"]):
                    matching_alerts.append(alert)
            
            # Check if threshold is met
            if len(matching_alerts) >= rule["threshold"]:
                # Group alerts
                group = {
                    "correlation_name": rule["name"],
                    "alerts": matching_alerts,
                    "count": len(matching_alerts),
                    "time_window": rule["time_window"],
                    "action": rule["correlation_action"],
                    "priority": self._calculate_group_priority(matching_alerts)
                }
                
                correlated_groups.append(group)
                
                # Mark alerts as processed
                for alert in matching_alerts:
                    processed_alerts.add(alert.alert_id)
        
        return correlated_groups
    
    def _calculate_group_priority(self, alerts: List[AlertContext]) -> str:
        """Calculate priority for correlated alert group"""
        
        if not alerts:
            return "Low"
        
        # Use highest severity in the group
        severities = [alert.severity for alert in alerts]
        severity_priority = {
            'Critical': 4,
            'High': 3,
            'Medium': 2,
            'Low': 1,
            'Info': 0
        }
        
        max_severity_priority = max([severity_priority.get(s, 0) for s in severities])
        
        if max_severity_priority >= 4:
            return "Critical"
        elif max_severity_priority >= 3:
            return "High"
        elif max_severity_priority >= 2:
            return "Medium"
        else:
            return "Low"

class AdaptiveThresholdManager:
    """Adaptive threshold management to reduce false positives"""
    
    def __init__(self):
        self.threshold_history = {}
        self.learning_rate = 0.1
    
    def adjust_thresholds(self, alert_type: str, false_positive_rate: float, analyst_feedback: Optional[Dict[str, Any]] = None) -> Dict[str, float]:
        """Adjust thresholds based on false positive rate and analyst feedback"""
        
        if alert_type not in self.threshold_history:
            self.threshold_history[alert_type] = {
                'current_threshold': 0.5,
                'false_positive_rate': 0.0,
                'adjustment_count': 0
            }
        
        history = self.threshold_history[alert_type]
        
        # Calculate adjustment based on false positive rate
        if false_positive_rate > 0.3:  # High false positive rate
            adjustment = 0.1  # Increase threshold
        elif false_positive_rate < 0.1:  # Low false positive rate
            adjustment = -0.05  # Decrease threshold
        else:
            adjustment = 0  # No adjustment needed
        
        # Apply analyst feedback if available
        if analyst_feedback:
            if analyst_feedback.get('too_many_alerts', False):
                adjustment += 0.05
            elif analyst_feedback.get('missed_important_alerts', False):
                adjustment -= 0.05
        
        # Update threshold
        new_threshold = max(0.1, min(0.9, history['current_threshold'] + adjustment))
        history['current_threshold'] = new_threshold
        history['false_positive_rate'] = false_positive_rate
        history['adjustment_count'] += 1
        
        return {
            'alert_type': alert_type,
            'old_threshold': history['current_threshold'] - adjustment,
            'new_threshold': new_threshold,
            'adjustment': adjustment,
            'false_positive_rate': false_positive_rate
        }
    
    def get_optimal_threshold(self, alert_type: str) -> float:
        """Get optimal threshold for alert type"""
        return self.threshold_history.get(alert_type, {}).get('current_threshold', 0.5)

class AnalystFatigueMonitor:
    """Real-time analyst fatigue monitoring"""
    
    def __init__(self):
        self.analyst_sessions = {}
        self.fatigue_indicators = {
            'alert_processing_time': 30,  # seconds per alert
            'decision_fatigue_threshold': 50,  # decisions per hour
            'attention_span': 45,  # minutes
            'break_frequency': 2  # hours
        }
    
    def monitor_analyst_session(self, analyst_id: str, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Monitor analyst session for fatigue indicators"""
        
        if analyst_id not in self.analyst_sessions:
            self.analyst_sessions[analyst_id] = {
                'session_start': datetime.utcnow(),
                'alerts_processed': 0,
                'decisions_made': 0,
                'break_taken': False,
                'last_break': None,
                'processing_times': [],
                'fatigue_score': 0.0
            }
        
        session = self.analyst_sessions[analyst_id]
        current_time = datetime.utcnow()
        session_duration = (current_time - session['session_start']).total_seconds() / 3600  # hours
        
        # Update session data
        session['alerts_processed'] += session_data.get('alerts_processed', 0)
        session['decisions_made'] += session_data.get('decisions_made', 0)
        
        if session_data.get('break_taken', False):
            session['break_taken'] = True
            session['last_break'] = current_time
        
        if 'processing_time' in session_data:
            session['processing_times'].append(session_data['processing_time'])
        
        # Calculate fatigue indicators
        fatigue_indicators = self._calculate_fatigue_indicators(session, session_duration)
        
        # Update fatigue score
        session['fatigue_score'] = self._calculate_fatigue_score(fatigue_indicators)
        
        return {
            'analyst_id': analyst_id,
            'session_duration_hours': session_duration,
            'fatigue_score': session['fatigue_score'],
            'fatigue_level': self._get_fatigue_level(session['fatigue_score']),
            'indicators': fatigue_indicators,
            'recommendations': self._get_fatigue_recommendations(session['fatigue_score'], fatigue_indicators)
        }
    
    def _calculate_fatigue_indicators(self, session: Dict[str, Any], session_duration: float) -> Dict[str, Any]:
        """Calculate fatigue indicators"""
        
        indicators = {}
        
        # Alert processing rate
        if session_duration > 0:
            alerts_per_hour = session['alerts_processed'] / session_duration
            indicators['alerts_per_hour'] = alerts_per_hour
            indicators['high_alert_volume'] = alerts_per_hour > 50
        
        # Decision fatigue
        if session_duration > 0:
            decisions_per_hour = session['decisions_made'] / session_duration
            indicators['decisions_per_hour'] = decisions_per_hour
            indicators['decision_fatigue'] = decisions_per_hour > self.fatigue_indicators['decision_fatigue_threshold']
        
        # Processing time degradation
        if len(session['processing_times']) > 5:
            recent_times = session['processing_times'][-5:]
            avg_recent_time = statistics.mean(recent_times)
            indicators['processing_time_degradation'] = avg_recent_time > self.fatigue_indicators['alert_processing_time']
        
        # Break frequency
        if session['last_break']:
            time_since_break = (datetime.utcnow() - session['last_break']).total_seconds() / 3600
            indicators['time_since_break'] = time_since_break
            indicators['needs_break'] = time_since_break > self.fatigue_indicators['break_frequency']
        else:
            indicators['needs_break'] = session_duration > self.fatigue_indicators['break_frequency']
        
        return indicators
    
    def _calculate_fatigue_score(self, indicators: Dict[str, Any]) -> float:
        """Calculate overall fatigue score"""
        
        score = 0.0
        
        if indicators.get('high_alert_volume', False):
            score += 0.3
        
        if indicators.get('decision_fatigue', False):
            score += 0.3
        
        if indicators.get('processing_time_degradation', False):
            score += 0.2
        
        if indicators.get('needs_break', False):
            score += 0.2
        
        return min(score, 1.0)
    
    def _get_fatigue_level(self, fatigue_score: float) -> str:
        """Get fatigue level from score"""
        
        if fatigue_score >= 0.8:
            return "Critical"
        elif fatigue_score >= 0.6:
            return "High"
        elif fatigue_score >= 0.4:
            return "Medium"
        else:
            return "Low"
    
    def _get_fatigue_recommendations(self, fatigue_score: float, indicators: Dict[str, Any]) -> List[str]:
        """Get recommendations based on fatigue level and indicators"""
        
        recommendations = []
        
        if fatigue_score >= 0.8:
            recommendations.extend([
                "Immediate break required",
                "Reduce alert volume by 50%",
                "Enable automated response for low-risk alerts",
                "Consider shift rotation"
            ])
        elif fatigue_score >= 0.6:
            recommendations.extend([
                "Take a 15-minute break",
                "Reduce alert volume by 25%",
                "Focus on high-priority alerts only"
            ])
        elif fatigue_score >= 0.4:
            recommendations.extend([
                "Consider taking a short break",
                "Review alert filtering rules"
            ])
        
        if indicators.get('needs_break', False):
            recommendations.append("Schedule a break within 30 minutes")
        
        if indicators.get('high_alert_volume', False):
            recommendations.append("Implement alert batching and prioritization")
        
        if indicators.get('decision_fatigue', False):
            recommendations.append("Use automated triage for routine decisions")
        
        return list(set(recommendations))  # Remove duplicates

class SmartAlertPresentation:
    """Smart alert presentation to reduce cognitive load"""
    
    def __init__(self):
        self.presentation_modes = {
            'summary': 'Show only key information',
            'detailed': 'Show full alert details',
            'contextual': 'Show with relevant context',
            'minimal': 'Show minimal information'
        }
    
    def optimize_alert_display(self, alerts: List[AlertContext], analyst_profile: AnalystProfile, fatigue_level: str) -> List[Dict[str, Any]]:
        """Optimize alert display based on analyst state"""
        
        optimized_alerts = []
        
        for alert in alerts:
            # Choose presentation mode based on fatigue level
            if fatigue_level == "Critical":
                presentation_mode = "minimal"
            elif fatigue_level == "High":
                presentation_mode = "summary"
            elif fatigue_level == "Medium":
                presentation_mode = "contextual"
            else:
                presentation_mode = "detailed"
            
            # Create optimized alert display
            optimized_alert = self._create_optimized_display(alert, presentation_mode, analyst_profile)
            optimized_alerts.append(optimized_alert)
        
        return optimized_alerts
    
    def _create_optimized_display(self, alert: AlertContext, mode: str, analyst_profile: AnalystProfile) -> Dict[str, Any]:
        """Create optimized alert display based on mode"""
        
        base_display = {
            'alert_id': alert.alert_id,
            'timestamp': alert.timestamp.isoformat(),
            'severity': alert.severity,
            'priority_score': getattr(alert, 'priority_score', 0.5)
        }
        
        if mode == "minimal":
            base_display.update({
                'description': alert.description[:100] + "..." if len(alert.description) > 100 else alert.description,
                'action_required': self._get_quick_action(alert)
            })
        elif mode == "summary":
            base_display.update({
                'description': alert.description,
                'source_ip': alert.source_ip,
                'destination_ip': alert.destination_ip,
                'framework_mappings': alert.framework_mappings[:3],  # Show only top 3
                'action_required': self._get_quick_action(alert)
            })
        elif mode == "contextual":
            base_display.update({
                'description': alert.description,
                'source_ip': alert.source_ip,
                'destination_ip': alert.destination_ip,
                'user': alert.user,
                'framework_mappings': alert.framework_mappings,
                'confidence_score': alert.confidence_score,
                'context': self._get_alert_context(alert),
                'action_required': self._get_quick_action(alert)
            })
        else:  # detailed
            base_display.update({
                'description': alert.description,
                'source_ip': alert.source_ip,
                'destination_ip': alert.destination_ip,
                'user': alert.user,
                'framework_mappings': alert.framework_mappings,
                'confidence_score': alert.confidence_score,
                'false_positive_likelihood': alert.false_positive_likelihood,
                'context': self._get_alert_context(alert),
                'recommended_actions': self._get_recommended_actions(alert),
                'action_required': self._get_quick_action(alert)
            })
        
        return base_display
    
    def _get_quick_action(self, alert: AlertContext) -> str:
        """Get quick action for alert"""
        
        if alert.severity == "Critical":
            return "Investigate immediately"
        elif alert.severity == "High":
            return "Review within 1 hour"
        elif alert.severity == "Medium":
            return "Review within 4 hours"
        else:
            return "Review when possible"
    
    def _get_alert_context(self, alert: AlertContext) -> Dict[str, Any]:
        """Get contextual information for alert"""
        
        return {
            'time_of_day': alert.timestamp.hour,
            'day_of_week': alert.timestamp.weekday(),
            'framework_count': len(alert.framework_mappings),
            'confidence_level': 'High' if alert.confidence_score > 0.8 else 'Medium' if alert.confidence_score > 0.5 else 'Low'
        }
    
    def _get_recommended_actions(self, alert: AlertContext) -> List[str]:
        """Get recommended actions for alert"""
        
        actions = []
        
        if 'injection' in alert.description.lower():
            actions.extend([
                "Check application logs",
                "Review input validation",
                "Scan for SQL injection patterns"
            ])
        elif 'brute_force' in alert.description.lower():
            actions.extend([
                "Check authentication logs",
                "Review failed login attempts",
                "Consider IP blocking"
            ])
        elif 'malware' in alert.description.lower():
            actions.extend([
                "Isolate affected system",
                "Run antivirus scan",
                "Check network traffic"
            ])
        
        return actions

# Export main classes
__all__ = [
    'FatigueLevel',
    'AlertPriority',
    'AnalystProfile',
    'AlertContext',
    'IntelligentAlertPrioritizer',
    'ContextualAlertCorrelator',
    'AdaptiveThresholdManager',
    'AnalystFatigueMonitor',
    'SmartAlertPresentation'
]
