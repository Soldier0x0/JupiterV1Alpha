# 🚀 Jupiter SIEM - Automated Deployment System

## 📋 **What This Script Does**

The `deploy_jupiter_siem.sh` script provides **fully automated deployment** of your Jupiter SIEM platform with:

### ✅ **Intelligent System Checks**
- Detects existing installations (Docker, Nginx, Node.js, Python, etc.)
- Shows current versions of installed software
- Only installs what's missing
- Validates system requirements

### 🔧 **Complete Setup**
- **Docker containerization** with MongoDB, FastAPI backend, React frontend
- **Nginx reverse proxy** with security headers and rate limiting
- **API rate limiting system** with usage tracking
- **Advanced user management** with RBAC (Role-Based Access Control)
- **Email integration** for OTP and invitations
- **Cloudflare tunnel** configuration

### 🔑 **Pre-configured APIs**
All your threat intelligence APIs are pre-configured with rate limits:

| API | Rate Limits | Status |
|-----|-------------|--------|
| **VirusTotal** | 4 req/min, 500/day | ✅ Configured |
| **AbuseIPDB** | 1000 checks/day | ✅ Configured |
| **AlienVault OTX** | No strict limits | ✅ Configured |
| **IntelligenceX** | 50 searches/month | ✅ Configured |
| **LeakIX** | 3000 calls/month | ✅ Configured |
| **FOFA** | 300 queries/month | ✅ Configured |
| **Custom Slots** | 3 slots for future APIs | ✅ Ready |

### 👥 **Advanced User System**
- **Super Admin**: harsha@projectjupiter.in (you)
- **Role Hierarchy**: Super Admin → Tenant Owner → Admin → Analyst → Viewer → Guest
- **Granular Permissions**: 30+ individual permissions across all features
- **Multi-tenant Architecture**: Complete organization isolation
- **User Invitations**: Automatic email invitations with secure tokens
- **Audit Logging**: Complete activity tracking for compliance

---

## 🚀 **Quick Start**

### **1. Download Script to Your Debian Server**
```bash
# Copy the script to your server
scp deploy_jupiter_siem.sh user@your-server:~/
ssh user@your-server

# Make executable
chmod +x deploy_jupiter_siem.sh
```

### **2. Run the Automated Deployment**
```bash
# Run as regular user (not root)
./deploy_jupiter_siem.sh
```

### **3. Follow Interactive Prompts**
The script will ask for:
- MongoDB admin password (minimum 12 characters)
- JWT secret key (minimum 32 characters)  
- Email app password for harsha@projectjupiter.in
- Cloudflare tunnel name
- Installation directory

### **4. Manual Cloudflare Steps**
After script completes:
```bash
# Login to Cloudflare
sudo cloudflared tunnel login

# Create tunnel
sudo cloudflared tunnel create jupiter-siem

# Configure DNS in Cloudflare dashboard
# Start tunnel service
sudo cloudflared service install
sudo systemctl start cloudflared
```

---

## 📊 **What Gets Installed**

### **System Services**
- ✅ Docker & Docker Compose
- ✅ Nginx with security configuration
- ✅ MongoDB 7.0 (containerized)
- ✅ FastAPI backend (containerized)
- ✅ React frontend (containerized)
- ✅ Cloudflared tunnel client

### **Directory Structure**
```
/opt/jupiter-siem/
├── backend/          # FastAPI application
├── frontend/         # React application  
├── mongodb/          # Database initialization
├── nginx/           # Reverse proxy config
├── scripts/         # Management scripts
├── backups/         # Automated backups
└── docker-compose.yml
```

### **Management Scripts**
- **Status Check**: `./scripts/status.sh`
- **Backup System**: `./scripts/backup.sh`
- **Update System**: `./scripts/update.sh`

---

## 🎯 **Features Included**

### **🛡️ Security Features**
- Multi-tenant architecture with complete isolation
- Role-based access control (6 default roles)
- Two-factor authentication (2FA) support
- API rate limiting with usage tracking
- Audit logging for compliance
- Secure password requirements
- Session management
- CORS protection

### **📊 SIEM Capabilities**
- Real-time security dashboard
- Alert management and correlation
- Threat intelligence integration
- IOC (Indicators of Compromise) management
- SOAR automation engine
- Case management system
- AI-powered threat analysis

### **🔗 API Integrations**
- 6 pre-configured threat intelligence APIs
- Rate limit monitoring and enforcement
- Usage statistics and reporting
- Easy addition of custom APIs
- Automatic retry logic
- Error handling and logging

### **👥 User Management**
- Multi-tenant organization support
- Granular permission system (30+ permissions)
- User invitation system with email
- Role assignment with hierarchy validation
- Account lockout protection
- Password policy enforcement

---

## 📈 **Post-Deployment**

### **Access Your SIEM**
- **URL**: https://projectjupiter.in
- **Admin Email**: harsha@projectjupiter.in
- **Tenant**: MainTenant
- **Login**: Request OTP via email

### **API Documentation**
- **Swagger UI**: https://projectjupiter.in/api/docs
- **Health Check**: https://projectjupiter.in/api/health
- **Rate Limits**: https://projectjupiter.in/api/threat-intel/status

### **Management Tasks**
```bash
cd /opt/jupiter-siem

# Check system status
./scripts/status.sh

# Create backup
./scripts/backup.sh

# Update system
./scripts/update.sh

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🔧 **Customization**

### **Add New APIs**
The system supports adding new threat intelligence APIs:
1. Access Settings → API Keys in the web interface
2. Click "Add Custom API"
3. Enter API name, key, and rate limits
4. System automatically handles integration

### **Create New Roles**
```bash
# Access web interface as super admin
# Go to Administration → Role Management
# Create custom roles with specific permissions
```

### **Invite New Users**
```bash
# Use web interface: Users → Invite User
# Or via API:
curl -X POST https://projectjupiter.in/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email": "user@company.com", "role": "analyst"}'
```

---

## 🎉 **Expected Result**

After successful deployment, you'll have:

- **Enterprise-grade SIEM platform** running on projectjupiter.in
- **Complete threat intelligence integration** with 6+ APIs
- **Advanced user management** with role-based access
- **Professional security operations center** accessible globally
- **Automated monitoring and alerting** system
- **Compliance-ready audit logging**

Your spare laptop becomes a **powerful security operations center** with enterprise features! 🛡️

---

## 📞 **Support**

If you encounter issues during deployment:

1. **Check logs**: `./scripts/status.sh`
2. **Review Docker**: `docker-compose ps` and `docker-compose logs`
3. **Verify network**: Test ports 80, 443, 3000, 8001
4. **Cloudflare tunnel**: Check tunnel status and DNS configuration

The script creates detailed logs at `/var/log/jupiter_siem_deploy.log` for troubleshooting.

**Ready to deploy your enterprise SIEM platform? Run the script!** 🚀