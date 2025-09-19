# 🔌 API Reference

This document lists public API endpoints, parameters, and response models. For guided usage, see Developer Guide → API Documentation.

- Authentication
  - POST /api/v1/auth/login
  - POST /api/v1/auth/logout
  - POST /api/v1/auth/refresh
  - POST /api/v1/auth/2fa/verify
- Users
  - GET /api/v1/users
  - POST /api/v1/users
  - GET /api/v1/users/{id}
  - PUT /api/v1/users/{id}
  - DELETE /api/v1/users/{id}
- Logs
  - POST /api/v1/logs/search
  - POST /api/v1/logs/ingest
  - GET /api/v1/logs/{id}
- Alerts
  - GET /api/v1/alerts
  - POST /api/v1/alerts
  - PUT /api/v1/alerts/{id}
  - DELETE /api/v1/alerts/{id}
- Analytics
  - POST /api/v1/analytics/query
  - GET /api/v1/analytics/templates

See also: Developer Guide → api-documentation.md
