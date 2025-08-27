#!/bin/bash

# Fix for Debian Trixie deployment issues
# This script addresses package availability issues in Debian testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[STEP] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_step "Fixing Debian Trixie Package Issues"

# Check Debian version
DEBIAN_VERSION=$(lsb_release -sr 2>/dev/null || echo "unknown")
DEBIAN_CODENAME=$(lsb_release -sc 2>/dev/null || echo "unknown")

print_info "Detected: Debian $DEBIAN_VERSION ($DEBIAN_CODENAME)"

# Fix package sources for Trixie
print_step "Updating Package Sources for Debian Trixie"

# Install essential packages that are available
print_info "Installing available essential packages..."
sudo apt update
sudo apt install -y curl wget gnupg2 apt-transport-https ca-certificates lsb-release

# Check if software-properties-common is available under a different name
print_info "Checking for software-properties-common alternatives..."

if apt-cache search software-properties | grep -q "software-properties-common"; then
    print_info "software-properties-common found, installing..."
    sudo apt install -y software-properties-common
elif apt-cache search python3-software-properties | grep -q "python3-software-properties"; then
    print_info "Installing python3-software-properties instead..."
    sudo apt install -y python3-software-properties
else
    print_warning "software-properties-common not available, but we can proceed without it"
fi

# Docker installation for Debian Trixie
print_step "Installing Docker for Debian Trixie"

if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    
    # Remove any existing Docker installations
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # For Debian Trixie, we'll use bookworm repository (stable) as fallback
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Enable and start Docker
    sudo systemctl enable docker
    sudo systemctl start docker
    
    print_info "Docker installed successfully"
else
    print_info "Docker already installed"
fi

# Docker Compose installation
print_step "Installing Docker Compose"

if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    
    # Get latest version
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # Download and install
    sudo curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for compatibility
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_info "Docker Compose installed successfully"
else
    print_info "Docker Compose already installed"
fi

# Nginx installation
print_step "Installing Nginx"

if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    print_info "Nginx installed successfully"
else
    print_info "Nginx already installed"
fi

# Git installation  
print_step "Installing Git"

if ! command -v git &> /dev/null; then
    print_info "Installing Git..."
    sudo apt install -y git
    print_info "Git installed successfully"
else
    print_info "Git already installed"
fi

# Python installation
print_step "Installing Python3"

if ! command -v python3 &> /dev/null; then
    print_info "Installing Python3..."
    sudo apt install -y python3 python3-pip python3-venv python3-dev
    print_info "Python3 installed successfully"
else
    print_info "Python3 already installed"
fi

# Node.js installation
print_step "Installing Node.js"

if ! command -v node &> /dev/null; then
    print_info "Installing Node.js..."
    # Use NodeSource repository which should work with Trixie
    sudo apt install -y nodejs npm
    
    # Install yarn globally
    sudo npm install -g yarn
    
    print_info "Node.js installed successfully"
else
    print_info "Node.js already installed"
fi

# Cloudflared installation
print_step "Installing Cloudflared"

if ! command -v cloudflared &> /dev/null; then
    print_info "Installing Cloudflared..."
    
    # Download latest cloudflared
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    
    print_info "Cloudflared installed successfully"
else
    print_info "Cloudflared already installed"
fi

# Additional tools
print_step "Installing Additional Tools"
sudo apt install -y htop curl wget unzip jq tree

print_step "Installation Complete!"

# Verify installations
print_info "Verifying installations..."
echo "Docker: $(docker --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Nginx: $(nginx -v 2>&1 || echo 'NOT INSTALLED')"
echo "Git: $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Python3: $(python3 --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Node.js: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Cloudflared: $(cloudflared version 2>/dev/null | head -1 || echo 'NOT INSTALLED')"

print_step "Ready to Continue Jupiter SIEM Deployment!"
print_info "You can now re-run the original deployment script or continue manually."

echo -e "${GREEN}"
echo "============================================================"
echo "           Dependencies Fixed for Debian Trixie!"
echo "============================================================"
echo
echo "Next steps:"
echo "1. Re-run the Jupiter SIEM deployment script"
echo "2. Or continue with manual deployment using Docker"
echo 
echo "Installation directory: /srv/jupiter/server"
echo "Tunnel name: ProjectJupiter"
echo -e "${NC}"