#!/bin/bash

# Exit on any error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
    error "Please run this script as root (with sudo)"
    exit 1
fi

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        log "$1 successful"
    else
        error "$1 failed"
        exit 1
    fi
}

# Check if domain is provided
if [ -z "$1" ]; then
    error "Please provide the domain name as an argument"
    echo "Usage: $0 <domain_name>"
    exit 1
fi

DOMAIN=$1
JUPITER_DIR="/opt/jupiter"
MONGO_PASSWORD=$(openssl rand -base64 32)
DEPLOYMENT_LOG="/var/log/jupiter_deployment.log"

# Start logging
exec 1> >(tee -a "$DEPLOYMENT_LOG") 2>&1

log "Starting JupiterEmerge deployment for domain: $DOMAIN"

# 1. Update system and install dependencies
log "Updating system and installing dependencies..."
{
    # Add MongoDB Repository
    log "Adding MongoDB repository..."
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian $(lsb_release -cs)/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # Add NodeSource repository for Node.js
    log "Adding NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

    # Update and install dependencies
    apt update && apt upgrade -y
    apt install -y python3-pip nodejs nginx certbot python3-certbot-nginx mongodb-org supervisor git curl gnupg
} || {
    error "Failed to install dependencies"
    exit 1
}

# 2. Set up MongoDB
log "Setting up MongoDB..."
systemctl start mongod
systemctl enable mongod
check_status "MongoDB service setup"

# Create MongoDB user and database
log "Creating MongoDB user and database..."
mongosh --eval "
    use jupiter_siem
    db.createUser({
        user: 'jupiter_admin',
        pwd: '$MONGO_PASSWORD',
        roles: ['dbOwner']
    })
" || {
    error "Failed to create MongoDB user"
    exit 1
}

# 3. Create and setup project directory
log "Setting up project directory..."
mkdir -p $JUPITER_DIR
cd $JUPITER_DIR || exit 1

# Save MongoDB credentials
echo "MONGODB_URI=mongodb://jupiter_admin:$MONGO_PASSWORD@localhost:27017/jupiter_siem" > .env
check_status "Environment setup"

# 4. Clone repository
log "Cloning repository..."
git clone https://github.com/Soldier0x0/JupiterEmerge.git . || {
    error "Failed to clone repository"
    exit 1
}

# 5. Setup Python virtual environment and install requirements
log "Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
check_status "Python dependencies installation"

# 6. Build frontend
log "Building frontend..."
cd frontend || exit 1
npm install
npm run build
check_status "Frontend build"
cd ..

# 7. Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer";
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self';";

    location / {
        root $JUPITER_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        root $JUPITER_DIR/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        root $JUPITER_DIR/frontend/dist;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t
check_status "Nginx configuration"

# 8. Configure Supervisor
log "Configuring Supervisor..."
cat > /etc/supervisor/conf.d/jupiter.conf << EOF
[program:jupiter]
directory=$JUPITER_DIR
command=$JUPITER_DIR/venv/bin/python backend/server.py
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/jupiter.err.log
stdout_logfile=/var/log/supervisor/jupiter.out.log
environment=MONGODB_URI="mongodb://jupiter_admin:$MONGO_PASSWORD@localhost:27017/jupiter_siem"
EOF

# Set correct permissions
chown -R www-data:www-data $JUPITER_DIR
chmod -R 755 $JUPITER_DIR

# Reload supervisor
supervisorctl reread
supervisorctl update
supervisorctl start jupiter
check_status "Supervisor configuration"

# 9. Set up SSL with Let's Encrypt
log "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
    warning "SSL certificate setup failed. Please run 'certbot --nginx' manually after fixing DNS settings."
}

# Reload Nginx
systemctl reload nginx
check_status "Nginx reload"

# Final status check
log "Checking service status..."
systemctl status nginx | grep "active" || warning "Nginx not running"
systemctl status mongodb | grep "active" || warning "MongoDB not running"
supervisorctl status jupiter | grep "RUNNING" || warning "Jupiter application not running"

# Save credentials
log "Saving credentials to /root/jupiter_credentials.txt..."
cat > /root/jupiter_credentials.txt << EOF
JupiterEmerge Deployment Credentials
===================================
Domain: $DOMAIN
MongoDB Username: jupiter_admin
MongoDB Password: $MONGO_PASSWORD
MongoDB URI: mongodb://jupiter_admin:$MONGO_PASSWORD@localhost:27017/jupiter_siem
Deployment Log: $DEPLOYMENT_LOG
EOF
chmod 600 /root/jupiter_credentials.txt

log "Deployment completed successfully!"
log "Credentials saved in /root/jupiter_credentials.txt"
log "Please make sure your DNS records point to this server:"
log "  - $DOMAIN"
log "  - www.$DOMAIN"
log "You can check the application status at: https://$DOMAIN"
log "Check deployment log at: $DEPLOYMENT_LOG"
