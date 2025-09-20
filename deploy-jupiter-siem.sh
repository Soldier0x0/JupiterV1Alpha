#!/bin/bash
# JupiterEmerge SIEM - Complete Deployment Script
# Debian 13 + Cloudflare Tunnel + projectjupiter.in subdomain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="jupiter-siem"
DOMAIN="siem.projectjupiter.in"
MAIN_DOMAIN="projectjupiter.in"
PROJECT_DIR="/home/$USER/$PROJECT_NAME"

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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Banner
clear
echo -e "${PURPLE}"
echo "  ██╗██╗   ██╗██████╗ ██╗████████╗███████╗███████╗"
echo "  ██║██║   ██║██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝"
echo "  ██║██║   ██║██████╔╝██║   ██║   █████╗  █████╗  "
echo "  ██║██║   ██║██╔═══╝ ██║   ██║   ██╔══╝  ██╔══╝  "
echo "  ██║╚██████╔╝██║     ██║   ██║   ███████╗███████╗"
echo "  ╚═╝ ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚══════╝╚══════╝"
echo -e "${NC}"
echo "  🚀 JupiterEmerge SIEM - Enterprise Security Platform"
echo "  📍 Debian 13 + Cloudflare Tunnel + projectjupiter.in"
echo "  ==================================================="
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if we're on Debian
if ! grep -q "Debian" /etc/os-release; then
    print_warning "This script is optimized for Debian 13. Proceeding anyway..."
fi

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if user has sudo access
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo access. Please run with a user that has sudo privileges."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the JupiterEmerge SIEM project root directory"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup system
setup_system() {
    print_header "Setting Up System"
    
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
        jq \
        bc
    
    # Start and enable Docker
    print_status "Configuring Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    
    print_success "System setup completed"
}

# Function to setup project
setup_project() {
    print_header "Setting Up Project"
    
    # Create project directory
    print_status "Setting up project directory..."
    mkdir -p $PROJECT_DIR
    cp -r . $PROJECT_DIR/
    cd $PROJECT_DIR
    
    # Setup Python backend
    print_status "Setting up Python backend..."
    cd backend
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
    cd ../frontend
    npm install
    npm run build
    
    print_success "Project setup completed"
}

# Function to configure services
configure_services() {
    print_header "Configuring Services"
    
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

    # Configure Nginx
    print_status "Configuring Nginx..."
    sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
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
        proxy_pass http://localhost:8001;
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
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8001;
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
    
    print_success "Services configured"
}

# Function to setup security
setup_security() {
    print_header "Setting Up Security"
    
    # Configure firewall
    print_status "Configuring firewall..."
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 8080/tcp
    
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
    
    print_success "Security configured"
}

# Function to setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create environment file
    print_status "Creating environment configuration..."
    tee $PROJECT_DIR/.env > /dev/null <<EOF
# JupiterEmerge SIEM Environment Configuration

# Domain Configuration
DOMAIN=$DOMAIN
MAIN_DOMAIN=$MAIN_DOMAIN
BACKEND_PORT=8001
FRONTEND_PORT=3000
CLOUDFLARE_TUNNEL_PORT=8080

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
    
    print_success "Environment configured"
}

# Function to setup Cloudflare tunnel
setup_cloudflare() {
    print_header "Setting Up Cloudflare Tunnel"
    
    # Install Cloudflare Tunnel
    print_status "Installing Cloudflare Tunnel..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    
    print_warning "Cloudflare Tunnel setup requires manual steps:"
    print_warning "1. Run: cloudflared tunnel login"
    print_warning "2. Run: cloudflared tunnel create jupiter-siem"
    print_warning "3. Copy the tunnel ID to /etc/cloudflared/jupiter-siem.json"
    print_warning "4. Configure DNS: siem.projectjupiter.in -> <tunnel-id>.cfargotunnel.com"
    
    # Create tunnel configuration
    sudo mkdir -p /etc/cloudflared
    sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: jupiter-siem
credentials-file: /etc/cloudflared/jupiter-siem.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:8080
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
    sudo useradd -r -s /bin/false cloudflared 2>/dev/null || true
    
    # Set permissions
    sudo chown -R cloudflared:cloudflared /etc/cloudflared
    
    print_success "Cloudflare tunnel configured (manual steps required)"
}

