#!/bin/bash
# Jupiter SIEM Comprehensive Deployment Script
# Deploys all phases: Core Analyst Features, UX Enhancements, Security & Trust, Extensibility, Reporting, and Ops

set -e

echo "🚀 Jupiter SIEM Comprehensive Deployment Starting..."
echo "=================================================="

# Configuration
PROJECT_NAME="jupiter-siem"
BACKEND_PORT=8000
FRONTEND_PORT=3000
NGINX_PORT=80
NGINX_SSL_PORT=443

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed. Please install Python 3 first."
    fi
    
    log "All requirements satisfied ✓"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data/mongodb
    mkdir -p data/redis
    mkdir -p data/backups
    mkdir -p ssl
    mkdir -p config
    mkdir -p exports
    
    # Set proper permissions
    chmod 755 logs data ssl config exports
    chmod 700 data/mongodb data/redis data/backups
    
    log "Directories created ✓"
}

# Generate SSL certificates
generate_ssl() {
    log "Generating SSL certificates..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        chmod 600 ssl/key.pem
        chmod 644 ssl/cert.pem
        log "SSL certificates generated ✓"
    else
        log "SSL certificates already exist ✓"
    fi
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    cat > .env << EOF
# Jupiter SIEM Environment Configuration

# Application
NODE_ENV=production
PYTHON_ENV=production
PROJECT_NAME=${PROJECT_NAME}

# Database
MONGODB_URI=mongodb://mongodb:27017/jupiter_siem
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
WEBHOOK_SECRET=$(openssl rand -base64 32)

# API Configuration
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
NGINX_PORT=${NGINX_PORT}
NGINX_SSL_PORT=${NGINX_SSL_PORT}

# Tenant Configuration
TENANT_MODE=standard
DEFAULT_TENANT=default

# AI Configuration
AI_ENABLED=true
AI_FALLBACK_ENABLED=true
AI_MODEL_PATH=/app/models

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_ENABLED=true
GRAFANA_PORT=3001

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
LOG_FILE_PATH=/app/logs

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@jupiter-siem.local

# Webhook Configuration
WEBHOOK_TIMEOUT=30
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Security Headers
SECURITY_HEADERS_ENABLED=true
CORS_ORIGINS=*
CORS_CREDENTIALS=true

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=json,csv,txt,log

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)
SESSION_TIMEOUT=3600

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_SIZE=1000

# Performance
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1024
KEEPALIVE_TIMEOUT=65

# Health Checks
HEALTH_CHECK_INTERVAL=30
HEALTH_CHECK_TIMEOUT=10
READINESS_CHECK_TIMEOUT=5

# Panic Mode
PANIC_MODE_ENABLED=true
PANIC_MODE_TIMEOUT=300

# Audit Configuration
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365
AUDIT_HASH_CHAINING=true

# Compliance
COMPLIANCE_MODE=standard
COMPLIANCE_REPORTS_ENABLED=true
COMPLIANCE_TEMPLATES_PATH=/app/templates

# Gamification
GAMIFICATION_ENABLED=true
POINTS_ENABLED=true
LEADERBOARD_ENABLED=true
BADGES_ENABLED=true

# Noise Management
NOISE_BUCKET_ENABLED=true
NOISE_BUCKET_TIMEOUT=300
NOISE_BUCKET_MAX_SIZE=1000

# Pivot Queries
PIVOT_QUERIES_ENABLED=true
PIVOT_TEMPLATES_PATH=/app/pivot_templates

# Report Generation
REPORT_GENERATION_ENABLED=true
REPORT_TEMPLATES_PATH=/app/report_templates
REPORT_EXPORT_PATH=/app/exports

# Framework Analysis
FRAMEWORK_ANALYSIS_ENABLED=true
FRAMEWORK_CACHE_TTL=3600
FRAMEWORK_UPDATE_INTERVAL=86400

# Analyst Fatigue Management
FATIGUE_MANAGEMENT_ENABLED=true
FATIGUE_THRESHOLD=80
FATIGUE_RECOVERY_TIME=1800

# Integration
WEBHOOK_INTEGRATIONS_ENABLED=true
SLACK_INTEGRATION_ENABLED=true
DISCORD_INTEGRATION_ENABLED=true
MATTERMOST_INTEGRATION_ENABLED=true

# Incident Management
INCIDENT_REPLAY_ENABLED=true
INCIDENT_SIMULATION_ENABLED=true
INCIDENT_TIMELINE_ENABLED=true

