# Cloudflare Tunnel Setup for JupiterEmerge SIEM

## 🎯 Architecture Overview

```
Internet → Cloudflare → Cloudflare Tunnel → Debian 13 Laptop → JupiterEmerge SIEM
```

**Your Setup:**
- **Main Domain**: `projectjupiter.in` (Portfolio showcase)
- **SIEM Subdomain**: `siem.projectjupiter.in` (Security tool)
- **Local Access**: `localhost:8080` (Development)
- **Public Access**: `https://siem.projectjupiter.in` (Production)

## 🚀 Step-by-Step Setup

### 1. Install Cloudflare Tunnel

```bash
# Download and install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

### 2. Authenticate with Cloudflare

```bash
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# This will:
# - Open your browser to Cloudflare
# - Ask for permission to manage tunnels
# - Download a certificate to ~/.cloudflared/cert.pem
```

### 3. Create the Tunnel

```bash
# Create a new tunnel
cloudflared tunnel create jupiter-siem

# This will output something like:
# Your tunnel 'jupiter-siem' has been created!
# Tunnel ID: 12345678-1234-1234-1234-123456789abc
# Save this tunnel ID for later use
```

### 4. Configure the Tunnel

```bash
# Create tunnel configuration
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: jupiter-siem
credentials-file: /etc/cloudflared/jupiter-siem.json

ingress:
  - hostname: siem.projectjupiter.in
    service: http://localhost:8080
  - service: http_status:404
EOF

# Copy the tunnel credentials
sudo cp ~/.cloudflared/12345678-1234-1234-1234-123456789abc.json /etc/cloudflared/jupiter-siem.json
```

### 5. Configure DNS

In your Cloudflare dashboard:

1. Go to **DNS** → **Records**
2. Add a new **CNAME** record:
   - **Name**: `siem`
   - **Target**: `12345678-1234-1234-1234-123456789abc.cfargotunnel.com`
   - **Proxy status**: 🟠 Proxied (orange cloud)
   - **TTL**: Auto

### 6. Create Systemd Service

```bash
# Create cloudflared service
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

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### 7. Verify Tunnel Status

```bash
# Check tunnel status
sudo systemctl status cloudflared

# Check tunnel logs
sudo journalctl -u cloudflared -f

# Test tunnel connectivity
cloudflared tunnel info jupiter-siem
```

## 🔧 Advanced Configuration

### Multiple Subdomains

If you want to add more subdomains:

```yaml
# /etc/cloudflared/config.yml
tunnel: jupiter-siem
credentials-file: /etc/cloudflared/jupiter-siem.json

ingress:
  - hostname: siem.projectjupiter.in
    service: http://localhost:8080
  - hostname: api.siem.projectjupiter.in
    service: http://localhost:8001
  - hostname: admin.siem.projectjupiter.in
    service: http://localhost:8081
  - service: http_status:404
```

### Load Balancing

For high availability:

```yaml
ingress:
  - hostname: siem.projectjupiter.in
    service: http://localhost:8080
    originRequest:
      httpHostHeader: siem.projectjupiter.in
      noTLSVerify: true
  - service: http_status:404
```

### Custom Headers

```yaml
ingress:
  - hostname: siem.projectjupiter.in
    service: http://localhost:8080
    originRequest:
      httpHostHeader: siem.projectjupiter.in
      noTLSVerify: true
      # Custom headers
      httpHeaders:
        X-Forwarded-Proto: https
        X-Real-IP: $remote_addr
  - service: http_status:404
```

## 🛡️ Security Configuration

### 1. Access Policies

In Cloudflare dashboard:

1. Go to **Zero Trust** → **Access** → **Applications**
2. Add **Self-hosted** application:
   - **Application name**: JupiterEmerge SIEM
   - **Subdomain**: `siem.projectjupiter.in`
   - **Domain**: `projectjupiter.in`

3. Configure **Access Policy**:
   - **Action**: Allow
   - **Rules**: 
     - Email: `your-email@domain.com`
     - Or IP: `your-office-ip/32`

### 2. WAF Rules

```bash
# Create WAF rule for SIEM protection
# In Cloudflare dashboard → Security → WAF → Custom rules

# Rule: Block suspicious requests
(http.request.uri contains "admin" and http.request.method eq "POST") or
(http.request.uri contains "api" and http.request.method eq "GET" and http.request.uri.query contains "debug") or
(http.user_agent contains "sqlmap") or
(http.user_agent contains "nikto")
```

### 3. Rate Limiting

