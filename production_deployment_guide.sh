#!/bin/bash

# Jupiter SIEM Production Deployment Guide
# Debian 13 Server Setup for projectjupiter.in

set -e

# Configuration
DOMAIN="projectjupiter.in"
ADMIN_EMAIL="harsha@projectjupiter.in"
REPO_DIR="/srv/jupiter/JupiterEmerge"
INSTALL_DIR="/opt/jupiter-siem"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "============================================================"
    echo "          Jupiter SIEM Production Deployment"
    echo "          Domain: $DOMAIN"
    echo "          Server: Debian 13"
    echo "============================================================"
    echo -e "${NC}"
}

print_step() { echo -e "${GREEN}[STEP] $1${NC}"; }
print_info() { echo -e "${BLUE}[INFO] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[WARN] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}"; }

check_prerequisites() {
    print_step "Checking Prerequisites"
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo privileges"
        exit 1
    fi
    
    # Check if repository exists
    if [ ! -d "$REPO_DIR" ]; then
        print_error "Repository not found at $REPO_DIR"
        print_info "Please clone the repository first:"
        print_info "git clone https://github.com/Soldier0x0/JupiterEmerge.git $REPO_DIR"
        exit 1
    fi
    
    print_info "✅ Prerequisites check passed"
}

install_dependencies() {
    print_step "Installing System Dependencies"
    
    # Update system
    apt update && apt upgrade -y
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        git \
        unzip \
        gnupg2 \
        ca-certificates \
        lsb-release \
        software-properties-common \
        nginx \
        certbot \
        python3-certbot-nginx \
        htop \
        ufw \
        fail2ban
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        print_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
        rm get-docker.sh
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_info "Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    # Install Node.js (for frontend building if needed)
    if ! command -v node &> /dev/null; then
        print_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    
    print_info "✅ Dependencies installed"
}

setup_directories() {
    print_step "Setting Up Production Directory Structure"
    
    # Create production directory
    mkdir -p "$INSTALL_DIR"
    
    # Copy repository to production location
    rsync -av --progress "$REPO_DIR/" "$INSTALL_DIR/" --exclude='.git'
    
    # Create additional directories
    mkdir -p "$INSTALL_DIR"/{logs,backups,ssl,scripts,config}
    
    # Set proper permissions
    chown -R root:root "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    
    print_info "✅ Directory structure created at $INSTALL_DIR"
}