# System Monitoring
SYSTEM_MONITORING_ENABLED=true
METRICS_COLLECTION_ENABLED=true
ALERTING_ENABLED=true
EOF

    log "Environment variables configured ✓"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    docker build -t ${PROJECT_NAME}-backend:latest -f backend/Dockerfile backend/
    
    # Build frontend image
    docker build -t ${PROJECT_NAME}-frontend:latest -f frontend/Dockerfile frontend/
    
    # Build nginx image
    docker build -t ${PROJECT_NAME}-nginx:latest -f nginx/Dockerfile nginx/
    
    log "Docker images built ✓"
}

# Create Docker Compose configuration
create_docker_compose() {
    log "Creating Docker Compose configuration..."
    
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: ${PROJECT_NAME}-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD:-jupiter_siem_2024}
      MONGO_INITDB_DATABASE: jupiter_siem
    volumes:
      - ./data/mongodb:/data/db
      - ./config/mongodb.conf:/etc/mongod.conf:ro
    ports:
      - "27017:27017"
    networks:
      - jupiter-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis Cache
  redis:
    image: redis:7.2-alpine
    container_name: ${PROJECT_NAME}-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-jupiter_siem_2024}
    volumes:
      - ./data/redis:/data
      - ./config/redis.conf:/usr/local/etc/redis/redis.conf:ro
    ports:
      - "6379:6379"
    networks:
      - jupiter-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    image: ${PROJECT_NAME}-backend:latest
    container_name: ${PROJECT_NAME}-backend
    restart: unless-stopped
    environment:
      - PYTHON_ENV=production
      - MONGODB_URI=mongodb://admin:\${MONGO_ROOT_PASSWORD:-jupiter_siem_2024}@mongodb:27017/jupiter_siem?authSource=admin
      - REDIS_URL=redis://:jupiter_siem_2024@redis:6379
    volumes:
      - ./logs:/app/logs
      - ./exports:/app/exports
      - ./config:/app/config:ro
    ports:
      - "${BACKEND_PORT}:8000"
    networks:
      - jupiter-network
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/security-ops/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Application
  frontend:
    image: ${PROJECT_NAME}-frontend:latest
    container_name: ${PROJECT_NAME}-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://backend:8000
    volumes:
      - ./logs:/app/logs
    ports:
      - "${FRONTEND_PORT}:3000"
    networks:
      - jupiter-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: ${PROJECT_NAME}-nginx:latest
    container_name: ${PROJECT_NAME}-nginx
    restart: unless-stopped
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./logs/nginx:/var/log/nginx
    ports:
      - "${NGINX_PORT}:80"
      - "${NGINX_SSL_PORT}:443"
    networks:
      - jupiter-network
    depends_on:
      - backend
      - frontend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: ${PROJECT_NAME}-prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./data/prometheus:/prometheus
    ports:
      - "9090:9090"
    networks:
      - jupiter-network
    profiles:
      - monitoring

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: ${PROJECT_NAME}-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD:-jupiter_siem_2024}
    volumes:
      - ./data/grafana:/var/lib/grafana
      - ./config/grafana:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    networks:
      - jupiter-network
    depends_on:
      - prometheus
    profiles:
      - monitoring

networks:
  jupiter-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
EOF

    log "Docker Compose configuration created ✓"
}

# Create Nginx configuration
create_nginx_config() {
    log "Creating Nginx configuration..."
    
    mkdir -p config
    
    cat > config/nginx.conf << EOF
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
    client_max_body_size 10M;

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

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream servers
    upstream backend {
        server backend:8000;
        keepalive 32;
    }

    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    # Main server block
    server {
        listen 80;
        server_name localhost;
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend routes
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
        }

        # Static files caching
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # HTTPS server block (if SSL certificates are available)
    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Same location blocks as HTTP server
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

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
        }

        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    log "Nginx configuration created ✓"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash
# Jupiter SIEM Backup Script

set -e

BACKUP_DIR="./data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="jupiter_siem_backup_${DATE}"

echo "🔄 Starting backup process..."

# Create backup directory
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

# Backup MongoDB
echo "📦 Backing up MongoDB..."
docker exec jupiter-siem-mongodb mongodump --out /tmp/backup
docker cp jupiter-siem-mongodb:/tmp/backup "${BACKUP_DIR}/${BACKUP_NAME}/mongodb"

# Backup Redis
echo "📦 Backing up Redis..."
docker exec jupiter-siem-redis redis-cli --rdb /tmp/dump.rdb
docker cp jupiter-siem-redis:/tmp/dump.rdb "${BACKUP_DIR}/${BACKUP_NAME}/redis.rdb"

# Backup configuration files
echo "📦 Backing up configuration..."
cp -r config "${BACKUP_DIR}/${BACKUP_NAME}/"
cp -r ssl "${BACKUP_DIR}/${BACKUP_NAME}/"
cp .env "${BACKUP_DIR}/${BACKUP_NAME}/"

# Backup logs
echo "📦 Backing up logs..."
cp -r logs "${BACKUP_DIR}/${BACKUP_NAME}/"

