# 🚀 Jupiter SIEM Self-Hosting Guide
## Debian Server + projectjupiter.in + Cloudflare Setup

### 📋 **Prerequisites Check**
- ✅ Debian server (your laptop)
- ✅ Domain: projectjupiter.in 
- ✅ Cloudflare DNS + TLS
- ✅ Cloudflare tunnel configured

---

## 🛠️ **1. Server Preparation**

### **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
sudo apt install -y curl wget git nginx certbot
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose (latest)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **Create Project Directory**
```bash
# Create deployment directory
sudo mkdir -p /opt/jupiter-siem
cd /opt/jupiter-siem

# Clone your Jupiter SIEM code (or copy from current setup)
```

---

## 🐳 **2. Docker Deployment Setup**

### **Create Production Docker Compose**
Create `/opt/jupiter-siem/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password_here
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:27017:27017"

  # FastAPI Backend
  backend:
    build: ./backend
    container_name: jupiter-backend
    restart: always
    environment:
      - MONGO_URL=mongodb://admin:your_secure_password_here@mongodb:27017/jupiter_siem?authSource=admin
      - JWT_SECRET=your_super_secure_jwt_secret_change_this
      - ENVIRONMENT=production
      - EMAIL_HOST=smtp.gmail.com
      - EMAIL_PORT=587
      - EMAIL_USER=your_email@gmail.com
      - EMAIL_PASSWORD=your_app_password
    depends_on:
      - mongodb
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:8001:8001"

  # React Frontend
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: jupiter-frontend
    restart: always
    environment:
      - VITE_BACKEND_URL=https://projectjupiter.in/api
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:3000:80"

volumes:
  mongodb_data:

networks:
  jupiter-network:
    driver: bridge
```

---

## 📁 **3. Create Production Dockerfiles**

### **Backend Dockerfile** (`/opt/jupiter-siem/backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "server.py"]
```

### **Frontend Dockerfile** (`/opt/jupiter-siem/frontend/Dockerfile.prod`)
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Production server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Frontend Nginx Config** (`/opt/jupiter-siem/frontend/nginx.conf`)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 🌐 **4. Main Nginx Reverse Proxy**

### **Create Main Nginx Config** (`/etc/nginx/sites-available/projectjupiter.in`)
```nginx
server {
    listen 80;
    server_name projectjupiter.in www.projectjupiter.in;

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "DENY";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self';";

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS for API
        add_header Access-Control-Allow-Origin https://projectjupiter.in;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # WebSocket support (if needed)
    location /ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/projectjupiter.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ☁️ **5. Cloudflare Tunnel Configuration**

### **Install Cloudflared**
```bash
# Install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### **Configure Tunnel**
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create jupiter-siem

# Create tunnel config
sudo mkdir -p /etc/cloudflared
```

### **Tunnel Config** (`/etc/cloudflared/config.yml`)
```yaml
tunnel: jupiter-siem
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: projectjupiter.in
    service: http://localhost:80
  - hostname: www.projectjupiter.in  
    service: http://localhost:80
  - service: http_status:404
```

### **Start Tunnel Service**
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## 🔒 **6. Production Environment Setup**

### **Environment Files**

**Backend** (`.env` in backend folder):
```env
# Database
MONGO_URL=mongodb://admin:your_secure_password@mongodb:27017/jupiter_siem?authSource=admin

# Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars_long
ENVIRONMENT=production

# Email (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Optional: API Keys for Threat Intelligence
VIRUSTOTAL_API_KEY=your_vt_key
ABUSEIPDB_API_KEY=your_abuse_key
```

**Frontend** (`.env.production` in frontend folder):
```env
VITE_BACKEND_URL=https://projectjupiter.in/api
VITE_APP_NAME="Jupiter SIEM"
```

---

## 🚀 **7. Deployment Steps**

### **1. Copy Your Code**
```bash
# Copy your Jupiter SIEM code to server
scp -r /path/to/jupiter-siem/* user@your-server:/opt/jupiter-siem/

# Or use git clone if you have it in a repository
```

### **2. Build and Start Services**
```bash
cd /opt/jupiter-siem

# Build and start all services
sudo docker-compose up -d --build

# Check status
sudo docker-compose ps
sudo docker-compose logs
```

### **3. Initialize Database**
```bash
# Create admin user (run this once)
sudo docker-compose exec backend python -c "
import requests
import json

# Create admin user
response = requests.post('http://localhost:8001/api/auth/register', 
    json={
        'email': 'admin@projectjupiter.in',
        'tenant_name': 'MainTenant',
        'is_owner': True
    })
print('Admin created:', response.json())
"
```

---

## 🔧 **8. Cloudflare DNS Setup**

### **DNS Records in Cloudflare**
```
Type: CNAME
Name: projectjupiter.in
Content: YOUR_TUNNEL_ID.cfargotunnel.com
Proxy: Yes (Orange cloud)

Type: CNAME  
Name: www
Content: projectjupiter.in
Proxy: Yes (Orange cloud)
```

### **SSL/TLS Settings in Cloudflare**
- **SSL/TLS Mode:** Full (strict) or Flexible
- **Always Use HTTPS:** On
- **Minimum TLS Version:** 1.2
- **Opportunistic Encryption:** On

---

## 📊 **9. Monitoring & Maintenance**

### **System Status Commands**
```bash
# Check all services
sudo docker-compose ps

# View logs
sudo docker-compose logs -f

# Restart services
sudo docker-compose restart

# Update application
cd /opt/jupiter-siem
git pull  # if using git
sudo docker-compose down
sudo docker-compose up -d --build
```

### **Backup Script** (`/opt/jupiter-siem/backup.sh`)
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/jupiter-siem"

mkdir -p $BACKUP_DIR

# Backup MongoDB
sudo docker-compose exec -T mongodb mongodump --archive > $BACKUP_DIR/mongodb_$DATE.archive

# Backup config files
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/jupiter-siem/.env* /opt/jupiter-siem/docker-compose.yml

# Keep only last 7 days
find $BACKUP_DIR -name "*.archive" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

---

## 🎯 **10. Final Access**

After deployment, access your SIEM at:
- **Main URL:** `https://projectjupiter.in`
- **Admin Login:** Use the admin account you created
- **API Docs:** `https://projectjupiter.in/api/docs`

### **Default Admin Credentials**
- **Email:** `admin@projectjupiter.in`
- **Tenant:** `MainTenant`  
- **OTP:** Will be sent via email (configure SMTP first)

---

## 🔍 **Troubleshooting**

### **Common Issues**
```bash
# Check if services are running
sudo docker-compose ps

# Check nginx status
sudo nginx -t
sudo systemctl status nginx

# Check cloudflared status  
sudo systemctl status cloudflared

# View application logs
sudo docker-compose logs backend
sudo docker-compose logs frontend

# Check network connectivity
curl -I http://localhost:3000
curl -I http://localhost:8001/api/health
```

---

## 🎉 **Success!**

Your Jupiter SIEM is now self-hosted on your Debian server with:
- ✅ Professional domain (projectjupiter.in)
- ✅ Cloudflare CDN + DDoS protection
- ✅ Automatic SSL/TLS certificates
- ✅ Secure tunnel connection
- ✅ Production-ready deployment

Your enterprise SIEM platform is ready for serious security operations! 🛡️