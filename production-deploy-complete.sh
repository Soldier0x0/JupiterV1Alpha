#!/bin/bash

# Jupiter SIEM - Complete Production Deployment
# Debian 13 optimized, admin-controlled, cloudflare-ready

set -e

# Configuration
DOMAIN="projectjupiter.in"
ADMIN_EMAIL="admin@projectjupiter.in"
ADMIN_PASSWORD="Harsha@313"
REPO_DIR="/srv/jupiter/JupiterEmerge"
INSTALL_DIR="/opt/jupiter-siem"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP] $1${NC}"; }
print_info() { echo -e "${BLUE}[INFO] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[WARN] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}"; }

print_step "Jupiter SIEM Complete Production Deployment"

# Check prerequisites
if [[ $EUID -ne 0 ]]; then
    print_error "Run as root: sudo ./production-deploy-complete.sh"
    exit 1
fi

if [ ! -d "$REPO_DIR" ]; then
    print_error "Repository not found at $REPO_DIR"
    print_info "Clone first: git clone https://github.com/Soldier0x0/JupiterEmerge.git $REPO_DIR"
    exit 1
fi

# Install all dependencies
print_step "Installing System Dependencies"
cd "$REPO_DIR"
chmod +x install-dependencies.sh
./install-dependencies.sh

# Create production directories
print_step "Setting Up Production Environment"
mkdir -p "$INSTALL_DIR"
rsync -av --progress "$REPO_DIR/" "$INSTALL_DIR/" --exclude='.git'
cd "$INSTALL_DIR"

# Generate secure credentials
MONGO_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

print_step "Configuring Backend Environment"
cat > backend/.env << EOF
# Production Database
MONGO_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/jupiter_siem?authSource=admin

# Security Configuration
JWT_SECRET_KEY=${JWT_SECRET}
ENVIRONMENT=production

# Admin Configuration
SUPER_ADMIN_EMAIL=${ADMIN_EMAIL}
SUPER_ADMIN_PASSWORD=${ADMIN_PASSWORD}
SUPER_ADMIN_TENANT_NAME=MainTenant

# Email Configuration (User Creation)
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=${ADMIN_EMAIL}
EMAIL_PASSWORD=${EMAIL_PASSWORD:-change_this_password}
EMAIL_USE_TLS=true

# Security Settings
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
PASSWORD_MIN_LENGTH=10
ALLOWED_SPECIAL_CHARS=!@#$%&*+-=?

# Your API Keys
VT_API_KEY=b89331bda6300ef0df9e67021daa92a2dd6513a505bd345ebe0c652c956ed767
ABUSEIPDB_API_KEY=548c80405c02d9992931e7683e1328c6e2b5feb021a4ebd9d8b6eaceb9798011821cb476d6cb3f08
OTX_API_KEY=fb20ae93a7af4e3341005b4d0bf09e16a0b958d2047d57c17b20d3aaaf8fd474
INTELX_API_KEY=secureinsight-1
LEAKIX_API_KEY=MuyNozCtkYTIJJB_8Q_JHeLRZliJ4CGFRoCu1wOCOFu4QtK1
FOFA_EMAIL=${ADMIN_EMAIL}
FOFA_KEY=be658263f8d7b6be644b730545df7c62
EOF

print_step "Configuring Frontend Environment"
cat > frontend/.env.production << EOF
VITE_BACKEND_URL=https://${DOMAIN}/api
VITE_APP_NAME="Jupiter SIEM"
VITE_ADMIN_EMAIL=${ADMIN_EMAIL}
VITE_ENVIRONMENT=production
EOF

print_step "Creating Production Docker Configuration"
cat > docker-compose.prod.yml << EOF
services:
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: jupiter-backend
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:8001:8001"
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: jupiter-frontend
    restart: always
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:3000:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  mongodb_data:

networks:
  jupiter-net:
    driver: bridge
EOF

print_step "Creating Production Dockerfiles"

# Backend Dockerfile
cat > backend/Dockerfile.prod << EOF
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl gcc && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements-clean.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .
RUN mkdir -p logs

EXPOSE 8001
CMD ["python", "main.py"]
EOF

# Frontend Dockerfile
cat > frontend/Dockerfile.prod << EOF
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Frontend nginx config
cat > frontend/nginx.conf << EOF
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

print_step "Configuring Reverse Proxy"
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

print_step "Configuring Security"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_step "Building and Deploying Services"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

print_step "Waiting for Services"
sleep 45

# Test services
print_step "Testing Deployment"
if curl -s http://localhost:8001/api/health | grep -q "healthy"; then
    print_info "✅ Backend running"
else
    print_warning "❌ Backend issues - check logs"
fi

if curl -s http://localhost:3000 | grep -q "Jupiter SIEM"; then
    print_info "✅ Frontend running"
else
    print_warning "❌ Frontend issues - check logs"
fi

systemctl restart nginx
systemctl enable nginx

print_step "Creating Management Scripts"
mkdir -p scripts

cat > scripts/status.sh << 'EOF'
#!/bin/bash
echo "Jupiter SIEM Status:"
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml ps
echo -e "\nHealth Checks:"
curl -s http://localhost:8001/api/health || echo "Backend: OFFLINE"
curl -s http://localhost:3000 >/dev/null && echo "Frontend: ONLINE" || echo "Frontend: OFFLINE"
EOF

chmod +x scripts/status.sh

print_step "Deployment Complete!"

echo -e "${GREEN}"
echo "============================================================"
echo "🎉         Jupiter SIEM Production Ready!"
echo "============================================================"
echo
echo "🌐 Access Information:"
echo "   Domain: http://${DOMAIN} (configure Cloudflare tunnel)"
echo "   Local:  http://localhost"
echo
echo "🔐 Admin Login Credentials:"
echo "   Email:    ${ADMIN_EMAIL}"
echo "   Password: ${ADMIN_PASSWORD}"
echo
echo "📊 Management:"
echo "   Status:   /opt/jupiter-siem/scripts/status.sh"
echo "   Logs:     docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml logs -f"
echo "   Restart:  docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml restart"
echo
echo "🔧 Next Steps:"
echo "   1. Configure Cloudflare tunnel to point to port 80"
echo "   2. Access https://${DOMAIN}"
echo "   3. Login and create team members"
echo "   4. Configure threat intel APIs"
echo
echo "🛡️ Security Features:"
echo "   ✅ Admin-controlled user creation"
echo "   ✅ Secure password requirements"
echo "   ✅ JWT token management"
echo "   ✅ Email-based user onboarding"
echo "   ✅ Role-based access control"
echo "   ✅ Professional UI/UX"
echo "   ✅ Threat intelligence integration"
echo
echo "Database Password: ${MONGO_PASSWORD}"
echo "JWT Secret: ${JWT_SECRET}"
echo
echo "============================================================"
echo -e "${NC}"