# ⚡ Quick Reference

## 📋 Table of Contents

1. [System Information](#system-information)
2. [Login Credentials](#login-credentials)
3. [Common Commands](#common-commands)
4. [API Endpoints](#api-endpoints)
5. [Configuration Files](#configuration-files)
6. [Ports and Services](#ports-and-services)
7. [File Locations](#file-locations)
8. [Environment Variables](#environment-variables)
9. [Quick Troubleshooting](#quick-troubleshooting)
10. [Emergency Contacts](#emergency-contacts)

## 🖥️ System Information

### Default URLs
```
Production: https://siem.projectjupiter.in
Development: http://localhost:3000
API Base: https://siem.projectjupiter.in/api/v1
```

### System Requirements
```
Minimum:
- CPU: 2 cores
- RAM: 4 GB
- Storage: 50 GB
- OS: Ubuntu 20.04+

Recommended:
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS
```

### Browser Support
```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
⚠️ Internet Explorer 11 (Limited)
```

## 🔐 Login Credentials

### Default Admin Account
```
Email: admin@projectjupiter.in
Password: [Set during installation]
```

### Test Accounts
```
Analyst: analyst@projectjupiter.in
Viewer: viewer@projectjupiter.in
Admin: admin@projectjupiter.in
```

### Password Requirements
```
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

## 🖥️ Common Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update services
docker-compose pull && docker-compose up -d
```

### System Service Commands
```bash
# Check service status
sudo systemctl status jupiter-backend
sudo systemctl status jupiter-frontend

# Start services
sudo systemctl start jupiter-backend
sudo systemctl start jupiter-frontend

# Restart services
sudo systemctl restart jupiter-backend
sudo systemctl restart jupiter-frontend

# View logs
sudo journalctl -u jupiter-backend -f
sudo journalctl -u jupiter-frontend -f
```

### Database Commands
```bash
# Connect to database
python backend/scripts/db_connect.py

# Backup database
python backend/scripts/backup_db.py

# Restore database
python backend/scripts/restore_db.py --file backup.sql

# Run migrations
python backend/scripts/migrate.py
```

### Log Commands
```bash
# View application logs
tail -f logs/backend.log
tail -f logs/frontend.log

# View system logs
sudo journalctl -u jupiter-backend -f
sudo journalctl -u jupiter-frontend -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔌 API Endpoints

### Authentication
```http
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/2fa/verify
```

### User Management
```http
GET /api/v1/users/me
PUT /api/v1/users/me
POST /api/v1/users/me/password
GET /api/v1/users
POST /api/v1/users
PUT /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

### Log Management
```http
POST /api/v1/logs/search
POST /api/v1/logs/ingest
GET /api/v1/logs/{id}
GET /api/v1/logs/export
```

### Alert Management
```http
GET /api/v1/alerts
POST /api/v1/alerts
PUT /api/v1/alerts/{id}
DELETE /api/v1/alerts/{id}
GET /api/v1/alerts/{id}/history
```

### Analytics
```http
POST /api/v1/analytics/query
GET /api/v1/analytics/templates
POST /api/v1/analytics/queries
GET /api/v1/analytics/metrics
```

### System Health
```http
GET /api/v1/health
GET /api/v1/health/detailed
GET /api/v1/health/database
GET /api/v1/health/redis
```

## ⚙️ Configuration Files

### Environment Files
```
.env                    # Main environment file
.env.development        # Development environment
.env.production         # Production environment
.env.testing            # Testing environment
```

### Application Config
```
backend/.env            # Backend configuration
frontend/.env           # Frontend configuration
docker-compose.yml      # Docker configuration
docker-compose.prod.yml # Production Docker config
```

### System Config
```
/etc/nginx/sites-available/jupiter-siem
/etc/systemd/system/jupiter-backend.service
/etc/systemd/system/jupiter-frontend.service
/etc/fail2ban/jail.local
```

### Security Config
```
ssl/cert.pem            # SSL certificate
ssl/key.pem             # SSL private key
ssl/ca.pem              # Certificate authority
```

## 🌐 Ports and Services

### Default Ports
```
3000 - Frontend (HTTP/HTTPS)
8000 - Backend API (HTTP/HTTPS)
80   - HTTP (redirects to HTTPS)
443  - HTTPS
22   - SSH
```

### Database Ports
```
5432 - PostgreSQL (if used)
6379 - Redis (if used)
27017 - MongoDB (if used)
```

### Monitoring Ports
```
9090 - Prometheus
3001 - Grafana
9093 - Alertmanager
```

## 📁 File Locations

### Application Files
```
/opt/jupiter-siem/      # Main application directory
├── backend/            # Backend application
├── frontend/           # Frontend application
├── logs/               # Application logs
├── data/               # Application data
├── backups/            # Backup files
└── config/             # Configuration files
```

### Log Files
```
logs/backend.log        # Backend application logs
logs/frontend.log       # Frontend application logs
logs/access.log         # Web server access logs
logs/error.log          # Web server error logs
logs/security.log       # Security event logs
```

### Data Files
```
data/jupiter.db         # Main database file
data/backups/           # Database backups
data/uploads/           # File uploads
data/exports/           # Data exports
```

### Configuration Files
```
config/database.yml     # Database configuration
config/redis.yml        # Redis configuration
config/email.yml        # Email configuration
config/security.yml     # Security configuration
```

## 🔧 Environment Variables

### Core Configuration
```bash
# Application
APP_NAME=Jupiter SIEM
APP_ENV=production
APP_DEBUG=false
APP_URL=https://siem.projectjupiter.in

# Database
DATABASE_URL=sqlite:///data/jupiter.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/jupiter
# DATABASE_URL=mysql://user:pass@localhost:3306/jupiter

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here
```

### Email Configuration
```bash
# SMTP Settings
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=admin@projectjupiter.in
SMTP_PASSWORD=your-email-password
SMTP_TLS=true

# Email Settings
MAIL_FROM=admin@projectjupiter.in
MAIL_FROM_NAME=Jupiter SIEM
```

### Security Settings
```bash
# Authentication
SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
PASSWORD_MIN_LENGTH=8

# 2FA
TWO_FACTOR_ENABLED=true
TWO_FACTOR_ISSUER=Jupiter SIEM
```

### Monitoring Settings
```bash
# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/application.log
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=10

# Monitoring
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30
```

## 🔧 Quick Troubleshooting

### Common Issues

#### Cannot Access Web Interface
```bash
# Check if services are running
sudo systemctl status jupiter-backend
sudo systemctl status jupiter-frontend

# Check if ports are listening
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000

# Check firewall
sudo ufw status
```

#### Database Connection Issues
```bash
# Check database service
sudo systemctl status postgresql  # if using PostgreSQL
sudo systemctl status redis       # if using Redis

# Test database connection
python backend/scripts/test_db.py

# Check database file permissions
ls -la data/jupiter.db
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect siem.projectjupiter.in:443

# Renew Let's Encrypt certificate
sudo certbot renew
```

#### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check application logs for errors
tail -f logs/backend.log
tail -f logs/frontend.log

# Check database performance
python backend/scripts/db_performance.py
```

### Quick Fixes

#### Restart All Services
```bash
# Docker
docker-compose restart

# System services
sudo systemctl restart jupiter-backend
sudo systemctl restart jupiter-frontend
sudo systemctl restart nginx
```

#### Clear Cache
```bash
# Clear application cache
python backend/scripts/clear_cache.py

# Clear browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
```

#### Reset Configuration
```bash
# Reset to default configuration
cp config/default.yml config/application.yml

# Restart services
sudo systemctl restart jupiter-backend
sudo systemctl restart jupiter-frontend
```

## 🆘 Emergency Contacts

### System Administrator
```
Name: [Your Admin Name]
Email: admin@projectjupiter.in
Phone: [Your Phone Number]
```

### Security Team
```
Email: security@projectjupiter.in
Phone: [Security Phone Number]
```

### Support Channels
```
Documentation: https://docs.projectjupiter.in
GitHub Issues: https://github.com/your-org/jupiter-siem/issues
Community Forum: https://community.projectjupiter.in
```

### Emergency Procedures
```
1. Check system status: https://status.projectjupiter.in
2. Review incident response procedures
3. Contact appropriate team member
4. Document incident details
5. Follow up with post-incident review
```

## 📞 Support Information

### Business Hours Support
```
Monday - Friday: 9:00 AM - 5:00 PM (UTC)
Response Time: 4 hours
```

### Emergency Support
```
24/7 Emergency Line: [Emergency Number]
Response Time: 1 hour
```

### Self-Service Resources
```
Documentation: Complete user and admin guides
FAQ: Frequently asked questions
Troubleshooting: Step-by-step problem resolution
Community: User community and forums
```

---

**Related References:**
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Reference](./configuration-reference.md) - All configuration options
- [Troubleshooting Guide](./troubleshooting-guide.md) - Detailed problem resolution
- [FAQ](./faq.md) - Frequently asked questions
