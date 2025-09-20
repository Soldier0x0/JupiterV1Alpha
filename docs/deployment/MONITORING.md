# Monitoring and Logging Guide

## Overview
This guide covers monitoring, logging, and observability practices for Project Jupiter.

## Monitoring Setup

### 1. Infrastructure Monitoring

#### AWS CloudWatch Configuration
```yaml
# terraform/monitoring.tf
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.environment}-high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/ECS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "CPU utilization is too high"
  
  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

#### Prometheus Configuration
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'jupiter-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'

  - job_name: 'jupiter-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 2. Application Monitoring

#### Backend Metrics (Python)
```python
# backend/monitoring.py
from prometheus_client import Counter, Histogram, Info
from functools import wraps
import time

# Request counter
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Response time histogram
REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

# Application info
APP_INFO = Info('jupiter_backend', 'Backend application information')
APP_INFO.info({
    'version': '1.0.0',
    'python_version': '3.10.0'
})

def monitor_endpoint(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            response = await func(*args, **kwargs)
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.path,
                status=response.status_code
            ).inc()
            return response
        finally:
            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=request.path
            ).observe(time.time() - start_time)
    return wrapper
```

#### Frontend Monitoring (React)
```javascript
// frontend/src/utils/monitoring.js
import { init, track } from '@sentry/browser';
import { BrowserTracing } from "@sentry/tracing";

// Initialize Sentry
init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Performance monitoring
export const monitorComponentPerformance = (Component) => {
  return function WrappedComponent(props) {
    const startTime = performance.now();
    
    useEffect(() => {
      const endTime = performance.now();
      track({
        type: 'performance',
        name: Component.name,
        value: endTime - startTime
      });
    }, []);
    
    return <Component {...props} />;
  };
};
```

## Logging Configuration

### 1. Centralized Logging (ELK Stack)

#### Logstash Configuration
```conf
# logstash/pipeline/jupiter.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [type] == "backend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
      target => "@timestamp"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "jupiter-logs-%{+YYYY.MM.dd}"
  }
}
```

#### Filebeat Configuration
```yaml
# filebeat/filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/jupiter/backend/*.log
  fields:
    type: backend
    
