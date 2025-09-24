#!/bin/bash
# Jupiter SIEM - Master Deployment Selector
# Unified deployment script for both Native and Docker approaches

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; exit 1; }
warning() { echo -e "${YELLOW}[WARNING] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }
header() { echo -e "${CYAN}$1${NC}"; }

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NATIVE_DEPLOY="${SCRIPT_DIR}/native/deployment/deploy-native.sh"
DOCKER_DEPLOY="${SCRIPT_DIR}/docker/deployment/deploy-docker.sh"

# Display header
clear
header "╔══════════════════════════════════════════════════════════════════════╗"
header "║                    🚀 Jupiter SIEM Deployment                        ║"
header "║                     Production-Ready Deployment                      ║"
header "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Show deployment options
show_menu() {
    echo "Please select your deployment method:"
    echo ""
    echo "  🖥️  [1] Native Deployment"
    echo "      └── Direct installation on server (systemd, nginx, redis)"
    echo "      └── Better performance, traditional ops"
    echo "      └── Recommended for: Single server, traditional environments"
    echo ""
    echo "  🐳 [2] Docker Deployment"  
    echo "      └── Containerized deployment (docker-compose)"
    echo "      └── Better isolation, easier scaling"
    echo "      └── Recommended for: Cloud, microservices, development"
    echo ""
    echo "  ⚙️  [3] Both Deployments (Different Ports)"
    echo "      └── Run both native and docker simultaneously"
    echo "      └── Native: http://localhost, Docker: http://localhost:8080"
    echo "      └── Recommended for: Testing, migration scenarios"
    echo ""
    echo "  ℹ️  [4] Show Deployment Comparison"
    echo "      └── Detailed comparison of native vs docker"
    echo ""
    echo "  ❌ [5] Exit"
    echo ""
}

# Show deployment comparison
show_comparison() {
    clear
    header "╔══════════════════════════════════════════════════════════════════════╗"
    header "║                   📊 Deployment Method Comparison                    ║"
    header "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    echo "┌─────────────────┬────────────────────────┬────────────────────────┐"
    echo "│     Aspect      │    Native Deployment   │   Docker Deployment    │"
    echo "├─────────────────┼────────────────────────┼────────────────────────┤"
    echo "│ Performance     │ ⚡ Excellent (direct)  │ 🔥 Good (containers)   │"
    echo "│ Resource Usage  │ 💚 Lower overhead     │ 🟡 Higher overhead     │"
    echo "│ Isolation       │ 🟡 Process-level      │ ⭐ Container-level     │"
    echo "│ Scaling         │ 🟡 Manual scaling     │ ⭐ Easy auto-scaling   │"
    echo "│ Maintenance     │ 🔧 Traditional tools  │ 🐳 Docker tools       │"
    echo "│ Debugging       │ ⭐ Direct access      │ 🔍 Container logs      │"
    echo "│ Rollbacks       │ 🟡 Manual process     │ ⚡ Quick & easy       │"
    echo "│ Cloud Deploy    │ 🟡 Requires setup     │ ⭐ Cloud-native       │"
    echo "│ Complexity      │ 🟢 Simple setup      │ 🟡 Docker knowledge   │"
    echo "│ Backup/Restore  │ 📦 File-based        │ 📦 Volume-based       │"
    echo "└─────────────────┴────────────────────────┴────────────────────────┘"
    echo ""
    
    echo "🎯 Choose Native if:"
    echo "   • You prefer traditional server management"
    echo "   • Maximum performance is critical"
    echo "   • You have a single server setup"
    echo "   • Your team is familiar with systemd/nginx"
    echo ""
    
    echo "🎯 Choose Docker if:"
    echo "   • You want containerized deployments"
    echo "   • You plan to scale horizontally"
    echo "   • You're deploying to cloud platforms"
    echo "   • You want easier development/testing"
    echo ""
    
    echo "Press any key to return to menu..."
    read -n 1
}

# Check system capabilities
check_system() {
    local native_ok=true
    local docker_ok=true
    
    # Check for native deployment requirements
    if ! command -v systemctl >/dev/null 2>&1; then
        native_ok=false
    fi
    if ! command -v nginx >/dev/null 2>&1; then
        native_ok=false
    fi
    
    # Check for docker deployment requirements
    if ! command -v docker >/dev/null 2>&1; then
        docker_ok=false
    fi
    if ! command -v docker-compose >/dev/null 2>&1; then
        docker_ok=false
    fi
    
    echo "System Capabilities:"
    if [[ "$native_ok" == true ]]; then
        echo "  ✅ Native deployment - Ready"
    else
        echo "  ❌ Native deployment - Missing requirements (systemctl, nginx)"
    fi
    
    if [[ "$docker_ok" == true ]]; then
        echo "  ✅ Docker deployment - Ready"
    else
        echo "  ❌ Docker deployment - Missing requirements (docker, docker-compose)"
    fi
    echo ""
}

# Deploy native
deploy_native() {
    header "🖥️ Starting Native Deployment..."
    
    if [[ ! -f "$NATIVE_DEPLOY" ]]; then
        error "Native deployment script not found at $NATIVE_DEPLOY"
    fi
    
    if ! command -v systemctl >/dev/null 2>&1; then
        error "systemctl is required for native deployment"
    fi
    
    log "Executing native deployment script..."
    bash "$NATIVE_DEPLOY"
}

# Deploy docker
deploy_docker() {
    header "🐳 Starting Docker Deployment..."
    
    if [[ ! -f "$DOCKER_DEPLOY" ]]; then
        error "Docker deployment script not found at $DOCKER_DEPLOY"
    fi
    
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is required for Docker deployment"
    fi
    
    log "Executing Docker deployment script..."
    bash "$DOCKER_DEPLOY"
}

# Deploy both
deploy_both() {
    header "⚙️ Starting Both Deployments..."
    
    warning "This will run both native and Docker deployments on different ports"
    warning "Native: http://localhost (ports 80/443)"
    warning "Docker: http://localhost:8080 (ports 8080/8443)"
    echo ""
    
    read -p "Continue? [y/N]: " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        return
    fi
    
    log "Phase 1: Native Deployment"
    deploy_native
    
    echo ""
    log "Phase 2: Docker Deployment"
    deploy_docker
    
    log ""
    log "🎉 Both deployments completed!"
    log "Native:  http://localhost"
    log "Docker:  http://localhost:8080"
}

# Main function
main() {
    while true; do
        show_menu
        check_system
        
        read -p "Enter your choice [1-5]: " -n 1 -r
        echo ""
        echo ""
        
        case $REPLY in
            1)
                deploy_native
                break
                ;;
            2)
                deploy_docker
                break
                ;;
            3)
                deploy_both
                break
                ;;
            4)
                show_comparison
                ;;
            5)
                log "Goodbye! 👋"
                exit 0
                ;;
            *)
                warning "Invalid option. Please select 1-5."
                echo ""
                ;;
        esac
    done
}

# Handle command line arguments
if [[ $# -gt 0 ]]; then
    case "${1}" in
        "native"|"-n"|"--native")
            deploy_native
            ;;
        "docker"|"-d"|"--docker")
            deploy_docker
            ;;
        "both"|"-b"|"--both")
            deploy_both
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [native|docker|both|help]"
            echo ""
            echo "Options:"
            echo "  native, -n, --native    Deploy using native method"
            echo "  docker, -d, --docker    Deploy using Docker method"  
            echo "  both, -b, --both        Deploy both methods"
            echo "  help, -h, --help        Show this help"
            echo ""
            echo "If no option is provided, interactive menu will be shown."
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use 'help' for usage information."
            ;;
    esac
else
    main
fi