configure_environment() {
    print_step "Configuring Production Environment"
    
    cd "$INSTALL_DIR"
    
    # Collect user inputs for production
    echo -e "${YELLOW}=== Production Configuration ===${NC}"
    
    read -sp "Enter MongoDB admin password (min 16 chars): " MONGO_PASSWORD
    echo
    while [[ ${#MONGO_PASSWORD} -lt 16 ]]; do
        print_error "Password too short for production!"
        read -sp "Enter MongoDB admin password (min 16 chars): " MONGO_PASSWORD
        echo
    done
    
    read -sp "Enter JWT secret key (min 64 chars): " JWT_SECRET
    echo
    while [[ ${#JWT_SECRET} -lt 64 ]]; do
        print_error "JWT secret too short for production!"
        read -sp "Enter JWT secret key (min 64 chars): " JWT_SECRET
        echo
    done
    
    read -sp "Enter email app password for $ADMIN_EMAIL: " EMAIL_PASSWORD
    echo
    
    # Create backend environment
    cat > backend/.env << EOF
# Production Database Configuration
MONGO_URL=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/jupiter_siem?authSource=admin

# Security Configuration
JWT_SECRET=$JWT_SECRET
ENVIRONMENT=production
DEBUG=false

# Email Configuration
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=$ADMIN_EMAIL
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_USE_TLS=true

# Admin Configuration
SUPER_ADMIN_EMAIL=$ADMIN_EMAIL

# API Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900

# Threat Intelligence APIs (your existing keys)
VT_API_KEY=b89331bda6300ef0df9e67021daa92a2dd6513a505bd345ebe0c652c956ed767
VT_RATE_LIMIT_PER_MIN=4
VT_RATE_LIMIT_PER_DAY=500

ABUSEIPDB_API_KEY=548c80405c02d9992931e7683e1328c6e2b5feb021a4ebd9d8b6eaceb9798011821cb476d6cb3f08
ABUSEIPDB_RATE_LIMIT_CHECKS_PER_DAY=1000

OTX_API_KEY=fb20ae93a7af4e3341005b4d0bf09e16a0b958d2047d57c17b20d3aaaf8fd474

INTELX_API_KEY=secureinsight-1
INTELX_URL=https://free.intelx.io/
INTELX_RATE_LIMIT_SEARCH_PER_MONTH=50

LEAKIX_API_KEY=MuyNozCtkYTIJJB_8Q_JHeLRZliJ4CGFRoCu1wOCOFu4QtK1
LEAKIX_RATE_LIMIT_PER_MONTH=3000

FOFA_EMAIL=$ADMIN_EMAIL
FOFA_KEY=be658263f8d7b6be644b730545df7c62
FOFA_RATE_LIMIT_PER_MONTH=300

# Security Headers
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
TRUSTED_HOSTS=$DOMAIN,www.$DOMAIN,localhost
EOF

    # Create frontend environment
    cat > frontend/.env.production << EOF
VITE_BACKEND_URL=https://$DOMAIN/api
VITE_APP_NAME="Jupiter SIEM"
VITE_ADMIN_EMAIL=$ADMIN_EMAIL
VITE_ENVIRONMENT=production
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=false
EOF

    # Create Docker Compose environment
    cat > .env << EOF
# Project Configuration
COMPOSE_PROJECT_NAME=jupiter-siem
DOMAIN=$DOMAIN
ADMIN_EMAIL=$ADMIN_EMAIL

# Database Credentials
MONGO_USER=admin
MONGO_PASSWORD=$MONGO_PASSWORD

# Network Configuration
NETWORK_SUBNET=172.20.0.0/16

# Backup Configuration
BACKUP_RETENTION_DAYS=30
EOF

    print_info "✅ Production environment configured"
}

create_production_compose() {
    print_step "Creating Production Docker Compose Configuration"
    
    cd "$INSTALL_DIR"
    
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database with Production Configuration
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb-prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: jupiter_siem
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - ./config/mongod.conf:/etc/mongod.conf:ro
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
      - ./backups:/backups
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:27017:27017"
    command: ["mongod", "--config", "/etc/mongod.conf"]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Redis for Caching and Session Management
  redis:
    image: redis:7-alpine
    container_name: jupiter-redis-prod
    restart: always
    command: redis-server --requirepass ${MONGO_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - jupiter-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend with Production Configuration
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
      args:
        - BUILD_ENV=production
    container_name: jupiter-backend-prod
    restart: always
    env_file:
      - ./backend/.env
    environment:
      - REDIS_URL=redis://redis:6379
      - WORKERS=4
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:8001:8001"
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
      - /etc/localtime:/etc/localtime:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 60s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  # React Frontend with Nginx
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        - BUILD_ENV=production
    container_name: jupiter-frontend-prod
    restart: always
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    container_name: jupiter-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx-main.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
      - /var/log/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - jupiter-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  redis_data:
    driver: local

networks:
  jupiter-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: ${NETWORK_SUBNET}
EOF

    print_info "✅ Production Docker Compose created"
}

create_production_dockerfiles() {
    print_step "Creating Production Dockerfiles"
    
    cd "$INSTALL_DIR"
    
    # Backend Production Dockerfile
    cat > backend/Dockerfile.prod << 'EOF'
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp \
    && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Expose port
EXPOSE 8001

# Run application with gunicorn for production
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8001", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--access-logfile", "/app/logs/access.log", "--error-logfile", "/app/logs/error.log", "--log-level", "info"]
EOF

    # Frontend Production Dockerfile
    cat > frontend/Dockerfile.prod << 'EOF'
# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci --only=production=false --silent

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add health check endpoint
RUN echo '#!/bin/sh\necho "OK"' > /usr/share/nginx/html/health \
    && chmod +x /usr/share/nginx/html/health

# Create non-root user
RUN addgroup -g 1001 -S nginx-user \
    && adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user \
    && chown -R nginx-user:nginx-user /usr/share/nginx/html \
    && chown -R nginx-user:nginx-user /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Run as non-root user
USER nginx-user

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    print_info "✅ Production Dockerfiles created"
}

create_nginx_configuration() {
    print_step "Creating Production Nginx Configuration"
    
    cd "$INSTALL_DIR"
    
    # Main Nginx configuration for reverse proxy
    cat > config/nginx-main.conf << EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/s;

    # Upstream definitions
    upstream backend {
        server frontend:80 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream api {
        server backend:8001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        # Allow Certbot challenges
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;

        # SSL Configuration
        ssl_certificate /etc/ssl/certs/$DOMAIN.crt;
        ssl_certificate_key /etc/ssl/certs/$DOMAIN.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self';" always;

        # Main application
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api/api/;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # CORS headers for API
            add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;

            # Handle preflight requests
            if (\$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "https://$DOMAIN";
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type "text/plain charset=UTF-8";
                add_header Content-Length 0;
                return 204;
            }

            # API specific timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 120s;
        }

        # Authentication endpoints with stricter rate limiting
        location ~ ^/api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files \$uri =404;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    # Frontend Nginx configuration
    cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF

    print_info "✅ Nginx configuration created"
}

setup_ssl() {
    print_step "Setting Up SSL/TLS Certificates"
    
    cd "$INSTALL_DIR"
    
    # Stop nginx if running
    systemctl stop nginx 2>/dev/null || true
    
    # Get Let's Encrypt certificate
    print_info "Obtaining SSL certificate from Let's Encrypt..."
    certbot certonly --standalone \
        --email "$ADMIN_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
    
    # Copy certificates to project directory
    mkdir -p ssl
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/$DOMAIN.crt
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/$DOMAIN.key
    
    # Set up certificate renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $INSTALL_DIR/docker-compose.prod.yml restart nginx") | crontab -
    
    print_info "✅ SSL certificates configured"
}

configure_firewall() {
    print_step "Configuring Firewall"
    
    # Configure UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    print_info "✅ Firewall and security configured"
}

create_management_scripts() {
    print_step "Creating Management Scripts"
    
    cd "$INSTALL_DIR"
    
    # Deployment script
    cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
set -e

cd /opt/jupiter-siem

echo "🚀 Deploying Jupiter SIEM..."

# Pull latest changes (if using git)
# git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
./scripts/health-check.sh

echo "✅ Deployment complete!"
EOF

    # Health check script
    cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Jupiter SIEM Health Check"
echo "=========================="

# Check Docker services
echo "Docker Services:"
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml ps

echo ""
echo "Service Health:"

# Backend health
if curl -s -f https://projectjupiter.in/api/health > /dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Frontend health  
if curl -s -f https://projectjupiter.in/health > /dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# SSL certificate check
echo ""
echo "SSL Certificate:"
openssl x509 -in /opt/jupiter-siem/ssl/projectjupiter.in.crt -noout -dates
EOF

    # Backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/jupiter-siem/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Creating Jupiter SIEM backup..."

mkdir -p "$BACKUP_DIR"

# Database backup
docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml exec -T mongodb mongodump --archive --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"

# Configuration backup
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /opt/jupiter-siem/.env \
    /opt/jupiter-siem/backend/.env \
    /opt/jupiter-siem/frontend/.env.production \
    /opt/jupiter-siem/config/ \
    /etc/nginx/sites-available/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR"
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_info "✅ Management scripts created"
}

setup_monitoring() {
    print_step "Setting Up Basic Monitoring"
    
    # Create log rotation configuration
    cat > /etc/logrotate.d/jupiter-siem << 'EOF'
/opt/jupiter-siem/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        docker-compose -f /opt/jupiter-siem/docker-compose.prod.yml restart backend frontend
    endscript
}
EOF

    # Create monitoring script
    cat > /usr/local/bin/jupiter-monitor << 'EOF'
#!/bin/bash

SERVICES=("jupiter-mongodb-prod" "jupiter-backend-prod" "jupiter-frontend-prod" "jupiter-nginx-prod")
WEBHOOK_URL=""  # Add webhook URL for notifications

for service in "${SERVICES[@]}"; do
    if ! docker ps | grep -q "$service"; then
        echo "⚠️  Service $service is down!" | logger -t jupiter-siem
        # Send notification (implement webhook/email notification here)
    fi
done

# Check disk space
USAGE=$(df /opt/jupiter-siem | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$USAGE" -gt 80 ]; then
    echo "⚠️  Disk usage is ${USAGE}%" | logger -t jupiter-siem
fi
EOF

    chmod +x /usr/local/bin/jupiter-monitor

    # Add monitoring to cron
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/jupiter-monitor") | crontab -

    print_info "✅ Basic monitoring configured"
}

deploy_production() {
    print_step "Deploying Production Services"
    
    cd "$INSTALL_DIR"
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 60
    
    # Create super admin
    print_info "Creating super admin user..."
    docker-compose -f docker-compose.prod.yml exec -T backend python -c "
import sys
sys.path.append('/app')
import asyncio
from main import create_super_admin

async def setup_admin():
    try:
        result = await create_super_admin('$ADMIN_EMAIL', 'MainTenant')
        print('✅ Super admin created:', result)
    except Exception as e:
        print('ℹ️  Admin may already exist:', str(e))

asyncio.run(setup_admin())
" || print_warning "Admin user may already exist"
    
    print_info "✅ Production deployment complete"
}

show_completion_info() {
    print_step "Production Deployment Complete!"
    
    echo -e "${GREEN}"
    echo "============================================================"
    echo "🎉         Jupiter SIEM Production Ready!"
    echo "============================================================"
    echo
    echo "🌐 Access URLs:"
    echo "   • Main Site: https://$DOMAIN"
    echo "   • API Docs:  https://$DOMAIN/api/docs"
    echo "   • Health:    https://$DOMAIN/api/health"
    echo
    echo "🔐 Admin Login:"
    echo "   • Email:     $ADMIN_EMAIL"
    echo "   • Tenant:    MainTenant"
    echo "   • OTP:       Check email for authentication code"
    echo
    echo "📊 Management Commands:"
    echo "   • Deploy:    $INSTALL_DIR/scripts/deploy.sh"
    echo "   • Health:    $INSTALL_DIR/scripts/health-check.sh"
    echo "   • Backup:    $INSTALL_DIR/scripts/backup.sh"
    echo "   • Logs:      docker-compose -f $INSTALL_DIR/docker-compose.prod.yml logs -f"
    echo
    echo "🔧 System Services:"
    echo "   • Status:    systemctl status docker nginx fail2ban"
    echo "   • Firewall:  ufw status"
    echo "   • SSL:       certbot certificates"
    echo
    echo "📁 Important Directories:"
    echo "   • App:       $INSTALL_DIR"
    echo "   • Logs:      $INSTALL_DIR/logs"
    echo "   • Backups:   $INSTALL_DIR/backups"
    echo "   • SSL:       $INSTALL_DIR/ssl"
    echo
    echo "🔒 Security Features:"
    echo "   • ✅ HTTPS with Let's Encrypt"
    echo "   • ✅ Firewall (UFW) configured"
    echo "   • ✅ Fail2ban protection"
    echo "   • ✅ Security headers"
    echo "   • ✅ Rate limiting"
    echo
    echo "🎯 Next Steps:"
    echo "   1. Access https://$DOMAIN and login"
    echo "   2. Configure additional threat intel APIs"
    echo "   3. Set up monitoring/alerting"
    echo "   4. Add team members"
    echo "   5. Configure backup automation"
    echo
    echo "============================================================"
    echo -e "${NC}"
}

# Main execution
main() {
    print_header
    
    check_prerequisites
    install_dependencies
    setup_directories
    configure_environment
    create_production_compose
    create_production_dockerfiles
    create_nginx_configuration
    setup_ssl
    configure_firewall
    create_management_scripts
    setup_monitoring
    deploy_production
    show_completion_info
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi