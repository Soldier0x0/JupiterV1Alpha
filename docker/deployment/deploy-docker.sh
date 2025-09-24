#!/bin/bash
# Jupiter SIEM - Docker Production Deployment Script
# Complete production-ready Docker deployment with monitoring, SSL, and security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DOCKER_ROOT="${APP_ROOT}/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; exit 1; }
warning() { echo -e "${YELLOW}[WARNING] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

log "🐳 Jupiter SIEM - Docker Production Deployment"
log "=============================================="

# Load environment
ENV_FILE="${DOCKER_ROOT}/configuration/.env.docker"
if [[ -f "${ENV_FILE}" ]]; then
    source "${ENV_FILE}"
else
    warning "Environment file not found at ${ENV_FILE}, using defaults"
fi

# Default configuration
COMPOSE_FILE="${DOCKER_ROOT}/deployment/docker-compose.prod.yml"
PROJECT_NAME=${PROJECT_NAME:-jupiter-docker}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is required"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is required"
    
    # Check if Docker daemon is running
    docker info >/dev/null 2>&1 || error "Docker daemon is not running"
    
    log "✅ System requirements satisfied"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "${APP_ROOT}/data"
    mkdir -p "${APP_ROOT}/logs/"{backend,frontend,nginx}
    mkdir -p "${APP_ROOT}/exports"
    mkdir -p "${DOCKER_ROOT}/configuration/ssl"
    
    # Set proper permissions
    chmod 755 "${APP_ROOT}/data" "${APP_ROOT}/logs" "${APP_ROOT}/exports"
    
    log "✅ Directories created"
}

# Generate environment file if not exists
setup_environment() {
    log "Setting up environment configuration..."
    
    if [[ ! -f "${ENV_FILE}" ]]; then
        log "Creating environment file..."
        cat > "${ENV_FILE}" << EOF
# Jupiter SIEM Docker Production Environment

# Project Configuration
PROJECT_NAME=jupiter-docker
APP_ENVIRONMENT=production

# Security
JWT_SECRET_KEY=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 16)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Email Configuration (Optional - configure for production)
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_USE_TLS=true

# Admin Configuration
SUPER_ADMIN_EMAIL=admin@projectjupiter.in
SUPER_ADMIN_PASSWORD=ChangeMe123!
SUPER_ADMIN_TENANT_NAME=MainTenant

# CORS Configuration
CORS_ORIGINS=http://localhost:8080,https://localhost:8443

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# Monitoring
MONITORING_ENABLED=true

# Performance
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1024
EOF
        log "✅ Environment file created at ${ENV_FILE}"
        warning "⚠️ Please review and update the environment file before production use"
    else
        log "✅ Environment file already exists"
    fi
}

# Generate SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    SSL_DIR="${DOCKER_ROOT}/configuration/ssl"
    
    if [[ ! -f "${SSL_DIR}/cert.pem" ]] || [[ ! -f "${SSL_DIR}/key.pem" ]]; then
        openssl req -x509 -newkey rsa:4096 -keyout "${SSL_DIR}/key.pem" -out "${SSL_DIR}/cert.pem" \
            -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Jupiter SIEM/CN=localhost"
        
        chmod 600 "${SSL_DIR}/key.pem"
        chmod 644 "${SSL_DIR}/cert.pem"
        
        log "✅ Self-signed SSL certificates generated"
        info "ℹ️ For production, use Let's Encrypt or proper CA certificates"
    else
        log "✅ SSL certificates already exist"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    docker build -t jupiter-siem-backend:latest -f "${APP_ROOT}/backend/Dockerfile" "${APP_ROOT}/backend/"
    
    # Build frontend image  
    docker build -t jupiter-siem-frontend:latest -f "${APP_ROOT}/frontend/Dockerfile" "${APP_ROOT}/frontend/"
    
    # Build nginx image
    docker build -t jupiter-siem-nginx:latest -f "${DOCKER_ROOT}/containers/nginx/Dockerfile" "${DOCKER_ROOT}/containers/nginx/"
    
    log "✅ Docker images built successfully"
}

