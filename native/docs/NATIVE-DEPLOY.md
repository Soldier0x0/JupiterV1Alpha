# 🖥️ Jupiter SIEM - Native Deployment Guide

> **Complete guide for native Linux deployment with systemd, nginx, and redis**

---

## 📋 **Overview**

The native deployment provides **maximum performance** by installing Jupiter SIEM directly on the Linux server using standard system services. This approach is ideal for:

- **Single server deployments**
- **Traditional IT environments** 
- **Maximum performance requirements**
- **Direct system integration needs**

---

## 🔧 **System Requirements**

### **Operating System**
- **Ubuntu**: 20.04 LTS or later
- **Debian**: 11 (Bullseye) or later  
- **CentOS/RHEL**: 8 or later
- **Fedora**: 35 or later

### **Hardware Requirements**
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 20GB available space
- **Network**: Internet access for installation

### **Software Dependencies**
- **Python**: 3.9 or later
- **Node.js**: 18 or later
- **nginx**: Latest stable
- **Redis**: 6.0 or later
- **systemd**: Available on all modern Linux

---

## 🚀 **Quick Installation**

### **One-Command Setup**
```bash
cd /app && ./native/deployment/deploy-native.sh
```

### **Step-by-Step Installation**

#### **1. System Preparation**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo dnf update -y                      # Fedora/RHEL

# Install required packages
sudo apt install -y python3 python3-venv python3-pip nodejs npm nginx redis-server systemctl curl # Ubuntu/Debian
sudo dnf install -y python3 python3-pip nodejs npm nginx redis systemd curl # Fedora/RHEL
```

#### **2. Setup Application**
```bash
# Navigate to application directory
cd /app

# Run native setup
./native/deployment/setup-native.sh

# Configure environment
cp native/configuration/.env.native.production native/configuration/.env.native
vim native/configuration/.env.native
```

#### **3. Deploy Services**
```bash
# Run full deployment
./native/deployment/deploy-native.sh
```

---

## ⚙️ **Configuration**

### **Environment Configuration**

Create and customize the environment file:
```bash
cp native/configuration/.env.native.production native/configuration/.env.native
```

**Key configuration options:**
```bash
# Application
APP_ENVIRONMENT=production
JWT_SECRET_KEY=your_secure_jwt_secret

# Database  
DUCKDB_PATH=/var/lib/jupiter-siem/jupiter_siem.db

# Email (Optional)
EMAIL_HOST=smtp.your-provider.com
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-email-password

# Admin Account
SUPER_ADMIN_EMAIL=admin@your-domain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!

# Network
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### **Service Configuration**

#### **Nginx Configuration**
```bash
# Location: native/configuration/nginx/nginx.conf
# Automatically copied to: /etc/nginx/sites-available/jupiter-siem

# Key settings:
server_name your-domain.com;  # Update for your domain
listen 80;                    # HTTP port
listen 443 ssl http2;         # HTTPS port (requires SSL setup)
```

#### **systemd Services**
```bash
# Backend service: native/configuration/systemd/jupiter-backend.service
# Frontend service: native/configuration/systemd/jupiter-frontend.service

# Services automatically:
# - Start on boot
# - Restart on failure  
# - Run as non-root user
# - Include security hardening
```

---

## 🔒 **SSL/TLS Setup**

### **Self-Signed Certificates (Development)**
```bash
# Automatically generated during deployment
# Location: native/configuration/ssl/
```

### **Let's Encrypt (Production)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
sudo dnf install certbot python3-certbot-nginx  # Fedora/RHEL

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (automatically set up by certbot)
sudo crontab -l | grep certbot
```

### **Custom SSL Certificates**
```bash
# Place certificates in:
# Certificate: /etc/ssl/certs/jupiter-siem.crt
# Private key: /etc/ssl/private/jupiter-siem.key

# Update nginx configuration
sudo vim /etc/nginx/sites-available/jupiter-siem
# Update ssl_certificate and ssl_certificate_key paths
```

---

## 🛠️ **Service Management**

### **Service Commands**
```bash
# Start services
sudo systemctl start jupiter-backend jupiter-frontend nginx redis-server

# Stop services  
sudo systemctl stop jupiter-backend jupiter-frontend

# Restart services
sudo systemctl restart jupiter-backend jupiter-frontend nginx

# Enable auto-start on boot
sudo systemctl enable jupiter-backend jupiter-frontend nginx redis-server

# Check service status
sudo systemctl status jupiter-backend
sudo systemctl status jupiter-frontend
```

### **Service Logs**
```bash
# View real-time logs
sudo journalctl -f -u jupiter-backend -u jupiter-frontend

