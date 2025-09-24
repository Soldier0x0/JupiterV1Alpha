# 🐳 Jupiter SIEM - Docker Deployment Guide

> **Complete guide for containerized deployment with Docker Compose**

---

## 📋 **Overview**

The Docker deployment provides **containerized isolation** and **cloud-native capabilities** using Docker Compose orchestration. This approach is ideal for:

- **Cloud deployments and microservices**
- **Development and testing environments**
- **Horizontal scaling requirements**
- **CI/CD and DevOps workflows**

---

## 🔧 **System Requirements**

### **Container Platform**
- **Docker**: 20.10 or later
- **Docker Compose**: 2.0 or later (Compose V2)

### **Operating System**
- **Linux**: Any Docker-supported distribution
- **macOS**: Docker Desktop for Mac
- **Windows**: Docker Desktop for Windows (WSL2 backend)

### **Hardware Requirements**
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 6GB minimum (12GB+ recommended)
- **Storage**: 30GB available space (includes images and volumes)
- **Network**: Internet access for image downloads

### **Development Requirements** (if building from source)
- **Node.js**: 18+ (for frontend builds)
- **Python**: 3.9+ (for backend builds)

---

## 🚀 **Quick Installation**

### **One-Command Setup**
```bash
cd /app && ./docker/deployment/deploy-docker.sh
```

### **Using Makefile**
```bash
# Setup and deploy
make docker-setup && make docker-deploy

# Or combined
make docker-build docker-deploy
```

---

## 📦 **Step-by-Step Installation**

### **1. Prerequisites Installation**

#### **Ubuntu/Debian**
```bash
# Update packages
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose V2
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### **CentOS/RHEL/Fedora**
```bash
# Install Docker
sudo dnf install -y docker docker-compose
sudo systemctl enable --now docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### **macOS**
```bash
# Install Docker Desktop from https://docker.com/products/docker-desktop/
# Or using Homebrew
brew install --cask docker
```

### **2. Environment Configuration**
```bash
# Navigate to application directory
cd /app

# Create environment file
cp docker/configuration/.env.docker.example docker/configuration/.env.docker

# Edit configuration
vim docker/configuration/.env.docker
```

### **3. Build and Deploy**
```bash
# Option 1: Using deployment script
./docker/deployment/deploy-docker.sh

# Option 2: Using make commands
make docker-setup
make docker-build
make docker-deploy

# Option 3: Manual Docker Compose
cd docker/deployment
docker compose -f docker-compose.prod.yml up -d
```

---

## ⚙️ **Configuration**

### **Environment Configuration**

The main configuration file is `docker/configuration/.env.docker`:

```bash
# Project Configuration
PROJECT_NAME=jupiter-docker
APP_ENVIRONMENT=production

# Security (Generate new keys!)
JWT_SECRET_KEY=your_secure_jwt_secret_here
REDIS_PASSWORD=your_redis_password_here  
GRAFANA_PASSWORD=your_grafana_password_here

# Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-email-password
EMAIL_USE_TLS=true

# Admin Account
SUPER_ADMIN_EMAIL=admin@your-domain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_TENANT_NAME=MainTenant

# CORS Origins (Update for your domain)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Performance
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1024

# Monitoring
MONITORING_ENABLED=true
PROMETHEUS_RETENTION=200h

# Backup
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
```

### **Docker Compose Configuration**

The main orchestration file is `docker/deployment/docker-compose.prod.yml`:

#### **Service Architecture**
```yaml
services:
  backend:     # FastAPI + DuckDB (Port 8002)
  frontend:    # React + Vite (Port 3001) 
  nginx:       # Reverse Proxy (Ports 8080/8443)
  redis:       # Cache & Sessions (Port 6380)
  prometheus:  # Metrics (Port 9091) [Optional]
  grafana:     # Dashboards (Port 3002) [Optional]
```

#### **Volume Management**
```yaml
volumes:
  redis_data:      # Redis persistence
  prometheus_data: # Metrics storage  
  grafana_data:    # Dashboard configs

# Host mounts:
  ../../data:/app/data           # DuckDB database
  ../../logs:/app/logs           # Application logs
  ../../exports:/app/exports     # Report exports
```

### **Nginx Configuration**