```bash
# In Cloudflare dashboard → Security → WAF → Rate limiting rules

# Rule: Limit API requests
- When: http.request.uri.path starts_with "/api/"
- Rate: 100 requests per 10 minutes
- Action: Block
```

## 📊 Monitoring & Logs

### 1. Tunnel Logs

```bash
# View real-time logs
sudo journalctl -u cloudflared -f

# View recent logs
sudo journalctl -u cloudflared --since "1 hour ago"

# Check tunnel health
cloudflared tunnel healthcheck jupiter-siem
```

### 2. Cloudflare Analytics

In Cloudflare dashboard:
- **Analytics** → **Web Traffic**: View requests, bandwidth
- **Security** → **Events**: View security events
- **Speed** → **Core Web Vitals**: Performance metrics

### 3. Custom Monitoring

```bash
# Create monitoring script
tee /home/$USER/monitor-tunnel.sh > /dev/null <<EOF
#!/bin/bash
echo "🔍 Cloudflare Tunnel Status"
echo "=========================="

# Check tunnel service
if systemctl is-active --quiet cloudflared; then
    echo "✅ Cloudflare Tunnel: Running"
else
    echo "❌ Cloudflare Tunnel: Not running"
fi

# Check tunnel connectivity
if cloudflared tunnel info jupiter-siem > /dev/null 2>&1; then
    echo "✅ Tunnel Connectivity: OK"
else
    echo "❌ Tunnel Connectivity: Failed"
fi

# Check DNS resolution
if nslookup siem.projectjupiter.in > /dev/null 2>&1; then
    echo "✅ DNS Resolution: OK"
else
    echo "❌ DNS Resolution: Failed"
fi

# Check local service
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Local Service: OK"
else
    echo "❌ Local Service: Failed"
fi
EOF

chmod +x /home/$USER/monitor-tunnel.sh
```

## 🔄 Backup & Recovery

### 1. Backup Tunnel Configuration

```bash
# Backup tunnel config
sudo tar -czf cloudflared-backup-$(date +%Y%m%d).tar.gz /etc/cloudflared/

# Backup certificates
sudo cp -r ~/.cloudflared/ /home/$USER/cloudflared-backup/
```

### 2. Restore Tunnel

```bash
# Restore configuration
sudo tar -xzf cloudflared-backup-YYYYMMDD.tar.gz -C /

# Restore certificates
sudo cp -r /home/$USER/cloudflared-backup/ ~/.cloudflared/

# Restart service
sudo systemctl restart cloudflared
```

## 🚨 Troubleshooting

### Common Issues

1. **Tunnel not connecting**:
   ```bash
   # Check tunnel status
   cloudflared tunnel info jupiter-siem
   
   # Check logs
   sudo journalctl -u cloudflared -f
   ```

2. **DNS not resolving**:
   ```bash
   # Check DNS propagation
   nslookup siem.projectjupiter.in
   dig siem.projectjupiter.in
   ```

3. **Local service not accessible**:
   ```bash
   # Check if service is running
   curl http://localhost:8080/health
   
   # Check firewall
   sudo ufw status
   ```

4. **SSL certificate issues**:
   ```bash
   # Check certificate
   openssl s_client -connect siem.projectjupiter.in:443 -servername siem.projectjupiter.in
   ```

### Performance Optimization

1. **Enable HTTP/2**:
   ```yaml
   # In config.yml
   originRequest:
     httpHostHeader: siem.projectjupiter.in
     http2Origin: true
   ```

2. **Compression**:
   ```yaml
   originRequest:
     httpHostHeader: siem.projectjupiter.in
     compressionQuality: 6
   ```

3. **Keep-alive**:
   ```yaml
   originRequest:
     httpHostHeader: siem.projectjupiter.in
     keepAliveConnections: 10
     keepAliveTimeout: 30s
   ```

## 📋 Final Checklist

- [ ] Cloudflare tunnel installed and authenticated
- [ ] Tunnel created with unique ID
- [ ] DNS CNAME record configured
- [ ] Systemd service created and enabled
- [ ] Tunnel running and accessible
- [ ] SSL certificate working
- [ ] Access policies configured
- [ ] WAF rules enabled
- [ ] Monitoring scripts created
- [ ] Backup procedures in place

## 🎯 Access URLs

- **Local Development**: `http://localhost:8080`
- **Public Access**: `https://siem.projectjupiter.in`
- **API Endpoint**: `https://siem.projectjupiter.in/api/`
- **Admin Panel**: `https://siem.projectjupiter.in/admin/`

Your JupiterEmerge SIEM is now securely accessible via Cloudflare tunnel while keeping your main portfolio domain separate!
