# 🎯 Admin Login Setup Complete!

## ✅ System Status
- ✅ Backend API running on `http://localhost:8001`
- ✅ Frontend UI running on `http://localhost:3000`
- ✅ MongoDB connected and configured
- ✅ Admin user created successfully
- ✅ Fixed OTP system configured for testing

## 🔑 Admin Login Credentials

### **Admin Account Details:**
- **Email:** `admin@jupiter.com`
- **Tenant ID:** `70d9c900-af02-4d81-9c6c-97ecf4ecf786`
- **Test OTP:** `123456` (fixed for development)

## 📋 Login Process

### **Step 1: Access the Application**
Navigate to: `http://localhost:3000`

### **Step 2: Login Flow**
1. Click "Login" or go to `/login`
2. Enter email: `admin@jupiter.com`
3. Select tenant or enter tenant ID
4. Request OTP
5. Enter OTP: `123456`
6. Click Login

## 🧪 Testing Commands

### **Test Backend API:**
```bash
# Health check
curl http://localhost:8001/api/health

# Request OTP
curl -X POST http://localhost:8001/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@jupiter.com", "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@jupiter.com", "tenant_id": "70d9c900-af02-4d81-9c6c-97ecf4ecf786", "otp": "123456"}'
```

### **Run Comprehensive Test:**
```bash
python /app/test_admin_login.py
```

## 🔧 Configuration Details

### **Environment Variables (Backend):**
```env
MONGO_URL=mongodb://localhost:27017/jupiter_siem
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENVIRONMENT=development  # Enables fixed OTP
```

### **Environment Variables (Frontend):**
```env
VITE_BACKEND_URL=/api
VITE_DEV_EMAIL=admin@jupiter.com
VITE_DEV_TENANT_ID=secureinsight-1
VITE_DEV_OTP=123456
```

## 🎭 User Roles & Permissions

### **Admin User Capabilities:**
- ✅ Full system access (is_owner: true)
- ✅ All SIEM features available
- ✅ User management
- ✅ Tenant administration  
- ✅ AI console access
- ✅ Settings configuration

## 🚀 Next Steps

1. **Access Dashboard:** Login and explore the dashboard
2. **Test AI Features:** Navigate to AI Console
3. **Configure Integrations:** Add threat intelligence APIs
4. **Add Users:** Create additional team members
5. **Set up Automation:** Configure SOAR playbooks

## 🔄 Service Management

### **Restart Services:**
```bash
sudo supervisorctl restart all
```

### **Check Service Status:**
```bash
sudo supervisorctl status
```

### **View Logs:**
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs (if using supervisor)
tail -f /var/log/supervisor/frontend.*.log
```

## ⚡ Development Mode Features

- **Fixed OTP:** Always returns `123456` for easy testing
- **Dev Credentials:** Pre-configured admin account
- **API Response:** OTP shown in API response during development
- **No Email:** OTP doesn't require real SMTP configuration

## 🛡️ Security Notes

- Fixed OTP is only enabled in `ENVIRONMENT=development`
- Change JWT_SECRET for production
- Enable real SMTP for production OTP delivery
- Configure 2FA for enhanced security

---
**🎉 Your Jupiter SIEM platform is ready!** 
Access the dashboard at `http://localhost:3000` and login with the admin credentials above.