Container nginx configuration: `docker/configuration/nginx/nginx.conf`

**Key features:**
- **Reverse proxy** for backend/frontend
- **Rate limiting** for API endpoints
- **Security headers** and CSP
- **SSL termination** (when certificates provided)
- **Health check endpoint** at `/health`

---

## 🏗️ **Container Management**

### **Service Commands**
```bash
cd docker/deployment

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Start with monitoring
docker compose -f docker-compose.prod.yml --profile monitoring up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Scale services (if configured)
docker compose -f docker-compose.prod.yml up -d --scale backend=2
```

### **Container Status**
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check container health
docker compose -f docker-compose.prod.yml exec backend curl -f http://localhost:8001/api/health

# View container resources
docker stats $(docker compose -f docker-compose.prod.yml ps -q)
```

### **Container Logs**
```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs  
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx

# View recent logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### **Interactive Access**
```bash
# Access backend container
docker compose -f docker-compose.prod.yml exec backend bash

# Access frontend container  
docker compose -f docker-compose.prod.yml exec frontend sh

# Access nginx container
docker compose -f docker-compose.prod.yml exec nginx sh

# Run one-off commands
docker compose -f docker-compose.prod.yml exec backend python -c "print('Hello from backend')"
```

---

## 🔒 **SSL/TLS Configuration**

### **Self-Signed Certificates (Development)**
```bash
# Automatically generated during deployment
# Location: docker/configuration/ssl/

# Manual generation
cd docker/configuration/ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Jupiter SIEM/CN=localhost"
```

### **Let's Encrypt (Production)**
```bash
# Using Certbot with Docker
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly --standalone -d your-domain.com

# Copy certificates to Docker configuration
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/configuration/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/configuration/ssl/key.pem

# Restart nginx to apply certificates
docker compose -f docker/deployment/docker-compose.prod.yml restart nginx
```

### **Custom SSL Certificates**
```bash
# Place your certificates in:
# Certificate: docker/configuration/ssl/cert.pem  
# Private key: docker/configuration/ssl/key.pem

# Ensure proper permissions
chmod 644 docker/configuration/ssl/cert.pem
chmod 600 docker/configuration/ssl/key.pem

# Restart nginx container
docker compose -f docker/deployment/docker-compose.prod.yml restart nginx
```

---

## 📊 **Monitoring & Health**

### **Health Checks**
```bash
# Application health
curl http://localhost:8080/health
curl https://localhost:8443/health  # If SSL configured

# Service-specific health
curl http://localhost:8002/api/health  # Backend direct
curl http://localhost:3001             # Frontend direct

# Container health status
docker compose -f docker/deployment/docker-compose.prod.yml ps
```

### **Monitoring Stack**
```bash
# Start monitoring services
cd docker/deployment
docker compose -f docker-compose.prod.yml --profile monitoring up -d

# Access monitoring interfaces
# Prometheus: http://localhost:9091
# Grafana: http://localhost:3002 (admin / your_grafana_password)
```

### **Prometheus Metrics**
Default metrics endpoints:
- **Backend**: `http://localhost:8002/api/metrics`
- **Frontend**: `http://localhost:3001/metrics`  
- **Nginx**: `http://localhost:8080/nginx_status`
- **Redis**: Available via redis_exporter (if configured)

### **Grafana Dashboards**
Pre-configured dashboards for:
- **Application Performance**: Response times, throughput
- **System Resources**: CPU, memory, disk usage
- **Container Metrics**: Docker container performance
- **Business Metrics**: User activity, security events

---

## 💾 **Backup & Restore**

### **Automated Backup**
```bash
# Create backup
./docker/deployment/backup-docker.sh

# Schedule automated backups (crontab)
sudo crontab -e
# Add: 0 2 * * * /opt/jupiter-siem/docker/deployment/backup-docker.sh
```

### **Manual Backup Components**

#### **Database Backup**
```bash
# Backup DuckDB from running container
docker compose -f docker-compose.prod.yml exec backend cp /app/data/jupiter_siem.db /tmp/backup.db
docker cp jupiter-docker-backend:/tmp/backup.db ./jupiter_siem_backup.db
```

