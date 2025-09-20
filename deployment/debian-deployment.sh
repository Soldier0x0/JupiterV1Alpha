#!/bin/bash
# JupiterEmerge SIEM - Debian 13 Deployment Script
# Deploy to Debian 13 laptop with Cloudflare tunnel integration

set -e

echo "🚀 Starting JupiterEmerge SIEM Deployment on Debian 13"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="jupiter-siem"
DOMAIN="siem.projectjupiter.in"  # Subdomain for SIEM
MAIN_DOMAIN="projectjupiter.in"  # Main portfolio domain
BACKEND_PORT="8001"
FRONTEND_PORT="3000"
CLOUDFLARE_TUNNEL_PORT="8080"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    nginx \
    certbot \
    python3-certbot-nginx \
    docker.io \
    docker-compose \
    ufw \
    fail2ban \
    htop \
    unzip \
    jq

# Start and enable Docker
print_status "Configuring Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Cloudflare Tunnel
print_status "Installing Cloudflare Tunnel..."
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

# Create project directory
print_status "Setting up project directory..."
PROJECT_DIR="/home/$USER/$PROJECT_NAME"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or copy project files
if [ -d ".git" ]; then
    print_status "Updating existing project..."
    git pull
else
    print_status "Setting up project files..."
    # Copy project files from current directory
    cp -r /path/to/current/project/* $PROJECT_DIR/ 2>/dev/null || {
        print_warning "Please copy your project files to $PROJECT_DIR"
        print_status "You can use: cp -r /path/to/your/project/* $PROJECT_DIR/"
    }
fi

# Setup Python virtual environment
print_status "Setting up Python backend..."
cd $PROJECT_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install AI dependencies
print_status "Installing AI dependencies..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install transformers sentence-transformers langchain chromadb
pip install bitsandbytes accelerate

# Setup Node.js frontend
print_status "Setting up Node.js frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build

# Create systemd service files
print_status "Creating systemd services..."

# Backend service
sudo tee /etc/systemd/system/jupiter-backend.service > /dev/null <<EOF
[Unit]
Description=JupiterEmerge SIEM Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
ExecStart=$PROJECT_DIR/backend/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service (served by nginx)
sudo tee /etc/systemd/system/jupiter-frontend.service > /dev/null <<EOF
[Unit]
Description=JupiterEmerge SIEM Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/frontend
ExecStart=/usr/bin/npm run serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
# JupiterEmerge SIEM Nginx Configuration
server {
    listen 80;
    server_name $DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        root $PROJECT_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
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
    
    # WebSocket support for real-time features
    location /ws/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow $CLOUDFLARE_TUNNEL_PORT/tcp

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

# Create environment file
print_status "Creating environment configuration..."
tee $PROJECT_DIR/.env > /dev/null <<EOF
# JupiterEmerge SIEM Environment Configuration

# Database
MONGO_URL=mongodb://localhost:27017/jupiter_siem
JWT_SECRET_KEY=jupiter_siem_production_secret_key_$(openssl rand -hex 32)

# Email Configuration
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=harsha@projectjupiter.in
EMAIL_PASSWORD=your_email_password
EMAIL_USE_TLS=true

# Admin Configuration
SUPER_ADMIN_EMAIL=admin@projectjupiter.in
SUPER_ADMIN_PASSWORD=your_secure_password
SUPER_ADMIN_TENANT_NAME=MainTenant

# CORS Configuration
CORS_ORIGINS=https://$DOMAIN,https://$MAIN_DOMAIN

# AI Configuration
AI_ENABLED=true
AI_MODELS_PATH=$PROJECT_DIR/models
AI_VECTOR_STORE_PATH=$PROJECT_DIR/vector_store
AI_MAX_MEMORY_USAGE=0.8
AI_DEVICE=cpu
AI_QUANTIZATION=true

# NiFi Configuration
NIFI_BASE_URL=http://localhost:8080
NIFI_USERNAME=admin
NIFI_PASSWORD=admin
NIFI_PROCESS_GROUP_ID=root

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
LOG_FILE=$PROJECT_DIR/logs/jupiter.log
EOF

# Create logs directory
mkdir -p $PROJECT_DIR/logs

# Setup Cloudflare Tunnel
print_status "Setting up Cloudflare Tunnel..."
print_warning "You need to authenticate with Cloudflare first:"
print_warning "Run: cloudflared tunnel login"
print_warning "Then create a tunnel: cloudflared tunnel create $PROJECT_NAME"

# Create tunnel configuration
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: $PROJECT_NAME
credentials-file: /etc/cloudflared/$PROJECT_NAME.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$CLOUDFLARE_TUNNEL_PORT
  - service: http_status:404
EOF

# Create Cloudflare tunnel service
sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=cloudflared
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create cloudflared user
sudo useradd -r -s /bin/false cloudflared

# Set permissions
sudo chown -R cloudflared:cloudflared /etc/cloudflared

# Reload systemd and start services
print_status "Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable jupiter-backend
sudo systemctl enable jupiter-frontend
sudo systemctl enable nginx
sudo systemctl enable fail2ban
sudo systemctl enable cloudflared

# Start services
sudo systemctl start jupiter-backend
sudo systemctl start nginx
sudo systemctl start fail2ban

# Wait for backend to start
sleep 10

# Check service status
print_status "Checking service status..."
sudo systemctl status jupiter-backend --no-pager
sudo systemctl status nginx --no-pager

# Create monitoring script
print_status "Creating monitoring script..."
tee $PROJECT_DIR/monitor.sh > /dev/null <<EOF
#!/bin/bash
# JupiterEmerge SIEM Monitoring Script

echo "🔍 JupiterEmerge SIEM Status Check"
echo "=================================="

# Check services
services=("jupiter-backend" "nginx" "fail2ban" "cloudflared")
for service in "\${services[@]}"; do
    if systemctl is-active --quiet \$service; then
        echo "✅ \$service: Running"
    else
        echo "❌ \$service: Not running"
    fi
done

# Check ports
ports=("$BACKEND_PORT" "80" "443" "$CLOUDFLARE_TUNNEL_PORT")
for port in "\${ports[@]}"; do
    if netstat -tuln | grep -q ":\$port "; then
        echo "✅ Port \$port: Open"
    else
        echo "❌ Port \$port: Closed"
    fi
done

# Check disk space
echo ""
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

# Check memory usage
echo ""
echo "🧠 Memory Usage:"
free -h

# Check logs
echo ""
echo "📋 Recent Logs:"
sudo journalctl -u jupiter-backend --since "5 minutes ago" --no-pager | tail -5
EOF

chmod +x $PROJECT_DIR/monitor.sh

# Create backup script
print_status "Creating backup script..."
tee $PROJECT_DIR/backup.sh > /dev/null <<EOF
#!/bin/bash
# JupiterEmerge SIEM Backup Script

BACKUP_DIR="/home/$USER/backups/jupiter-siem"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="jupiter-siem-backup-\$DATE.tar.gz"

mkdir -p \$BACKUP_DIR

echo "📦 Creating backup: \$BACKUP_FILE"

# Backup project files
tar -czf \$BACKUP_DIR/\$BACKUP_FILE \\
    --exclude='node_modules' \\
    --exclude='venv' \\
    --exclude='.git' \\
    --exclude='logs' \\
    --exclude='models' \\
    --exclude='vector_store' \\
    $PROJECT_DIR

echo "✅ Backup created: \$BACKUP_DIR/\$BACKUP_FILE"

# Keep only last 7 backups
cd \$BACKUP_DIR
ls -t jupiter-siem-backup-*.tar.gz | tail -n +8 | xargs -r rm

echo "🧹 Old backups cleaned up"
EOF

chmod +x $PROJECT_DIR/backup.sh

# Create update script
print_status "Creating update script..."
tee $PROJECT_DIR/update.sh > /dev/null <<EOF
#!/bin/bash
# JupiterEmerge SIEM Update Script

echo "🔄 Updating JupiterEmerge SIEM..."

# Stop services
sudo systemctl stop jupiter-backend
sudo systemctl stop jupiter-frontend

# Backup current version
./backup.sh

# Update project files
if [ -d ".git" ]; then
    git pull
else
    echo "⚠️ Not a git repository. Please update files manually."
fi

# Update backend dependencies
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Update frontend dependencies
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl start jupiter-backend
sudo systemctl start jupiter-frontend

echo "✅ Update completed!"
EOF

chmod +x $PROJECT_DIR/update.sh

# Final status
print_success "Deployment completed!"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure Cloudflare Tunnel:"
echo "   - Run: cloudflared tunnel login"
echo "   - Run: cloudflared tunnel create $PROJECT_NAME"
echo "   - Copy the tunnel ID to /etc/cloudflared/$PROJECT_NAME.json"
echo "   - Run: sudo systemctl start cloudflared"
echo ""
echo "2. Configure DNS:"
echo "   - Add CNAME record: $DOMAIN -> <tunnel-id>.cfargotunnel.com"
echo ""
echo "3. Get SSL Certificate:"
echo "   - Run: sudo certbot --nginx -d $DOMAIN"
echo ""
echo "4. Monitor the system:"
echo "   - Run: $PROJECT_DIR/monitor.sh"
echo ""
echo "5. Access your SIEM:"
echo "   - Local: http://localhost:$CLOUDFLARE_TUNNEL_PORT"
echo "   - Public: https://$DOMAIN"
echo ""
echo "📋 Useful Commands:"
echo "   - Monitor: $PROJECT_DIR/monitor.sh"
echo "   - Backup: $PROJECT_DIR/backup.sh"
echo "   - Update: $PROJECT_DIR/update.sh"
echo "   - Logs: sudo journalctl -u jupiter-backend -f"
echo ""
print_success "JupiterEmerge SIEM is ready for production!"