# View recent logs
sudo journalctl -u jupiter-backend --since "1 hour ago"

# View all logs
sudo journalctl -u jupiter-backend --no-pager
```

### **Configuration Reload**
```bash
# Reload systemd after configuration changes
sudo systemctl daemon-reload

# Restart services to apply changes
sudo systemctl restart jupiter-backend jupiter-frontend

# Test nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 **Monitoring & Health**

### **Health Checks**
```bash
# Application health
curl http://localhost/health
curl https://localhost/health  # If SSL configured

# Service health  
curl http://localhost:8001/api/health  # Backend direct
curl http://localhost:3000             # Frontend direct

# System health
systemctl is-active jupiter-backend
systemctl is-active jupiter-frontend
systemctl is-active nginx
systemctl is-active redis-server
```

### **Performance Monitoring**
```bash
# System resources
htop
iostat -x 1
free -h
df -h

# Service-specific metrics
# Backend logs include performance metrics
sudo journalctl -u jupiter-backend | grep "performance\|metrics"

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### **Native Monitoring Setup** 
```bash
# Install Prometheus (optional)
./native/scripts/monitoring-setup.sh

# Manual Prometheus setup
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xzf prometheus-2.45.0.linux-amd64.tar.gz
sudo cp prometheus-2.45.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-2.45.0.linux-amd64/promtool /usr/local/bin/

# Configure Prometheus
sudo mkdir -p /etc/prometheus /var/lib/prometheus
sudo cp native/configuration/prometheus/prometheus.yml /etc/prometheus/
```

---

## 💾 **Backup & Restore**

### **Automated Backup**
```bash
# Create backup
./native/deployment/backup-native.sh

# Schedule automated backups (crontab)
sudo crontab -e
# Add line: 0 2 * * * /opt/jupiter-siem/native/deployment/backup-native.sh
```

### **Manual Backup**
```bash
# Database backup
cp /var/lib/jupiter-siem/jupiter_siem.db /path/to/backup/

# Configuration backup
tar -czf jupiter-config-backup.tar.gz \
  native/configuration/ \
  /etc/nginx/sites-available/jupiter-siem \
  /etc/systemd/system/jupiter-*.service

# Application logs
cp -r /var/log/jupiter-siem/ /path/to/backup/
```

### **Restore Process**
```bash
# Stop services
sudo systemctl stop jupiter-backend jupiter-frontend

# Restore database
cp /path/to/backup/jupiter_siem.db /var/lib/jupiter-siem/

# Restore configuration
tar -xzf jupiter-config-backup.tar.gz

# Restart services
sudo systemctl start jupiter-backend jupiter-frontend
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check service status
sudo systemctl status jupiter-backend

# Check logs for errors
sudo journalctl -u jupiter-backend --since "10 minutes ago"

# Common fixes:
# 1. Check file permissions
sudo chown -R jupiter-siem:jupiter-siem /opt/jupiter-siem/
sudo chmod +x /opt/jupiter-siem/native/.venv/bin/uvicorn

# 2. Check Python environment
/opt/jupiter-siem/native/.venv/bin/python --version
/opt/jupiter-siem/native/.venv/bin/pip list

# 3. Check port availability
sudo netstat -tulpn | grep :8001
```

#### **Nginx Configuration Issues**
```bash
# Test nginx configuration
sudo nginx -t

# Common fixes:
# 1. Check syntax errors in configuration
sudo nginx -T

# 2. Check log files
sudo tail -f /var/log/nginx/error.log

# 3. Verify upstream services are running
curl http://localhost:8001/api/health
curl http://localhost:3000
```

#### **Database Issues**
```bash
# Check DuckDB file permissions
ls -la /var/lib/jupiter-siem/jupiter_siem.db

# Check directory permissions
sudo chown -R jupiter-siem:jupiter-siem /var/lib/jupiter-siem/

# Test DuckDB connectivity
python3 -c "
import duckdb
conn = duckdb.connect('/var/lib/jupiter-siem/jupiter_siem.db')
print('DuckDB connection successful')
conn.close()
"
```

#### **Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connectivity
redis-cli ping

# Check Redis configuration
sudo cat /etc/redis/redis.conf | grep -E "bind|port|requirepass"

# Restart Redis
sudo systemctl restart redis-server
```

### **Performance Issues**

#### **High CPU Usage**
```bash
# Check process usage
top -p $(pgrep -f "jupiter|uvicorn|node")

# Reduce worker processes
# Edit: /etc/systemd/system/jupiter-backend.service
# Change: --workers 4 to --workers 2

# Restart service
sudo systemctl daemon-reload
sudo systemctl restart jupiter-backend
```