# Deploy services
deploy_services() {
    log "Deploying Jupiter SIEM services..."
    
    cd "${DOCKER_ROOT}/deployment"
    
    # Stop any existing services
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    # Start core services
    docker-compose -f docker-compose.prod.yml up -d redis backend frontend nginx
    
    log "✅ Core services started"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Optionally start monitoring stack
    if [[ "${MONITORING_ENABLED:-false}" == "true" ]]; then
        log "Starting monitoring stack..."
        docker-compose -f docker-compose.prod.yml --profile monitoring up -d
        log "✅ Monitoring stack started"
    fi
    
    log "✅ All services deployed"
}

# Health checks
health_checks() {
    log "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:8002/api/health >/dev/null 2>&1; then
        log "✅ Backend is healthy"
    else
        error "❌ Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        log "✅ Frontend is healthy"
    else
        error "❌ Frontend health check failed"
    fi
    
    # Check nginx
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        log "✅ Nginx is healthy"
    else
        warning "⚠️ Nginx health check failed - check configuration"
    fi
    
    # Check Redis
    if docker exec jupiter-docker-redis redis-cli -a "${REDIS_PASSWORD:-jupiter_redis_2024}" ping >/dev/null 2>&1; then
        log "✅ Redis is healthy"
    else
        warning "⚠️ Redis health check failed"
    fi
    
    log "✅ Health checks completed"
}

# Show service status
show_status() {
    log "Service Status:"
    log "==============="
    
    cd "${DOCKER_ROOT}/deployment"
    docker-compose -f docker-compose.prod.yml ps
}

# Main deployment function
main() {
    log "Starting Docker deployment..."
    
    check_requirements
    create_directories
    setup_environment
    setup_ssl
    build_images
    deploy_services
    health_checks
    show_status
    
    log ""
    log "🎉 Jupiter SIEM Docker Deployment Complete!"
    log "==========================================="
    log ""
    log "🌐 Access URLs:"
    log "  Application: http://localhost:8080 (or https://localhost:8443 for SSL)"
    log "  Backend API: http://localhost:8080/api"
    log "  Direct Backend: http://localhost:8002/api"
    log "  Direct Frontend: http://localhost:3001"
    log "  Health Check: http://localhost:8080/health"
    log ""
    if [[ "${MONITORING_ENABLED:-false}" == "true" ]]; then
        log "📊 Monitoring URLs:"
        log "  Prometheus: http://localhost:9091"
        log "  Grafana: http://localhost:3002 (admin / ${GRAFANA_PASSWORD:-jupiter_grafana_2024})"
        log ""
    fi
    log "🐳 Docker Commands:"
    log "  View logs: docker-compose -f ${COMPOSE_FILE} logs -f"
    log "  Stop services: docker-compose -f ${COMPOSE_FILE} down"
    log "  Restart: docker-compose -f ${COMPOSE_FILE} restart"
    log "  Backup: ${DOCKER_ROOT}/deployment/backup-docker.sh"
    log ""
    log "📋 Service Status:"
    log "  Check status: docker-compose -f ${COMPOSE_FILE} ps"
    log "  Check health: docker-compose -f ${COMPOSE_FILE} exec backend curl -f http://localhost:8001/api/health"
    log ""
    log "⚠️ Next Steps for Production:"
    log "  1. Configure proper SSL certificates"
    log "  2. Update email configuration in ${ENV_FILE}"
    log "  3. Set up proper DNS and domain names"
    log "  4. Configure monitoring and alerting"
    log "  5. Set up automated backups"
    log "  6. Review security settings"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy"|"start")
        main
        ;;
    "stop")
        log "Stopping Jupiter SIEM Docker services..."
        cd "${DOCKER_ROOT}/deployment"
        docker-compose -f docker-compose.prod.yml down
        log "✅ Services stopped"
        ;;
    "restart")
        log "Restarting Jupiter SIEM Docker services..."
        cd "${DOCKER_ROOT}/deployment"
        docker-compose -f docker-compose.prod.yml restart
        log "✅ Services restarted"
        ;;
    "status")
        cd "${DOCKER_ROOT}/deployment"
        docker-compose -f docker-compose.prod.yml ps
        ;;
    "logs")
        cd "${DOCKER_ROOT}/deployment"
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  deploy/start - Deploy and start all services"
        echo "  stop         - Stop all services" 
        echo "  restart      - Restart all services"
        echo "  status       - Show service status"
        echo "  logs         - Follow service logs"
        exit 1
        ;;
esac