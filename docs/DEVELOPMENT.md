# Development Guide

## Prerequisites
- Git
- Node.js 18+ (LTS recommended)
- Python 3.10+
- MongoDB 6.0+
- Docker & Docker Compose
- Code editor (VS Code recommended)

## Environment Setup

### Windows Setup
1. **Install WSL2**
```powershell
wsl --install
```

2. **Install Prerequisites**
```powershell
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs-lts python git docker-desktop mongodb-compass vscode -y
```

### macOS Setup
1. **Install Homebrew**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Prerequisites**
```bash
brew install node python@3.10 git mongodb-community docker
brew install --cask visual-studio-code docker mongodb-compass
```

### Linux Setup (Ubuntu/Debian)
1. **Install Prerequisites**
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3.10 python3.10-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

## Project Setup

1. **Clone Repository**
```bash
git clone https://github.com/Soldier0x0/JupiterEmerge.git
cd JupiterEmerge
```

2. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux/macOS
.\venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
```

4. **Database Setup**
```bash
# Start MongoDB
sudo systemctl start mongod    # Linux
brew services start mongodb    # macOS
# Windows: Start MongoDB service from Services

# Initialize database
python scripts/init_db.py
```

## Development Workflow

### Starting Development Servers

1. **Frontend Development**
```bash
cd frontend
npm run dev
# Access at http://localhost:3000
```

2. **Backend Development**
```bash
cd backend
python server.py
# API available at http://localhost:8000
```

### Environment Configuration

Create `.env` files with appropriate values:

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

**Backend (.env)**
```env
DEBUG=True
MONGODB_URI=mongodb://localhost:27017/jupiter
JWT_SECRET=your-secret-key
AI_API_KEY=your-api-key
```

### Code Style & Quality

1. **Frontend**
```bash
# Lint check
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

2. **Backend**
```bash
# Format code
black .

# Lint check
flake8

# Type check
mypy .
```

### Testing

1. **Frontend Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

2. **Backend Tests**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.
```

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod    # Linux
brew services list              # macOS

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Node.js Dependency Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Development Tools

### Recommended VS Code Extensions
1. Python
2. ESLint
3. Prettier
4. Docker
5. MongoDB for VS Code
6. GitLens

### Browser Extensions
1. React Developer Tools
2. Redux DevTools

## Performance Optimization

### Frontend
- Use React.memo for pure components
- Implement code splitting
- Enable tree shaking
- Optimize images and assets
- Use web workers for heavy computations

### Backend
- Implement caching
- Use connection pooling
- Optimize database queries
- Use appropriate indexes
- Implement rate limiting

## Database Management

### Creating Indexes
```javascript
// Create indexes for better query performance
db.cases.createIndex({ "created_at": 1 });
db.cases.createIndex({ "status": 1, "severity": 1 });
db.alerts.createIndex({ "timestamp": 1 });
```

### Backup and Restore
```bash
# Create backup
mongodump --db jupiter --out backup/

# Restore from backup
mongorestore --db jupiter backup/jupiter/
```

## Security Best Practices

1. **Input Validation**
   - Sanitize all user inputs
   - Use parameterized queries
   - Validate request schemas

2. **Authentication & Authorization**
   - Implement rate limiting
   - Use secure session management
   - Implement RBAC

3. **Data Security**
   - Use environment variables
   - Encrypt sensitive data
   - Regular security audits

4. **Dependencies**
   - Keep dependencies updated
   - Run security scans
   - Monitor security advisories

### 1. Clone Repository
```bash
git clone https://github.com/Soldier0x0/JupiterEmerge.git
cd JupiterEmerge
```

### 2. Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start backend server
uvicorn server:app --reload --port 8001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### 4. Development Environment Variables

#### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017/jupiter_siem
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:8001/api
VITE_APP_NAME="Project Jupiter"
```

## Development Tools

### Code Formatting
- Backend: black, flake8
- Frontend: prettier, eslint

### Running Tests
```bash
# Backend tests
pytest

# Frontend tests
npm test
```

## Common Development Tasks

### Adding New API Endpoint
1. Add route in appropriate file in `backend/routes/`
2. Update API documentation
3. Add corresponding frontend API call in `frontend/src/api/`

### Adding New Frontend Route
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Update navigation in `frontend/src/components/SideNav.jsx`

## Debugging

### Backend
- Use `debug=True` in uvicorn
- Check logs in `logs/backend.log`

### Frontend
- Use Chrome DevTools
- Check browser console
- Use React DevTools

## Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```
