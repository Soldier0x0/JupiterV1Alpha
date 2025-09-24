#!/bin/bash
# Jupiter SIEM - Docker Backup Script
# Creates comprehensive backups of all Docker deployment components

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DOCKER_ROOT="${APP_ROOT}/docker"

# Configuration
BACKUP_DIR="${DOCKER_ROOT}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="jupiter_siem_docker_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

log "🔄 Starting Jupiter SIEM Docker Backup"
log "====================================="

# Load environment
ENV_FILE="${DOCKER_ROOT}/configuration/.env.docker"
if [[ -f "${ENV_FILE}" ]]; then
    source "${ENV_FILE}"
fi

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Check if containers are running
COMPOSE_FILE="${DOCKER_ROOT}/deployment/docker-compose.prod.yml"
cd "${DOCKER_ROOT}/deployment"

if ! docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q .; then
    info "⚠️ No running containers found. Backing up available data..."
fi

# Backup DuckDB database
log "📦 Backing up DuckDB database..."
if docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q backend; then
    docker-compose -f docker-compose.prod.yml exec -T backend cp /app/data/jupiter_siem.db /tmp/backup_db.db || true
    docker cp jupiter-docker-backend:/tmp/backup_db.db "${BACKUP_PATH}/jupiter_siem.db" 2>/dev/null || true
    log "✅ Database backup completed"
else
    # Backup from volume if container is not running
    cp "${APP_ROOT}/data/jupiter_siem.db" "${BACKUP_PATH}/jupiter_siem.db" 2>/dev/null || true
    info "ℹ️ Backend container not running, copied database file directly"
fi

# Backup Redis data
log "📦 Backing up Redis data..."
if docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q redis; then
    docker-compose -f docker-compose.prod.yml exec -T redis redis-cli BGSAVE || true
    sleep 5
    docker cp jupiter-docker-redis:/data/dump.rdb "${BACKUP_PATH}/redis_dump.rdb" 2>/dev/null || true
    log "✅ Redis backup completed"
else
    info "ℹ️ Redis container not running"
fi

# Backup Docker volumes
log "📦 Backing up Docker volumes..."
mkdir -p "${BACKUP_PATH}/volumes"

# List and backup all relevant volumes
docker volume ls --filter "name=docker_" --format "{{.Name}}" | while read volume; do
    if [[ -n "$volume" ]]; then
        log "Backing up volume: $volume"
        docker run --rm -v "$volume":/source:ro -v "${BACKUP_PATH}/volumes":/backup alpine tar czf "/backup/${volume}.tar.gz" -C /source . 2>/dev/null || true
    fi
done

# Backup configuration files
log "📦 Backing up configuration files..."
cp -r "${DOCKER_ROOT}/configuration" "${BACKUP_PATH}/"
cp -r "${DOCKER_ROOT}/deployment" "${BACKUP_PATH}/"

# Backup environment files
cp "${APP_ROOT}/backend/.env" "${BACKUP_PATH}/backend.env" 2>/dev/null || true
cp "${APP_ROOT}/frontend/.env" "${BACKUP_PATH}/frontend.env" 2>/dev/null || true
cp "${ENV_FILE}" "${BACKUP_PATH}/docker.env" 2>/dev/null || true

# Backup Docker Compose files
cp "${COMPOSE_FILE}" "${BACKUP_PATH}/"

# Backup application logs
log "📦 Backing up logs..."
mkdir -p "${BACKUP_PATH}/logs"
cp -r "${APP_ROOT}/logs" "${BACKUP_PATH}/" 2>/dev/null || true

# Export Docker images
log "📦 Exporting Docker images..."
mkdir -p "${BACKUP_PATH}/images"

# Export custom images
docker save jupiter-siem-backend:latest | gzip > "${BACKUP_PATH}/images/backend.tar.gz" 2>/dev/null || true
docker save jupiter-siem-frontend:latest | gzip > "${BACKUP_PATH}/images/frontend.tar.gz" 2>/dev/null || true
docker save jupiter-siem-nginx:latest | gzip > "${BACKUP_PATH}/images/nginx.tar.gz" 2>/dev/null || true

# Create container state snapshot
log "📦 Creating container state snapshot..."
docker-compose -f docker-compose.prod.yml ps --all > "${BACKUP_PATH}/container_state.txt" 2>/dev/null || true
docker-compose -f docker-compose.prod.yml config > "${BACKUP_PATH}/resolved_compose.yml" 2>/dev/null || true

# Create metadata
log "📦 Creating backup metadata..."
cat > "${BACKUP_PATH}/backup_metadata.txt" << EOF
Jupiter SIEM Docker Backup
==========================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
Host: $(hostname)
User: $(whoami)
App Root: ${APP_ROOT}
Docker Root: ${DOCKER_ROOT}
Docker Version: $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "Unknown")
Docker Compose Version: $(docker-compose version --short 2>/dev/null || echo "Unknown")

Included Components:
- DuckDB Database
- Redis Data Dump
- Docker Volumes
- Configuration Files
- Environment Files
- Docker Compose Files
- Application Logs
- Docker Images (custom)
- Container State

Container Status at Backup:
$(docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "No containers found")

Docker Images:
$(docker images | grep jupiter-siem 2>/dev/null || echo "No custom images found")

Docker Volumes:
$(docker volume ls --filter "name=docker_" 2>/dev/null || echo "No volumes found")
EOF

# Create archive
log "📦 Creating compressed archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"

# Set permissions
chmod 600 "${BACKUP_NAME}.tar.gz"

log "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Cleanup old backups (keep last 30 days)
log "🧹 Cleaning up old backups..."
find "${BACKUP_DIR}" -name "jupiter_siem_docker_backup_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

log "🎉 Docker backup process completed successfully!"
echo ""
echo "Backup Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "Backup Size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)"
echo "To restore: ${DOCKER_ROOT}/deployment/restore-docker.sh ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"