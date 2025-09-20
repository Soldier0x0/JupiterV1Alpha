# 🔌 API Documentation

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Core Endpoints](#core-endpoints)
4. [Security Endpoints](#security-endpoints)
5. [Analytics Endpoints](#analytics-endpoints)
6. [Integration Endpoints](#integration-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [SDK Examples](#sdk-examples)
10. [Testing](#testing)

## 🌐 API Overview

### Base URL
```
Production: https://siem.projectjupiter.in/api/v1
Development: http://localhost:8000/api/v1
```

### API Versioning
- **Current Version**: v1
- **Version Header**: `API-Version: v1`
- **Deprecation Policy**: 6 months notice for breaking changes

### Response Format
All API responses follow a consistent JSON structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "req_123456789"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "req_123456789"
}
```

## 🔐 Authentication

### Authentication Methods

#### 1. JWT Token Authentication (Recommended)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Key Authentication
```http
X-API-Key: jupiter_api_1234567890abcdef
```

#### 3. Session Authentication
```http
Cookie: session_id=abc123def456
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "remember_me": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "analyst",
      "permissions": ["read_logs", "create_alerts"]
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Two-Factor Authentication
```http
POST /auth/2fa/verify
Content-Type: application/json

{
  "token": "123456",
  "backup_code": "backup123"
}
```

## 🔧 Core Endpoints

### User Management

#### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "preferences": {
    "theme": "dark",
    "timezone": "UTC",
    "notifications": {
      "email": true,
      "dashboard": true
    }
  }
}
```

#### Change Password
```http
POST /users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "old_password",
  "new_password": "new_secure_password"
}
```

### Log Management

#### Search Logs
```http
POST /logs/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "failed login",
  "time_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-02T00:00:00Z"
  },
  "filters": {
    "source": "auth_server",
    "severity": ["high", "critical"]
  },
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "timestamp": "2024-01-01T12:00:00Z",
        "source": "auth_server",
        "event_type": "authentication_failed",
        "severity": "high",
        "message": "Failed login attempt for user admin",
        "details": {
          "user": "admin",
          "ip_address": "192.168.1.100",
          "user_agent": "Mozilla/5.0..."
        }
      }
    ],
    "total": 150,
    "has_more": true
  }
}
```

#### Ingest Logs
```http
POST /logs/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "logs": [
    {
      "timestamp": "2024-01-01T12:00:00Z",
      "source": "web_server",
      "event_type": "http_request",
      "severity": "info",
      "message": "GET /api/users HTTP/1.1 200",
      "details": {
        "method": "GET",
        "path": "/api/users",
        "status_code": 200,
        "response_time": 150
      }
    }
  ]
}
```

#### Get Log by ID
```http
GET /logs/{log_id}
Authorization: Bearer <token>
```

### Alert Management

#### Get Alerts
```http
GET /alerts
Authorization: Bearer <token>
Query Parameters:
  - status: open|acknowledged|resolved
  - severity: low|medium|high|critical
  - limit: 50
  - offset: 0
```

#### Create Alert
```http
POST /alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Suspicious Login Activity",
  "description": "Multiple failed login attempts detected",
  "severity": "high",
  "source": "auth_server",
  "rule_id": "rule_123",
  "details": {
    "user": "admin",
    "attempts": 5,
    "time_window": "5 minutes"
  }
}
```

#### Update Alert Status
```http
PUT /alerts/{alert_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "acknowledged",
  "assigned_to": "analyst_123",
  "notes": "Investigating the incident"
}
```

## 🔒 Security Endpoints

### Threat Intelligence

#### Get Threat Indicators
```http
GET /threats/indicators
Authorization: Bearer <token>
Query Parameters:
  - type: ip|domain|hash|url
  - confidence: high|medium|low
  - limit: 100
```

#### Add Threat Indicator
```http
POST /threats/indicators
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "ip",
  "value": "192.168.1.100",
  "confidence": "high",
  "source": "manual",
  "description": "Known malicious IP",
  "tags": ["malware", "botnet"]
}
```

### Security Analytics

#### Get Security Metrics
```http
GET /analytics/security
Authorization: Bearer <token>
Query Parameters:
  - time_range: 24h|7d|30d
  - metric: threats|alerts|incidents
