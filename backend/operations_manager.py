#!/usr/bin/env python3
"""
Jupiter SIEM Operations & Disaster Recovery Manager
Handles backup, monitoring, health checks, and disaster recovery operations
"""

import asyncio
import logging
import os
import shutil
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field
from pathlib import Path
import subprocess
import tarfile
import gzip

logger = logging.getLogger(__name__)

class ServiceStatus(str, Enum):
    """Service status types"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    DOWN = "down"
    UNKNOWN = "unknown"

class BackupType(str, Enum):
    """Backup types"""
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

class BackupStatus(str, Enum):
    """Backup operation status"""
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SCHEDULED = "scheduled"

@dataclass
class HealthCheck:
    """Health check definition"""
    name: str
    component: str
    check_type: str  # "http", "tcp", "command", "database"
    target: str
    timeout: int = 30
    interval: int = 60
    retries: int = 3
    enabled: bool = True

@dataclass
class ServiceHealth:
    """Service health status"""
    name: str
    status: ServiceStatus
    last_check: datetime
    response_time: float
    error_message: Optional[str] = None
    metrics: Dict[str, Any] = field(default_factory=dict)

@dataclass
class BackupJob:
    """Backup job definition"""
    id: str
    name: str
    backup_type: BackupType
    source_path: str
    destination_path: str
    schedule: str  # cron format
    retention_days: int = 30
    compression: bool = True
    encryption: bool = False
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

@dataclass
class BackupExecution:
    """Backup execution record"""
    id: str
    job_id: str
    status: BackupStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    files_count: int = 0
    size_bytes: int = 0
    compressed_size_bytes: int = 0
    error_message: Optional[str] = None

class OperationsManager:
    """Jupiter SIEM Operations & Disaster Recovery Manager"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.backup_dir = Path(config.get("backup_dir", "/app/backups"))
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        self.health_checks = {}
        self.service_health = {}
        self.backup_jobs = {}
        self.backup_executions = {}
        
        self._initialize_health_checks()
        self._initialize_backup_jobs()
    
    def _initialize_health_checks(self):
        """Initialize health check definitions"""
        
        health_checks = [
            HealthCheck(
                name="clickhouse_http",
                component="clickhouse",
                check_type="http",
                target="http://clickhouse:8123/ping",
                timeout=10,
                interval=60
            ),
            HealthCheck(
                name="mongodb_tcp",
                component="mongodb", 
                check_type="tcp",
                target="mongodb:27017",
                timeout=10,
                interval=60
            ),
            HealthCheck(
                name="redis_tcp",
                component="redis",
                check_type="tcp", 
                target="redis:6379",
                timeout=5,
                interval=30
            ),
            HealthCheck(
                name="vector_api",
                component="vector",
                check_type="http",
                target="http://vector:8686/health",
                timeout=10,
                interval=60
            ),
            HealthCheck(
                name="backend_api",
                component="backend",
                check_type="http",
                target="http://backend:8001/api/health",
                timeout=10,
                interval=30
            ),
            HealthCheck(
                name="frontend_web",
                component="frontend",
                check_type="http",
                target="http://frontend:80",
                timeout=10,
                interval=60
            ),
            HealthCheck(
                name="n8n_api",
                component="n8n",
                check_type="http",
                target="http://n8n:5678",
                timeout=15,
                interval=120
            ),
            HealthCheck(
                name="grafana_web",
                component="grafana",
                check_type="http",
                target="http://grafana:3000",
                timeout=10,
                interval=120
            ),
            HealthCheck(
                name="disk_space",
                component="system",
                check_type="command",
                target="df -h / | awk 'NR==2 {print $5}' | sed 's/%//'",
                timeout=5,
                interval=300  # 5 minutes
            ),
            HealthCheck(
                name="memory_usage",
                component="system",
                check_type="command",
                target="free | awk 'NR==2{printf \"%.2f\", $3*100/$2}'",
                timeout=5,
                interval=60
            )
        ]
        
        self.health_checks = {hc.name: hc for hc in health_checks}
    
    def _initialize_backup_jobs(self):
        """Initialize backup job definitions"""
        
        jobs = [
            BackupJob(
                id="clickhouse_daily",
                name="ClickHouse Daily Backup",
                backup_type=BackupType.FULL,
                source_path="/var/lib/clickhouse",
                destination_path=str(self.backup_dir / "clickhouse"),
                schedule="0 2 * * *",  # Daily at 2 AM
                retention_days=30,
                compression=True
            ),
            BackupJob(
                id="mongodb_daily",
                name="MongoDB Daily Backup", 
                backup_type=BackupType.FULL,
                source_path="mongodb://mongodb:27017",  # Special handling for MongoDB
                destination_path=str(self.backup_dir / "mongodb"),
                schedule="0 3 * * *",  # Daily at 3 AM
                retention_days=30,
                compression=True
            ),
            BackupJob(
                id="config_daily",
                name="Configuration Files Backup",
                backup_type=BackupType.FULL,
                source_path="/app/config",
                destination_path=str(self.backup_dir / "config"),
                schedule="0 1 * * *",  # Daily at 1 AM
                retention_days=90,
                compression=True
            ),
            BackupJob(
                id="logs_weekly",
                name="Logs Weekly Archive",
                backup_type=BackupType.FULL,
                source_path="/app/logs",
                destination_path=str(self.backup_dir / "logs"),
                schedule="0 0 * * 0",  # Weekly on Sunday
                retention_days=365,
                compression=True
            )
        ]
        
        self.backup_jobs = {job.id: job for job in jobs}
    
    async def run_health_checks(self) -> Dict[str, ServiceHealth]:
        """Run all enabled health checks"""
        results = {}
        
        for check_name, health_check in self.health_checks.items():
            if not health_check.enabled:
                continue
            
            try:
                result = await self._execute_health_check(health_check)
                results[check_name] = result
                self.service_health[check_name] = result
            except Exception as e:
                logger.error(f"Health check {check_name} failed: {e}")
                error_result = ServiceHealth(
                    name=health_check.name,
                    status=ServiceStatus.UNKNOWN,
                    last_check=datetime.now(),
                    response_time=0.0,
                    error_message=str(e)
                )
                results[check_name] = error_result
                self.service_health[check_name] = error_result
        
        return results
    
    async def _execute_health_check(self, check: HealthCheck) -> ServiceHealth:
        """Execute individual health check"""
        start_time = datetime.now()
        
        try:
            if check.check_type == "http":
                result = await self._http_health_check(check)
            elif check.check_type == "tcp":
                result = await self._tcp_health_check(check)
            elif check.check_type == "command":
                result = await self._command_health_check(check)
            elif check.check_type == "database":
                result = await self._database_health_check(check)
            else:
                raise ValueError(f"Unknown check type: {check.check_type}")
            
            response_time = (datetime.now() - start_time).total_seconds()
            
            return ServiceHealth(
                name=check.name,
                status=result.get("status", ServiceStatus.HEALTHY),
                last_check=datetime.now(),
                response_time=response_time,
                metrics=result.get("metrics", {})
            )
        
        except Exception as e:
            response_time = (datetime.now() - start_time).total_seconds()
            return ServiceHealth(
                name=check.name,
                status=ServiceStatus.UNHEALTHY,
                last_check=datetime.now(),
                response_time=response_time,
                error_message=str(e)
            )
    
    async def _http_health_check(self, check: HealthCheck) -> Dict[str, Any]:
        """HTTP-based health check"""
        import aiohttp
        
        timeout = aiohttp.ClientTimeout(total=check.timeout)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(check.target) as response:
                if response.status == 200:
                    return {"status": ServiceStatus.HEALTHY}
                elif response.status < 500:
                    return {"status": ServiceStatus.DEGRADED}
                else:
                    return {"status": ServiceStatus.UNHEALTHY}
    
    async def _tcp_health_check(self, check: HealthCheck) -> Dict[str, Any]:
        """TCP port health check"""
        host, port = check.target.split(":")
        port = int(port)
        
        try:
            future = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(future, timeout=check.timeout)
            writer.close()
            await writer.wait_closed()
            return {"status": ServiceStatus.HEALTHY}
        except asyncio.TimeoutError:
            return {"status": ServiceStatus.DEGRADED}
        except Exception:
            return {"status": ServiceStatus.UNHEALTHY}
    
    async def _command_health_check(self, check: HealthCheck) -> Dict[str, Any]:
        """Command-based health check"""
        try:
            process = await asyncio.create_subprocess_shell(
                check.target,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=check.timeout
            )
            
            if process.returncode == 0:
                output = stdout.decode().strip()
                
                # Parse specific metrics
                metrics = {}
                if check.name == "disk_space":
                    usage_pct = float(output)
                    metrics["disk_usage_percent"] = usage_pct
                    if usage_pct > 90:
                        status = ServiceStatus.UNHEALTHY
                    elif usage_pct > 80:
                        status = ServiceStatus.DEGRADED
                    else:
                        status = ServiceStatus.HEALTHY
                elif check.name == "memory_usage":
                    usage_pct = float(output)
                    metrics["memory_usage_percent"] = usage_pct
                    if usage_pct > 95:
                        status = ServiceStatus.UNHEALTHY
                    elif usage_pct > 85:
                        status = ServiceStatus.DEGRADED
                    else:
                        status = ServiceStatus.HEALTHY
                else:
                    status = ServiceStatus.HEALTHY
                
                return {"status": status, "metrics": metrics}
            else:
                return {"status": ServiceStatus.UNHEALTHY}
        
        except asyncio.TimeoutError:
            return {"status": ServiceStatus.DEGRADED}
        except Exception as e:
            return {"status": ServiceStatus.UNHEALTHY}
    
    async def _database_health_check(self, check: HealthCheck) -> Dict[str, Any]:
        """Database-specific health check"""
        # Implementation would depend on database type
        return {"status": ServiceStatus.HEALTHY}
    
    async def execute_backup(self, job_id: str) -> BackupExecution:
        """Execute backup job"""
        if job_id not in self.backup_jobs:
            raise ValueError(f"Backup job {job_id} not found")
        
        job = self.backup_jobs[job_id]
        execution_id = f"backup_{job_id}_{int(datetime.now().timestamp())}"
        
        execution = BackupExecution(
            id=execution_id,
            job_id=job_id,
            status=BackupStatus.RUNNING,
            started_at=datetime.now()
        )
        
        self.backup_executions[execution_id] = execution
        
        try:
            logger.info(f"Starting backup job: {job.name}")
            
            # Create timestamped backup directory
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = Path(job.destination_path) / f"{job.name}_{timestamp}"
            backup_path.mkdir(parents=True, exist_ok=True)
            
            if job.source_path.startswith("mongodb://"):
                # Special handling for MongoDB
                await self._backup_mongodb(job, backup_path, execution)
            else:
                # File system backup
                await self._backup_filesystem(job, backup_path, execution)
            
            # Compression
            if job.compression:
                compressed_path = await self._compress_backup(backup_path)
                # Remove uncompressed backup
                shutil.rmtree(backup_path)
                backup_path = compressed_path
                execution.compressed_size_bytes = backup_path.stat().st_size
            
            # Update execution
            execution.status = BackupStatus.COMPLETED
            execution.completed_at = datetime.now()
            execution.duration_seconds = (execution.completed_at - execution.started_at).total_seconds()
            
            # Update job
            job.last_run = execution.completed_at
            
            # Cleanup old backups
            await self._cleanup_old_backups(job)
            
            logger.info(f"Backup completed: {job.name} ({execution.duration_seconds:.1f}s)")
            
        except Exception as e:
            logger.error(f"Backup failed for {job.name}: {e}")
            execution.status = BackupStatus.FAILED
            execution.completed_at = datetime.now()
            execution.error_message = str(e)
        
        return execution
    
    async def _backup_filesystem(self, job: BackupJob, backup_path: Path, execution: BackupExecution):
        """Backup filesystem using tar"""
        source_path = Path(job.source_path)
        
        if not source_path.exists():
            raise FileNotFoundError(f"Source path does not exist: {source_path}")
        
        tar_file = backup_path / "backup.tar"
        
        # Create tar archive
        with tarfile.open(tar_file, "w") as tar:
            tar.add(source_path, arcname=source_path.name)
        
        execution.files_count = sum(1 for _ in source_path.rglob("*") if _.is_file())
        execution.size_bytes = tar_file.stat().st_size
    
    async def _backup_mongodb(self, job: BackupJob, backup_path: Path, execution: BackupExecution):
        """Backup MongoDB using mongodump"""
        
        # Parse MongoDB URI
        mongo_uri = job.source_path
        dump_path = backup_path / "mongodb_dump"
        
        # Execute mongodump
        cmd = [
            "mongodump",
            "--uri", mongo_uri,
            "--out", str(dump_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise RuntimeError(f"mongodump failed: {stderr.decode()}")
        
        # Calculate size and file count
        execution.files_count = sum(1 for _ in dump_path.rglob("*") if _.is_file())
        execution.size_bytes = sum(f.stat().st_size for f in dump_path.rglob("*") if f.is_file())
    
    async def _compress_backup(self, backup_path: Path) -> Path:
        """Compress backup using gzip"""
        compressed_path = backup_path.with_suffix('.tar.gz')
        
        with tarfile.open(compressed_path, "w:gz") as tar:
            tar.add(backup_path, arcname=backup_path.name)
        
        return compressed_path
    
    async def _cleanup_old_backups(self, job: BackupJob):
        """Remove backups older than retention period"""
        backup_dir = Path(job.destination_path)
        cutoff_date = datetime.now() - timedelta(days=job.retention_days)
        
        if backup_dir.exists():
            for backup_file in backup_dir.iterdir():
                if backup_file.is_file() or backup_file.is_dir():
                    # Check file modification time
                    mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
                    if mtime < cutoff_date:
                        if backup_file.is_file():
                            backup_file.unlink()
                        else:
                            shutil.rmtree(backup_file)
                        logger.info(f"Deleted old backup: {backup_file}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status"""
        status_summary = {
            "overall_status": ServiceStatus.HEALTHY.value,
            "timestamp": datetime.now().isoformat(),
            "services": {},
            "critical_services": [],
            "warnings": [],
            "errors": []
        }
        
        critical_services = ["clickhouse", "mongodb", "backend"]
        service_statuses = {}
        
        for check_name, health in self.service_health.items():
            component = self.health_checks[check_name].component
            
            if component not in service_statuses:
                service_statuses[component] = []
            
            service_statuses[component].append(health)
        
        # Aggregate service statuses
        for component, healths in service_statuses.items():
            if not healths:
                continue
            
            # Determine worst status
            statuses = [h.status for h in healths]
            if ServiceStatus.UNHEALTHY in statuses:
                component_status = ServiceStatus.UNHEALTHY
            elif ServiceStatus.DEGRADED in statuses:
                component_status = ServiceStatus.DEGRADED
            else:
                component_status = ServiceStatus.HEALTHY
            
            status_summary["services"][component] = {
                "status": component_status.value,
                "checks": [
                    {
                        "name": h.name,
                        "status": h.status.value,
                        "last_check": h.last_check.isoformat(),
                        "response_time": h.response_time,
                        "error": h.error_message
                    } for h in healths
                ],
                "metrics": {}
            }
            
            # Aggregate metrics
            for health in healths:
                status_summary["services"][component]["metrics"].update(health.metrics)
            
            # Track critical service issues
            if component in critical_services:
                if component_status != ServiceStatus.HEALTHY:
                    status_summary["critical_services"].append({
                        "service": component,
                        "status": component_status.value
                    })
            
            # Track warnings and errors
            for health in healths:
                if health.status == ServiceStatus.DEGRADED:
                    status_summary["warnings"].append(f"{component}: {health.error_message or 'Degraded performance'}")
                elif health.status == ServiceStatus.UNHEALTHY:
                    status_summary["errors"].append(f"{component}: {health.error_message or 'Service unavailable'}")
        
        # Determine overall status
        if status_summary["critical_services"]:
            critical_down = any(cs["status"] == ServiceStatus.UNHEALTHY.value for cs in status_summary["critical_services"])
            if critical_down:
                status_summary["overall_status"] = ServiceStatus.UNHEALTHY.value
            else:
                status_summary["overall_status"] = ServiceStatus.DEGRADED.value
        elif status_summary["warnings"]:
            status_summary["overall_status"] = ServiceStatus.DEGRADED.value
        
        return status_summary
    
    def get_backup_status(self) -> Dict[str, Any]:
        """Get backup system status"""
        backup_summary = {
            "jobs": {},
            "recent_executions": [],
            "storage_usage": {},
            "next_scheduled": []
        }
        
        # Job summaries
        for job_id, job in self.backup_jobs.items():
            recent_executions = [
                ex for ex in self.backup_executions.values()
                if ex.job_id == job_id
            ]
            recent_executions.sort(key=lambda x: x.started_at, reverse=True)
            
            last_execution = recent_executions[0] if recent_executions else None
            
            backup_summary["jobs"][job_id] = {
                "name": job.name,
                "enabled": job.enabled,
                "schedule": job.schedule,
                "last_run": job.last_run.isoformat() if job.last_run else None,
                "last_status": last_execution.status.value if last_execution else None,
                "retention_days": job.retention_days
            }
        
        # Recent executions
        all_executions = list(self.backup_executions.values())
        all_executions.sort(key=lambda x: x.started_at, reverse=True)
        
        for execution in all_executions[:10]:  # Last 10 executions
            backup_summary["recent_executions"].append({
                "id": execution.id,
                "job_id": execution.job_id,
                "status": execution.status.value,
                "started_at": execution.started_at.isoformat(),
                "duration": execution.duration_seconds,
                "size_mb": execution.size_bytes / (1024 * 1024) if execution.size_bytes else 0
            })
        
        # Storage usage
        if self.backup_dir.exists():
            total_size = sum(f.stat().st_size for f in self.backup_dir.rglob("*") if f.is_file())
            backup_summary["storage_usage"] = {
                "total_size_gb": total_size / (1024 * 1024 * 1024),
                "backup_count": len(list(self.backup_dir.rglob("*.tar.gz")))
            }
        
        return backup_summary

# Global operations manager instance
operations_manager = None

def initialize_operations_manager(config: Dict[str, Any]):
    """Initialize operations manager"""
    global operations_manager
    operations_manager = OperationsManager(config)
    logger.info("Operations Manager initialized")

async def run_health_checks() -> Dict[str, Any]:
    """Run system health checks (convenience function)"""
    if operations_manager:
        return await operations_manager.run_health_checks()
    return {}

async def execute_backup_job(job_id: str) -> Any:
    """Execute backup job (convenience function)"""
    if operations_manager:
        return await operations_manager.execute_backup(job_id)
    return None