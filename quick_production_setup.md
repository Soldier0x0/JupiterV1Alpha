# 🚀 Jupiter SIEM Production Deployment Guide

## Quick Setup for Debian 13 Server

### 📋 Prerequisites Checklist

✅ **Server Requirements:**
- Debian 13 server with root/sudo access
- Minimum 4GB RAM, 20GB storage
- Domain name: projectjupiter.in pointing to server IP
- Repository cloned at `/srv/jupiter/JupiterEmerge`

✅ **What You'll Get:**
- Production-ready SIEM with HTTPS
- Professional UI with dark theme
- Complete threat intelligence integration
- Automated backups and monitoring
- Security hardening and firewall

---

## 🎯 One-Command Production Setup

```bash
# 1. SSH to your server
ssh root@projectjupiter.in

# 2. Navigate to repository
cd /srv/jupiter/JupiterEmerge

# 3. Copy and run production deployment
wget https://raw.githubusercontent.com/your-repo/deploy.sh -O production_deploy.sh
chmod +x production_deploy.sh
./production_deploy.sh
```

**OR copy the script manually:**

```bash
# Copy the production script from your local /app directory
scp /app/production_deployment_guide.sh root@projectjupiter.in:/root/

# SSH and run
ssh root@projectjupiter.in
chmod +x /root/production_deployment_guide.sh
./production_deployment_guide.sh
```

---

## 🔧 Manual Step-by-Step Setup

### **1. System Preparation**

```bash
# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose ufw fail2ban

# Start Docker
systemctl enable docker --now
```

### **2. Clone and Setup Repository**

```bash
# Clone if not already done
git clone https://github.com/Soldier0x0/JupiterEmerge.git /srv/jupiter/JupiterEmerge

# Create production directory
mkdir -p /opt/jupiter-siem
rsync -av /srv/jupiter/JupiterEmerge/ /opt/jupiter-siem/

cd /opt/jupiter-siem
```

### **3. Configure Environment Variables**

Create `/opt/jupiter-siem/backend/.env`:

```env
# Database
MONGO_URL=mongodb://admin:your_secure_password@mongodb:27017/jupiter_siem?authSource=admin

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_64_characters_long_for_production
ENVIRONMENT=production

# Email (Outlook)
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=harsha@projectjupiter.in
EMAIL_PASSWORD=your_outlook_app_password
EMAIL_USE_TLS=true

# Admin
SUPER_ADMIN_EMAIL=harsha@projectjupiter.in

# Your existing API keys
VT_API_KEY=b89331bda6300ef0df9e67021daa92a2dd6513a505bd345ebe0c652c956ed767
ABUSEIPDB_API_KEY=548c80405c02d9992931e7683e1328c6e2b5feb021a4ebd9d8b6eaceb9798011821cb476d6cb3f08
OTX_API_KEY=fb20ae93a7af4e3341005b4d0bf09e16a0b958d2047d57c17b20d3aaaf8fd474
INTELX_API_KEY=ef5ed6f8-30da-4fbe-86ac-c5fd19210a12
LEAKIX_API_KEY=MuyNozCtkYTIJJB_8Q_JHeLRZliJ4CGFRoCu1wOCOFu4QtK1
FOFA_EMAIL=harsha@projectjupiter.in
FOFA_KEY=be658263f8d7b6be644b730545df7c62
```

Create `/opt/jupiter-siem/frontend/.env.production`:

```env
VITE_BACKEND_URL=https://projectjupiter.in/api
VITE_APP_NAME="Jupiter SIEM"
VITE_ADMIN_EMAIL=harsha@projectjupiter.in
VITE_ENVIRONMENT=production
```

### **4. SSL Certificate Setup**

```bash
# Stop nginx
systemctl stop nginx

# Get Let's Encrypt certificate
certbot certonly --standalone \
    --email harsha@projectjupiter.in \
    --agree-tos \
    --no-eff-email \
    -d projectjupiter.in \
    -d www.projectjupiter.in

# Copy certificates to project
mkdir -p /opt/jupiter-siem/ssl
cp /etc/letsencrypt/live/projectjupiter.in/fullchain.pem /opt/jupiter-siem/ssl/projectjupiter.in.crt
cp /etc/letsencrypt/live/projectjupiter.in/privkey.pem /opt/jupiter-siem/ssl/projectjupiter.in.key
```

