# 🚀 Installation & Deployment Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Installation Checklist](#pre-installation-checklist)
3. [Installation Methods](#installation-methods)
4. [Docker Deployment](#docker-deployment)
5. [Native Deployment](#native-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Post-Installation Configuration](#post-installation-configuration)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

## 💻 System Requirements

### Minimum Requirements

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 4 GB | 8 GB | 16+ GB |
| **Storage** | 50 GB | 100 GB | 500+ GB SSD |
| **Network** | 100 Mbps | 1 Gbps | 10+ Gbps |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04+ | Ubuntu 22.04 LTS |

### Software Dependencies

#### Backend Dependencies
```bash
# Python 3.12+
python3 --version  # Should be 3.12 or higher

# Node.js 18+
node --version     # Should be 18 or higher

# Docker (optional)
docker --version   # For containerized deployment

# Git
git --version      # For source code management
```

#### System Packages
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget git build-essential python3-dev python3-pip nodejs npm

# CentOS/RHEL
sudo yum update
sudo yum install -y curl wget git gcc python3-devel python3-pip nodejs npm
```

### Network Requirements

#### Ports and Services
| Port | Service | Protocol | Description |
|------|---------|----------|-------------|
| 3000 | Frontend | HTTP/HTTPS | Web interface |
| 8000 | Backend API | HTTP/HTTPS | API endpoints |
| 5432 | PostgreSQL | TCP | Database (if using) |
| 6379 | Redis | TCP | Caching (if using) |
| 22 | SSH | TCP | Remote administration |

#### Firewall Configuration
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## ✅ Pre-Installation Checklist

### Environment Preparation

1. **System Preparation**
   ```
   ✅ Verify system requirements
   ✅ Update system packages
   ✅ Configure firewall rules
   ✅ Set up SSL certificates (production)
   ✅ Configure DNS records
   ```

2. **Security Preparation**
   ```
   ✅ Create dedicated user account
   ✅ Configure SSH key authentication
   ✅ Set up fail2ban
   ✅ Configure log monitoring
   ✅ Review security policies
   ```

3. **Backup Preparation**
   ```
   ✅ Set up backup storage
   ✅ Configure backup scripts
   ✅ Test backup procedures
   ✅ Document recovery procedures
   ```

### Required Information

Before installation, gather:

```
📋 System Information:
   - Server hostname: _______________
   - Domain name: _______________
   - SSL certificate path: _______________
   - Admin email: _______________

🔐 Security Information:
   - Admin username: _______________
   - Admin password: _______________
   - SSH key path: _______________
   - Firewall rules: _______________

🌐 Network Information:
   - IP address: _______________
   - Gateway: _______________
   - DNS servers: _______________
   - Proxy settings: _______________
```

## 🛠️ Installation Methods

### Method 1: Docker Deployment (Recommended)

#### Quick Docker Deployment
```bash
# Clone repository
git clone https://github.com/your-org/jupiter-siem.git
cd jupiter-siem

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start services
docker-compose up -d

# Verify deployment
docker-compose ps
```

#### Production Docker Deployment
```bash
# Create production environment
cp .env.production .env

# Configure production settings
nano .env

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Set up SSL certificates
./scripts/setup-ssl.sh

# Configure reverse proxy
./scripts/setup-nginx.sh
```

### Method 2: Native Deployment

#### Backend Installation
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp backend/.env.example backend/.env
nano backend/.env

# Initialize database
python backend/scripts/init_db.py

# Start backend service
python backend/main.py
```

#### Frontend Installation
```bash
# Install dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env
nano .env

# Build for production
npm run build

# Start frontend service
npm start
```

### Method 3: Automated Script Deployment

#### One-Click Deployment
```bash
# Download deployment script
wget https://raw.githubusercontent.com/your-org/jupiter-siem/main/deploy.sh
chmod +x deploy.sh

# Run deployment
./deploy.sh --environment production --domain siem.yourdomain.com
```

#### Custom Deployment
```bash
# Run with custom options
./deploy.sh \
  --environment production \
  --domain siem.yourdomain.com \
  --ssl-cert /path/to/cert.pem \
  --ssl-key /path/to/key.pem \
  --admin-email admin@yourdomain.com
```

## 🐳 Docker Deployment

### Docker Compose Configuration

#### Basic docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///app/data/jupiter.db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

#### Production docker-compose.prod.yml
```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/jupiter
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=your-secret-key
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=jupiter
      - POSTGRES_USER=jupiter
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Docker Commands

#### Basic Operations
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update services
docker-compose pull
docker-compose up -d
```

#### Maintenance Commands
```bash
# Backup data
docker-compose exec backend python scripts/backup.py

# Run database migrations
docker-compose exec backend python scripts/migrate.py

# Check service health
docker-compose ps

# View resource usage
docker stats

# Clean up unused images
docker system prune -a
```

## 🖥️ Native Deployment

### System Service Configuration

#### Backend Service (systemd)
```ini
# /etc/systemd/system/jupiter-backend.service
[Unit]
Description=Jupiter SIEM Backend
After=network.target

[Service]
Type=simple
User=jupiter
Group=jupiter
WorkingDirectory=/opt/jupiter-siem/backend
Environment=PATH=/opt/jupiter-siem/venv/bin
ExecStart=/opt/jupiter-siem/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service (systemd)
```ini
# /etc/systemd/system/jupiter-frontend.service
[Unit]
Description=Jupiter SIEM Frontend
After=network.target

[Service]
Type=simple
User=jupiter
Group=jupiter
WorkingDirectory=/opt/jupiter-siem/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Service Management
```bash
# Enable services
sudo systemctl enable jupiter-backend
sudo systemctl enable jupiter-frontend

# Start services
sudo systemctl start jupiter-backend
sudo systemctl start jupiter-frontend

# Check status
sudo systemctl status jupiter-backend
sudo systemctl status jupiter-frontend

# View logs
sudo journalctl -u jupiter-backend -f
sudo journalctl -u jupiter-frontend -f
```

### Process Management

#### Using PM2 (Node.js)
```bash
# Install PM2
npm install -g pm2

# Start frontend with PM2
pm2 start frontend/package.json --name jupiter-frontend

# Start backend with PM2
pm2 start backend/main.py --name jupiter-backend --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Supervisor (Python)
```bash
# Install supervisor
sudo apt install supervisor

# Create configuration
sudo nano /etc/supervisor/conf.d/jupiter-backend.conf

# Start service
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start jupiter-backend
```

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 Instance Setup
```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-groups jupiter-siem-sg \
  --user-data file://user-data.sh
```

#### Security Group Configuration
```json
{
  "SecurityGroupRules": [
    {
      "IpProtocol": "tcp",
      "FromPort": 22,
      "ToPort": 22,
      "CidrIpv4": "0.0.0.0/0",
      "Description": "SSH access"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 80,
      "ToPort": 80,
      "CidrIpv4": "0.0.0.0/0",
      "Description": "HTTP access"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 443,
      "ToPort": 443,
      "CidrIpv4": "0.0.0.0/0",
      "Description": "HTTPS access"
    }
  ]
}
```

### Azure Deployment

#### Virtual Machine Setup
```bash
# Create resource group
az group create --name jupiter-siem-rg --location eastus

# Create virtual machine
az vm create \
  --resource-group jupiter-siem-rg \
  --name jupiter-siem-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys
```

### Google Cloud Deployment

#### Compute Engine Setup
```bash
# Create instance
gcloud compute instances create jupiter-siem \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB
```

## ⚙️ Post-Installation Configuration

### Initial System Configuration

#### 1. Database Setup
```bash
# Initialize database
python backend/scripts/init_db.py

# Create admin user
python backend/scripts/create_admin.py \
  --email admin@yourdomain.com \
  --password SecurePassword123

# Run database migrations
python backend/scripts/migrate.py
```

#### 2. SSL Certificate Setup
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d siem.yourdomain.com

# Configure nginx
sudo nano /etc/nginx/sites-available/jupiter-siem
```

#### 3. Reverse Proxy Configuration
```nginx
# /etc/nginx/sites-available/jupiter-siem
server {
    listen 80;
    server_name siem.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name siem.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/siem.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siem.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Configuration

#### 1. Firewall Setup
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 2. Fail2ban Configuration
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure jail
sudo nano /etc/fail2ban/jail.local
```

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[jupiter-siem]
enabled = true
port = 80,443
logpath = /opt/jupiter-siem/logs/access.log
maxretry = 5
```

#### 3. User Account Setup
```bash
# Create dedicated user
sudo useradd -m -s /bin/bash jupiter
sudo usermod -aG sudo jupiter

# Set up SSH keys
sudo mkdir -p /home/jupiter/.ssh
sudo cp /path/to/your/public-key /home/jupiter/.ssh/authorized_keys
sudo chown -R jupiter:jupiter /home/jupiter/.ssh
sudo chmod 700 /home/jupiter/.ssh
sudo chmod 600 /home/jupiter/.ssh/authorized_keys
```

## ✅ Verification & Testing

### System Health Checks

#### 1. Service Status Check
```bash
# Check all services
sudo systemctl status jupiter-backend
sudo systemctl status jupiter-frontend
sudo systemctl status nginx

# Check Docker services (if using)
docker-compose ps
```

#### 2. Port Accessibility Check
```bash
# Check if ports are listening
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

#### 3. Database Connectivity Check
```bash
# Test database connection
python backend/scripts/test_db.py

# Check database tables
python backend/scripts/check_db.py
```

### Functional Testing

#### 1. Web Interface Test
```bash
# Test frontend accessibility
curl -I http://localhost:3000
curl -I https://siem.yourdomain.com

# Test API endpoints
curl -I http://localhost:8000/api/health
curl -I https://siem.yourdomain.com/api/health
```

#### 2. Authentication Test
```bash
# Test login endpoint
curl -X POST https://siem.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"SecurePassword123"}'
```

#### 3. Data Ingestion Test
```bash
# Test log ingestion
curl -X POST https://siem.yourdomain.com/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"timestamp":"2024-01-01T00:00:00Z","event":"test","source":"test"}'
```

### Performance Testing

#### 1. Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test frontend performance
ab -n 1000 -c 10 https://siem.yourdomain.com/

# Test API performance
ab -n 1000 -c 10 https://siem.yourdomain.com/api/health
```

#### 2. Resource Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor Docker resources (if using)
docker stats
```

## 🔧 Troubleshooting

### Common Installation Issues

#### Issue: Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process
sudo kill -9 PID

# Or change port in configuration
nano backend/.env
nano frontend/.env
```

#### Issue: Permission Denied
```bash
# Fix file permissions
sudo chown -R jupiter:jupiter /opt/jupiter-siem
sudo chmod -R 755 /opt/jupiter-siem

# Fix service permissions
sudo chown root:root /etc/systemd/system/jupiter-*.service
sudo chmod 644 /etc/systemd/system/jupiter-*.service
```

#### Issue: Database Connection Failed
```bash
# Check database service
sudo systemctl status postgresql
sudo systemctl status redis

# Check database configuration
nano backend/.env

# Test database connection
python backend/scripts/test_db.py
```

#### Issue: SSL Certificate Problems
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/siem.yourdomain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect siem.yourdomain.com:443
```

### Log Analysis

#### System Logs
```bash
# Check system logs
sudo journalctl -u jupiter-backend -f
sudo journalctl -u jupiter-frontend -f
sudo journalctl -u nginx -f

# Check application logs
tail -f /opt/jupiter-siem/logs/backend.log
tail -f /opt/jupiter-siem/logs/frontend.log
```

#### Docker Logs
```bash
# Check Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Check specific container logs
docker logs jupiter-siem-backend-1
docker logs jupiter-siem-frontend-1
```

### Recovery Procedures

#### Service Recovery
```bash
# Restart all services
sudo systemctl restart jupiter-backend
sudo systemctl restart jupiter-frontend
sudo systemctl restart nginx

# Restart Docker services
docker-compose restart
```

#### Database Recovery
```bash
# Restore from backup
python backend/scripts/restore_db.py --backup-file backup.sql

# Recreate database
python backend/scripts/init_db.py
python backend/scripts/migrate.py
```

---

**Next Steps:**
- [Configuration Management](./configuration-management.md) - System configuration
- [User Management](./user-management.md) - User setup and management
- [Security Configuration](./security-configuration.md) - Security hardening
- [Monitoring & Maintenance](./monitoring-maintenance.md) - Ongoing maintenance
