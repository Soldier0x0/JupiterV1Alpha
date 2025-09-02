#!/bin/bash

# Jupiter SIEM - Simplified Deployment for Debian Trixie
# Optimized for your specific setup

set -e

# Configuration from your previous run
INSTALL_DIR="/srv/jupiter/server"
TUNNEL_NAME="ProjectJupiter"
DOMAIN="projectjupiter.in"
ADMIN_EMAIL="harsha@projectjupiter.in"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP] $1${NC}"; }
print_info() { echo -e "${BLUE}[INFO] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[WARN] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}"; }

# Collect required inputs
collect_inputs() {
    print_step "Collecting Configuration"
    
    echo -e "${YELLOW}"
    read -sp "Enter MongoDB admin password (min 12 chars): " MONGO_PASSWORD
    echo
    while [[ ${#MONGO_PASSWORD} -lt 12 ]]; do
        print_error "Password too short!"
        read -sp "Enter MongoDB admin password (min 12 chars): " MONGO_PASSWORD
        echo
    done
    
    read -sp "Enter JWT secret key (min 32 chars): " JWT_SECRET
    echo
    while [[ ${#JWT_SECRET} -lt 32 ]]; do
        print_error "JWT secret too short!"
        read -sp "Enter JWT secret key (min 32 chars): " JWT_SECRET
        echo
    done
    
    read -sp "Enter email app password for $ADMIN_EMAIL: " EMAIL_PASSWORD
    echo
    echo -e "${NC}"
}

# Setup directories
setup_directories() {
    print_step "Setting up Project Directories"
    
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    mkdir -p {backend,frontend,mongodb,nginx,scripts,backups,logs}
    print_info "Directories created at $INSTALL_DIR"
}

# Create environment files
create_env_files() {
    print_step "Creating Environment Files"
    
    # Backend .env
    cat > "$INSTALL_DIR/backend/.env" << EOF
# Database
MONGO_URL=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/jupiter_siem?authSource=admin

# Security
JWT_SECRET=$JWT_SECRET
ENVIRONMENT=production

# Email
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=$ADMIN_EMAIL
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_USE_TLS=true

# Admin
SUPER_ADMIN_EMAIL=$ADMIN_EMAIL

# API Keys with Rate Limits
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
EOF

    # Frontend .env
    cat > "$INSTALL_DIR/frontend/.env.production" << EOF
VITE_BACKEND_URL=https://$DOMAIN/api
VITE_APP_NAME="Jupiter SIEM"
VITE_ADMIN_EMAIL=$ADMIN_EMAIL
VITE_ENVIRONMENT=production
EOF

    print_info "Environment files created"
}

# Create Docker Compose
create_docker_compose() {
    print_step "Creating Docker Compose Configuration"
    
    cat > "$INSTALL_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: jupiter-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: $MONGO_PASSWORD
      MONGO_INITDB_DATABASE: jupiter_siem
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/init.js:/docker-entrypoint-initdb.d/init.js:ro
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:27017:27017"

  backend:
    build: ./backend
    container_name: jupiter-backend
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:8001:8001"
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: jupiter-frontend
    restart: always
    networks:
      - jupiter-net
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:

networks:
  jupiter-net:
    driver: bridge
EOF

    print_info "Docker Compose created"
}

# Copy application code
copy_application() {
    print_step "Copying Application Code"
    
    # Copy backend
    if [ -d "/srv/jupiter/JupiterEmerge/backend" ]; then
        cp -r /srv/jupiter/JupiterEmerge/backend/* "$INSTALL_DIR/backend/" 2>/dev/null || true
    elif [ -d "/app/backend" ]; then
        cp -r /app/backend/* "$INSTALL_DIR/backend/" 2>/dev/null || true
    fi
    
    # Copy frontend
    if [ -d "/srv/jupiter/JupiterEmerge/frontend" ]; then
        cp -r /srv/jupiter/JupiterEmerge/frontend/* "$INSTALL_DIR/frontend/" 2>/dev/null || true
    elif [ -d "/app/frontend" ]; then
        cp -r /app/frontend/* "$INSTALL_DIR/frontend/" 2>/dev/null || true
    fi
    
    print_info "Application code copied"
}

# Create Dockerfiles
create_dockerfiles() {
    print_step "Creating Production Dockerfiles"
    
    # Backend Dockerfile
    cat > "$INSTALL_DIR/backend/Dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/logs

EXPOSE 8001

CMD ["python", "server.py"]
EOF

    # Frontend Dockerfile
    cat > "$INSTALL_DIR/frontend/Dockerfile.prod" << 'EOF'
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .
RUN yarn build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Nginx config for frontend
    cat > "$INSTALL_DIR/frontend/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    # MongoDB init script
    cat > "$INSTALL_DIR/mongodb/init.js" << 'EOF'
print('Initializing Jupiter SIEM database...');

db = db.getSiblingDB('jupiter_siem');

db.createCollection('users');
db.createCollection('tenants');
db.createCollection('roles');
db.createCollection('alerts');
db.createCollection('iocs');
db.createCollection('automations');
db.createCollection('api_keys');
db.createCollection('logs');
db.createCollection('cases');
db.createCollection('sessions');

db.users.createIndex({ "email": 1, "tenant_id": 1 }, { unique: true });
db.tenants.createIndex({ "name": 1 }, { unique: true });

print('Database initialization completed!');
EOF

    print_info "Dockerfiles and configs created"
}

# Create Nginx reverse proxy
create_nginx_config() {
    print_step "Creating Nginx Reverse Proxy"
    
    sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
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

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    print_info "Nginx configuration created"
}

# Start services
start_services() {
    print_step "Starting Services"
    
    cd "$INSTALL_DIR"
    
    # Build and start
    docker-compose up -d --build
    
    print_info "Waiting for services to start..."
    sleep 30
    
    # Check status
    docker-compose ps
    
    # Restart nginx
    sudo systemctl reload nginx
    
    print_info "Services started"
}

# Create super admin
create_super_admin() {
    print_step "Creating Super Admin User"
    
    sleep 10  # Wait for backend to be ready
    
    docker-compose exec -T backend python -c "
import requests
import json
import time

# Wait for API
for i in range(30):
    try:
        response = requests.get('http://localhost:8001/api/health', timeout=5)
        if response.status_code == 200:
            break
    except:
        time.sleep(2)

# Create super admin
try:
    response = requests.post('http://localhost:8001/api/auth/register', 
        json={
            'email': '$ADMIN_EMAIL',
            'tenant_name': 'MainTenant',
            'is_owner': True
        },
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        print('✅ Super admin created!')
        print(f'User ID: {data[\"user_id\"]}')
        print(f'Tenant ID: {data[\"tenant_id\"]}')
    else:
        print(f'❌ Failed: {response.text}')
except Exception as e:
    print(f'❌ Error: {str(e)}')
"
    
    print_info "Super admin setup completed"
}

# Create management scripts
create_scripts() {
    print_step "Creating Management Scripts"
    
    # Status script
    cat > "$INSTALL_DIR/scripts/status.sh" << 'EOF'
#!/bin/bash
echo "Jupiter SIEM Status:"
echo "==================="
docker-compose ps
echo
echo "Health Checks:"
curl -s http://localhost:8001/api/health || echo "Backend: OFFLINE"
curl -s http://localhost:3000 >/dev/null && echo "Frontend: ONLINE" || echo "Frontend: OFFLINE"
EOF

    # Backup script  
    cat > "$INSTALL_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/srv/jupiter/server/backups"

mkdir -p "$BACKUP_DIR"
docker-compose exec -T mongodb mongodump --archive --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"
echo "Backup created: $BACKUP_DIR/mongodb_$DATE.gz"
EOF

    chmod +x "$INSTALL_DIR/scripts/"*.sh
    print_info "Management scripts created"
}

# Final info
show_completion() {
    print_step "Deployment Complete!"
    
    echo -e "${GREEN}"
    echo "============================================================"
    echo "           Jupiter SIEM Deployed Successfully!"
    echo "============================================================"
    echo
    echo "🌐 Domain: $DOMAIN"
    echo "📧 Admin: $ADMIN_EMAIL"
    echo "🏢 Tenant: MainTenant"
    echo "📍 Location: $INSTALL_DIR"
    echo
    echo "🔗 Access URLs:"
    echo "   • Main: https://$DOMAIN"
    echo "   • Local: http://localhost"
    echo "   • API: https://$DOMAIN/api/docs"
    echo
    echo "🎯 Next Steps:"
    echo "   1. Configure Cloudflare tunnel:"
    echo "      sudo cloudflared tunnel login"
    echo "      sudo cloudflared tunnel create $TUNNEL_NAME"
    echo "   2. Set up DNS in Cloudflare dashboard"
    echo "   3. Login with $ADMIN_EMAIL and OTP from email"
    echo
    echo "📊 Management:"
    echo "   • Status: $INSTALL_DIR/scripts/status.sh"
    echo "   • Backup: $INSTALL_DIR/scripts/backup.sh"
    echo "   • Logs: docker-compose logs -f"
    echo
    echo "============================================================"
    echo -e "${NC}"
}

# Main execution
main() {
    print_step "Jupiter SIEM - Simplified Deployment"
    
    collect_inputs
    setup_directories
    create_env_files
    create_docker_compose
    copy_application
    create_dockerfiles
    create_nginx_config
    start_services
    create_super_admin
    create_scripts
    show_completion
}

# Check if dependencies are installed
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    print_error "Docker or Docker Compose not found!"
    print_info "Please run the dependency fix script first:"
    print_info "./fix_deployment_debian_trixie.sh"
    exit 1
fi

main "$@"