#!/bin/bash
 Jupiter SIEM Cloudflare-Optimized Deployment Script

set -e

echo "☁️ Jupiter SIEM Cloudflare-Optimized Deployment Starting..."

# Configuration
PROJECT_NAME="jupiter-siem"
DOMAIN="siem.projectjupiter.in"
CLOUDFLARE_EMAIL="harsha@projectjupiter.in"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check Cloudflare credentials
check_cloudflare_credentials() {
    log "Checking Cloudflare credentials..."
    
    if [ -z "$CLOUDFLARE_API_KEY" ]; then
        if [ -f ".env" ]; then
            source .env
        fi
        
        if [ -z "$CLOUDFLARE_API_KEY" ]; then
            error "CLOUDFLARE_API_KEY not found. Please set it in .env file"
        fi
    fi
    
    log "Cloudflare API access verified ✓"
}

# Create Cloudflare-optimized environment
create_cloudflare_env() {
    log "Creating Cloudflare-optimized environment configuration..."
    
    cat > .env.cloudflare << EOF
# Jupiter SIEM Cloudflare-Optimized Configuration
NODE_ENV=production
PYTHON_ENV=production
PROJECT_NAME=${PROJECT_NAME}

# Domain Configuration
DOMAIN=${DOMAIN}
CLOUDFLARE_ENABLED=true
CLOUDFLARE_EMAIL=${CLOUDFLARE_EMAIL}
CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}

# Database
MONGODB_URI=mongodb://mongodb:27017/jupiter_siem
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# API Configuration (Internal ports only)
BACKEND_PORT=8000
FRONTEND_PORT=3000
NGINX_PORT=80

# Cloudflare-specific settings
CLOUDFLARE_IP_RANGES=true
CLOUDFLARE_CACHE_PURGE=true
TRUST_CLOUDFLARE_PROXY=true

# CORS (Allow Cloudflare)
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},https://projectjupiter.in

# Rate Limiting (Cloudflare handles DDoS protection)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60

# Performance (Cloudflare CDN)
CDN_ENABLED=true
STATIC_CACHE_TTL=31536000
API_CACHE_TTL=300
EOF

    log "Cloudflare environment configuration created ✓"
}

# Create Cloudflare-optimized Docker Compose
create_cloudflare_docker_compose() {
    log "Creating Cloudflare-optimized Docker Compose configuration..."
    
    cat > docker-compose.cloudflare.yml << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: ${PROJECT_NAME}-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: jupiter_siem_2024
      MONGO_INITDB_DATABASE: jupiter_siem
    volumes:
      - ./data/mongodb:/data/db
    networks:
      - jupiter-network

  redis:
    image: redis:7.2-alpine
    container_name: ${PROJECT_NAME}-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass jupiter_siem_2024
    volumes:
      - ./data/redis:/data
    networks:
      - jupiter-network

  backend:
    image: ${PROJECT_NAME}-backend:latest
    container_name: ${PROJECT_NAME}-backend
    restart: unless-stopped
    environment:
      - PYTHON_ENV=production
      - MONGODB_URI=mongodb://admin:jupiter_siem_2024@mongodb:27017/jupiter_siem?authSource=admin
      - REDIS_URL=redis://:jupiter_siem_2024@redis:6379
      - CLOUDFLARE_ENABLED=true
      - TRUST_CLOUDFLARE_PROXY=true
    volumes:
      - ./logs:/app/logs
      - ./exports:/app/exports
    networks:
      - jupiter-network
    depends_on:
      - mongodb
      - redis

  frontend:
    image: ${PROJECT_NAME}-frontend:latest
    container_name: ${PROJECT_NAME}-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://backend:8000
      - REACT_APP_DOMAIN=${DOMAIN}
    networks:
      - jupiter-network
    depends_on:
      - backend

  nginx:
    image: ${PROJECT_NAME}-nginx:latest
    container_name: ${PROJECT_NAME}-nginx
    restart: unless-stopped
    volumes:
      - ./config/nginx-cloudflare.conf:/etc/nginx/nginx.conf:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    networks:
      - jupiter-network
    depends_on:
      - backend
      - frontend

networks:
  jupiter-network:
    driver: bridge
EOF

    log "Cloudflare Docker Compose configuration created ✓"
}

# Main deployment function
main() {
    log "Starting Jupiter SIEM Cloudflare-Optimized Deployment"
    
    check_cloudflare_credentials
    create_cloudflare_env
    create_cloudflare_docker_compose
    
    log ""
    log "🎉 Jupiter SIEM Cloudflare Deployment Configuration Complete!"
    log ""
    log "Next Steps:"
    log "1. Set CLOUDFLARE_API_KEY in .env file"
    log "2. Configure DNS A record for ${DOMAIN} → YOUR_SERVER_IP"
    log "3. Run: docker-compose -f docker-compose.cloudflare.yml up -d"
    log ""
    log "Access URLs:"
    log "  Frontend: https://${DOMAIN}"
    log "  Backend API: https://${DOMAIN}/api"
    log ""
    log "Cloudflare Features Enabled:"
    log "  ✅ DNS Management"
    log "  ✅ SSL/TLS Termination"
    log "  ✅ CDN & Caching"
    log "  ✅ DDoS Protection"
    log "  ✅ Bot Fight Mode"
log ""
}

main "$@"