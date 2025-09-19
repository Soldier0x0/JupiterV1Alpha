# Deployment Guide

## Production Deployment

### System Requirements
- 4 CPU cores
- 8GB RAM
- 50GB SSD
- Ubuntu 22.04 LTS or Debian 12

### 1. Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip nodejs npm nginx certbot python3-certbot-nginx mongodb

# Create project directory
sudo mkdir /opt/jupiter
sudo chown $USER:$USER /opt/jupiter
```

### 2. MongoDB Setup
```bash
# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongosh
use jupiter_siem
db.createUser({
  user: "jupiter_admin",
  pwd: "secure_password",
  roles: ["dbOwner"]
})
```

### 3. Application Setup
```bash
# Clone repository
cd /opt/jupiter
git clone https://github.com/Soldier0x0/JupiterEmerge.git .

# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Frontend setup
cd frontend
npm install
npm run build
```

### 4. Configuration

#### Environment Variables
```bash
# Backend (.env)
MONGO_URL=mongodb://jupiter_admin:secure_password@localhost:27017/jupiter_siem
JWT_SECRET=your-secure-secret
NODE_ENV=production
DOMAIN=projectjupiter.in
```

#### Nginx Configuration
```nginx
server {
    server_name projectjupiter.in;

    # Frontend
    location / {
        root /opt/jupiter/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SSL configuration
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/projectjupiter.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/projectjupiter.in/privkey.pem;
}
```

### 5. SSL Setup
```bash
sudo certbot --nginx -d projectjupiter.in
```

### 6. Process Management
```bash
# Create service file
sudo nano /etc/systemd/system/jupiter.service

[Unit]
Description=Jupiter SIEM
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/jupiter
Environment="PATH=/opt/jupiter/venv/bin"
ExecStart=/opt/jupiter/venv/bin/uvicorn backend.server:app --host 127.0.0.1 --port 8001

[Install]
WantedBy=multi-user.target

# Start service
sudo systemctl start jupiter
sudo systemctl enable jupiter
```

### 7. Monitoring Setup
```bash
# Install monitoring tools
sudo apt install -y prometheus node-exporter

# Configure logging
sudo mkdir -p /var/log/jupiter
sudo chown www-data:www-data /var/log/jupiter
```

## Backup Configuration
```bash
# Create backup script
cat > /opt/jupiter/backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/var/backups/jupiter"
DATE=\$(date +%Y%m%d)
mongodump --out \$BACKUP_DIR/db_\$DATE
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz /opt/jupiter
find \$BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOL

# Add to crontab
0 0 * * * /opt/jupiter/backup.sh
```