#### **High Memory Usage**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Configure memory limits
# Edit systemd service files to add:
# MemoryLimit=2G
```

#### **Disk Space Issues**
```bash
# Check disk usage  
df -h
du -sh /var/log/jupiter-siem/
du -sh /var/lib/jupiter-siem/

# Clean up logs (if needed)
sudo journalctl --vacuum-time=7d
sudo find /var/log/jupiter-siem/ -name "*.log" -mtime +30 -delete
```

---

## 🔒 **Security Hardening**

### **Firewall Configuration**
```bash
# Install UFW (Ubuntu/Debian)
sudo apt install ufw

# Basic firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### **Fail2Ban Setup**
```bash
# Install Fail2Ban
sudo apt install fail2ban  # Ubuntu/Debian
sudo dnf install fail2ban  # Fedora/RHEL

# Configure for nginx
sudo cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

# Start and enable
sudo systemctl enable --now fail2ban
```

### **User Security**
```bash
# Create dedicated user (done automatically by deployment script)
sudo useradd -r -m -s /bin/bash jupiter-siem

# Set proper ownership
sudo chown -R jupiter-siem:jupiter-siem /opt/jupiter-siem/
sudo chown -R jupiter-siem:jupiter-siem /var/lib/jupiter-siem/
sudo chown -R jupiter-siem:jupiter-siem /var/log/jupiter-siem/

# Verify no root processes
ps aux | grep jupiter | grep -v root
```

---

## 📈 **Performance Tuning**

### **System-Level Optimizations**
```bash
# Increase file descriptor limits
echo "jupiter-siem soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "jupiter-siem hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize kernel parameters
sudo cat >> /etc/sysctl.conf << EOF
# Network optimizations
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_keepalive_time = 300
EOF

sudo sysctl -p
```

### **Application-Level Optimizations**
```bash
# Backend workers (edit systemd service)
sudo systemctl edit jupiter-backend
# Add:
# [Service] 
# ExecStart=
# ExecStart=/opt/jupiter-siem/native/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4

# Nginx worker processes
sudo vim /etc/nginx/nginx.conf
# Set: worker_processes auto;
# Set: worker_connections 1024;
```

### **Database Optimizations**
```bash
# DuckDB configuration (in environment file)
DUCKDB_MEMORY_LIMIT=2GB
DUCKDB_THREADS=4
DUCKDB_MAX_MEMORY=75%

# Ensure SSD storage for database
sudo mkdir -p /var/lib/jupiter-siem
# Mount SSD to /var/lib/jupiter-siem if available
```

---

## 🎯 **Production Checklist**

### **Pre-Production**
- [ ] Update environment configuration with production values
- [ ] Configure proper SSL certificates (Let's Encrypt or CA)
- [ ] Set up firewall rules (UFW or iptables)
- [ ] Configure fail2ban for intrusion prevention  
- [ ] Set up automated backups with cron
- [ ] Test backup and restore procedures
- [ ] Configure monitoring and alerting
- [ ] Update CORS origins for production domains
- [ ] Set secure admin passwords
- [ ] Configure email settings for notifications

### **Post-Deployment**
- [ ] Verify all services are running (`systemctl status`)
- [ ] Test health endpoints (`curl http://localhost/health`)
- [ ] Verify SSL certificates (`openssl s_client -connect localhost:443`)
- [ ] Check firewall status (`ufw status`)
- [ ] Test backup creation and restoration
- [ ] Monitor system resources and performance
- [ ] Verify log rotation is working
- [ ] Test fail2ban rules
- [ ] Confirm monitoring alerts are working

---

## 📞 **Support**

### **Log Collection for Support**
```bash
# Collect system information
./native/deployment/collect-logs.sh

# Manual log collection
sudo journalctl -u jupiter-backend --since "1 hour ago" > backend.log
sudo journalctl -u jupiter-frontend --since "1 hour ago" > frontend.log
sudo nginx -T > nginx-config.txt
systemctl status jupiter-backend jupiter-frontend > service-status.txt
```

### **Common Support Information Needed**
- Operating system and version (`lsb_release -a`)
- Service status (`systemctl status jupiter-*`)
- Error logs from journalctl
- Nginx configuration (`nginx -T`)
- Network configuration (`ss -tlnp`)
- System resources (`free -h`, `df -h`)

---

**🎉 Your Jupiter SIEM native deployment is now production-ready!**

Access your application at `https://your-domain.com` or `http://localhost` for local testing.