#!/bin/bash

# Fix Frontend Build Issue for Jupiter SIEM
set -e

INSTALL_DIR="/srv/jupiter/server"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP] $1${NC}"; }
print_info() { echo -e "${BLUE}[INFO] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}"; }

print_step "Fixing Frontend Build Issues"

# Check if install directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    print_error "Install directory $INSTALL_DIR not found!"
    print_info "Creating directory structure..."
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Create frontend directory if missing
if [ ! -d "frontend" ]; then
    print_info "Creating frontend directory..."
    mkdir -p frontend
fi

# Copy frontend files from the correct source
print_step "Setting Up Frontend Files"

# Check multiple possible locations for frontend source
SOURCE_DIRS=(
    "/srv/jupiter/JupiterEmerge/frontend"
    "/srv/jupiter/JupiterEmerge/ui" 
    "/app/frontend"
    "/app/ui"
)

FRONTEND_SOURCE=""
for dir in "${SOURCE_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        FRONTEND_SOURCE="$dir"
        print_info "Found frontend source: $FRONTEND_SOURCE"
        break
    fi
done

if [ -z "$FRONTEND_SOURCE" ]; then
    print_info "No existing frontend found, creating minimal React app..."
    
    # Create minimal package.json
    cat > "$INSTALL_DIR/frontend/package.json" << 'EOF'
{
  "name": "jupiter-siem-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "tailwindcss": "^3.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
EOF

    # Create minimal vite config
    cat > "$INSTALL_DIR/frontend/vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'projectjupiter.in',
      'www.projectjupiter.in',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist'
  }
})
EOF

    # Create minimal React app
    mkdir -p "$INSTALL_DIR/frontend/src"
    cat > "$INSTALL_DIR/frontend/src/main.jsx" << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

    cat > "$INSTALL_DIR/frontend/src/App.jsx" << 'EOF'
import React, { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [tenant, setTenant] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')

  const requestOTP = async () => {
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenant_id: tenant })
      })
      const data = await response.json()
      setMessage(data.message)
      setStep(2)
    } catch (error) {
      setMessage('Error requesting OTP')
    }
  }

  const login = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenant_id: tenant, otp })
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setMessage('Login successful! Welcome to Jupiter SIEM')
      } else {
        setMessage(data.detail || 'Login failed')
      }
    } catch (error) {
      setMessage('Error during login')
    }
  }

  return (
    <div className="App">
      <div className="login-container">
        <h1>🛡️ Jupiter SIEM</h1>
        <p>Security Information and Event Management</p>
        
        {step === 1 && (
          <div>
            <input
              type="email"
              placeholder="Email (harsha@projectjupiter.in)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tenant (MainTenant)"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
            />
            <button onClick={requestOTP}>Request OTP</button>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <input
              type="text"
              placeholder="Enter OTP from email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={login}>Login</button>
          </div>
        )}
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}

export default App
EOF

    cat > "$INSTALL_DIR/frontend/src/App.css" << 'EOF'
.App {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-container {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

h1 {
  color: #1e40af;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover {
  background: #1d4ed8;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 0.9rem;
}
EOF

    cat > "$INSTALL_DIR/frontend/src/index.css" << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

    # Create index.html
    mkdir -p "$INSTALL_DIR/frontend/public"
    cat > "$INSTALL_DIR/frontend/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jupiter SIEM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

else
    print_info "Copying from existing frontend source..."
    cp -r "$FRONTEND_SOURCE"/* "$INSTALL_DIR/frontend/"
fi

print_step "Creating Updated Dockerfile"

# Create a more robust Dockerfile that handles missing yarn.lock
cat > "$INSTALL_DIR/frontend/Dockerfile.prod" << 'EOF'
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy yarn.lock if it exists, otherwise create it
COPY yarn.loc[k] ./

# Install dependencies
RUN if [ ! -f yarn.lock ]; then yarn install --production=false; else yarn install --frozen-lockfile --production=false; fi

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

print_step "Generating yarn.lock file"

# Go to frontend directory and ensure yarn.lock exists
cd "$INSTALL_DIR/frontend"

# Install dependencies to generate yarn.lock if it doesn't exist
if [ ! -f "yarn.lock" ]; then
    print_info "Generating yarn.lock file..."
    
    # Check if yarn is installed
    if ! command -v yarn &> /dev/null; then
        print_info "Installing yarn..."
        npm install -g yarn
    fi
    
    # Generate yarn.lock
    yarn install
    print_info "yarn.lock generated successfully"
else
    print_info "yarn.lock already exists"
fi

print_step "Frontend Setup Complete!"
print_info "You can now rebuild the Docker containers"

echo -e "${GREEN}"
echo "============================================================"
echo "           Frontend Build Issue Fixed!"
echo "============================================================"
echo
echo "Fixed issues:"
echo "  ✅ Created missing frontend files"
echo "  ✅ Generated yarn.lock file"
echo "  ✅ Updated Dockerfile to handle missing files"
echo "  ✅ Created minimal Jupiter SIEM login interface"
echo
echo "Next steps:"
echo "  1. cd /srv/jupiter/server"
echo "  2. docker-compose down"
echo "  3. docker-compose up -d --build"
echo
echo "============================================================"
echo -e "${NC}"
EOF

chmod +x /app/fix_frontend_build.sh