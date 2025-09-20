# Project Jupiter API Documentation

## Base URL
Development: `http://localhost:8001/api`
Production: `https://api.projectjupiter.in`

## Authentication
All API endpoints (except /health and /auth/register) require JWT authentication.

### Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

## Rate Limiting
- 100 requests per minute per IP for general endpoints
- 10 requests per minute per IP for authentication endpoints
- Headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Authentication Endpoints

### POST /auth/register
Create a new user account.

```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

// Response 201
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-08-20T10:00:00Z"
}
```

### POST /auth/login
Authenticate and receive JWT token.

```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

## AI Services

### POST /ai/analyze
Submit data for AI analysis.

```json
// Request
{
  "data": {
    "type": "network_traffic",
    "content": "..."
  },
  "options": {
    "depth": "full",
    "include_recommendations": true
  }
}

// Response 200
{
  "analysis": {
    "risk_score": 85,
    "findings": [...],
    "recommendations": [...]
  }
}
```

### GET /ai/models
List available AI models.

```json
// Response 200
{
  "models": [
    {
      "id": "jupiter-sec-1",
      "name": "Jupiter Security Analyzer",
      "version": "1.0.0",
      "capabilities": ["network", "endpoint", "threat"]
    }
  ]
}
```

## Case Management

### GET /cases
List security cases with pagination.

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `status`: Filter by status
- `severity`: Filter by severity

```json
// Response 200
{
  "cases": [
    {
      "id": "CASE-2025-001",
      "title": "Suspicious Network Activity",
      "severity": "high",
      "status": "open",
      "created_at": "2025-08-20T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 10
}
```

### POST /cases
Create a new security case.

```json
// Request
{
  "title": "Suspicious Network Activity",
  "description": "Multiple failed login attempts detected",
  "severity": "high",
  "tags": ["brute-force", "authentication"]
}

// Response 201
{
  "id": "CASE-2025-002",
  "status": "created"
}
```

## WebSocket API

### Connection
Connect to receive real-time updates:
```javascript
const ws = new WebSocket('wss://api.projectjupiter.in/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};
```

### Event Types
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'case_update':
      console.log('Case updated:', data.case);
      break;
    case 'alert':
      console.log('New alert:', data.alert);
      break;
  }
};
```

## Error Responses

All endpoints may return these error responses:

```json
// 400 Bad Request
{
  "error": "Invalid input",
  "details": {
    "field": "Description of the error"
  }
}

// 401 Unauthorized
{
  "error": "Authentication required"
}

// 403 Forbidden
{
  "error": "Insufficient permissions"
}

// 404 Not Found
{
  "error": "Resource not found"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "request_id": "req_123456"
}
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication
- **POST** `/auth/register`
  ```json
  {
    "email": "user@example.com",
    "tenant_name": "Organization Name",
    "is_owner": boolean
  }
  ```

- **POST** `/auth/request-otp`
  ```json
  {
    "email": "user@example.com",
    "tenant_id": "uuid"
  }
  ```

- **POST** `/auth/login`
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "tenant_id": "uuid"
  }
  ```

### Tenant Management
- **GET** `/tenants` - List all tenants (admin only)
- **POST** `/tenants` - Create new tenant
- **PUT** `/tenants/{id}` - Update tenant
- **DELETE** `/tenants/{id}` - Delete tenant

### User Management
- **GET** `/users` - List users
- **POST** `/users` - Create user
- **PUT** `/users/{id}` - Update user
- **DELETE** `/users/{id}` - Delete user

### Dashboard
- **GET** `/dashboard/overview` - Get dashboard data
- **GET** `/dashboard/metrics` - Get system metrics
- **POST** `/dashboard/widgets` - Save widget configuration

### AI Services
- **POST** `/ai/analyze` - Submit for AI analysis
- **GET** `/ai/models` - List available models
- **POST** `/ai/chat` - Chat with AI

### System
- **GET** `/health` - System health check
- **GET** `/metrics` - System metrics

## Error Responses
```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

## Rate Limits
- Authentication endpoints: 5 requests per minute
- API endpoints: 60 requests per minute
- AI endpoints: 10 requests per minute
