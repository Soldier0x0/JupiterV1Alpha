# Quick Start Guide

## 🚀 5-Minute Setup

### 1. Clone & Install
```bash
# Clone repository
git clone https://github.com/Soldier0x0/JupiterEmerge.git
cd JupiterEmerge

# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Frontend setup
cd frontend
npm install
```

### 2. Configuration
```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017/jupiter_siem
JWT_SECRET=your-dev-secret
NODE_ENV=development

# Frontend (.env)
VITE_BACKEND_URL=http://localhost:8001/api
VITE_APP_NAME="Project Jupiter"
```

### 3. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs
- Health Check: http://localhost:8001/api/health

## 🎯 First Steps

1. **Create Admin Account**
   ```bash
   curl -X POST http://localhost:8001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "tenant_name": "My Organization",
       "is_owner": true
     }'
   ```

2. **Configure Dashboard**
   - Login to the application
   - Navigate to Dashboard
   - Click "Customize" to add widgets

3. **Test AI Features**
   - Go to AI Console
   - Test with basic security questions
   - Check Local Models section

## 📱 Key Features Demo

### 1. Security Dashboard
- Add threat monitoring widget
- Configure real-time alerts
- Set up custom metrics

### 2. AI Integration
- Connect to local LLM
- Test threat analysis
- Configure automations

### 3. User Management
- Add team members
- Assign roles
- Configure permissions

## 🔧 Common Tasks

### Add New User
```bash
curl -X POST http://localhost:8001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "analyst"
  }'
```

### Create Custom Widget
```javascript
// frontend/src/components/widgets/CustomWidget.jsx
import React from 'react';

export const CustomWidget = ({ data }) => {
  return (
    <div className="widget">
      <h3>{data.title}</h3>
      {/* Widget content */}
    </div>
  );
};
```

## 🆘 Quick Troubleshooting

### Frontend Issues
- Clear browser cache
- Check console errors
- Verify API endpoint in `.env`

### Backend Issues
- Check MongoDB connection
- Verify JWT token
- Check log files

## 📚 Next Steps
1. Read full [Development Guide](DEVELOPMENT.md)
2. Explore [API Documentation](API.md)
3. Review [Deployment Guide](DEPLOYMENT.md)
4. Bookmark [Troubleshooting Guide](TROUBLESHOOTING.md)
