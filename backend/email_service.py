"""
Jupiter SIEM Email Service
Handles all email communications using admin account
"""

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, List, Optional
import logging
from datetime import datetime
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

class EmailService:
    """Email service for Jupiter SIEM using admin account"""
    
    def __init__(self):
        self.smtp_config = {
            'host': os.getenv('EMAIL_HOST', 'smtp.office365.com'),
            'port': int(os.getenv('EMAIL_PORT', 587)),
            'username': os.getenv('EMAIL_USER', 'admin@projectjupiter.in'),
            'password': os.getenv('EMAIL_PASSWORD'),
            'use_tls': os.getenv('EMAIL_USE_TLS', 'true').lower() == 'true'
        }
        
        self.from_config = {
            'name': os.getenv('EMAIL_FROM_NAME', 'Jupiter SIEM'),
            'address': os.getenv('EMAIL_FROM_ADDRESS', 'admin@projectjupiter.in')
        }
        
        self.recipients = {
            'admin': os.getenv('ADMIN_EMAIL'),
            'security_alerts': os.getenv('SECURITY_ALERT_EMAIL'),
            'system_notifications': os.getenv('SYSTEM_NOTIFICATION_EMAIL')
        }
        
        # Validate configuration
        self._validate_config()
    
    def _validate_config(self):
        """Validate email configuration"""
        required_fields = ['EMAIL_PASSWORD', 'ADMIN_EMAIL']
        missing_fields = [field for field in required_fields if not os.getenv(field)]
        
        if missing_fields:
            logger.warning(f"Missing email configuration: {missing_fields}")
            logger.warning("Email service will be disabled")
            self.enabled = False
        else:
            self.enabled = True
    
    def _create_message(self, to_email: str, subject: str, body: str, 
                       html_body: Optional[str] = None, 
                       attachments: Optional[List[str]] = None) -> MIMEMultipart:
        """Create email message"""
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{self.from_config['name']} <{self.from_config['address']}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add text body
        text_part = MIMEText(body, 'plain')
        msg.attach(text_part)
        
        # Add HTML body if provided
        if html_body:
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
        
        # Add attachments if provided
        if attachments:
            for file_path in attachments:
                if os.path.isfile(file_path):
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(file_path)}'
                        )
                        msg.attach(part)
        
        return msg
    
    def _send_email(self, to_email: str, subject: str, body: str, 
                   html_body: Optional[str] = None, 
                   attachments: Optional[List[str]] = None) -> bool:
        """Send email using SMTP"""
        if not self.enabled:
            logger.warning("Email service is disabled - skipping email send")
            return False
        
        try:
            # Create message
            msg = self._create_message(to_email, subject, body, html_body, attachments)
            
            # Create SMTP connection
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                if self.smtp_config['use_tls']:
                    server.starttls(context=context)
                
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_security_alert(self, alert_data: Dict) -> bool:
        """Send security alert to admin"""
        if not self.recipients['security_alerts']:
            logger.warning("No security alert email configured")
            return False
        
        subject = f"🚨 Jupiter SIEM Security Alert: {alert_data.get('title', 'Unknown Threat')}"
        
        body = f"""
Jupiter SIEM Security Alert

Alert Details:
- Title: {alert_data.get('title', 'Unknown')}
- Severity: {alert_data.get('severity', 'Unknown')}
- Source: {alert_data.get('source', 'Unknown')}
- Timestamp: {alert_data.get('timestamp', datetime.now().isoformat())}
- Description: {alert_data.get('description', 'No description available')}

Threat Details:
- Attack Type: {alert_data.get('attack_type', 'Unknown')}
- Source IP: {alert_data.get('source_ip', 'Unknown')}
- Target: {alert_data.get('target', 'Unknown')}
- Framework: {alert_data.get('framework', 'Unknown')}

Recommended Actions:
1. Review the alert in Jupiter SIEM dashboard
2. Investigate the source and target systems
3. Apply appropriate security measures
4. Update security policies if needed

This is an automated message from Jupiter SIEM.
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
                    🚨 Jupiter SIEM Security Alert
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">Alert Details</h3>
                    <p><strong>Title:</strong> {alert_data.get('title', 'Unknown')}</p>
                    <p><strong>Severity:</strong> <span style="color: #dc3545;">{alert_data.get('severity', 'Unknown')}</span></p>
                    <p><strong>Source:</strong> {alert_data.get('source', 'Unknown')}</p>
                    <p><strong>Timestamp:</strong> {alert_data.get('timestamp', datetime.now().isoformat())}</p>
                    <p><strong>Description:</strong> {alert_data.get('description', 'No description available')}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">Threat Details</h3>
                    <p><strong>Attack Type:</strong> {alert_data.get('attack_type', 'Unknown')}</p>
                    <p><strong>Source IP:</strong> {alert_data.get('source_ip', 'Unknown')}</p>
                    <p><strong>Target:</strong> {alert_data.get('target', 'Unknown')}</p>
                    <p><strong>Framework:</strong> {alert_data.get('framework', 'Unknown')}</p>
                </div>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #0c5460; margin-top: 0;">Recommended Actions</h3>
                    <ol>
                        <li>Review the alert in Jupiter SIEM dashboard</li>
                        <li>Investigate the source and target systems</li>
                        <li>Apply appropriate security measures</li>
                        <li>Update security policies if needed</li>
                    </ol>
                </div>
                
                <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
                    This is an automated message from Jupiter SIEM.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self._send_email(
            self.recipients['security_alerts'],
            subject,
            body,
            html_body
        )
    
    async def send_user_welcome(self, user_email: str, user_data: Dict) -> bool:
        """Send welcome email to new user"""
        subject = f"Welcome to Jupiter SIEM - {user_data.get('username', 'User')}"
        
        body = f"""