# Function to start services
start_services() {
    print_header "Starting Services"
    
    # Reload systemd and start services
    print_status "Starting services..."
    sudo systemctl daemon-reload
    sudo systemctl enable jupiter-backend
    sudo systemctl enable nginx
    sudo systemctl enable fail2ban
    sudo systemctl enable cloudflared
    
    # Start services
    sudo systemctl start jupiter-backend
    sudo systemctl start nginx
    sudo systemctl start fail2ban
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 10
    
    # Check service status
    print_status "Checking service status..."
    sudo systemctl status jupiter-backend --no-pager
    sudo systemctl status nginx --no-pager
    
    print_success "Services started"
}

# Function to setup monitoring
setup_monitoring() {
    print_header "Setting Up Monitoring"
    
    # Make maintenance script executable
    chmod +x $PROJECT_DIR/deployment/maintenance.sh
    
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
ports=("8001" "80" "443" "8080")
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
    
    print_success "Monitoring configured"
}

# Function to show final status
show_final_status() {
    print_header "Deployment Status"
    
    echo "🎯 JupiterEmerge SIEM Deployment Summary"
    echo "======================================="
    echo ""
    echo "📁 Project Directory: $PROJECT_DIR"
    echo "🌐 Domain: $DOMAIN"
    echo "🔒 Main Domain: $MAIN_DOMAIN"
    echo ""
    
    echo "🔧 Services Status:"
    services=("jupiter-backend" "nginx" "fail2ban" "cloudflared")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service; then
            echo "  ✅ $service: Running"
        else
            echo "  ❌ $service: Not running"
        fi
    done
    
    echo ""
    echo "🌐 Access URLs:"
    echo "  Local: http://localhost:8080"
    echo "  Public: https://$DOMAIN (after Cloudflare setup)"
    echo ""
    
    echo "📋 Next Steps:"
    echo "  1. Complete Cloudflare tunnel setup:"
    echo "     - Run: cloudflared tunnel login"
    echo "     - Run: cloudflared tunnel create jupiter-siem"
    echo "     - Configure DNS: siem.projectjupiter.in -> <tunnel-id>.cfargotunnel.com"
    echo ""
    echo "  2. Get SSL certificate:"
    echo "     - Run: sudo certbot --nginx -d $DOMAIN"
    echo ""
    echo "  3. Monitor the system:"
    echo "     - Run: $PROJECT_DIR/monitor.sh"
    echo "     - Run: $PROJECT_DIR/deployment/maintenance.sh status"
    echo ""
    echo "  4. Configure your environment:"
    echo "     - Edit: $PROJECT_DIR/.env"
    echo "     - Set your email password and admin credentials"
    echo ""
    
    echo "📚 Documentation:"
    echo "  - Quick Guide: $PROJECT_DIR/deployment/QUICK_DEPLOYMENT_GUIDE.md"
    echo "  - Cloudflare Setup: $PROJECT_DIR/deployment/cloudflare-setup.md"
    echo "  - Maintenance: $PROJECT_DIR/deployment/maintenance.sh"
    echo ""
    
    print_success "JupiterEmerge SIEM deployment completed!"
    print_warning "Remember to complete the Cloudflare tunnel setup for public access!"
}

# Main deployment flow
main() {
    check_prerequisites
    setup_system
    setup_project
    configure_services
    setup_security
    setup_environment
    setup_cloudflare
    start_services
    setup_monitoring
    show_final_status
}

# Run main function
main "$@"
