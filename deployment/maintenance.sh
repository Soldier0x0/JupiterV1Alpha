#!/bin/bash
# JupiterEmerge SIEM - Maintenance & Monitoring Script
# For Debian 13 + Cloudflare Tunnel deployment

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
PROJECT_DIR="/home/$USER/$PROJECT_NAME"
DOMAIN="siem.projectjupiter.in"
LOG_FILE="$PROJECT_DIR/logs/maintenance.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1" | tee -a $LOG_FILE
}

# Create log directory if it doesn't exist
mkdir -p $PROJECT_DIR/logs

# Function to check service status
check_service() {
    local service_name=$1
    if systemctl is-active --quiet $service_name; then
        print_success "$service_name: Running"
        return 0
    else
        print_error "$service_name: Not running"
        return 1
    fi
}

# Function to check port status
check_port() {
    local port=$1
    if netstat -tuln | grep -q ":$port "; then
        print_success "Port $port: Open"
        return 0
    else
        print_error "Port $port: Closed"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -lt 80 ]; then
        print_success "Disk usage: ${usage}% (OK)"
    elif [ $usage -lt 90 ]; then
        print_warning "Disk usage: ${usage}% (Warning)"
    else
        print_error "Disk usage: ${usage}% (Critical)"
    fi
}

# Function to check memory usage
check_memory() {
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $usage -lt 80 ]; then
        print_success "Memory usage: ${usage}% (OK)"
    elif [ $usage -lt 90 ]; then
        print_warning "Memory usage: ${usage}% (Warning)"
    else
        print_error "Memory usage: ${usage}% (Critical)"
    fi
}

# Function to check CPU usage
check_cpu() {
    local usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$usage < 80" | bc -l) )); then
        print_success "CPU usage: ${usage}% (OK)"
    elif (( $(echo "$usage < 90" | bc -l) )); then
        print_warning "CPU usage: ${usage}% (Warning)"
    else
        print_error "CPU usage: ${usage}% (Critical)"
    fi
}

# Function to check network connectivity
check_network() {
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        print_success "Network connectivity: OK"
    else
        print_error "Network connectivity: Failed"
    fi
}

# Function to check DNS resolution
check_dns() {
    if nslookup $DOMAIN > /dev/null 2>&1; then
        print_success "DNS resolution: OK"
    else
        print_error "DNS resolution: Failed"
    fi
}

# Function to check SSL certificate
check_ssl() {
    local cert_info=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ $? -eq 0 ]; then
        local expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ $days_until_expiry -gt 30 ]; then
            print_success "SSL certificate: Valid (expires in $days_until_expiry days)"
        elif [ $days_until_expiry -gt 7 ]; then
            print_warning "SSL certificate: Expires in $days_until_expiry days"
        else
            print_error "SSL certificate: Expires in $days_until_expiry days (Critical)"
        fi
    else
        print_error "SSL certificate: Failed to check"
    fi
}

# Function to check Cloudflare tunnel
check_cloudflare_tunnel() {
    if systemctl is-active --quiet cloudflared; then
        print_success "Cloudflare tunnel: Running"
        
        # Check tunnel connectivity
        if cloudflared tunnel info jupiter-siem > /dev/null 2>&1; then
            print_success "Tunnel connectivity: OK"
        else
            print_error "Tunnel connectivity: Failed"
        fi
    else
        print_error "Cloudflare tunnel: Not running"
    fi
}

# Function to check application health
check_application_health() {
    local health_url="http://localhost:8080/api/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" $health_url 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "Application health: OK"
    else
        print_error "Application health: Failed (HTTP $response)"
    fi
}

