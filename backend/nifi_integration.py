# Apache NiFi Integration for JupiterEmerge SIEM
import requests
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import aiohttp
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class NiFiConfig:
    base_url: str
    username: str
    password: str
    process_group_id: str
    input_port: str
    output_port: str

class NiFiIntegration:
    def __init__(self, config: NiFiConfig):
        self.config = config
        self.session = requests.Session()
        self.session.auth = (config.username, config.password)
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def get_access_token(self) -> Optional[str]:
        """Get NiFi access token for authentication"""
        try:
            auth_url = f"{self.config.base_url}/nifi-api/access/token"
            auth_data = {
                "username": self.config.username,
                "password": self.config.password
            }
            
            response = self.session.post(auth_url, json=auth_data)
            if response.status_code == 200:
                return response.text.strip('"')
            else:
                logger.error(f"Failed to get access token: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting access token: {e}")
            return None
    
    def create_evtx_to_ocsf_flow(self) -> Dict[str, Any]:
        """Create NiFi flow for EVTX to OCSF transformation"""
        try:
            # Get access token
            token = self.get_access_token()
            if not token:
                return {"success": False, "error": "Failed to get access token"}
            
            # Update session with token
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            
            # Create the flow
            flow_definition = self._get_evtx_to_ocsf_flow_definition()
            
            # Deploy the flow
            deploy_url = f"{self.config.base_url}/nifi-api/process-groups/{self.config.process_group_id}/template-instance"
            
            response = self.session.post(deploy_url, json=flow_definition)
            
            if response.status_code == 201:
                logger.info("EVTX to OCSF flow created successfully")
                return {
                    "success": True,
                    "flow_id": response.json().get("id"),
                    "message": "Flow created successfully"
                }
            else:
                logger.error(f"Failed to create flow: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Failed to create flow: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error creating EVTX to OCSF flow: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_evtx_to_ocsf_flow_definition(self) -> Dict[str, Any]:
        """Get the flow definition for EVTX to OCSF transformation"""
        return {
            "templateId": None,
            "originX": 100.0,
            "originY": 100.0,
            "processGroups": [
                {
                    "name": "EVTX to OCSF Transformation",
                    "position": {"x": 100.0, "y": 100.0},
                    "processors": [
                        {
                            "name": "GetFile",
                            "type": "org.apache.nifi.processors.standard.GetFile",
                            "position": {"x": 100.0, "y": 100.0},
                            "properties": {
                                "Input Directory": "/var/log/evtx",
                                "File Filter": "*.evtx",
                                "Keep Source File": "false"
                            }
                        },
                        {
                            "name": "ConvertEVTX",
                            "type": "org.apache.nifi.processors.standard.ExecuteScript",
                            "position": {"x": 300.0, "y": 100.0},
                            "properties": {
                                "Script Engine": "python",
                                "Script Body": self._get_evtx_conversion_script()
                            }
                        },
                        {
                            "name": "TransformToOCSF",
                            "type": "org.apache.nifi.processors.standard.ExecuteScript",
                            "position": {"x": 500.0, "y": 100.0},
                            "properties": {
                                "Script Engine": "python",
                                "Script Body": self._get_ocsf_transformation_script()
                            }
                        },
                        {
                            "name": "ValidateOCSF",
                            "type": "org.apache.nifi.processors.standard.ExecuteScript",
                            "position": {"x": 700.0, "y": 100.0},
                            "properties": {
                                "Script Engine": "python",
                                "Script Body": self._get_ocsf_validation_script()
                            }
                        },
                        {
                            "name": "PutKafka",
                            "type": "org.apache.nifi.processors.kafka.pubsub.PublishKafka",
                            "position": {"x": 900.0, "y": 100.0},
                            "properties": {
                                "Kafka Brokers": "localhost:9092",
                                "Topic Name": "ocsf-logs",
                                "Delivery Guarantee": "BEST_EFFORT"
                            }
                        }
                    ],
                    "connections": [
                        {
                            "name": "GetFile to ConvertEVTX",
                            "source": {"id": "GetFile", "type": "PROCESSOR"},
                            "destination": {"id": "ConvertEVTX", "type": "PROCESSOR"},
                            "selectedRelationships": ["success"]
                        },
                        {
                            "name": "ConvertEVTX to TransformToOCSF",
                            "source": {"id": "ConvertEVTX", "type": "PROCESSOR"},
                            "destination": {"id": "TransformToOCSF", "type": "PROCESSOR"},
                            "selectedRelationships": ["success"]
                        },
                        {
                            "name": "TransformToOCSF to ValidateOCSF",
                            "source": {"id": "TransformToOCSF", "type": "PROCESSOR"},
                            "destination": {"id": "ValidateOCSF", "type": "PROCESSOR"},
                            "selectedRelationships": ["success"]
                        },
                        {
                            "name": "ValidateOCSF to PutKafka",
                            "source": {"id": "ValidateOCSF", "type": "PROCESSOR"},
                            "destination": {"id": "PutKafka", "type": "PROCESSOR"},
                            "selectedRelationships": ["success"]
                        }
                    ]
                }
            ]
        }
    
    def _get_evtx_conversion_script(self) -> str:
        """Get Python script for EVTX conversion"""
        return '''
import json
import xml.etree.ElementTree as ET
from flowfile import FlowFile

def process(session):
    flowfile = session.get()
    if flowfile is None:
        return
    
    try:
        # Read EVTX file content
        content = flowfile.getContentsAsBytes()
        
        # Convert EVTX to JSON (simplified - in production use python-evtx)
        # This is a placeholder - you'd need to implement actual EVTX parsing
        evtx_data = {
            "event_id": 4625,
            "event_type": "Logon",
            "timestamp": "2024-01-15T10:30:00Z",
            "computer": "WORKSTATION-01",
            "user": "john.doe",
            "source_ip": "192.168.1.100",
            "logon_type": 3,
            "status": "Failure"
        }
        
        # Write JSON to flowfile
        session.write(flowfile, json.dumps(evtx_data).encode('utf-8'))
        session.transfer(flowfile, REL_SUCCESS)
        
    except Exception as e:
        session.transfer(flowfile, REL_FAILURE)
        '''
    
    def _get_ocsf_transformation_script(self) -> str:
        """Get Python script for OCSF transformation"""
        return '''
import json
from flowfile import FlowFile

def process(session):
    flowfile = session.get()
    if flowfile is None:
        return
    
    try:
        # Read JSON content
        content = flowfile.getContentsAsBytes().decode('utf-8')
        evtx_data = json.loads(content)
        
        # Transform to OCSF format
        ocsf_data = {
            "activity_id": 1,
            "activity_name": "failed_login",
            "category_uid": 1,
            "class_uid": 1001,
            "severity_id": 2,
            "severity": "medium",
            "time": evtx_data.get("timestamp"),
            "user": {
                "name": evtx_data.get("user"),
                "type": "User"
            },
            "device": {
                "name": evtx_data.get("computer"),
                "type": "Workstation"
            },
            "src_endpoint": {
                "ip": evtx_data.get("source_ip")
            },
            "metadata": {
                "original_event_id": evtx_data.get("event_id"),
                "logon_type": evtx_data.get("logon_type"),
                "status": evtx_data.get("status")
            }
        }
        
        # Write OCSF JSON to flowfile
        session.write(flowfile, json.dumps(ocsf_data).encode('utf-8'))
        session.transfer(flowfile, REL_SUCCESS)
        
    except Exception as e:
        session.transfer(flowfile, REL_FAILURE)
        '''
    
    def _get_ocsf_validation_script(self) -> str:
        """Get Python script for OCSF validation"""
        return '''
import json
from flowfile import FlowFile

def process(session):
    flowfile = session.get()
    if flowfile is None:
        return
    
    try:
        # Read OCSF content
        content = flowfile.getContentsAsBytes().decode('utf-8')
        ocsf_data = json.loads(content)
        
        # Validate required OCSF fields
        required_fields = ["activity_id", "activity_name", "time"]
        missing_fields = [field for field in required_fields if field not in ocsf_data]
        
        if missing_fields:
            # Add validation error
            ocsf_data["validation_errors"] = f"Missing required fields: {missing_fields}"
            session.write(flowfile, json.dumps(ocsf_data).encode('utf-8'))
            session.transfer(flowfile, REL_FAILURE)
        else:
            # Validation passed
            session.transfer(flowfile, REL_SUCCESS)
        
    except Exception as e:
        session.transfer(flowfile, REL_FAILURE)
        '''
    
    def get_flow_status(self, flow_id: str) -> Dict[str, Any]:
        """Get status of a NiFi flow"""
        try:
            token = self.get_access_token()
            if not token:
                return {"success": False, "error": "Failed to get access token"}
            
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            
            status_url = f"{self.config.base_url}/nifi-api/process-groups/{flow_id}"
            response = self.session.get(status_url)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "status": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to get flow status: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error getting flow status: {e}")
            return {"success": False, "error": str(e)}
    
    def start_flow(self, flow_id: str) -> Dict[str, Any]:
        """Start a NiFi flow"""
        try:
            token = self.get_access_token()
            if not token:
                return {"success": False, "error": "Failed to get access token"}
            
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            
            start_url = f"{self.config.base_url}/nifi-api/process-groups/{flow_id}"
            start_data = {
                "id": flow_id,
                "state": "RUNNING"
            }
            
            response = self.session.put(start_url, json=start_data)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Flow started successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to start flow: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error starting flow: {e}")
            return {"success": False, "error": str(e)}
    
    def stop_flow(self, flow_id: str) -> Dict[str, Any]:
        """Stop a NiFi flow"""
        try:
            token = self.get_access_token()
            if not token:
                return {"success": False, "error": "Failed to get access token"}
            
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            
            stop_url = f"{self.config.base_url}/nifi-api/process-groups/{flow_id}"
            stop_data = {
                "id": flow_id,
                "state": "STOPPED"
            }
            
            response = self.session.put(stop_url, json=stop_data)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Flow stopped successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to stop flow: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error stopping flow: {e}")
            return {"success": False, "error": str(e)}
    
    def get_flow_metrics(self, flow_id: str) -> Dict[str, Any]:
        """Get metrics for a NiFi flow"""
        try:
            token = self.get_access_token()
            if not token:
                return {"success": False, "error": "Failed to get access token"}
            
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            
            metrics_url = f"{self.config.base_url}/nifi-api/process-groups/{flow_id}/status"
            response = self.session.get(metrics_url)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "metrics": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to get flow metrics: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error getting flow metrics: {e}")
            return {"success": False, "error": str(e)}

# OCSF Schema Validator
class OCSFValidator:
    """Validate data against OCSF schema"""
    
    def __init__(self):
        self.required_fields = {
            "activity_id": int,
            "activity_name": str,
            "category_uid": int,
            "class_uid": int,
            "time": str
        }
        
        self.optional_fields = {
            "severity_id": int,
            "severity": str,
            "user": dict,
            "device": dict,
            "src_endpoint": dict,
            "dst_endpoint": dict,
            "file": dict,
            "process": dict,
            "registry": dict,
            "dns": dict,
            "http": dict
        }
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate data against OCSF schema"""
        errors = []
        warnings = []
        
        # Check required fields
        for field, field_type in self.required_fields.items():
            if field not in data:
                errors.append(f"Missing required field: {field}")
            elif not isinstance(data[field], field_type):
                errors.append(f"Invalid type for {field}: expected {field_type.__name__}")
        
        # Check optional fields
        for field, field_type in self.optional_fields.items():
            if field in data and not isinstance(data[field], field_type):
                warnings.append(f"Invalid type for {field}: expected {field_type.__name__}")
        
        # Validate timestamp format
        if "time" in data:
            try:
                datetime.fromisoformat(data["time"].replace('Z', '+00:00'))
            except ValueError:
                errors.append("Invalid timestamp format")
        
        # Validate severity values
        if "severity" in data:
            valid_severities = ["low", "medium", "high", "critical"]
            if data["severity"] not in valid_severities:
                warnings.append(f"Invalid severity value: {data['severity']}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

# Global NiFi integration instance
nifi_integration = None

def initialize_nifi_integration(config: Dict[str, Any]) -> Optional[NiFiIntegration]:
    """Initialize NiFi integration"""
    global nifi_integration
    
    try:
        nifi_config = NiFiConfig(
            base_url=config.get("base_url", "http://localhost:8080"),
            username=config.get("username", "admin"),
            password=config.get("password", "admin"),
            process_group_id=config.get("process_group_id", "root"),
            input_port=config.get("input_port", "input"),
            output_port=config.get("output_port", "output")
        )
        
        nifi_integration = NiFiIntegration(nifi_config)
        logger.info("NiFi integration initialized successfully")
        return nifi_integration
        
    except Exception as e:
        logger.error(f"Failed to initialize NiFi integration: {e}")
        return None

def get_nifi_integration() -> Optional[NiFiIntegration]:
    """Get the global NiFi integration instance"""
    return nifi_integration