#### **Volume Backup**
```bash
# Backup all volumes
docker volume ls --filter "name=docker_" --format "{{.Name}}" | while read volume; do
  docker run --rm -v "$volume":/source:ro -v "$(pwd)":/backup alpine \
    tar czf "/backup/${volume}.tar.gz" -C /source .
done
```

#### **Configuration Backup**
```bash
# Backup configuration and compose files
tar -czf jupiter-docker-config.tar.gz \
  docker/configuration/ \
  docker/deployment/ \
  docker/containers/
```

#### **Image Backup**
```bash
# Export custom images
docker save jupiter-siem-backend:latest | gzip > backend-image.tar.gz
docker save jupiter-siem-frontend:latest | gzip > frontend-image.tar.gz  
docker save jupiter-siem-nginx:latest | gzip > nginx-image.tar.gz
```

### **Restore Process**
```bash
# Stop services
docker compose -f docker/deployment/docker-compose.prod.yml down

# Restore volumes
for backup in *.tar.gz; do
  volume_name=$(basename "$backup" .tar.gz)
  docker volume create "$volume_name"
  docker run --rm -v "$volume_name":/target -v "$(pwd)":/backup alpine \
    tar xzf "/backup/$backup" -C /target
done

# Restore images
docker load < backend-image.tar.gz
docker load < frontend-image.tar.gz
docker load < nginx-image.tar.gz

# Restore database  
docker cp jupiter_siem_backup.db jupiter-docker-backend:/app/data/jupiter_siem.db

# Start services
docker compose -f docker/deployment/docker-compose.prod.yml up -d
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Containers Won't Start**
```bash
# Check container status and errors
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend

# Check system resources
docker system df
docker system events

# Common fixes:
# 1. Remove and recreate containers
docker compose -f docker-compose.prod.yml down --volumes
docker compose -f docker-compose.prod.yml up -d

# 2. Rebuild images
docker compose -f docker-compose.prod.yml build --no-cache
```

#### **Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep -E ":8080|:8443|:8002|:3001"
docker port $(docker compose -f docker-compose.prod.yml ps -q)

# Fix port conflicts by updating compose file:
# Change port mappings in docker-compose.prod.yml
ports:
  - "8081:80"    # Instead of 8080:80
  - "8444:443"   # Instead of 8443:443
```

#### **Database Issues**
```bash
# Check DuckDB file permissions and location
docker compose -f docker-compose.prod.yml exec backend ls -la /app/data/

# Recreate database volume
docker compose -f docker-compose.prod.yml down
docker volume rm docker_backend_data
docker compose -f docker-compose.prod.yml up -d

# Check database connectivity
docker compose -f docker-compose.prod.yml exec backend python -c "
import duckdb
conn = duckdb.connect('/app/data/jupiter_siem.db')
print('DuckDB connection successful')
conn.close()
"
```

#### **Nginx/Proxy Issues**
```bash
# Check nginx configuration
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Check upstream connectivity
docker compose -f docker-compose.prod.yml exec nginx curl http://backend:8001/api/health
docker compose -f docker-compose.prod.yml exec nginx curl http://frontend:3000

# Reload nginx configuration  
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

#### **Performance Issues**
```bash
# Check container resource usage
docker stats $(docker compose -f docker-compose.prod.yml ps -q)

# Check container limits
docker compose -f docker-compose.prod.yml config | grep -A5 -B5 "memory\|cpu"

# Increase resource limits in compose file:
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2'
    reservations:
      memory: 2G
      cpus: '1'
```

### **Network Issues**
```bash
# Check Docker networks
docker network ls
docker network inspect docker_jupiter-docker-net

# Test inter-container connectivity
docker compose -f docker-compose.prod.yml exec backend ping frontend
docker compose -f docker-compose.prod.yml exec frontend curl http://backend:8001/api/health

# Recreate network
docker compose -f docker-compose.prod.yml down
docker network rm docker_jupiter-docker-net
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔒 **Security Considerations**

### **Container Security**
```bash
# Run containers as non-root (already configured in Dockerfiles)
# Check user in containers:
docker compose -f docker-compose.prod.yml exec backend whoami
docker compose -f docker-compose.prod.yml exec frontend whoami

# Scan images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy jupiter-siem-backend:latest

# Update base images regularly
docker pull node:18-alpine
docker pull python:3.11-slim
docker pull nginx:alpine
make docker-build
```

