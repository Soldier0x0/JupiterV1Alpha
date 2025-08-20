# Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### 1. MongoDB Connection Errors
```
Error: MongoConnectionError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
- Check if MongoDB is running: `sudo systemctl status mongodb`
- Verify MongoDB connection string in `.env`
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongodb.log`

#### 2. API Authorization Errors
```
Error: JWT token invalid or expired
```
**Solutions:**
- Check JWT_SECRET in backend `.env`
- Verify token expiration time
- Clear browser cache and login again

#### 3. OTP Issues
```
Error: OTP verification failed
```
**Solutions:**
- Check email configuration
- Verify OTP timeouts
- Check server time synchronization

### Frontend Issues

#### 1. Blank Screen After Login
**Solutions:**
- Check browser console for errors
- Verify API endpoint configuration
- Check CORS settings in backend

#### 2. Widget Loading Issues
**Solutions:**
- Check network tab for failed requests
- Verify widget permissions
- Clear browser cache

#### 3. Local Development Server Issues
**Solutions:**
```bash
# Clear node modules
rm -rf node_modules
npm install

# Clear vite cache
rm -rf node_modules/.vite
```

### Deployment Issues

#### 1. Nginx Configuration
**Check configuration:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Check logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

#### 2. SSL Certificate Issues
**Solutions:**
```bash
# Renew certificates
sudo certbot renew --dry-run
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### 3. Permission Issues
```bash
# Fix ownership
sudo chown -R www-data:www-data /opt/jupiter
sudo chmod -R 755 /opt/jupiter

# Fix log permissions
sudo chown -R www-data:www-data /var/log/jupiter
```

### Performance Issues

#### 1. Slow API Response
**Check:**
- MongoDB indexes
- API endpoint logging
- Server resources

```bash
# Check system resources
top
htop
df -h
```

#### 2. High Memory Usage
```bash
# Check memory usage
free -m
ps aux | grep python
ps aux | grep node
```

### Monitoring and Logging

#### 1. Check Application Logs
```bash
# Backend logs
tail -f /var/log/jupiter/backend.log

# Frontend logs
tail -f /var/log/jupiter/frontend.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

#### 2. Monitor System Health
```bash
# Check system metrics
curl http://localhost:8001/api/health
curl http://localhost:8001/api/metrics
```

### Recovery Procedures

#### 1. Database Backup and Restore
```bash
# Backup
mongodump --out /var/backups/jupiter/$(date +%Y%m%d)

# Restore
mongorestore /var/backups/jupiter/20250820
```

#### 2. Application Rollback
```bash
# Git rollback
git reset --hard <previous-commit>
git clean -fd

# Rebuild and restart
cd frontend && npm install && npm run build
sudo systemctl restart jupiter
```
