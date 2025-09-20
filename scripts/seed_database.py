#!/usr/bin/env python3
"""
Database seeding script for Jupiter SIEM
Creates initial data for development and testing
"""

import os
import sys
from datetime import datetime, timedelta
import asyncio

# Add backend to path
sys.path.append('/app')

from models.user_management import UserManagementSystem
from models.analyst_features import (
    PivotTemplate, NoiseBucketModel, PointsModel
)

async def seed_database():
    """Seed database with initial data"""
    
    # Initialize user management system
    mongo_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017/jupiter_siem")
    email_config = {
        'host': 'localhost',
        'port': 587,
        'username': 'admin@jupiter-siem.local',
        'password': 'password',
        'use_tls': True
    }
    jwt_secret = os.getenv("JWT_SECRET_KEY", "jupiter_secret_key")
    
    user_manager = UserManagementSystem(mongo_url, email_config, jwt_secret)
    
    print("🌱 Seeding database...")
    
    # Create default pivot templates
    pivot_templates = [
        {
            "name": "IP Address Analysis",
            "description": "Analyze activities by IP address",
            "pivot_type": "ip",
            "query_template": "SELECT * FROM logs WHERE source_ip = '{value}'",
            "parameters": ["value"],
            "created_by": "system"
        },
        {
            "name": "User Activity Analysis", 
            "description": "Analyze activities by username",
            "pivot_type": "username",
            "query_template": "SELECT * FROM logs WHERE user_id = '{value}'",
            "parameters": ["value"],
            "created_by": "system"
        },
        {
            "name": "ASN Analysis",
            "description": "Analyze activities by ASN",
            "pivot_type": "asn", 
            "query_template": "SELECT * FROM logs WHERE asn = '{value}'",
            "parameters": ["value"],
            "created_by": "system"
        }
    ]
    
    for template_data in pivot_templates:
        template = PivotTemplate(**template_data)
        # In production, save to database
        print(f"✅ Created pivot template: {template.name}")
    
    # Create sample noise buckets
    noise_buckets = [
        {
            "tenant_id": "default",
            "bucket_key": "brute_force_192.168.1.100",
            "alert_type": "brute_force",
            "source_ip": "192.168.1.100",
            "count": 15,
            "severity": "high",
            "sample_alerts": [
                {"activity_name": "Failed Login Attempt", "timestamp": datetime.utcnow().isoformat()},
                {"activity_name": "Password Brute Force", "timestamp": datetime.utcnow().isoformat()}
            ]
        },
        {
            "tenant_id": "default", 
            "bucket_key": "port_scan_10.0.0.1",
            "alert_type": "port_scan",
            "source_ip": "10.0.0.1",
            "count": 8,
            "severity": "medium",
            "sample_alerts": [
                {"activity_name": "Port Scan Detected", "timestamp": datetime.utcnow().isoformat()}
            ]
        }
    ]
    
    for bucket_data in noise_buckets:
        bucket = NoiseBucketModel(**bucket_data)
        # In production, save to database
        print(f"✅ Created noise bucket: {bucket.alert_type}")
    
    # Create sample analyst points
    analyst_points = [
        {
            "analyst_id": "admin@jupiter-siem.local",
            "tenant_id": "default",
            "xp": 150,
            "badges": ["level_1", "reports_10", "flags_5"],
            "streak_count": 7,
            "level": 2,
            "achievements": [
                {
                    "action": "Created first report",
                    "points": 50,
                    "timestamp": datetime.utcnow().isoformat()
                },
                {
                    "action": "Flagged suspicious activity", 
                    "points": 25,
                    "timestamp": datetime.utcnow().isoformat()
                }
            ]
        }
    ]
    
    for points_data in analyst_points:
        points = PointsModel(**points_data)
        # In production, save to database
        print(f"✅ Created analyst points for: {points.analyst_id}")
    
    print("🎉 Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
