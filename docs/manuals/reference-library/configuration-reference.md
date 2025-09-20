# ⚙️ Configuration Reference

Centralized configuration options and environment variables.

- Core
  - APP_NAME, APP_ENV, APP_DEBUG, APP_URL
- Security
  - SECRET_KEY, JWT_SECRET, ENCRYPTION_KEY
  - SESSION_TIMEOUT, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION
- Email (Microsoft 365)
  - SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_TLS
  - MAIL_FROM, MAIL_FROM_NAME
- Database
  - DATABASE_URL (DuckDB/Postgres/SQLite)
- Redis (optional)
  - REDIS_URL, REDIS_PASSWORD
- Monitoring
  - LOG_LEVEL, METRICS_ENABLED, HEALTH_CHECK_INTERVAL
