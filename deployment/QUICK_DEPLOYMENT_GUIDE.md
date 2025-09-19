# 🚀 JupiterEmerge SIEM - Quick Deployment Guide

## **Your Setup: Debian 13 + Cloudflare Tunnel + projectjupiter.in**

### **🎯 Architecture Overview**
```
Internet → Cloudflare → Cloudflare Tunnel → Debian 13 Laptop → JupiterEmerge SIEM
```

**Domains:**
- **Main Portfolio**: `projectjupiter.in` (Showcase)
- **SIEM Tool**: `siem.projectjupiter.in` (Security tool)
- **Local Access**: `localhost:8080` (Development)

---

## **⚡ Quick Start (5 Minutes)**

### **1. Prepare Your Debian 13 Laptop**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git python3 python3-pip python3-venv nodejs npm nginx docker.io docker-compose ufw fail2ban

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### **2. Deploy JupiterEmerge SIEM**

```bash
# Clone or copy your project
git clone <your-repo> /home/$USER/jupiter-siem
cd /home/$USER/jupiter-siem

# Make deployment script executable
chmod +x deployment/debian-deployment.sh

# Run deployment (this will take 10-15 minutes)
./deployment/debian-deployment.sh
```

### **3. Setup Cloudflare Tunnel**

```bash
# Install Cloudflare Tunnel
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create jupiter-siem

# Note the tunnel ID (you'll need this for DNS)
```

### **4. Configure DNS in Cloudflare**

1. Go to **Cloudflare Dashboard** → **DNS** → **Records**
2. Add **CNAME** record:
   - **Name**: `siem`
   - **Target**: `<tunnel-id>.cfargotunnel.com`
   - **Proxy**: 🟠 Proxied (orange cloud)

### **5. Start Services**

```bash
# Start all services
sudo systemctl start jupiter-backend
sudo systemctl start nginx
sudo systemctl start cloudflared

# Check status
sudo systemctl status jupiter-backend
sudo systemctl status nginx
sudo systemctl status cloudflared
```

---

## **🔧 Configuration Files**

### **Environment Configuration**
```bash
# Copy production environment
cp deployment/production.env /home/$USER/jupiter-siem/.env

# Edit with your settings
nano /home/$USER/jupiter-siem/.env
```

**Key settings to update:**
```env
# Your email
EMAIL_USER=harsha@projectjupiter.in
EMAIL_PASSWORD=your_email_password

# Admin credentials
SUPER_ADMIN_EMAIL=admin@projectjupiter.in
SUPER_ADMIN_PASSWORD=your_secure_password

# Domain
DOMAIN=siem.projectjupiter.in
MAIN_DOMAIN=projectjupiter.in
```

### **Cloudflare Tunnel Config**
```bash
# Create tunnel configuration
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: jupiter-siem
credentials-file: /etc/cloudflared/jupiter-siem.json

ingress:
  - hostname: siem.projectjupiter.in
    service: http://localhost:8080
  - service: http_status:404
EOF
```

---

## **🛡️ Security Setup**

### **1. Firewall Configuration**
```bash
# Enable firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# Check status
sudo ufw status
```

### **2. Fail2ban Configuration**
```bash
# Configure fail2ban
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

# Start fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### **3. SSL Certificate**
```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d siem.projectjupiter.in

# Test renewal
sudo certbot renew --dry-run
```

---

## **📊 Monitoring & Maintenance**

### **1. System Monitoring**
```bash
# Make maintenance script executable
chmod +x deployment/maintenance.sh

# Check system status
./deployment/maintenance.sh status

# Perform maintenance
./deployment/maintenance.sh maintenance

# Create backup
./deployment/maintenance.sh backup
```

### **2. Log Monitoring**
```bash
# View real-time logs
sudo journalctl -u jupiter-backend -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View Cloudflare tunnel logs
sudo journalctl -u cloudflared -f
```

### **3. Performance Monitoring**
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tuln
```

