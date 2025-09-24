#!/bin/bash
# Jupiter SIEM - Native Backup Script
# Creates comprehensive backups of all native deployment components

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NATIVE_ROOT="${APP_ROOT}/native"

# Configuration
BACKUP_DIR="${NATIVE_ROOT}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="jupiter_siem_native_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

log "🔄 Starting Jupiter SIEM Native Backup"
log "====================================="

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Load environment
if [[ -f "${NATIVE_ROOT}/configuration/.env.native" ]]; then
    source "${NATIVE_ROOT}/configuration/.env.native"
fi

# Backup DuckDB database
log "📦 Backing up DuckDB database..."
DUCKDB_PATH=${DUCKDB_PATH:-"${APP_ROOT}/data/jupiter_siem.db"}
if [[ -f "${DUCKDB_PATH}" ]]; then
    cp "${DUCKDB_PATH}" "${BACKUP_PATH}/jupiter_siem.db"
    log "✅ Database backup completed"
else
    info "ℹ️ DuckDB file not found at ${DUCKDB_PATH}"
fi

# Backup Redis data
log "📦 Backing up Redis data..."
if systemctl is-active --quiet redis-server; then
    redis-cli BGSAVE
    sleep 5
    cp /var/lib/redis/dump.rdb "${BACKUP_PATH}/redis_dump.rdb" 2>/dev/null || true
    log "✅ Redis backup completed"
else
    info "ℹ️ Redis is not running"
fi

# Backup configuration files
log "📦 Backing up configuration files..."
cp -r "${NATIVE_ROOT}/configuration" "${BACKUP_PATH}/"
cp "${APP_ROOT}/backend/.env" "${BACKUP_PATH}/backend.env" 2>/dev/null || true
cp "${APP_ROOT}/frontend/.env" "${BACKUP_PATH}/frontend.env" 2>/dev/null || true

# Backup systemd service files
mkdir -p "${BACKUP_PATH}/systemd"
cp /etc/systemd/system/jupiter-*.service "${BACKUP_PATH}/systemd/" 2>/dev/null || true

# Backup nginx configuration
mkdir -p "${BACKUP_PATH}/nginx"
cp /etc/nginx/sites-available/jupiter-siem "${BACKUP_PATH}/nginx/" 2>/dev/null || true

# Backup application logs
log "📦 Backing up logs..."
mkdir -p "${BACKUP_PATH}/logs"
cp -r /var/log/jupiter* "${BACKUP_PATH}/logs/" 2>/dev/null || true
journalctl -u jupiter-backend --since="7 days ago" > "${BACKUP_PATH}/logs/backend.log" 2>/dev/null || true
journalctl -u jupiter-frontend --since="7 days ago" > "${BACKUP_PATH}/logs/frontend.log" 2>/dev/null || true

# Create metadata
log "📦 Creating backup metadata..."
cat > "${BACKUP_PATH}/backup_metadata.txt" << EOF
Jupiter SIEM Native Backup
==========================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
Host: $(hostname)
User: $(whoami)
App Root: ${APP_ROOT}
Native Root: ${NATIVE_ROOT}

Included Components:
- DuckDB Database
- Redis Data
- Configuration Files
- Systemd Services
- Nginx Configuration
- Application Logs (7 days)

Services Status at Backup:
$(systemctl status jupiter-backend --no-pager -l || echo "Backend service not found")
$(systemctl status jupiter-frontend --no-pager -l || echo "Frontend service not found")
$(systemctl status redis-server --no-pager -l || echo "Redis service not found")
$(systemctl status nginx --no-pager -l || echo "Nginx service not found")
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
find "${BACKUP_DIR}" -name "jupiter_siem_native_backup_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

log "🎉 Native backup process completed successfully!"
echo ""
echo "Backup Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "To restore: ${NATIVE_ROOT}/deployment/restore-native.sh ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"