# Create archive
echo "📦 Creating archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"

echo "✅ Backup completed: ${BACKUP_NAME}.tar.gz"

# Cleanup old backups (keep last 30 days)
find "${BACKUP_DIR}" -name "jupiter_siem_backup_*.tar.gz" -mtime +30 -delete

echo "🧹 Old backups cleaned up"
EOF

    chmod +x backup.sh
    log "Backup script created ✓"
}

# Create restore script
create_restore_script() {
    log "Creating restore script..."
    
    cat > restore.sh << 'EOF'
#!/bin/bash
# Jupiter SIEM Restore Script

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="./data/backups"
RESTORE_DIR="${BACKUP_DIR}/restore_$(date +%Y%m%d_%H%M%S)"

echo "🔄 Starting restore process..."

# Extract backup
echo "📦 Extracting backup..."
mkdir -p "${RESTORE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}" --strip-components=1

# Stop services
echo "⏹️ Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Restore MongoDB
echo "📦 Restoring MongoDB..."
docker-compose -f docker-compose.prod.yml up -d mongodb
sleep 30
docker exec jupiter-siem-mongodb mongorestore /tmp/backup
docker cp "${RESTORE_DIR}/mongodb" jupiter-siem-mongodb:/tmp/backup

# Restore Redis
echo "📦 Restoring Redis..."
docker-compose -f docker-compose.prod.yml up -d redis
sleep 10
docker cp "${RESTORE_DIR}/redis.rdb" jupiter-siem-redis:/tmp/dump.rdb
docker exec jupiter-siem-redis redis-cli --rdb /tmp/dump.rdb

# Restore configuration
echo "📦 Restoring configuration..."
cp -r "${RESTORE_DIR}/config" ./
cp -r "${RESTORE_DIR}/ssl" ./
cp "${RESTORE_DIR}/.env" ./

# Start all services
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Cleanup
rm -rf "${RESTORE_DIR}"

echo "✅ Restore completed successfully"
EOF

    chmod +x restore.sh
    log "Restore script created ✓"
}

# Run tests
run_tests() {
    log "Running comprehensive tests..."
    
    # Backend tests
    cd backend
    python -m pytest tests/ -v --tb=short
    cd ..
    
    # Frontend tests
    cd frontend
    npm test -- --coverage --watchAll=false
    cd ..
    
    log "All tests passed ✓"
}

# Deploy application
deploy_application() {
    log "Deploying Jupiter SIEM..."
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 60
    
    # Check service health
    if curl -f http://localhost:${BACKEND_PORT}/api/security-ops/healthz > /dev/null 2>&1; then
        log "Backend is healthy ✓"
    else
        error "Backend health check failed"
    fi
    
    if curl -f http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
        log "Frontend is healthy ✓"
    else
        error "Frontend health check failed"
    fi
    
    if curl -f http://localhost:${NGINX_PORT}/health > /dev/null 2>&1; then
        log "Nginx is healthy ✓"
    else
        error "Nginx health check failed"
    fi
    
    log "Jupiter SIEM deployed successfully! 🎉"
}

# Main deployment function
main() {
    log "Starting Jupiter SIEM Comprehensive Deployment"
    log "=============================================="
    
    check_requirements
    create_directories
    generate_ssl
    setup_environment
    build_images
    create_docker_compose
    create_nginx_config
    create_backup_script
    create_restore_script
    
    if [ "$1" = "--test" ]; then
        run_tests
    fi
    
    deploy_application
    
    log ""
    log "🎉 Jupiter SIEM Comprehensive Deployment Complete!"
    log "=================================================="
    log ""
    log "Access URLs:"
    log "  Frontend: http://localhost:${NGINX_PORT}"
    log "  Backend API: http://localhost:${NGINX_PORT}/api"
    log "  Health Check: http://localhost:${NGINX_PORT}/health"
    log ""
    log "Admin Credentials:"
    log "  Email: admin@jupiter-siem.local"
    log "  Password: JupiterSIEM2024!"
    log ""
    log "Monitoring (if enabled):"
    log "  Prometheus: http://localhost:9090"
    log "  Grafana: http://localhost:3001"
    log ""
    log "Useful Commands:"
    log "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
    log "  Stop services: docker-compose -f docker-compose.prod.yml down"
    log "  Backup: ./backup.sh"
    log "  Restore: ./restore.sh <backup_file.tar.gz>"
    log ""
    log "For production deployment, ensure:"
    log "  1. Update SSL certificates"
    log "  2. Configure proper domain names"
    log "  3. Set up monitoring and alerting"
    log "  4. Configure backup schedules"
    log "  5. Review security settings"
    log ""
}

# Run main function with all arguments
main "$@"