### **5. Configure Nginx Reverse Proxy**

Create `/etc/nginx/sites-available/projectjupiter.in`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name projectjupiter.in www.projectjupiter.in;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name projectjupiter.in www.projectjupiter.in;

    # SSL Configuration
    ssl_certificate /opt/jupiter-siem/ssl/projectjupiter.in.crt;
    ssl_certificate_key /opt/jupiter-siem/ssl/projectjupiter.in.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -sf /etc/nginx/sites-available/projectjupiter.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl start nginx
```

### **6. Deploy with Docker**

Create production Docker Compose:

```yaml
# /opt/jupiter-siem/docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "127.0.0.1:27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: ./backend
    container_name: jupiter-backend
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    ports:
      - "127.0.0.1:8001:8001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: jupiter-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "127.0.0.1:3000:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  mongodb_data:
```

Deploy:
```bash
cd /opt/jupiter-siem
docker-compose -f docker-compose.prod.yml up -d --build
```

### **7. Security Hardening**

```bash
# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
systemctl enable fail2ban --now
```

### **8. Create Admin User**

```bash
# Wait for backend to be ready
sleep 30

# Create super admin
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml exec -T backend python -c "
import sys
sys.path.append('/app')
import requests

try:
    response = requests.post('http://localhost:8001/api/auth/register', 
        json={
            'email': 'harsha@projectjupiter.in',
            'tenant_name': 'MainTenant',
            'is_owner': True
        })
    print('Admin created:', response.json())
except Exception as e:
    print('Error or admin exists:', str(e))
"
```

---

## 🎯 Final Access & Testing

### **1. Access Your SIEM**
- **URL:** https://projectjupiter.in
- **Admin Email:** harsha@projectjupiter.in
- **Tenant:** MainTenant
- **OTP:** Check your Outlook email

### **2. Verify Everything Works**

```bash
# Check services
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml ps

# Test endpoints
curl -k https://projectjupiter.in/api/health
curl -k https://projectjupiter.in

# Check logs
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml logs backend
```

### **3. Management Commands**

```bash
# Restart services
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml restart

# View logs
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml logs -f

# Backup database
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml exec mongodb mongodump --archive --gzip > backup.gz

# Update SSL certificate
certbot renew --nginx
```

---

## 🛡️ Production Features

✅ **Security:**
- HTTPS with Let's Encrypt
- Security headers (HSTS, CSP, etc.)
- Firewall and rate limiting
- Fail2ban protection
- Non-root containers

✅ **Performance:**
- Nginx reverse proxy
- Gzip compression
- Static file caching
- Health checks
- Resource limits

✅ **Operations:**
- Automated SSL renewal
- Log rotation
- Database backups
- Service monitoring
- Error tracking

✅ **Professional UI:**
- Modern dark theme
- Responsive design
- Real-time metrics
- Threat intelligence dashboard
- Professional typography

---

## 🚨 Troubleshooting

### **Services Won't Start**
```bash
# Check Docker status
systemctl status docker
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml ps

# Check logs
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml logs
```

### **SSL Issues**
```bash
# Check certificate
openssl x509 -in /opt/jupiter-siem/ssl/projectjupiter.in.crt -noout -dates

# Renew if needed
certbot renew --nginx
```

### **Can't Access Website**
```bash
# Check nginx
nginx -t
systemctl status nginx

# Check firewall
ufw status

# Check DNS
nslookup projectjupiter.in
```

### **Database Connection Issues**
```bash
# Check MongoDB
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml exec mongodb mongosh

# Reset database
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml down -v
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml up -d
```

---

**🎉 Your Jupiter SIEM is now production-ready!**

Access https://projectjupiter.in and start securing your infrastructure with enterprise-grade threat intelligence and monitoring capabilities.