# 🚀 Jupiter SIEM - Dual Deployment Architecture

> **Enterprise-Grade Security Information and Event Management System**  
> Production-ready deployment with Native and Docker options

[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](https://github.com/projectjupiter/jupiter-siem)
[![Architecture Score](https://img.shields.io/badge/Architecture-90%25-brightgreen.svg)](#architecture)
[![Deployment Options](https://img.shields.io/badge/Deployment-Native%20%7C%20Docker-blue.svg)](#deployment)

---

## 📋 **Quick Start**

### **🎯 One-Command Deployment**
```bash
# Interactive deployment selector
./deploy.sh

# Or choose directly:
./deploy.sh native    # Native deployment
./deploy.sh docker    # Docker deployment  
./deploy.sh both      # Both deployments
```

### **⚡ Quick Commands**
```bash
# Native deployment
make native-deploy

# Docker deployment  
make docker-deploy

# Health check
make health
```

---

## 🏗️ **Architecture Overview**

Jupiter SIEM supports **two independent deployment architectures**:

### **🖥️ Native Deployment**
- **Direct server installation** using systemd, nginx, redis
- **Optimal performance** with minimal overhead
- **Traditional operations** with standard Linux tools
- **Recommended for**: Single server, traditional environments

### **🐳 Docker Deployment**  
- **Containerized deployment** using docker-compose
- **Easy scaling and isolation** with container orchestration
- **Cloud-native ready** with modern DevOps practices
- **Recommended for**: Cloud platforms, microservices, development

### **⚙️ Both Deployments (Parallel)**
- Run both approaches **simultaneously on different ports**
- **Native**: `http://localhost` (ports 80/443)
- **Docker**: `http://localhost:8080` (ports 8080/8443)  
- **Use case**: Testing, migration scenarios, comparison

---

## 📁 **Directory Structure**

```
/app/
├── 🏠 CORE APPLICATION (Shared)
│   ├── backend/           # FastAPI + DuckDB + AI features
│   ├── frontend/          # React + TypeScript + Tailwind
│   ├── docs/              # Comprehensive documentation
│   └── tests/             # Test suites
│
├── 🖥️ NATIVE DEPLOYMENT
│   └── native/
│       ├── deployment/    # Native deployment scripts
│       ├── configuration/ # Native configs (nginx, systemd, ssl)
│       ├── scripts/       # Native runtime scripts  
│       └── docs/          # Native-specific documentation
│
├── 🐳 DOCKER DEPLOYMENT
│   └── docker/
│       ├── deployment/    # Docker compose & deployment scripts
│       ├── configuration/ # Docker configs (nginx, prometheus)
│       ├── containers/    # Custom Dockerfiles
│       └── docs/          # Docker-specific documentation
│
└── 🛠️ UNIFIED TOOLS
    ├── deploy.sh          # Master deployment selector
    ├── Makefile           # Enhanced build automation
    └── README.md          # This file
```

---

## 🚀 **Deployment Methods**

### **Method 1: Interactive Deployment**
```bash
./deploy.sh
```
- **Interactive menu** with deployment options
- **System capability checking**
- **Deployment method comparison**
- **Guided setup process**

### **Method 2: Direct Commands**
```bash
# Native deployment
./native/deployment/deploy-native.sh

# Docker deployment
./docker/deployment/deploy-docker.sh

# Using Makefile
make native-deploy   # Native
make docker-deploy   # Docker
```

### **Method 3: Command Line Arguments**
```bash
./deploy.sh native   # Direct native deployment
./deploy.sh docker   # Direct Docker deployment
./deploy.sh both     # Deploy both methods
```

---

## 📊 **Deployment Comparison**

| **Aspect** | **Native Deployment** | **Docker Deployment** |
|------------|----------------------|----------------------|
| **Performance** | ⚡ Excellent (direct) | 🔥 Good (containers) |
| **Resource Usage** | 💚 Lower overhead | 🟡 Higher overhead |
| **Isolation** | 🟡 Process-level | ⭐ Container-level |
| **Scaling** | 🟡 Manual scaling | ⭐ Easy auto-scaling |
| **Maintenance** | 🔧 Traditional tools | 🐳 Docker tools |
| **Debugging** | ⭐ Direct access | 🔍 Container logs |
| **Rollbacks** | 🟡 Manual process | ⚡ Quick & easy |
| **Cloud Deploy** | 🟡 Requires setup | ⭐ Cloud-native |

---

## 🔧 **Configuration**

### **Native Configuration**
```bash
# Environment file
cp native/configuration/.env.native.production native/configuration/.env.native
vim native/configuration/.env.native

# Service configuration  
native/configuration/systemd/    # systemd services
native/configuration/nginx/     # nginx reverse proxy
native/configuration/ssl/       # SSL certificates
```

### **Docker Configuration**
```bash
# Environment file
cp docker/configuration/.env.docker.example docker/configuration/.env.docker
vim docker/configuration/.env.docker

# Service configuration
docker/configuration/nginx/     # nginx container config  
docker/configuration/prometheus/ # monitoring config
docker/deployment/docker-compose.prod.yml # main orchestration
```

---

## 🌐 **Access URLs**

### **Native Deployment**
- **Application**: `http://localhost` or `https://localhost`
- **Backend API**: `http://localhost/api`
- **Health Check**: `http://localhost/health`

### **Docker Deployment**
- **Application**: `http://localhost:8080` or `https://localhost:8443`
- **Backend API**: `http://localhost:8080/api`  
- **Health Check**: `http://localhost:8080/health`
- **Prometheus**: `http://localhost:9091` (if monitoring enabled)
- **Grafana**: `http://localhost:3002` (if monitoring enabled)

### **Direct Service Access**
```bash
# Native services
Backend:  http://localhost:8001/api
Frontend: http://localhost:3000

# Docker services  
Backend:  http://localhost:8002/api
Frontend: http://localhost:3001
Redis:    localhost:6380
```

---

## 💾 **Backup & Restore**

### **Native Backup**
```bash
# Create backup
./native/deployment/backup-native.sh

# Automated backup (via cron)
0 2 * * * /opt/jupiter-siem/native/deployment/backup-native.sh
```

### **Docker Backup**  
```bash
# Create backup
./docker/deployment/backup-docker.sh

# Using make
make docker-backup
```

### **Unified Backup**
```bash
# Interactive backup selection
make backup

# Backup both deployments
make native-backup && make docker-backup
```

---

## 📊 **Monitoring & Health**

### **Health Checks**
```bash
# Check all deployments
make health

# Native health
curl http://localhost/health

# Docker health  
curl http://localhost:8080/health

# Service-specific health
systemctl status jupiter-backend    # Native
docker-compose -f docker/deployment/docker-compose.prod.yml ps # Docker
```

### **Monitoring Stack**
```bash
# Enable monitoring (Docker)
docker-compose -f docker/deployment/docker-compose.prod.yml --profile monitoring up -d

# Access monitoring
# Prometheus: http://localhost:9091
# Grafana:    http://localhost:3002
```

### **Logs**
```bash
# Native logs
make native-logs
journalctl -f -u jupiter-backend -u jupiter-frontend

# Docker logs
make docker-logs  
docker-compose -f docker/deployment/docker-compose.prod.yml logs -f
```

---

## 🛠️ **Development**

### **Development Environment**
```bash
# Install dependencies
make install

# Start development
make dev

# Run tests
make test

# Code quality
make lint
```

### **Building**
```bash
# Build Docker images
make docker-build

# Clean build artifacts  
make clean
```

---

## 🔒 **Security Features**

- ✅ **OWASP Top 10** compliance
- ✅ **JWT authentication** with RBAC
- ✅ **Multi-tenant** architecture  
- ✅ **Rate limiting** and DDoS protection
- ✅ **SSL/TLS** termination
- ✅ **Security headers** and CSP
- ✅ **Input validation** and sanitization
- ✅ **Audit logging** and monitoring

---

## 📋 **Requirements**

### **Native Deployment Requirements**
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **Runtime**: Python 3.9+, Node.js 18+, Redis, Nginx
- **System**: systemd, 2GB RAM, 10GB disk

### **Docker Deployment Requirements**
- **Container**: Docker 20.10+, Docker Compose 2.0+
- **System**: 4GB RAM, 20GB disk
- **OS**: Any Docker-supported OS

---

## 🚨 **Production Checklist**

### **Before Production Deployment**
- [ ] Update environment files with production credentials
- [ ] Configure proper SSL certificates (Let's Encrypt recommended)
- [ ] Set up firewall rules (UFW/iptables)
- [ ] Configure monitoring and alerting
- [ ] Set up automated backups
- [ ] Review security settings
- [ ] Update CORS origins for your domain
- [ ] Configure email settings for notifications

### **Post-Deployment Verification**
- [ ] Health checks pass (`make health`)
- [ ] SSL certificates valid  
- [ ] Monitoring dashboards accessible
- [ ] Backup procedures tested
- [ ] Security headers present
- [ ] Performance metrics within expected ranges

---

## 🆘 **Troubleshooting**

### **Common Issues**

**Service not starting:**
```bash
# Check service status
systemctl status jupiter-backend  # Native
docker-compose -f docker/deployment/docker-compose.prod.yml ps # Docker

# Check logs
journalctl -u jupiter-backend     # Native  
docker logs jupiter-docker-backend # Docker
```

**Port conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :8001
netstat -tulpn | grep :8080

# Kill conflicting processes
sudo fuser -k 8001/tcp
```

**SSL certificate issues:**
```bash
# Generate new certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Check certificate validity
openssl x509 -in cert.pem -text -noout
```

### **Getting Help**
- 📚 **Documentation**: Check `/app/docs/` for detailed guides
- 🐛 **Issues**: Report issues with detailed logs
- 💬 **Support**: Include deployment method (native/docker) and error logs

---

## 📈 **Performance Optimization**

### **Native Deployment**
- Tune systemd service limits
- Optimize nginx worker processes  
- Configure Redis memory limits
- Use SSD storage for DuckDB

### **Docker Deployment**
- Allocate sufficient memory to containers
- Use volume mounts for persistent data
- Configure resource limits in compose file
- Enable Docker BuildKit for faster builds

---

## 🎯 **Next Steps**

1. **Choose your deployment method** based on requirements
2. **Run the interactive deployment**: `./deploy.sh`
3. **Configure production settings** in environment files
4. **Set up monitoring and backups**
5. **Configure SSL and security**
6. **Test thoroughly** before going live

---

**🎉 Jupiter SIEM is now production-ready with dual deployment architecture!**

For detailed deployment guides, see:
- 🖥️ Native: [`native/docs/NATIVE-DEPLOY.md`](native/docs/NATIVE-DEPLOY.md)
- 🐳 Docker: [`docker/docs/DOCKER-DEPLOY.md`](docker/docs/DOCKER-DEPLOY.md)