- type: log
  enabled: true
  paths:
    - /var/log/jupiter/frontend/*.log
  fields:
    type: frontend

output.logstash:
  hosts: ["logstash:5044"]
```

### 2. Application Logging

#### Backend Logging
```python
# backend/utils/logger.py
import logging
import json
from datetime import datetime
from typing import Any, Dict

class CustomJSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
            
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

# Configure logger
logger = logging.getLogger('jupiter')
handler = logging.StreamHandler()
handler.setFormatter(CustomJSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Usage example
def process_case(case_id: str) -> None:
    logger.info('Processing case', extra={
        'case_id': case_id,
        'request_id': request_id.get()
    })
```

#### Frontend Logging
```javascript
// frontend/src/utils/logger.js
class Logger {
  constructor() {
    this.defaultMetadata = {
      app: 'jupiter-frontend',
      version: process.env.VERSION
    };
  }

  formatMessage(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultMetadata,
      ...metadata
    });
  }

  info(message, metadata) {
    console.log(this.formatMessage('info', message, metadata));
  }

  error(message, error, metadata = {}) {
    console.error(this.formatMessage('error', message, {
      ...metadata,
      error: {
        message: error.message,
        stack: error.stack
      }
    }));
  }
}

export const logger = new Logger();
```

## Alerting Configuration

### 1. Alert Rules

#### Prometheus Alert Rules
```yaml
# prometheus/alerts.yml
groups:
- name: jupiter
  rules:
  - alert: HighCPUUsage
    expr: avg(rate(container_cpu_usage_seconds_total{job="jupiter"}[5m])) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High CPU usage detected
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
```

#### Application Alerts
```python
# backend/monitoring/alerts.py
from typing import Dict, Any
import requests

class AlertManager:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
        
    def send_alert(self, alert: Dict[str, Any]) -> None:
        requests.post(
            self.webhook_url,
            json={
                'text': f"🚨 ALERT: {alert['title']}",
                'attachments': [{
                    'fields': [
                        {'title': 'Severity', 'value': alert['severity']},
                        {'title': 'Details', 'value': alert['details']}
                    ]
                }]
            }
        )

# Usage
alert_manager = AlertManager(os.getenv('SLACK_WEBHOOK_URL'))
alert_manager.send_alert({
    'title': 'High Memory Usage',
    'severity': 'warning',
    'details': 'Memory usage exceeded 80%'
})
```

### 2. Notification Channels

#### Slack Integration
```yaml
# alertmanager/config.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'

route:
  receiver: 'slack-notifications'
  group_by: ['alertname', 'cluster', 'service']
  
  routes:
  - match:
      severity: critical
    receiver: 'slack-critical'
    continue: true
    
receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#jupiter-alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: "{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}"

- name: 'slack-critical'
  slack_configs:
  - channel: '#jupiter-critical'
    title: '🚨 {{ .GroupLabels.alertname }}'
    text: "{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}"
```

## Dashboard Configuration

### 1. Grafana Dashboards

#### Application Overview
```json
{
  "dashboard": {
    "id": null,
    "title": "Jupiter Overview",
    "tags": ["jupiter", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

#### Resource Usage Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "Jupiter Resources",
    "tags": ["jupiter", "resources"],
    "timezone": "browser",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "avg(rate(container_cpu_usage_seconds_total{job=\"jupiter\"}[5m]))"
          }
        ],
        "thresholds": [
          { "value": null, "color": "green" },
          { "value": 0.6, "color": "yellow" },
          { "value": 0.8, "color": "red" }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "avg(container_memory_usage_bytes{job=\"jupiter\"}) / avg(container_memory_max_usage_bytes{job=\"jupiter\"})"
          }
        ]
      }
    ]
  }
}
```

## Tracing Configuration

### 1. Distributed Tracing

#### Backend Tracing (OpenTelemetry)
```python
# backend/tracing.py
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def setup_tracing():
    # Configure tracer
    tracer_provider = TracerProvider()
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger",
        agent_port=6831,
    )
    tracer_provider.add_span_processor(
        BatchSpanProcessor(jaeger_exporter)
    )
    trace.set_tracer_provider(tracer_provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)

# Usage in endpoints
tracer = trace.get_tracer(__name__)

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str):
    with tracer.start_as_current_span("get_case") as span:
        span.set_attribute("case_id", case_id)
        case = await case_service.get_case(case_id)
        return case
```

#### Frontend Tracing
```javascript
// frontend/src/utils/tracing.js
import { TracerProvider } from '@opentelemetry/sdk-trace-web';
import { WebTracerProvider } from '@opentelemetry/web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const setupTracing = () => {
  const provider = new WebTracerProvider();
  
  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new CollectorTraceExporter({
        url: 'http://localhost:4318/v1/trace'
      })
    )
  );
  
  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator()
  });
  
  registerInstrumentations({
    instrumentations: [
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: ['http://localhost:8000/.*']
      }),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: ['http://localhost:8000/.*']
      })
    ]
  });
};
```

## Metrics Collection

### 1. Custom Metrics

#### Backend Custom Metrics
```python
# backend/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Business metrics
CASE_CREATED = Counter(
    'jupiter_case_created_total',
    'Total number of cases created',
    ['severity']
)

CASE_RESOLUTION_TIME = Histogram(
    'jupiter_case_resolution_seconds',
    'Time taken to resolve cases',
    ['severity'],
    buckets=[300, 600, 1800, 3600, 7200, 14400, 28800, 86400]
)

ACTIVE_CASES = Gauge(
    'jupiter_active_cases',
    'Number of active cases',
    ['status']
)

# Usage
def create_case(case_data):
    case = Case.create(**case_data)
    CASE_CREATED.labels(severity=case.severity).inc()
    ACTIVE_CASES.labels(status='open').inc()
    return case

def resolve_case(case_id):
    case = Case.get(case_id)
    resolution_time = time.time() - case.created_at.timestamp()
    CASE_RESOLUTION_TIME.labels(severity=case.severity).observe(resolution_time)
    ACTIVE_CASES.labels(status='open').dec()
    ACTIVE_CASES.labels(status='resolved').inc()
```

#### Frontend Performance Metrics
```javascript
// frontend/src/utils/metrics.js
const collectPerformanceMetrics = () => {
  const metrics = {};
  
  // Navigation Timing
  const navigation = performance.getEntriesByType('navigation')[0];
  metrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
  metrics.domInteractive = navigation.domInteractive - navigation.navigationStart;
  
  // Resource Timing
  const resources = performance.getEntriesByType('resource');
  metrics.resourceCount = resources.length;
  metrics.totalResourceTime = resources.reduce((total, resource) => 
    total + resource.duration, 0);
    
  // First Paint
  const paint = performance.getEntriesByType('paint');
  metrics.firstPaint = paint.find(entry => 
    entry.name === 'first-paint').startTime;
  
  return metrics;
};

// Report metrics
const reportMetrics = () => {
  const metrics = collectPerformanceMetrics();
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metrics)
  });
};
```

### 2. System Metrics

#### Node Exporter Configuration
```yaml
# docker-compose.yml
services:
  node-exporter:
    image: prom/node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
```

#### cAdvisor Configuration
```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
```

## Health Checks

### 1. Application Health Checks

#### Backend Health Checks
```python
# backend/health.py
from fastapi import FastAPI
from typing import Dict, Any

async def check_database():
    try:
        await db.command('ping')
        return True
    except Exception:
        return False

async def check_redis():
    try:
        await redis.ping()
        return True
    except Exception:
        return False

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'checks': {
            'database': await check_database(),
            'redis': await check_redis(),
            'system': {
                'cpu_usage': psutil.cpu_percent(),
                'memory_usage': psutil.virtual_memory().percent
            }
        }
    }
```

#### Frontend Health Check
```javascript
// frontend/src/utils/health.js
const checkHealth = async () => {
  const results = {
    api: false,
    websocket: false
  };
  
  // Check API
  try {
    const response = await fetch('/api/health');
    results.api = response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
  }
  
  // Check WebSocket
  try {
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => {
      ws.onopen = () => {
        results.websocket = true;
        ws.close();
        resolve();
      };
      ws.onerror = reject;
      setTimeout(reject, 5000);
    });
  } catch (error) {
    console.error('WebSocket health check failed:', error);
  }
  
  return results;
};
```

### 2. Infrastructure Health Checks

#### Docker Health Checks
```yaml
# docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
      
  frontend:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Kubernetes Liveness Probes
```yaml
# kubernetes/deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: jupiter-backend
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
```
