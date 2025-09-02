#!/bin/bash

# Jupiter SIEM Automated Deployment Script
# Domain: projectjupiter.in
# Owner: harsha@projectjupiter.in

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="/var/log/jupiter_siem_deploy.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

print_header() {
    echo -e "${BLUE}"
    echo "============================================================"
    echo "           Jupiter SIEM Automated Deployment"
    echo "           Domain: projectjupiter.in"  
    echo "           Owner: harsha@projectjupiter.in"
    echo "============================================================"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons."
        print_info "Please run as a regular user with sudo privileges."
        exit 1
    fi
    
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo privileges."
        exit 1
    fi
}

# System information
get_system_info() {
    print_step "Gathering System Information"
    
    OS=$(lsb_release -si 2>/dev/null || echo "Unknown")
    OS_VERSION=$(lsb_release -sr 2>/dev/null || echo "Unknown")
    ARCH=$(uname -m)
    TOTAL_RAM=$(free -h | awk '/^Mem:/ {print $2}')
    AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
    
    print_info "Operating System: $OS $OS_VERSION"
    print_info "Architecture: $ARCH"
    print_info "Total RAM: $TOTAL_RAM"
    print_info "Available Disk Space: $AVAILABLE_SPACE"
    
    # Minimum requirements check
    RAM_GB=$(free -g | awk '/^Mem:/ {print $2}')
    if [[ $RAM_GB -lt 2 ]]; then
        print_warning "System has less than 2GB RAM. Jupiter SIEM may run slowly."
    fi
}

# Check existing installations
check_existing_installations() {
    print_step "Checking Existing Installations"
    
    # Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
        print_info "Docker found: $DOCKER_VERSION"
        DOCKER_INSTALLED=true
    else
        print_info "Docker: Not installed"
        DOCKER_INSTALLED=false
    fi
    
    # Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | sed 's/,//')
        print_info "Docker Compose found: $COMPOSE_VERSION"
        COMPOSE_INSTALLED=true
    else
        print_info "Docker Compose: Not installed"
        COMPOSE_INSTALLED=false
    fi
    
    # Nginx
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
        print_info "Nginx found: $NGINX_VERSION"
        NGINX_INSTALLED=true
    else
        print_info "Nginx: Not installed"
        NGINX_INSTALLED=false
    fi
    
    # Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_info "Git found: $GIT_VERSION"
        GIT_INSTALLED=true
    else
        print_info "Git: Not installed"
        GIT_INSTALLED=false
    fi
    
    # Cloudflared
    if command -v cloudflared &> /dev/null; then
        CLOUDFLARED_VERSION=$(cloudflared version | head -1)
        print_info "Cloudflared found: $CLOUDFLARED_VERSION"
        CLOUDFLARED_INSTALLED=true
    else
        print_info "Cloudflared: Not installed"
        CLOUDFLARED_INSTALLED=false
    fi
    
    # Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_info "Python3 found: $PYTHON_VERSION"
        PYTHON_INSTALLED=true
    else
        print_info "Python3: Not installed"
        PYTHON_INSTALLED=false
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_info "Node.js found: $NODE_VERSION"
        NODE_INSTALLED=true
    else
        print_info "Node.js: Not installed"
        NODE_INSTALLED=false
    fi
}

