# 📧 Jupiter SIEM Email Configuration Guide

## Overview

This guide explains how to configure email notifications for Jupiter SIEM using your Microsoft 365 Business Basic subscription. The system is designed to use your admin account for all email communications, ensuring zero additional costs while maintaining professional appearance.

## 🎯 Email Strategy

### **Single Admin Account Approach**
- **All emails sent from**: `admin@projectjupiter.in`
- **All notifications go to**: Your personal email address
- **Zero additional costs**: No new user licenses required
- **Professional appearance**: Emails from your domain

### **Email Flow**
```
Jupiter SIEM → admin@projectjupiter.in → Your Personal Email
```

## 🔧 Configuration Steps

### **Step 1: Microsoft 365 Business Basic Setup**

#### **1.1 Create Admin Email Account**
```bash
# In Microsoft 365 Admin Center
1. Go to Users → Active users
2. Create new user: admin@projectjupiter.in
3. Assign Microsoft 365 Business Basic license
4. Set strong password
5. Enable SMTP authentication
```

#### **1.2 Configure SMTP Authentication**
```bash
# In Microsoft 365 Admin Center
1. Go to Settings → Mail
2. Enable "SMTP AUTH" for admin@projectjupiter.in
3. Configure "Modern Authentication"
4. Set up "App Passwords" if needed
```

### **Step 2: Environment Configuration**

#### **2.1 Update Root Environment File**
```bash
# Copy template to .env
cp jupiter-siem.env .env

# Edit .env file
nano .env
```

#### **2.2 Email Configuration Variables**
```bash
# Email Service Configuration
EMAIL_ENABLED=true
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=admin@projectjupiter.in
EMAIL_PASSWORD=your_admin_email_password
EMAIL_USE_TLS=true
EMAIL_FROM_NAME=Jupiter SIEM
EMAIL_FROM_ADDRESS=admin@projectjupiter.in

# Email Recipients (All go to your personal email)
ADMIN_EMAIL=your_personal_email@gmail.com
SECURITY_ALERT_EMAIL=your_personal_email@gmail.com
SYSTEM_NOTIFICATION_EMAIL=your_personal_email@gmail.com
```

#### **2.3 Backend Environment File**
```bash
# Copy template to backend/.env
cp backend/backend.env backend/.env

# Edit backend/.env file
nano backend/.env
```

### **Step 3: Email Service Integration**

#### **3.1 Import Email Service**
```python
# In your FastAPI routes
from backend.email_service import (
    send_security_alert,
    send_user_welcome,
    send_system_notification,
    send_backup_notification,
    send_password_reset
)
```

#### **3.2 Example Usage**
```python
# Send security alert
await send_security_alert({
    'title': 'Suspicious Login Attempt',
    'severity': 'High',
    'source': '192.168.1.100',
    'description': 'Multiple failed login attempts detected',
    'attack_type': 'Brute Force',
    'source_ip': '192.168.1.100',
    'target': 'admin@projectjupiter.in',
    'framework': 'MITRE ATT&CK'
})

# Send user welcome email
await send_user_welcome('user@example.com', {
    'username': 'newuser',
    'role': 'Analyst',
    'tenant': 'MainTenant'
})

# Send system notification
await send_system_notification({
    'type': 'Backup Completed',
    'severity': 'Info',
    'message': 'Daily backup completed successfully',
    'service': 'Backup Service',
    'status': 'Success'
})
```

## 📧 Email Types

### **1. Security Alerts**
- **Triggered by**: Threat detection, failed logins, suspicious activity
- **Sent to**: Your personal email
- **Content**: Alert details, threat information, recommended actions
- **Frequency**: Real-time

### **2. User Welcome Emails**
- **Triggered by**: New user creation
- **Sent to**: User's personal email
- **Content**: Login credentials, welcome message, getting started guide
- **Frequency**: On user creation

### **3. System Notifications**
- **Triggered by**: Backup status, system health, errors
- **Sent to**: Your personal email
- **Content**: System status, service information, error details
- **Frequency**: As needed

### **4. Password Reset Emails**
- **Triggered by**: Password reset requests
- **Sent to**: User's personal email
- **Content**: Reset link, security reminders
- **Frequency**: On request

### **5. Backup Notifications**
- **Triggered by**: Backup completion/failure
- **Sent to**: Your personal email
- **Content**: Backup status, file count, duration
- **Frequency**: Daily

## 🔒 Security Features

### **Email Security**
- **TLS Encryption**: All emails sent over encrypted connection
- **Authentication**: SMTP authentication required
- **Rate Limiting**: Prevents email spam
- **Input Validation**: Sanitizes email content

### **Content Security**
- **HTML Sanitization**: Prevents XSS attacks
- **Attachment Scanning**: Validates file attachments
- **Link Validation**: Checks reset URLs
- **Content Filtering**: Removes malicious content

## 🚀 Testing Email Configuration

