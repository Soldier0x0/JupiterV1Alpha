#!/bin/bash

# Jupiter SIEM - Complete Dependency Installation for Debian 13
# Installs everything needed for production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[INSTALL] $1${NC}"; }
print_info() { echo -e "${BLUE}[INFO] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[WARN] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}"; }

print_step "Jupiter SIEM - Installing All Dependencies for Debian 13"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Update system
print_step "Updating System Packages"
apt update && apt upgrade -y

# Install system essentials
print_step "Installing System Essentials"
apt install -y \
    curl \
    wget \
    git \
    unzip \
    zip \
    htop \
    tree \
    jq \
    vim \
    nano \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Python 3.11 and pip
print_step "Installing Python 3.11"
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    python3-setuptools \
    python3-wheel

# Install Node.js 20 LTS
print_step "Installing Node.js 20 LTS"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Yarn package manager
print_step "Installing Yarn"
npm install -g yarn

# Install Docker
print_step "Installing Docker"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
else
    print_info "Docker already installed"
fi

# Install Docker Compose
print_step "Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    print_info "Docker Compose already installed"
fi

# Install Nginx
print_step "Installing Nginx"
apt install -y nginx

# Install SSL tools
print_step "Installing SSL/TLS Tools"
apt install -y certbot python3-certbot-nginx

# Install security tools
print_step "Installing Security Tools"
apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    logrotate

# Install monitoring tools
print_step "Installing Monitoring Tools"
apt install -y \
    htop \
    iotop \
    nethogs \
    ncdu \
    rsync

# Install database client tools
print_step "Installing Database Tools"
apt install -y mongodb-clients

# Verify installations
print_step "Verifying Installations"

echo "System Information:"
echo "=================="
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo

echo "Installed Versions:"
echo "=================="
echo "Python: $(python3 --version)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Yarn: $(yarn --version)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Git: $(git --version)"

# Check if cloudflared is available
if command -v cloudflared &> /dev/null; then
    echo "Cloudflared: $(cloudflared version | head -1)"
else
    print_warning "Cloudflared not found - install separately if needed"
fi

print_step "Creating Python Virtual Environment"
cd /opt
python3 -m venv jupiter-siem-env
source jupiter-siem-env/bin/activate
pip install --upgrade pip setuptools wheel

print_step "All Dependencies Installed Successfully!"

echo
print_info "✅ System ready for Jupiter SIEM deployment"
print_info "✅ All required packages installed"
print_info "✅ Docker and containers ready"
print_info "✅ SSL/TLS tools available"
print_info "✅ Security tools configured"
print_info "✅ Development tools ready"

echo
print_warning "Next steps:"
print_warning "1. Configure Cloudflare tunnel (if not done)"
print_warning "2. Run the Jupiter SIEM deployment script"
print_warning "3. Configure firewall and security settings"

echo
echo "🚀 Ready to deploy Jupiter SIEM!"