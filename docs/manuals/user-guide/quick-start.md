# 🚀 Quick Start Guide

## 📋 Table of Contents

1. [Login and First Steps](#login-and-first-steps)
2. [Dashboard Overview](#dashboard-overview)
3. [Your First Query](#your-first-query)
4. [Understanding Alerts](#understanding-alerts)
5. [Basic Navigation](#basic-navigation)
6. [Essential Settings](#essential-settings)
7. [Getting Help](#getting-help)

## 🔐 Login and First Steps

### Accessing Jupiter SIEM

1. **Open your web browser** and navigate to your Jupiter SIEM URL
   - Example: `https://siem.projectjupiter.in`
   - Or your local deployment: `http://localhost:3000`

2. **Login Screen**
   ```
   Username: admin@projectjupiter.in
   Password: [Your admin password]
   ```

3. **First Login Checklist**
   - ✅ Change your default password
   - ✅ Set up two-factor authentication (2FA)
   - ✅ Review your user profile
   - ✅ Check notification preferences

### Initial Setup

#### Change Default Password
1. Click on your **profile icon** (top-right corner)
2. Select **"Change Password"**
3. Enter your current password
4. Create a strong new password
5. Confirm the new password
6. Click **"Update Password"**

#### Enable Two-Factor Authentication
1. Go to **Settings** → **Security**
2. Click **"Enable 2FA"**
3. Scan the QR code with your authenticator app
4. Enter the verification code
5. Save your backup codes securely

## 📊 Dashboard Overview

### Main Dashboard Components

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Global Search                    👤 Profile    ⚙️ Settings │
├─────────────────────────────────────────────────────────────┤
│ 📈 Security Metrics Dashboard                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │   Alerts    │ │ Incidents   │ │   Logs      │ │ Threats │ │
│ │     12      │ │      3      │ │   1,247     │ │    8    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 🚨 Recent Alerts                    📊 Activity Timeline     │
│ • Failed login attempts (5)         • User logins           │
│ • Suspicious file access (2)        • System events         │
│ • Network anomalies (1)             • Security events       │
└─────────────────────────────────────────────────────────────┘
```

### Key Dashboard Elements

1. **Security Metrics Cards**
   - **Alerts**: Current active security alerts
   - **Incidents**: Open security incidents
   - **Logs**: Total log entries processed
   - **Threats**: Identified threats

2. **Recent Alerts Panel**
   - Shows the most recent security alerts
   - Click any alert for detailed information
   - Use filters to focus on specific alert types

3. **Activity Timeline**
   - Real-time view of system activity
   - Color-coded by event type
   - Click to drill down into specific events

## 🔍 Your First Query

### Building a Simple Query

1. **Access Query Builder**
   - Click **"Query Builder"** in the main navigation
   - Or use the global search bar

2. **Basic Query Example**
   ```
   Search for: failed login attempts
   Time Range: Last 24 hours
   Source: All systems
   ```

3. **Step-by-Step Process**
   - **Step 1**: Select your search criteria
   - **Step 2**: Choose time range
   - **Step 3**: Apply filters (optional)
   - **Step 4**: Click **"Search"**

### Query Builder Interface

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Query Builder                                            │
├─────────────────────────────────────────────────────────────┤
│ Search Term: [failed login attempts        ] 🔍 Search      │
│                                                             │
│ Time Range: [Last 24 hours ▼]                              │
│                                                             │
│ Filters:                                                    │
│ ☐ Source System: [All ▼]                                   │
│ ☐ Event Type: [All ▼]                                      │
│ ☐ Severity: [All ▼]                                        │
│                                                             │
│ Advanced Options: [Show ▼]                                 │
└─────────────────────────────────────────────────────────────┘
```

### Common Query Examples

#### 1. Failed Login Attempts
```
Search: "authentication failed"
Time: Last 7 days
Filter: Event Type = "Authentication"
```

#### 2. Suspicious Network Activity
```
Search: "unusual network traffic"
Time: Last 24 hours
Filter: Source = "Network Devices"
```

#### 3. File Access Anomalies
```
Search: "unauthorized file access"
Time: Last 3 days
Filter: Severity = "High" or "Critical"
```

## 🚨 Understanding Alerts

### Alert Types

1. **Security Alerts**
   - Failed authentication attempts
   - Suspicious network activity
   - Malware detection
   - Data exfiltration attempts

2. **System Alerts**
   - Service failures
   - Performance issues
   - Configuration changes
   - Backup failures

3. **Compliance Alerts**
   - Policy violations
   - Audit failures
   - Regulatory compliance issues

### Alert Severity Levels

| Severity | Color | Description | Action Required |
|----------|-------|-------------|-----------------|
| **Critical** | 🔴 Red | Immediate threat | Investigate immediately |
| **High** | 🟠 Orange | Significant risk | Investigate within 1 hour |
| **Medium** | 🟡 Yellow | Moderate concern | Investigate within 4 hours |
| **Low** | 🔵 Blue | Minor issue | Investigate within 24 hours |
| **Info** | ⚪ Gray | Informational | Review when convenient |

### Working with Alerts

1. **Viewing Alerts**
   - Click on any alert in the dashboard
   - Review alert details and context
   - Check related events and logs

2. **Acknowledging Alerts**
   - Click **"Acknowledge"** to mark as reviewed
   - Add notes explaining your assessment
   - Assign to team members if needed

3. **Escalating Alerts**
   - Click **"Escalate"** for critical issues
   - Select escalation level
   - Add urgency notes

## 🧭 Basic Navigation

### Main Navigation Menu

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard  🔍 Search  📊 Reports  ⚙️ Settings  👤 Profile │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📈 Analytics & Intelligence                                 │
│ ├── Query Builder                                           │
│ ├── Threat Intelligence                                     │
│ ├── Behavioral Analytics                                    │
│ └── Machine Learning Insights                               │
│                                                             │
│ 🚨 Security Operations                                      │
│ ├── Alert Management                                        │
│ ├── Incident Response                                       │
│ ├── Case Management                                         │
│ └── Threat Hunting                                          │
│                                                             │
│ 📋 Administration                                           │
│ ├── User Management                                         │
│ ├── System Configuration                                    │
│ ├── Data Sources                                            │
│ └── Integrations                                            │
└─────────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open global search |
| `Ctrl + /` | Show keyboard shortcuts |
| `Ctrl + N` | New query |
| `Ctrl + R` | Refresh dashboard |
| `Esc` | Close current dialog |
| `F1` | Open help |

### Breadcrumb Navigation

```
Home > Security Operations > Alert Management > Alert #12345
```

- Click any part of the breadcrumb to navigate back
- Use browser back button for quick navigation
- Bookmark frequently used pages

## ⚙️ Essential Settings

### User Preferences

1. **Access Settings**
   - Click your profile icon → **"Settings"**
   - Or use `Ctrl + ,` (if available)

2. **Notification Preferences**
   ```
   Email Notifications: ☑ Enabled
   ├── Critical Alerts: ☑ Immediate
   ├── High Priority: ☑ Within 1 hour
   ├── Medium Priority: ☑ Daily digest
   └── Low Priority: ☐ Disabled
   
   Dashboard Alerts: ☑ Enabled
   ├── Sound Alerts: ☑ Enabled
   ├── Popup Notifications: ☑ Enabled
   └── Browser Notifications: ☑ Enabled
   ```

3. **Display Preferences**
   ```
   Theme: [Dark ▼] (Dark/Light/Auto)
   Time Zone: [UTC-5 ▼]
   Date Format: [MM/DD/YYYY ▼]
   Language: [English ▼]
   ```

### Dashboard Customization

1. **Widget Configuration**
   - Drag and drop widgets to rearrange
   - Click widget settings to customize
   - Add/remove widgets based on your role

2. **Default Views**
   - Set your preferred default dashboard
   - Configure automatic refresh intervals
   - Set up saved searches

## 🆘 Getting Help

### Built-in Help System

1. **Help Menu**
   - Click **"Help"** in the main navigation
   - Access context-sensitive help
   - Browse help topics by category

2. **Tooltips and Hints**
   - Hover over icons for quick explanations
   - Look for help icons (❓) next to complex features
   - Use the "What's this?" feature for detailed explanations

### Documentation Resources

1. **User Guide Sections**
   - [Troubleshooting Guide](./troubleshooting.md)
   - [FAQ](./faq.md)
   - [Best Practices](./best-practices.md)

2. **Quick References**
   - [Keyboard Shortcuts](./reference-library/keyboard-shortcuts.md)
   - [Common Queries](./reference-library/common-queries.md)
   - [Alert Types](./reference-library/alert-types.md)

### Support Channels

1. **Self-Service**
   - Check the [Troubleshooting Guide](./troubleshooting.md)
   - Search the [FAQ](./faq.md)
   - Review [Best Practices](./best-practices.md)

2. **Team Support**
   - Contact your system administrator
   - Reach out to your security team lead
   - Use internal support channels

## ✅ Quick Start Checklist

### First Day Tasks
- [ ] Log in successfully
- [ ] Change default password
- [ ] Enable two-factor authentication
- [ ] Explore the main dashboard
- [ ] Run your first query
- [ ] Review recent alerts
- [ ] Customize your dashboard
- [ ] Set notification preferences

### First Week Tasks
- [ ] Complete user training modules
- [ ] Practice with query builder
- [ ] Understand alert workflows
- [ ] Learn incident response procedures
- [ ] Set up saved searches
- [ ] Configure dashboard widgets
- [ ] Review security policies
- [ ] Practice troubleshooting common issues

---

**Next Steps**: 
- [Getting Started Guide](./getting-started.md) - Detailed walkthrough of core features
- [Dashboard Overview](./dashboard-overview.md) - Comprehensive dashboard guide
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