### **Network Security**
```bash
# Use Docker's built-in networks (already configured)
# Containers communicate via internal network
# Only nginx exposes public ports

# Custom network isolation (advanced)
docker network create --driver bridge jupiter-internal
# Update compose file to use custom network
```

### **Secrets Management**
```bash
# Use Docker secrets (advanced)
echo "your_jwt_secret" | docker secret create jwt_secret -
echo "your_db_password" | docker secret create db_password -

# Update compose file to use secrets:
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true

services:
  backend:
    secrets:
      - jwt_secret
      - db_password
```

---

## 📈 **Performance Optimization**

### **Container Optimization**
```bash
# Optimize Docker daemon settings
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}

sudo systemctl restart docker
```

### **Resource Allocation**
```bash
# Update compose file with resource limits
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.5'
        reservations:
          memory: 1G
          cpus: '0.5'
  
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
```

### **Image Optimization**
```bash
# Use multi-stage builds (already implemented)
# Minimize layer count
# Use Alpine base images where possible
# Clean package caches in Dockerfiles

# Example optimization for backend Dockerfile:
FROM python:3.11-slim as builder
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
```

### **Volume Performance**
```bash
# Use bind mounts for performance-critical data
# Use named volumes for persistence
# Consider tmpfs for temporary data

# Example performance mount
volumes:
  - type: bind
    source: ./data
    target: /app/data
  - type: tmpfs
    target: /tmp
    tmpfs:
      size: 1G
```

---

## 🎯 **Production Checklist**

### **Pre-Production**
- [ ] Update `.env.docker` with production values
- [ ] Configure proper SSL certificates
- [ ] Set secure passwords for all services  
- [ ] Configure email settings for notifications
- [ ] Update CORS origins for production domains
- [ ] Enable monitoring stack
- [ ] Set up automated backups
- [ ] Configure resource limits for containers
- [ ] Test backup and restore procedures
- [ ] Configure log rotation and retention

### **Production Deployment**
- [ ] Deploy to production environment
- [ ] Verify all containers are healthy
- [ ] Test SSL certificates and HTTPS
- [ ] Verify monitoring and alerting
- [ ] Test backup creation and restoration
- [ ] Monitor resource usage and performance
- [ ] Configure external load balancer (if needed)
- [ ] Set up log aggregation (ELK stack, etc.)
- [ ] Configure CI/CD pipelines for updates

### **Post-Deployment**
- [ ] Monitor container health and resources
- [ ] Verify application functionality
- [ ] Test security headers and CSP
- [ ] Monitor application and system metrics
- [ ] Verify backup procedures are working
- [ ] Test disaster recovery procedures
- [ ] Update documentation with production specifics
- [ ] Train operations team on container management

---

## 🚀 **Advanced Features**

### **Container Orchestration**
```bash
# Docker Swarm mode (alternative to Compose)
docker swarm init
docker stack deploy -c docker-compose.prod.yml jupiter-siem

# Kubernetes deployment (advanced)
# Convert compose to k8s manifests using Kompose
kompose convert -f docker-compose.prod.yml
```

### **Auto-scaling**
```bash
# Horizontal Pod Autoscaler (Kubernetes)
# Docker Compose autoscaling (limited support)
# Use external orchestrators like Nomad or Kubernetes
```

### **Blue-Green Deployment**
```bash
# Maintain two identical environments
# Switch traffic between blue and green
# Implement with external load balancer
```

---

## 📞 **Support**

### **Log Collection for Support**
```bash
# Collect comprehensive logs
docker compose -f docker-compose.prod.yml logs > all-services.log
docker system info > docker-system.log
docker version > docker-version.log
docker compose -f docker-compose.prod.yml config > resolved-config.yml
```

### **Common Support Information**
- Docker and Docker Compose versions
- Container status and resource usage
- Service logs and error messages  
- Network configuration and connectivity
- Volume mounts and permissions
- Environment file (sanitized)
- Host system specifications

---

**🎉 Your Jupiter SIEM Docker deployment is now production-ready!**

Access your application at `http://localhost:8080` or configure your domain for production use.