# Function to check AI models
check_ai_models() {
    local ai_status_url="http://localhost:8080/api/ai/models/status"
    local response=$(curl -s $ai_status_url 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$response" | grep -q '"success":true'; then
        print_success "AI models: Available"
    else
        print_warning "AI models: Not available or error"
    fi
}

# Function to check log files
check_logs() {
    local log_files=(
        "/var/log/nginx/error.log"
        "/var/log/nginx/access.log"
        "$PROJECT_DIR/logs/jupiter.log"
        "/var/log/syslog"
    )
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            local size=$(du -h "$log_file" | cut -f1)
            print_success "Log file $log_file: $size"
        else
            print_warning "Log file $log_file: Not found"
        fi
    done
}

# Function to check security
check_security() {
    # Check fail2ban
    if systemctl is-active --quiet fail2ban; then
        print_success "Fail2ban: Running"
    else
        print_error "Fail2ban: Not running"
    fi
    
    # Check firewall
    if ufw status | grep -q "Status: active"; then
        print_success "Firewall: Active"
    else
        print_warning "Firewall: Not active"
    fi
    
    # Check for failed login attempts
    local failed_logins=$(grep "Failed password" /var/log/auth.log | wc -l)
    if [ $failed_logins -gt 0 ]; then
        print_warning "Failed login attempts: $failed_logins"
    else
        print_success "Failed login attempts: 0"
    fi
}

# Function to perform system maintenance
perform_maintenance() {
    print_header "Performing System Maintenance"
    
    # Update system packages
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Clean package cache
    print_status "Cleaning package cache..."
    sudo apt autoremove -y
    sudo apt autoclean
    
    # Clean log files
    print_status "Cleaning old log files..."
    sudo journalctl --vacuum-time=7d
    sudo find /var/log -name "*.log" -type f -mtime +30 -delete
    
    # Clean temporary files
    print_status "Cleaning temporary files..."
    sudo find /tmp -type f -mtime +7 -delete
    sudo find /var/tmp -type f -mtime +7 -delete
    
    # Update AI models (if needed)
    print_status "Checking AI model updates..."
    cd $PROJECT_DIR/backend
    source venv/bin/activate
    pip list --outdated | grep -E "(torch|transformers|sentence-transformers)" || true
    
    print_success "System maintenance completed"
}

# Function to backup system
backup_system() {
    print_header "Creating System Backup"
    
    local backup_dir="/home/$USER/backups/jupiter-siem"
    local backup_file="jupiter-siem-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    mkdir -p $backup_dir
    
    print_status "Creating backup: $backup_file"
    
    # Backup project files
    tar -czf $backup_dir/$backup_file \
        --exclude='node_modules' \
        --exclude='venv' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='models' \
        --exclude='vector_store' \
        --exclude='backups' \
        $PROJECT_DIR
    
    # Backup configuration files
    sudo tar -czf $backup_dir/config-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
        /etc/nginx/sites-available/$PROJECT_NAME \
        /etc/systemd/system/jupiter-*.service \
        /etc/cloudflared/ \
        /etc/letsencrypt/
    
    # Keep only last 7 backups
    cd $backup_dir
    ls -t jupiter-siem-backup-*.tar.gz | tail -n +8 | xargs -r rm
    ls -t config-backup-*.tar.gz | tail -n +8 | xargs -r rm
    
    print_success "Backup completed: $backup_dir/$backup_file"
}

# Function to restart services
restart_services() {
    print_header "Restarting Services"
    
    local services=("jupiter-backend" "nginx" "cloudflared" "fail2ban")
    
    for service in "${services[@]}"; do
        print_status "Restarting $service..."
        sudo systemctl restart $service
        sleep 2
        
        if systemctl is-active --quiet $service; then
            print_success "$service restarted successfully"
        else
            print_error "$service failed to restart"
        fi
    done
}

# Function to show system status
show_status() {
    print_header "JupiterEmerge SIEM System Status"
    echo "======================================"
    echo "Timestamp: $(date)"
    echo "Domain: $DOMAIN"
    echo "Project Directory: $PROJECT_DIR"
    echo ""
    
    print_header "Service Status"
    check_service "jupiter-backend"
    check_service "nginx"
    check_service "cloudflared"
    check_service "fail2ban"
    echo ""
    
    print_header "Port Status"
    check_port "80"
    check_port "443"
    check_port "8080"
    check_port "8001"
    echo ""
    
    print_header "System Resources"
    check_disk_space
    check_memory
    check_cpu
    echo ""
    
    print_header "Network & Connectivity"
    check_network
    check_dns
    check_ssl
    check_cloudflare_tunnel
    echo ""
    
    print_header "Application Health"
    check_application_health
    check_ai_models
    echo ""
    
    print_header "Security Status"
    check_security
    echo ""
    
    print_header "Log Files"
    check_logs
    echo ""
}

# Function to show help
show_help() {
    echo "JupiterEmerge SIEM Maintenance Script"
    echo "===================================="
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  status      Show system status"
    echo "  maintenance Perform system maintenance"
    echo "  backup      Create system backup"
    echo "  restart     Restart all services"
    echo "  logs        Show recent logs"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status      # Show current system status"
    echo "  $0 maintenance # Perform maintenance tasks"
    echo "  $0 backup      # Create system backup"
    echo "  $0 restart     # Restart all services"
    echo ""
}

# Function to show recent logs
show_logs() {
    print_header "Recent System Logs"
    echo "====================="
    
    echo "Jupiter Backend Logs (last 20 lines):"
    sudo journalctl -u jupiter-backend --since "1 hour ago" --no-pager | tail -20
    echo ""
    
    echo "Nginx Logs (last 20 lines):"
    sudo journalctl -u nginx --since "1 hour ago" --no-pager | tail -20
    echo ""
    
    echo "Cloudflare Tunnel Logs (last 20 lines):"
    sudo journalctl -u cloudflared --since "1 hour ago" --no-pager | tail -20
    echo ""
    
    echo "System Logs (last 20 lines):"
    sudo journalctl --since "1 hour ago" --no-pager | tail -20
    echo ""
}

# Main script logic
case "${1:-status}" in
    "status")
        show_status
        ;;
    "maintenance")
        perform_maintenance
        ;;
    "backup")
        backup_system
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

print_success "Maintenance script completed"