### **Test Email Service**
```python
# Create test script
cat > test_email.py << 'EOF'
import asyncio
from backend.email_service import send_system_notification

async def test_email():
    result = await send_system_notification({
        'type': 'Test Email',
        'severity': 'Info',
        'message': 'This is a test email from Jupiter SIEM',
        'service': 'Email Service',
        'status': 'Test'
    })
    print(f"Email sent: {result}")

if __name__ == "__main__":
    asyncio.run(test_email())
EOF

# Run test
python test_email.py
```

### **Verify Email Delivery**
1. Check your personal email inbox
2. Verify email appears from `admin@projectjupiter.in`
3. Check spam folder if not received
4. Test different email types

## 📊 Email Monitoring

### **Email Logs**
```bash
# Check email service logs
tail -f /app/logs/backend.log | grep "Email"

# Check email delivery status
grep "Email sent successfully" /app/logs/backend.log
```

### **Email Metrics**
- **Delivery Rate**: Percentage of successful email sends
- **Response Time**: Time to send email
- **Error Rate**: Percentage of failed sends
- **Volume**: Number of emails sent per day

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Authentication Failed**
```bash
# Check credentials
echo $EMAIL_USER
echo $EMAIL_PASSWORD

# Verify SMTP settings
telnet smtp.office365.com 587
```

#### **2. Emails Not Received**
```bash
# Check spam folder
# Verify recipient email address
# Check email service logs
tail -f /app/logs/backend.log | grep "Failed to send email"
```

#### **3. SMTP Connection Issues**
```bash
# Test SMTP connection
python -c "
import smtplib
server = smtplib.SMTP('smtp.office365.com', 587)
server.starttls()
server.login('admin@projectjupiter.in', 'your_password')
print('SMTP connection successful')
server.quit()
"
```

### **Debug Mode**
```bash
# Enable email debug logging
export EMAIL_DEBUG=true
export LOG_LEVEL=DEBUG

# Restart backend service
docker-compose restart backend
```

## 📈 Email Performance

### **Optimization Settings**
```bash
# Email batch processing
EMAIL_BATCH_SIZE=10
EMAIL_BATCH_DELAY=5

# Connection pooling
EMAIL_MAX_CONNECTIONS=5
EMAIL_CONNECTION_TIMEOUT=30

# Retry configuration
EMAIL_MAX_RETRIES=3
EMAIL_RETRY_DELAY=5
```

### **Monitoring**
```bash
# Email queue status
curl http://localhost:8001/api/v1/email/status

# Email metrics
curl http://localhost:8001/api/v1/metrics/email
```

## 🎯 Best Practices

### **Email Content**
- **Clear Subject Lines**: Descriptive and actionable
- **Professional Tone**: Consistent with SIEM branding
- **Actionable Content**: Include next steps
- **Security Reminders**: Always include security tips

### **Email Management**
- **Regular Testing**: Test email functionality weekly
- **Monitor Delivery**: Check delivery rates
- **Update Templates**: Keep email templates current
- **Backup Configuration**: Document email settings

### **Security**
- **Strong Passwords**: Use complex email passwords
- **Regular Rotation**: Change email passwords quarterly
- **Monitor Access**: Check email account access logs
- **Secure Storage**: Encrypt email credentials

## 📋 Email Templates

### **Security Alert Template**
```html
<h2>🚨 Jupiter SIEM Security Alert</h2>
<div class="alert-details">
    <h3>Alert Details</h3>
    <p><strong>Title:</strong> {title}</p>
    <p><strong>Severity:</strong> {severity}</p>
    <p><strong>Source:</strong> {source}</p>
    <p><strong>Timestamp:</strong> {timestamp}</p>
</div>
<div class="threat-details">
    <h3>Threat Details</h3>
    <p><strong>Attack Type:</strong> {attack_type}</p>
    <p><strong>Source IP:</strong> {source_ip}</p>
    <p><strong>Target:</strong> {target}</p>
</div>
<div class="recommended-actions">
    <h3>Recommended Actions</h3>
    <ol>
        <li>Review the alert in Jupiter SIEM dashboard</li>
        <li>Investigate the source and target systems</li>
        <li>Apply appropriate security measures</li>
    </ol>
</div>
```

### **User Welcome Template**
```html
<h2>Welcome to Jupiter SIEM!</h2>
<p>Hello <strong>{username}</strong>,</p>
<p>Your account has been created successfully.</p>
<div class="account-info">
    <h3>Account Information</h3>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Role:</strong> {role}</p>
</div>
<div class="login-instructions">
    <h3>Login Instructions</h3>
    <ol>
        <li>Visit: <a href="https://siem.projectjupiter.in">https://siem.projectjupiter.in</a></li>
        <li>Use your username and temporary password</li>
        <li>Change your password on first login</li>
    </ol>
</div>
```

## 🎉 Conclusion

Your Jupiter SIEM email configuration is now complete! The system will:

- ✅ Send all emails from `admin@projectjupiter.in`
- ✅ Deliver notifications to your personal email
- ✅ Maintain professional appearance
- ✅ Cost zero additional money
- ✅ Provide comprehensive email functionality

**Next Steps:**
1. Test the email configuration
2. Monitor email delivery
3. Customize email templates as needed
4. Set up email monitoring and alerts

**Support:**
If you encounter any issues, check the troubleshooting section or review the email service logs for detailed error information.
