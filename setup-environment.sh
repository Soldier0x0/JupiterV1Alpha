#!/bin/bash

# Jupiter SIEM Environment Setup Script
# This script creates the proper .env files from the template files

set -e

echo "🔧 Setting up Jupiter SIEM Environment Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the Jupiter SIEM root directory."
    exit 1
fi

print_status "Creating environment files..."

# Create root .env file
if [ ! -f ".env" ]; then
    if [ -f "jupiter-siem.env" ]; then
        cp jupiter-siem.env .env
        print_success "Created .env from jupiter-siem.env"
    else
        print_error "jupiter-siem.env template not found!"
        exit 1
    fi
else
    print_warning ".env already exists, skipping..."
fi

# Create backend .env file
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/backend.env" ]; then
        cp backend/backend.env backend/.env
        print_success "Created backend/.env from backend/backend.env"
    else
        print_error "backend/backend.env template not found!"
        exit 1
    fi
else
    print_warning "backend/.env already exists, skipping..."
fi

# Create frontend .env file
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/frontend.env" ]; then
        cp frontend/frontend.env frontend/.env
        print_success "Created frontend/.env from frontend/frontend.env"
    else
        print_error "frontend/frontend.env template not found!"
        exit 1
    fi
else
    print_warning "frontend/.env already exists, skipping..."
fi

# Create environment-specific files
if [ ! -f ".env.development" ]; then
    if [ -f "env.development" ]; then
        cp env.development .env.development
        print_success "Created .env.development from env.development"
    else
        print_warning "env.development template not found, skipping..."
    fi
else
    print_warning ".env.development already exists, skipping..."
fi

if [ ! -f ".env.production" ]; then
    if [ -f "env.production" ]; then
        cp env.production .env.production
        print_success "Created .env.production from env.production"
    else
        print_warning "env.production template not found, skipping..."
    fi
else
    print_warning ".env.production already exists, skipping..."
fi

# Create .env.example file
if [ ! -f ".env.example" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env.example
        print_success "Created .env.example from env.example"
    else
        print_warning "env.example template not found, skipping..."
    fi
else
    print_warning ".env.example already exists, skipping..."
fi

print_status "Setting up .gitignore for environment files..."

# Add .env files to .gitignore if not already present
if [ -f ".gitignore" ]; then
    if ! grep -q "\.env" .gitignore; then
        echo "" >> .gitignore
        echo "# Environment files" >> .gitignore
        echo ".env" >> .gitignore
        echo ".env.*" >> .gitignore
        echo "!.env.example" >> .gitignore
        echo "backend/.env" >> .gitignore
        echo "frontend/.env" >> .gitignore
        print_success "Added .env files to .gitignore"
    else
        print_warning ".env files already in .gitignore"
    fi
else
    print_warning ".gitignore not found, please add .env files manually"
fi

print_status "Validating environment configuration..."

# Check if required environment variables are set
required_vars=(
    "JWT_SECRET_KEY"
    "SUPER_ADMIN_EMAIL"
    "SUPER_ADMIN_PASSWORD"
    "MONGO_URL"
    "EMAIL_HOST"
    "EMAIL_USER"
    "EMAIL_PASSWORD"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=your_" .env || grep -q "^${var}=$" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "Please edit .env file and set proper values for these variables."
else
    print_success "All required environment variables are configured!"
fi

print_status "Environment setup complete!"

echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and configure your environment variables"
echo "2. Edit backend/.env for backend-specific configuration"
echo "3. Edit frontend/.env for frontend-specific configuration"
echo "4. Run 'docker-compose up -d' to start the application"
echo ""
echo "🔒 Security reminder:"
echo "- Never commit .env files to version control"
echo "- Use strong, unique passwords"
echo "- Rotate credentials regularly"
echo "- Use environment-specific configurations"
echo ""
print_success "Jupiter SIEM environment configuration is ready!"