# Collect user inputs
collect_user_inputs() {
    print_step "Collecting Configuration Details"
    
    # Database credentials
    echo -e "${YELLOW}"
    read -p "Enter MongoDB admin username [default: admin]: " MONGO_USER
    MONGO_USER=${MONGO_USER:-admin}
    
    read -sp "Enter MongoDB admin password (minimum 12 characters): " MONGO_PASSWORD
    echo
    while [[ ${#MONGO_PASSWORD} -lt 12 ]]; do
        print_error "Password too short. Minimum 12 characters required."
        read -sp "Enter MongoDB admin password: " MONGO_PASSWORD
        echo
    done
    
    # JWT Secret
    read -sp "Enter JWT secret key (minimum 32 characters): " JWT_SECRET
    echo
    while [[ ${#JWT_SECRET} -lt 32 ]]; do
        print_error "JWT secret too short. Minimum 32 characters required."
        read -sp "Enter JWT secret key: " JWT_SECRET
        echo
    done
    
    # Email configuration for OTP
    print_info "Email Configuration (for OTP delivery)"
    print_info "Using harsha@projectjupiter.in as configured"
    
    read -sp "Enter email app password for harsha@projectjupiter.in: " EMAIL_PASSWORD
    echo
    
    # Cloudflare details
    print_info "Cloudflare Configuration"
    read -p "Enter your Cloudflare tunnel name [default: jupiter-siem]: " TUNNEL_NAME
    TUNNEL_NAME=${TUNNEL_NAME:-jupiter-siem}
    
    # Installation directory
    read -p "Enter installation directory [default: /opt/jupiter-siem]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-/opt/jupiter-siem}
    
    echo -e "${NC}"
}

# Install missing dependencies
install_dependencies() {
    print_step "Installing Missing Dependencies"
    
    # Update package list
    sudo apt update
    
    # Install basic packages
    sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
    
    # Install Docker if not present
    if [[ $DOCKER_INSTALLED == false ]]; then
        print_info "Installing Docker..."
        curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker $USER
        sudo systemctl enable docker
        sudo systemctl start docker
        print_info "Docker installed successfully"
    fi
    
    # Install Docker Compose if not present
    if [[ $COMPOSE_INSTALLED == false ]]; then
        print_info "Installing Docker Compose..."
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        sudo curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_info "Docker Compose installed successfully"
    fi
    
    # Install Nginx if not present
    if [[ $NGINX_INSTALLED == false ]]; then
        print_info "Installing Nginx..."
        sudo apt install -y nginx
        sudo systemctl enable nginx
        print_info "Nginx installed successfully"
    fi
    
    # Install Git if not present
    if [[ $GIT_INSTALLED == false ]]; then
        print_info "Installing Git..."
        sudo apt install -y git
        print_info "Git installed successfully"
    fi
    
    # Install Cloudflared if not present
    if [[ $CLOUDFLARED_INSTALLED == false ]]; then
        print_info "Installing Cloudflared..."
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
        print_info "Cloudflared installed successfully"
    fi
    
    # Install Python if not present
    if [[ $PYTHON_INSTALLED == false ]]; then
        print_info "Installing Python3..."
        sudo apt install -y python3 python3-pip python3-venv
        print_info "Python3 installed successfully"
    fi
    
    # Install Node.js if not present
    if [[ $NODE_INSTALLED == false ]]; then
        print_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        print_info "Node.js installed successfully"
    fi
}

# Setup project directory and files
setup_project() {
    print_step "Setting up Project Directory"
    
    # Create installation directory
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Create directory structure
    mkdir -p {backend,frontend,nginx,mongodb,scripts,backups}
    
    print_info "Project directory created at $INSTALL_DIR"
}

# Create environment files with API keys
create_environment_files() {
    print_step "Creating Environment Configuration"
    
    # Backend environment file
    cat > "$INSTALL_DIR/backend/.env" << EOF
# Database Configuration
MONGO_URL=mongodb://$MONGO_USER:$MONGO_PASSWORD@mongodb:27017/jupiter_siem?authSource=admin

# Security
JWT_SECRET=$JWT_SECRET
ENVIRONMENT=production

# Email Configuration (OTP)
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=harsha@projectjupiter.in
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_USE_TLS=true

# Super Admin Configuration
SUPER_ADMIN_EMAIL=harsha@projectjupiter.in

# Threat Intelligence API Keys with Rate Limits

# VirusTotal (FREE: 4 req/min, 500 req/day)
VT_API_KEY=b89331bda6300ef0df9e67021daa92a2dd6513a505bd345ebe0c652c956ed767
VT_RATE_LIMIT_PER_MIN=4
VT_RATE_LIMIT_PER_DAY=500

# DNSDumpster (Community scraping)
DNSD_API_KEY=323a48f3eba26f4ea2e3facf6761d256e988513e161eb6b38bef6bbe9df25e4f
DNSD_RATE_LIMIT_NOTE="Community scraping - no official limits"

# AbuseIPDB (FREE: 1000 checks/day, 100 reports/day)
ABUSEIPDB_API_KEY=548c80405c02d9992931e7683e1328c6e2b5feb021a4ebd9d8b6eaceb9798011821cb476d6cb3f08
ABUSEIPDB_RATE_LIMIT_CHECKS_PER_DAY=1000
ABUSEIPDB_RATE_LIMIT_REPORTS_PER_DAY=100

# AlienVault OTX (FREE: No strict limits mentioned)
OTX_API_KEY=fb20ae93a7af4e3341005b4d0bf09e16a0b958d2047d57c17b20d3aaaf8fd474
OTX_RATE_LIMIT_NOTE="No strict limits - reasonable use"

# IntelligenceX (FREE: 50 searches/month, 100 views)
INTELX_API_KEY=secureinsight-1
INTELX_URL=https://free.intelx.io/
INTELX_RATE_LIMIT_SEARCH_PER_MONTH=50
INTELX_RATE_LIMIT_VIEW_PER_MONTH=100

# LeakIX (FREE: 3000 calls/month)
LEAKIX_API_KEY=MuyNozCtkYTIJJB_8Q_JHeLRZliJ4CGFRoCu1wOCOFu4QtK1
LEAKIX_RATE_LIMIT_PER_MONTH=3000

# FOFA (FREE: 300 queries/month)
FOFA_EMAIL=harsha@projectjupiter.in
FOFA_KEY=be658263f8d7b6be644b730545df7c62
FOFA_RATE_LIMIT_PER_MONTH=300

# Additional API Slots (for future use)
CUSTOM_API_1_NAME=""
CUSTOM_API_1_KEY=""
CUSTOM_API_1_RATE_LIMIT=""

CUSTOM_API_2_NAME=""
CUSTOM_API_2_KEY=""
CUSTOM_API_2_RATE_LIMIT=""

CUSTOM_API_3_NAME=""
CUSTOM_API_3_KEY=""
CUSTOM_API_3_RATE_LIMIT=""
EOF

    # Frontend environment file
    cat > "$INSTALL_DIR/frontend/.env.production" << EOF
VITE_BACKEND_URL=https://projectjupiter.in/api
VITE_APP_NAME="Jupiter SIEM"
VITE_ADMIN_EMAIL=harsha@projectjupiter.in
VITE_ENVIRONMENT=production
EOF

    # Docker Compose environment
    cat > "$INSTALL_DIR/.env" << EOF
# Project Configuration
PROJECT_NAME=jupiter-siem
DOMAIN=projectjupiter.in
ADMIN_EMAIL=harsha@projectjupiter.in

# Database
MONGO_USER=$MONGO_USER
MONGO_PASSWORD=$MONGO_PASSWORD

# Paths
INSTALL_DIR=$INSTALL_DIR
EOF

    print_info "Environment files created with API keys and rate limits"
}

# Create Docker Compose file
create_docker_compose() {
    print_step "Creating Docker Compose Configuration"
    
    cat > "$INSTALL_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: jupiter_siem
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:27017:27017"
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/jupiter_siem --quiet
      interval: 30s
      timeout: 10s
      retries: 3

  # FastAPI Backend
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: jupiter-backend
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:8001:8001"
    volumes:
      - ./backend/logs:/app/logs
      - ./backups:/app/backups
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # React Frontend
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: jupiter-frontend
    restart: always
    networks:
      - jupiter-network
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
    driver: local

networks:
  jupiter-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

    print_info "Docker Compose configuration created"
}

# Create production Dockerfiles
create_dockerfiles() {
    print_step "Creating Production Dockerfiles"
    
    # Backend Dockerfile
    cat > "$INSTALL_DIR/backend/Dockerfile" << EOF
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8001/api/health || exit 1

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "server.py"]
EOF

    # Frontend Dockerfile
    cat > "$INSTALL_DIR/frontend/Dockerfile.prod" << EOF
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.prod.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Frontend Nginx config
    cat > "$INSTALL_DIR/frontend/nginx.prod.conf" << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
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

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Handle React Router
        location / {
            try_files \$uri \$uri/ /index.html;
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
    }
}
EOF

    print_info "Production Dockerfiles created"
}

# Create MongoDB initialization script
create_mongodb_init() {
    print_step "Creating MongoDB Initialization"
    
    cat > "$INSTALL_DIR/mongodb/mongo-init.js" << EOF
// Jupiter SIEM Database Initialization
print('Starting Jupiter SIEM database initialization...');

// Switch to jupiter_siem database
db = db.getSiblingDB('jupiter_siem');

// Create collections with validation
db.createCollection('users', {
    validator: {
        \$jsonSchema: {
            bsonType: "object",
            required: ["_id", "email", "tenant_id", "created_at"],
            properties: {
                _id: { bsonType: "string" },
                email: { bsonType: "string", pattern: "^.+@.+\..+$" },
                tenant_id: { bsonType: "string" },
                is_owner: { bsonType: "bool" },
                role_id: { bsonType: "string" },
                created_at: { bsonType: "date" },
                last_login: { bsonType: ["date", "null"] },
                twofa_enabled: { bsonType: "bool" },
                twofa_verified: { bsonType: "bool" }
            }
        }
    }
});

db.createCollection('tenants', {
    validator: {
        \$jsonSchema: {
            bsonType: "object",
            required: ["_id", "name", "created_at"],
            properties: {
                _id: { bsonType: "string" },
                name: { bsonType: "string" },
                created_at: { bsonType: "date" },
                enabled: { bsonType: "bool" }
            }
        }
    }
});

db.createCollection('roles');
db.createCollection('alerts');
db.createCollection('iocs');
db.createCollection('automations');
db.createCollection('api_keys');
db.createCollection('logs');
db.createCollection('cases');
db.createCollection('sessions');
db.createCollection('api_usage_logs');

// Create indexes for better performance
db.users.createIndex({ "email": 1, "tenant_id": 1 }, { unique: true });
db.users.createIndex({ "tenant_id": 1 });
db.tenants.createIndex({ "name": 1 }, { unique: true });
db.alerts.createIndex({ "tenant_id": 1, "timestamp": -1 });
db.iocs.createIndex({ "tenant_id": 1, "ioc_type": 1 });
db.logs.createIndex({ "tenant_id": 1, "timestamp": -1 });
db.api_usage_logs.createIndex({ "api_name": 1, "timestamp": -1 });

print('Database initialization completed successfully!');
EOF

    print_info "MongoDB initialization script created"
}

# Create main Nginx configuration
create_nginx_config() {
    print_step "Creating Main Nginx Configuration"
    
    # Backup existing default site if it exists
    if [ -f /etc/nginx/sites-enabled/default ]; then
        sudo mv /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default.backup
    fi
    
    # Create Jupiter SIEM site configuration
    sudo tee /etc/nginx/sites-available/projectjupiter.in > /dev/null << EOF
# Jupiter SIEM - projectjupiter.in
# Main reverse proxy configuration

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/s;

# Upstream servers
upstream backend {
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name projectjupiter.in www.projectjupiter.in;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self';" always;
    
    # Remove server tokens
    server_tokens off;
    
    # Logging
    access_log /var/log/nginx/jupiter_access.log;
    error_log /var/log/nginx/jupiter_error.log;
    
    # Frontend (React SPA)
    location / {
        proxy_pass http://frontend;
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
    
    # Backend API with rate limiting
    location /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://projectjupiter.in" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://projectjupiter.in";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain charset=UTF-8";
            add_header Content-Length 0;
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Authentication endpoints with stricter rate limiting
    location ~ ^/api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/projectjupiter.in /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    
    print_info "Nginx configuration created and validated"
}

# Create management scripts
create_management_scripts() {
    print_step "Creating Management Scripts"
    
    # Backup script
    cat > "$INSTALL_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash

# Jupiter SIEM Backup Script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/jupiter-siem/backups"
RETENTION_DAYS=7

echo "Starting Jupiter SIEM backup at $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup MongoDB
echo "Backing up MongoDB..."
docker-compose exec -T mongodb mongodump --archive --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"

# Backup configuration files
echo "Backing up configuration..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /opt/jupiter-siem/backend/.env \
    /opt/jupiter-siem/frontend/.env.production \
    /opt/jupiter-siem/docker-compose.yml \
    /etc/nginx/sites-available/projectjupiter.in \
    /etc/cloudflared/config.yml 2>/dev/null

# Backup application logs
echo "Backing up logs..."
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" \
    /opt/jupiter-siem/backend/logs \
    /var/log/nginx/jupiter_*.log 2>/dev/null

# Cleanup old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Backup completed. Total backup size: $BACKUP_SIZE"
echo "Backup completed at $(date)"
EOF

    # Status script
    cat > "$INSTALL_DIR/scripts/status.sh" << 'EOF'
#!/bin/bash

# Jupiter SIEM Status Check Script

echo "==========================================="
echo "        Jupiter SIEM System Status"
echo "==========================================="
echo

# Docker services
echo "Docker Services:"
docker-compose ps

echo
echo "Service Health Checks:"
docker-compose exec -T backend curl -s http://localhost:8001/api/health || echo "Backend: UNHEALTHY"
docker-compose exec -T frontend curl -s http://localhost:80 >/dev/null && echo "Frontend: HEALTHY" || echo "Frontend: UNHEALTHY"

echo
echo "System Resources:"
echo "Memory Usage: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo "Load Average: $(cat /proc/loadavg | cut -d' ' -f1-3)"

echo
echo "Network Status:"
echo "Port 80 (HTTP): $(ss -tlnp | grep :80 | wc -l) listener(s)"
echo "Port 443 (HTTPS): $(ss -tlnp | grep :443 | wc -l) listener(s)"

echo
echo "Recent Logs (last 10 lines):"
echo "Backend logs:"
docker-compose logs --tail=5 backend 2>/dev/null

echo
echo "Nginx logs:"
tail -5 /var/log/nginx/jupiter_error.log 2>/dev/null || echo "No error logs found"
EOF

    # Update script
    cat > "$INSTALL_DIR/scripts/update.sh" << 'EOF'
#!/bin/bash

# Jupiter SIEM Update Script

echo "Starting Jupiter SIEM update..."

# Backup before update
echo "Creating backup before update..."
./backup.sh

# Pull latest images
echo "Updating Docker images..."
docker-compose pull

# Rebuild and restart services
echo "Rebuilding and restarting services..."
docker-compose down
docker-compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to become healthy..."
sleep 30

# Check health
echo "Checking service health..."
./status.sh

echo "Update completed!"
EOF

    # Make scripts executable
    chmod +x "$INSTALL_DIR/scripts/"*.sh
    
    print_info "Management scripts created"
}

# Copy application code (from current directory)
copy_application_code() {
    print_step "Copying Application Code"
    
    # Copy backend code
    cp -r /app/backend/* "$INSTALL_DIR/backend/" 2>/dev/null || true
    
    # Copy frontend code  
    cp -r /app/frontend/* "$INSTALL_DIR/frontend/" 2>/dev/null || true
    
    # Copy any additional files
    cp /app/requirements.txt "$INSTALL_DIR/backend/" 2>/dev/null || true
    
    print_info "Application code copied to $INSTALL_DIR"
}

# Build and start services
start_services() {
    print_step "Building and Starting Services"
    
    cd "$INSTALL_DIR"
    
    # Start services
    docker-compose up -d --build
    
    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    docker-compose ps
    
    print_info "Services started successfully"
}

# Initialize database and create super admin
initialize_database() {
    print_step "Initializing Database and Creating Super Admin"
    
    # Wait for backend to be fully ready
    sleep 10
    
    # Create super admin user
    print_info "Creating super admin user: harsha@projectjupiter.in"
    
    docker-compose exec -T backend python -c "
import requests
import json
import time

# Wait for API to be ready
for i in range(30):
    try:
        response = requests.get('http://localhost:8001/api/health', timeout=5)
        if response.status_code == 200:
            break
    except:
        time.sleep(2)
        continue

# Create super admin
try:
    response = requests.post('http://localhost:8001/api/auth/register', 
        json={
            'email': 'harsha@projectjupiter.in',
            'tenant_name': 'MainTenant',
            'is_owner': True
        },
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        print(f'✅ Super admin created successfully!')
        print(f'User ID: {data[\"user_id\"]}')
        print(f'Tenant ID: {data[\"tenant_id\"]}') 
    else:
        print(f'❌ Failed to create super admin: {response.text}')
except Exception as e:
    print(f'❌ Error creating super admin: {str(e)}')
"
    
    print_info "Database initialization completed"
}

# Configure Cloudflare tunnel
configure_cloudflare() {
    print_step "Configuring Cloudflare Tunnel"
    
    print_info "Cloudflare tunnel configuration:"
    print_info "1. Login to Cloudflare: cloudflared tunnel login"
    print_info "2. Create tunnel: cloudflared tunnel create $TUNNEL_NAME" 
    print_info "3. Configure DNS in Cloudflare dashboard"
    print_info "4. Start tunnel: cloudflared tunnel run $TUNNEL_NAME"
    
    # Create tunnel config template
    sudo mkdir -p /etc/cloudflared
    sudo tee /etc/cloudflared/config.yml.template > /dev/null << EOF
tunnel: $TUNNEL_NAME
credentials-file: /root/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: projectjupiter.in
    service: http://localhost:80
  - hostname: www.projectjupiter.in
    service: http://localhost:80
  - service: http_status:404
EOF

    print_warning "Manual steps required:"
    print_warning "1. Run: sudo cloudflared tunnel login"
    print_warning "2. Run: sudo cloudflared tunnel create $TUNNEL_NAME"
    print_warning "3. Update /etc/cloudflared/config.yml with your tunnel ID"
    print_warning "4. Configure DNS in Cloudflare dashboard"
    print_warning "5. Run: sudo cloudflared service install"
}

# Final setup and verification
final_verification() {
    print_step "Final System Verification"
    
    # Check services
    echo "Service Status:"
    docker-compose ps
    echo
    
    # Check nginx
    echo "Nginx Status:"
    sudo systemctl status nginx --no-pager -l
    echo
    
    # Check ports
    echo "Listening Ports:"
    ss -tlnp | grep -E ':80|:443|:3000|:8001|:27017'
    echo
    
    # Test endpoints
    echo "Endpoint Tests:"
    curl -s -o /dev/null -w "Health Check: %{http_code}\n" http://localhost:8001/api/health
    curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000
    curl -s -o /dev/null -w "Nginx Proxy: %{http_code}\n" http://localhost:80
    echo
    
    print_info "System verification completed"
}

# Display final information
show_completion_info() {
    print_step "Deployment Completed Successfully!"
    
    echo -e "${GREEN}"
    echo "============================================================"
    echo "           Jupiter SIEM Deployment Complete!"
    echo "============================================================"
    echo
    echo "🌐 Domain: projectjupiter.in"
    echo "👤 Super Admin: harsha@projectjupiter.in"
    echo "🏢 Main Tenant: MainTenant"
    echo
    echo "📍 Installation Directory: $INSTALL_DIR"
    echo
    echo "🐳 Docker Services:"
    echo "   • MongoDB: 127.0.0.1:27017"
    echo "   • Backend API: 127.0.0.1:8001"
    echo "   • Frontend: 127.0.0.1:3000"
    echo "   • Nginx Proxy: 127.0.0.1:80"
    echo
    echo "📊 Management Commands:"
    echo "   • Check Status: $INSTALL_DIR/scripts/status.sh"
    echo "   • Backup System: $INSTALL_DIR/scripts/backup.sh"
    echo "   • Update System: $INSTALL_DIR/scripts/update.sh"
    echo
    echo "🔑 API Keys Configured:"
    echo "   • VirusTotal (4 req/min, 500/day)"
    echo "   • AbuseIPDB (1000 checks/day)"
    echo "   • AlienVault OTX (No limits)"
    echo "   • IntelligenceX (50 searches/month)"
    echo "   • LeakIX (3000 calls/month)"
    echo "   • FOFA (300 queries/month)"
    echo
    echo "⚠️  Manual Steps Remaining:"
    echo "   1. Configure Cloudflare tunnel"
    echo "   2. Set up DNS records"
    echo "   3. Test external access"
    echo
    echo "📚 Access URLs (after Cloudflare setup):"
    echo "   • Main Site: https://projectjupiter.in"
    echo "   • API Docs: https://projectjupiter.in/api/docs"
    echo "   • Health: https://projectjupiter.in/api/health"
    echo
    echo "🔐 Login Instructions:"
    echo "   1. Go to https://projectjupiter.in/login"
    echo "   2. Email: harsha@projectjupiter.in"
    echo "   3. Tenant: MainTenant"
    echo "   4. Request OTP (sent to email)"
    echo "   5. Enter OTP and login"
    echo
    echo "============================================================"
    echo -e "${NC}"
}

# Main execution
main() {
    print_header
    
    # Checks
    check_root
    get_system_info
    check_existing_installations
    
    # User input
    collect_user_inputs
    
    # Installation
    install_dependencies
    setup_project
    
    # Configuration
    create_environment_files
    create_docker_compose
    create_dockerfiles
    create_mongodb_init
    create_nginx_config
    create_management_scripts
    
    # Deployment
    copy_application_code
    start_services
    initialize_database
    
    # Finalization
    configure_cloudflare
    final_verification
    show_completion_info
}

# Run main function
main "$@"