Welcome to Jupiter SIEM!

Hello {user_data.get('username', 'User')},

Your account has been created successfully. Here are your login details:

Account Information:
- Username: {user_data.get('username', 'N/A')}
- Email: {user_email}
- Role: {user_data.get('role', 'User')}
- Tenant: {user_data.get('tenant', 'Default')}

Login Instructions:
1. Visit: https://siem.projectjupiter.in
2. Use your username and the temporary password provided
3. Change your password on first login
4. Enable 2FA for enhanced security

Getting Started:
- Explore the dashboard to understand the interface
- Review security alerts and threat intelligence
- Check out the query builder for log analysis
- Read the documentation for advanced features

Security Reminders:
- Never share your login credentials
- Use strong, unique passwords
- Enable two-factor authentication
- Report any suspicious activity immediately

If you have any questions or need assistance, please contact the administrator.

Best regards,
Jupiter SIEM Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    Welcome to Jupiter SIEM!
                </h2>
                
                <p>Hello <strong>{user_data.get('username', 'User')}</strong>,</p>
                
                <p>Your account has been created successfully. Here are your login details:</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">Account Information</h3>
                    <p><strong>Username:</strong> {user_data.get('username', 'N/A')}</p>
                    <p><strong>Email:</strong> {user_email}</p>
                    <p><strong>Role:</strong> {user_data.get('role', 'User')}</p>
                    <p><strong>Tenant:</strong> {user_data.get('tenant', 'Default')}</p>
                </div>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #0c5460; margin-top: 0;">Login Instructions</h3>
                    <ol>
                        <li>Visit: <a href="https://siem.projectjupiter.in">https://siem.projectjupiter.in</a></li>
                        <li>Use your username and the temporary password provided</li>
                        <li>Change your password on first login</li>
                        <li>Enable 2FA for enhanced security</li>
                    </ol>
                </div>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #155724; margin-top: 0;">Getting Started</h3>
                    <ul>
                        <li>Explore the dashboard to understand the interface</li>
                        <li>Review security alerts and threat intelligence</li>
                        <li>Check out the query builder for log analysis</li>
                        <li>Read the documentation for advanced features</li>
                    </ul>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">Security Reminders</h3>
                    <ul>
                        <li>Never share your login credentials</li>
                        <li>Use strong, unique passwords</li>
                        <li>Enable two-factor authentication</li>
                        <li>Report any suspicious activity immediately</li>
                    </ul>
                </div>
                
                <p>If you have any questions or need assistance, please contact the administrator.</p>
                
                <p>Best regards,<br>Jupiter SIEM Team</p>
            </div>
        </body>
        </html>
        """
        
        return self._send_email(user_email, subject, body, html_body)
    
    async def send_system_notification(self, notification_data: Dict) -> bool:
        """Send system notification to admin"""
        if not self.recipients['system_notifications']:
            logger.warning("No system notification email configured")
            return False
        
        subject = f"🔧 Jupiter SIEM System Notification: {notification_data.get('type', 'System Update')}"
        
        body = f"""
Jupiter SIEM System Notification

Notification Details:
- Type: {notification_data.get('type', 'System Update')}
- Severity: {notification_data.get('severity', 'Info')}
- Timestamp: {notification_data.get('timestamp', datetime.now().isoformat())}
- Message: {notification_data.get('message', 'No message available')}

System Information:
- Service: {notification_data.get('service', 'Unknown')}
- Status: {notification_data.get('status', 'Unknown')}
- Details: {notification_data.get('details', 'No additional details')}