---

## **🔍 Troubleshooting**

### **Common Issues & Solutions**

#### **1. Services Not Starting**
```bash
# Check service status
sudo systemctl status jupiter-backend
sudo systemctl status nginx
sudo systemctl status cloudflared

# Check logs
sudo journalctl -u jupiter-backend --since "1 hour ago"
sudo journalctl -u nginx --since "1 hour ago"
sudo journalctl -u cloudflared --since "1 hour ago"
```

#### **2. DNS Not Resolving**
```bash
# Check DNS resolution
nslookup siem.projectjupiter.in
dig siem.projectjupiter.in

# Check Cloudflare tunnel
cloudflared tunnel info jupiter-siem
```

#### **3. SSL Certificate Issues**
```bash
# Check certificate
openssl s_client -connect siem.projectjupiter.in:443 -servername siem.projectjupiter.in

# Renew certificate
sudo certbot renew
```

#### **4. Port Conflicts**
```bash
# Check what's using ports
sudo netstat -tuln | grep :8080
sudo netstat -tuln | grep :8001

# Kill processes if needed
sudo kill -9 <PID>
```

---

## **🚀 Access Your SIEM**

### **Local Access**
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/api/
- **Health Check**: http://localhost:8080/api/health

### **Public Access**
- **Frontend**: https://siem.projectjupiter.in
- **API**: https://siem.projectjupiter.in/api/
- **Health Check**: https://siem.projectjupiter.in/api/health

### **Default Credentials**
- **Email**: admin@projectjupiter.in
- **Password**: (set in .env file)

---

## **📋 Post-Deployment Checklist**

- [ ] All services running (`sudo systemctl status jupiter-backend nginx cloudflared`)
- [ ] DNS resolving (`nslookup siem.projectjupiter.in`)
- [ ] SSL certificate working (`curl -I https://siem.projectjupiter.in`)
- [ ] Cloudflare tunnel connected (`cloudflared tunnel info jupiter-siem`)
- [ ] Firewall configured (`sudo ufw status`)
- [ ] Fail2ban active (`sudo systemctl status fail2ban`)
- [ ] Monitoring scripts working (`./deployment/maintenance.sh status`)
- [ ] Backup system configured (`./deployment/maintenance.sh backup`)
- [ ] AI models loaded (check `/api/ai/models/status`)
- [ ] Query builder working (test in UI)

---

## **🔄 Updates & Maintenance**

### **Regular Maintenance**
```bash
# Weekly maintenance
./deployment/maintenance.sh maintenance

# Daily status check
./deployment/maintenance.sh status

# Monthly backup
./deployment/maintenance.sh backup
```

### **System Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update project
cd /home/$USER/jupiter-siem
git pull
./deployment/update.sh
```

### **AI Model Updates**
```bash
# Update AI models
cd /home/$USER/jupiter-siem/backend
source venv/bin/activate
pip install --upgrade torch transformers sentence-transformers
```

---

## **🎯 Your SIEM is Ready!**

**Access URLs:**
- **Public**: https://siem.projectjupiter.in
- **Local**: http://localhost:8080

**Features Available:**
- ✅ **OCSF Query Builder** with AI assistance
- ✅ **Real-time Log Analysis** with RTX 3060
- ✅ **Threat Intelligence** integration
- ✅ **RAG System** for log insights
- ✅ **Multi-tenant Architecture**
- ✅ **Role-based Access Control**
- ✅ **Apache NiFi Integration** ready
- ✅ **Cloudflare Tunnel** security

**Next Steps:**
1. **Configure Apache NiFi** for EVTX to OCSF transformation
2. **Set up log collection** from your 20 customers
3. **Train AI models** on your specific log patterns
4. **Configure threat intelligence** feeds
5. **Set up monitoring** and alerting

Your JupiterEmerge SIEM is now production-ready and securely accessible via your projectjupiter.in subdomain! 🎉