```

**Response:**
```json
{
  "success": true,
  "data": {
    "time_range": "24h",
    "metrics": {
      "total_threats": 25,
      "high_severity_alerts": 5,
      "resolved_incidents": 12,
      "threat_trend": "increasing"
    },
    "breakdown": {
      "by_severity": {
        "critical": 2,
        "high": 8,
        "medium": 10,
        "low": 5
      },
      "by_source": {
        "network": 15,
        "endpoint": 7,
        "application": 3
      }
    }
  }
}
```

## 📊 Analytics Endpoints

### Query Builder

#### Execute Query
```http
POST /analytics/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": {
    "select": ["timestamp", "source", "event_type", "count(*)"],
    "from": "logs",
    "where": {
      "timestamp": {
        "gte": "2024-01-01T00:00:00Z",
        "lte": "2024-01-02T00:00:00Z"
      },
      "severity": "high"
    },
    "group_by": ["source", "event_type"],
    "order_by": "count(*) DESC",
    "limit": 100
  }
}
```

#### Get Query Templates
```http
GET /analytics/templates
Authorization: Bearer <token>
```

#### Save Query
```http
POST /analytics/queries
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Failed Login Analysis",
  "description": "Analyze failed login attempts by user",
  "query": {
    "select": ["user", "count(*)"],
    "from": "logs",
    "where": {
      "event_type": "authentication_failed"
    },
    "group_by": ["user"]
  },
  "is_public": false
}
```

### Reporting

#### Generate Report
```http
POST /reports/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": "template_123",
  "parameters": {
    "time_range": "7d",
    "include_charts": true,
    "format": "pdf"
  }
}
```

#### Get Report Status
```http
GET /reports/{report_id}/status
Authorization: Bearer <token>
```

#### Download Report
```http
GET /reports/{report_id}/download
Authorization: Bearer <token>
```

## 🔗 Integration Endpoints

### Data Sources

#### List Data Sources
```http
GET /integrations/sources
Authorization: Bearer <token>
```

#### Add Data Source
```http
POST /integrations/sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Windows Event Logs",
  "type": "syslog",
  "configuration": {
    "host": "192.168.1.50",
    "port": 514,
    "protocol": "udp",
    "format": "cef"
  },
  "enabled": true
}
```

#### Test Data Source
```http
POST /integrations/sources/{source_id}/test
Authorization: Bearer <token>
```

### Webhooks

#### Create Webhook
```http
POST /integrations/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/...",
  "events": ["alert.created", "incident.resolved"],
  "secret": "webhook_secret_123",
  "enabled": true
}
```

#### Test Webhook
```http
POST /integrations/webhooks/{webhook_id}/test
Authorization: Bearer <token>
```

## ❌ Error Handling

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `VALIDATION_ERROR` | Input validation failed | Check request parameters |
| `AUTHENTICATION_FAILED` | Invalid credentials | Verify login credentials |
| `AUTHORIZATION_DENIED` | Insufficient permissions | Check user permissions |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist | Verify resource ID |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `INTERNAL_ERROR` | Server error | Contact support |

### Error Response Examples

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

#### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid credentials",
    "details": {
      "attempts_remaining": 2,
      "lockout_time": "2024-01-01T12:05:00Z"
    }
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Tiers

| Tier | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| **Free** | 100 | 10 |
| **Basic** | 1,000 | 100 |
| **Professional** | 10,000 | 1,000 |
| **Enterprise** | 100,000 | 10,000 |

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_time": "2024-01-01T13:00:00Z",
      "retry_after": 3600
    }
  }
}
```

## 💻 SDK Examples

### JavaScript/Node.js

#### Installation
```bash
npm install @jupiter-siem/api-client
```

#### Basic Usage
```javascript
const JupiterAPI = require('@jupiter-siem/api-client');

const client = new JupiterAPI({
  baseURL: 'https://siem.projectjupiter.in/api/v1',
  apiKey: 'your_api_key_here'
});

// Search logs
const logs = await client.logs.search({
  query: 'failed login',
  timeRange: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-02T00:00:00Z'
  }
});

// Create alert
const alert = await client.alerts.create({
  title: 'Suspicious Activity',
  severity: 'high',
  description: 'Multiple failed login attempts'
});
```

### Python

#### Installation
```bash
pip install jupiter-siem-api
```

#### Basic Usage
```python
from jupiter_siem import JupiterAPI

client = JupiterAPI(
    base_url='https://siem.projectjupiter.in/api/v1',
    api_key='your_api_key_here'
)

# Search logs
logs = client.logs.search(
    query='failed login',
    time_range={
        'start': '2024-01-01T00:00:00Z',
        'end': '2024-01-02T00:00:00Z'
    }
)

# Create alert
alert = client.alerts.create(
    title='Suspicious Activity',
    severity='high',
    description='Multiple failed login attempts'
)
```

### cURL Examples

#### Authentication
```bash
# Login
curl -X POST https://siem.projectjupiter.in/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" \
  https://siem.projectjupiter.in/api/v1/users/me
```

#### Search Logs
```bash
curl -X POST https://siem.projectjupiter.in/api/v1/logs/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "failed login",
    "time_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-02T00:00:00Z"
    }
  }'
```

## 🧪 Testing

### API Testing with Postman

#### Collection Setup
```json
{
  "info": {
    "name": "Jupiter SIEM API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{access_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://siem.projectjupiter.in/api/v1"
    }
  ]
}
```

#### Test Scripts
```javascript
// Test response time
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('data');
});
```

### Unit Testing

#### Python Tests
```python
import pytest
from jupiter_siem import JupiterAPI

def test_log_search():
    client = JupiterAPI(api_key='test_key')
    
    # Mock response
    with pytest.mock.patch('requests.post') as mock_post:
        mock_post.return_value.json.return_value = {
            'success': True,
            'data': {'logs': []}
        }
        
        result = client.logs.search(query='test')
        assert result['success'] is True
```

#### JavaScript Tests
```javascript
const JupiterAPI = require('@jupiter-siem/api-client');

describe('Jupiter API Client', () => {
  test('should search logs successfully', async () => {
    const client = new JupiterAPI({ apiKey: 'test_key' });
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: { logs: [] } })
      })
    );
    
    const result = await client.logs.search({ query: 'test' });
    expect(result.success).toBe(true);
  });
});
```

---

**Related Documentation:**
- [Frontend Development](./frontend-development.md) - Frontend API integration
- [Backend Development](./backend-development.md) - Backend API implementation
- [Integration Development](./integration-development.md) - Custom integrations
- [Testing Framework](./testing-framework.md) - Comprehensive testing guide