This is an automated message from Jupiter SIEM.
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #17a2b8; border-bottom: 2px solid #17a2b8; padding-bottom: 10px;">
                    🔧 Jupiter SIEM System Notification
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">Notification Details</h3>
                    <p><strong>Type:</strong> {notification_data.get('type', 'System Update')}</p>
                    <p><strong>Severity:</strong> {notification_data.get('severity', 'Info')}</p>
                    <p><strong>Timestamp:</strong> {notification_data.get('timestamp', datetime.now().isoformat())}</p>
                    <p><strong>Message:</strong> {notification_data.get('message', 'No message available')}</p>
                </div>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #0c5460; margin-top: 0;">System Information</h3>
                    <p><strong>Service:</strong> {notification_data.get('service', 'Unknown')}</p>
                    <p><strong>Status:</strong> {notification_data.get('status', 'Unknown')}</p>
                    <p><strong>Details:</strong> {notification_data.get('details', 'No additional details')}</p>
                </div>
                
                <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
                    This is an automated message from Jupiter SIEM.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self._send_email(
            self.recipients['system_notifications'],
            subject,
            body,
            html_body
        )
    
    async def send_backup_notification(self, backup_data: Dict) -> bool:
        """Send backup status notification"""
        if not self.recipients['system_notifications']:
            return False
        
        subject = f"💾 Jupiter SIEM Backup Status: {backup_data.get('status', 'Unknown')}"
        
        body = f"""
Jupiter SIEM Backup Notification

Backup Details:
- Status: {backup_data.get('status', 'Unknown')}
- Type: {backup_data.get('type', 'Unknown')}
- Timestamp: {backup_data.get('timestamp', datetime.now().isoformat())}
- Size: {backup_data.get('size', 'Unknown')}
- Location: {backup_data.get('location', 'Unknown')}

Backup Information:
- Duration: {backup_data.get('duration', 'Unknown')}
- Files: {backup_data.get('file_count', 'Unknown')}
- Success: {backup_data.get('success', 'Unknown')}
- Error: {backup_data.get('error', 'None')}

This is an automated message from Jupiter SIEM.
        """
        
        return self._send_email(
            self.recipients['system_notifications'],
            subject,
            body
        )
    
    async def send_password_reset(self, user_email: str, reset_token: str) -> bool:
        """Send password reset email"""
        subject = "🔐 Jupiter SIEM Password Reset Request"
        
        reset_url = f"https://siem.projectjupiter.in/reset-password?token={reset_token}"
        
        body = f"""
Jupiter SIEM Password Reset

Hello,

You have requested a password reset for your Jupiter SIEM account.

To reset your password, please click the link below:
{reset_url}

This link will expire in 1 hour for security reasons.

If you did not request this password reset, please ignore this email and contact the administrator immediately.

Security Reminders:
- Never share your login credentials
- Use strong, unique passwords
- Enable two-factor authentication
- Report any suspicious activity immediately

Best regards,
Jupiter SIEM Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
                    🔐 Jupiter SIEM Password Reset
                </h2>
                
                <p>Hello,</p>
                
                <p>You have requested a password reset for your Jupiter SIEM account.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <a href="{reset_url}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p>This link will expire in 1 hour for security reasons.</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0;">
                        <strong>Important:</strong> If you did not request this password reset, please ignore this email and contact the administrator immediately.
                    </p>
                </div>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #0c5460; margin-top: 0;">Security Reminders</h3>
                    <ul>
                        <li>Never share your login credentials</li>
                        <li>Use strong, unique passwords</li>
                        <li>Enable two-factor authentication</li>
                        <li>Report any suspicious activity immediately</li>
                    </ul>
                </div>
                
                <p>Best regards,<br>Jupiter SIEM Team</p>
            </div>
        </body>
        </html>
        """
        
        return self._send_email(user_email, subject, body, html_body)

# Global email service instance
email_service = EmailService()

# Decorator for async email functions
def email_async(func):
    """Decorator to run email functions asynchronously"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)
    return wrapper

# Convenience functions
async def send_security_alert(alert_data: Dict) -> bool:
    """Send security alert email"""
    return await email_service.send_security_alert(alert_data)

async def send_user_welcome(user_email: str, user_data: Dict) -> bool:
    """Send user welcome email"""
    return await email_service.send_user_welcome(user_email, user_data)

async def send_system_notification(notification_data: Dict) -> bool:
    """Send system notification email"""
    return await email_service.send_system_notification(notification_data)

async def send_backup_notification(backup_data: Dict) -> bool:
    """Send backup notification email"""
    return await email_service.send_backup_notification(backup_data)

async def send_password_reset(user_email: str, reset_token: str) -> bool:
    """Send password reset email"""
    return await email_service.send_password_reset(user_email, reset_token)
