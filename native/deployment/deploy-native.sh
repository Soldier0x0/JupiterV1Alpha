#!/bin/bash
# Jupiter SIEM - Native Production Deployment Script
# Complete production-ready native deployment with monitoring, SSL, and security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NATIVE_ROOT="${APP_ROOT}/native"
BACKEND_DIR="${APP_ROOT}/backend"
FRONTEND_DIR="${APP_ROOT}/frontend"

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

log "🚀 Jupiter SIEM - Native Production Deployment"
log "=============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Load environment
if [[ -f "${NATIVE_ROOT}/configuration/.env.native" ]]; then
    source "${NATIVE_ROOT}/configuration/.env.native"
else
    warning "Environment file not found, using defaults"
fi

# Default configuration
BACKEND_PORT=${BACKEND_PORT:-8001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
REDIS_PORT=${REDIS_PORT:-6379}
NGINX_PORT=${NGINX_PORT:-80}
NGINX_SSL_PORT=${NGINX_SSL_PORT:-443}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    command -v python3 >/dev/null 2>&1 || error "Python 3 is required"
    command -v node >/dev/null 2>&1 || error "Node.js is required"
    command -v npm >/dev/null 2>&1 || error "npm is required"
    command -v nginx >/dev/null 2>&1 || error "Nginx is required"
    command -v redis-server >/dev/null 2>&1 || error "Redis is required"
    command -v systemctl >/dev/null 2>&1 || error "systemd is required"
    
    log "✅ System requirements satisfied"
}

# Setup Python virtual environment
setup_python_env() {
    log "Setting up Python environment..."
    
    VENV_DIR="${NATIVE_ROOT}/.venv"
    if [[ ! -d "${VENV_DIR}" ]]; then
        python3 -m venv "${VENV_DIR}"
    fi
    
    source "${VENV_DIR}/bin/activate"
    pip install --upgrade pip setuptools wheel
    
    # Install backend dependencies
    if [[ -f "${BACKEND_DIR}/requirements.txt" ]]; then
        pip install -r "${BACKEND_DIR}/requirements.txt"
    else
        error "Backend requirements.txt not found"
    fi
    
    log "✅ Python environment ready"
}

# Setup Node.js environment
setup_node_env() {
    log "Setting up Node.js environment..."
    
    cd "${FRONTEND_DIR}"
    npm ci --production
    npm run build
    
    log "✅ Node.js environment ready"
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    
    # Configure Redis for production
    sudo cp "${NATIVE_ROOT}/configuration/redis/redis.conf" /etc/redis/redis.conf 2>/dev/null || true
    sudo systemctl restart redis-server
    
    log "✅ Redis configured and running"
}

# Setup Nginx
setup_nginx() {
    log "Setting up Nginx reverse proxy..."
    
    # Copy Nginx configuration
    sudo cp "${NATIVE_ROOT}/configuration/nginx/nginx.conf" /etc/nginx/sites-available/jupiter-siem
    sudo ln -sf /etc/nginx/sites-available/jupiter-siem /etc/nginx/sites-enabled/jupiter-siem
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t && sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log "✅ Nginx configured and running"
}

# Setup systemd services
setup_systemd_services() {
    log "Setting up systemd services..."
    
    # Copy service files
    sudo cp "${NATIVE_ROOT}/configuration/systemd/jupiter-backend.service" /etc/systemd/system/
    sudo cp "${NATIVE_ROOT}/configuration/systemd/jupiter-frontend.service" /etc/systemd/system/
    
    # Update service files with correct paths
    sudo sed -i "s|%h/JupiterV1Alpha|${APP_ROOT}|g" /etc/systemd/system/jupiter-backend.service
    sudo sed -i "s|%h/JupiterV1Alpha|${APP_ROOT}|g" /etc/systemd/system/jupiter-frontend.service
    
    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable jupiter-backend
    sudo systemctl enable jupiter-frontend
    
    log "✅ Systemd services configured"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    SSL_DIR="${NATIVE_ROOT}/configuration/ssl"
    mkdir -p "${SSL_DIR}"
    
    if [[ ! -f "${SSL_DIR}/cert.pem" ]] || [[ ! -f "${SSL_DIR}/key.pem" ]]; then
        # Generate self-signed certificates for development
        openssl req -x509 -newkey rsa:4096 -keyout "${SSL_DIR}/key.pem" -out "${SSL_DIR}/cert.pem" \
            -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Jupiter SIEM/CN=localhost"
        
        chmod 600 "${SSL_DIR}/key.pem"
        chmod 644 "${SSL_DIR}/cert.pem"
        
        info "Self-signed SSL certificates generated. For production, use Let's Encrypt or proper CA certificates."
    fi
    
    log "✅ SSL certificates ready"
}

# Start services
start_services() {
    log "Starting Jupiter SIEM services..."
    
    # Start backend
    sudo systemctl start jupiter-backend
    sleep 5
    
    # Start frontend  
    sudo systemctl start jupiter-frontend
    sleep 5
    
    # Restart nginx to pick up any changes
    sudo systemctl restart nginx
    
    log "✅ All services started"
}

# Health checks
health_checks() {
    log "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:${BACKEND_PORT}/api/health >/dev/null 2>&1; then
        log "✅ Backend is healthy"
    else
        error "❌ Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:${FRONTEND_PORT} >/dev/null 2>&1; then
        log "✅ Frontend is healthy"
    else
        error "❌ Frontend health check failed"
    fi
    
    # Check nginx
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log "✅ Nginx is healthy"
    else
        warning "⚠️ Nginx health check failed - check configuration"
    fi
    
    log "✅ Health checks completed"
}

# Main deployment function
main() {
    log "Starting native deployment..."
    
    check_requirements
    setup_python_env
    setup_node_env
    setup_redis
    setup_nginx
    setup_systemd_services
    setup_ssl
    start_services
    health_checks
    
    log ""
    log "🎉 Jupiter SIEM Native Deployment Complete!"
    log "=========================================="
    log ""
    log "🌐 Access URLs:"
    log "  Application: http://localhost (or https://localhost for SSL)"
    log "  Backend API: http://localhost/api"
    log "  Health Check: http://localhost/health"
    log ""
    log "📊 Service Status:"
    log "  Backend: systemctl status jupiter-backend"
    log "  Frontend: systemctl status jupiter-frontend"  
    log "  Nginx: systemctl status nginx"
    log "  Redis: systemctl status redis-server"
    log ""
    log "📝 Useful Commands:"
    log "  View logs: journalctl -f -u jupiter-backend -u jupiter-frontend"
    log "  Restart services: sudo systemctl restart jupiter-backend jupiter-frontend"
    log "  Backup: ${NATIVE_ROOT}/deployment/backup-native.sh"
    log ""
    log "⚠️  Next Steps for Production:"
    log "  1. Configure proper SSL certificates (Let's Encrypt)"
    log "  2. Set up firewall rules (UFW)"
    log "  3. Configure monitoring and alerting"
    log "  4. Set up automated backups"
    log "  5. Review and harden security settings"
}

# Run main function
main "$@"