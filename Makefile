# Jupiter SIEM - Enhanced Makefile
# Comprehensive build, test, and deployment automation for both Native and Docker

.PHONY: help install test clean deploy backup restore logs health

# Default target
help:
	@echo "Jupiter SIEM - Enhanced Deployment Automation"
	@echo ""
	@echo "🏠 Native Deployment:"
	@echo "  make native-setup     - Setup native environment"
	@echo "  make native-deploy    - Deploy native production"
	@echo "  make native-backup    - Backup native deployment"
	@echo "  make native-logs      - View native service logs"
	@echo "  make native-status    - Check native service status"
	@echo "  make native-stop      - Stop native services"
	@echo "  make native-restart   - Restart native services"
	@echo ""
	@echo "🐳 Docker Deployment:"
	@echo "  make docker-setup     - Setup Docker environment"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-deploy    - Deploy Docker production"
	@echo "  make docker-backup    - Backup Docker deployment"
	@echo "  make docker-logs      - View Docker container logs"
	@echo "  make docker-status    - Check Docker container status"
	@echo "  make docker-stop      - Stop Docker containers"
	@echo "  make docker-restart   - Restart Docker containers"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make dev              - Start development environment"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linting"
	@echo "  make clean            - Clean up build artifacts"
	@echo ""
	@echo "🚀 Unified Commands:"
	@echo "  make deploy           - Interactive deployment selector"
	@echo "  make backup           - Interactive backup selector"
	@echo "  make health           - Check health of all deployments"
	@echo "  make install          - Install all dependencies"

# Variables
NATIVE_ROOT := native
DOCKER_ROOT := docker
BACKEND_DIR := backend
FRONTEND_DIR := frontend

# Native deployment targets
native-setup:
	@echo "🏠 Setting up native environment..."
	cd $(NATIVE_ROOT)/deployment && chmod +x setup-native.sh && ./setup-native.sh

native-deploy:
	@echo "🏠 Deploying native production..."
	cd $(NATIVE_ROOT)/deployment && chmod +x deploy-native.sh && ./deploy-native.sh

native-backup:
	@echo "🏠 Creating native backup..."
	cd $(NATIVE_ROOT)/deployment && chmod +x backup-native.sh && ./backup-native.sh

native-logs:
	@echo "🏠 Viewing native service logs..."
	sudo journalctl -f -u jupiter-backend -u jupiter-frontend

native-status:
	@echo "🏠 Native service status:"
	@systemctl status jupiter-backend --no-pager || echo "Backend service not found"
	@systemctl status jupiter-frontend --no-pager || echo "Frontend service not found"
	@systemctl status redis-server --no-pager || echo "Redis service not found"
	@systemctl status nginx --no-pager || echo "Nginx service not found"

native-stop:
	@echo "🏠 Stopping native services..."
	sudo systemctl stop jupiter-backend jupiter-frontend || true

native-restart:
	@echo "🏠 Restarting native services..."
	sudo systemctl restart jupiter-backend jupiter-frontend nginx redis-server

# Docker deployment targets
docker-setup:
	@echo "🐳 Setting up Docker environment..."
	@if [ ! -f "$(DOCKER_ROOT)/configuration/.env.docker" ]; then \
		cp $(DOCKER_ROOT)/configuration/.env.docker.example $(DOCKER_ROOT)/configuration/.env.docker; \
		echo "Created Docker environment file. Please review and update it."; \
	fi

docker-build:
	@echo "🐳 Building Docker images..."
	docker build -t jupiter-siem-backend:latest -f $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)/
	docker build -t jupiter-siem-frontend:latest -f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)/
	docker build -t jupiter-siem-nginx:latest -f $(DOCKER_ROOT)/containers/nginx/Dockerfile $(DOCKER_ROOT)/containers/nginx/

docker-deploy:
	@echo "🐳 Deploying Docker production..."
	cd $(DOCKER_ROOT)/deployment && chmod +x deploy-docker.sh && ./deploy-docker.sh

docker-backup:
	@echo "🐳 Creating Docker backup..."
	cd $(DOCKER_ROOT)/deployment && chmod +x backup-docker.sh && ./backup-docker.sh

docker-logs:
	@echo "🐳 Viewing Docker container logs..."
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.prod.yml logs -f

docker-status:
	@echo "🐳 Docker container status:"
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.prod.yml ps

docker-stop:
	@echo "🐳 Stopping Docker containers..."
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.prod.yml down

docker-restart:
	@echo "🐳 Restarting Docker containers..."
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.prod.yml restart

# Development targets
dev:
	@echo "🚀 Starting development environment..."
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.dev.yml up -d || \
	echo "Development compose file not found, using production with dev profile"

test:
	@echo "🧪 Running comprehensive test suite..."
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && python -m pytest tests/ -v --tb=short || true; \
	fi
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		cd $(FRONTEND_DIR) && npm test -- --coverage --watchAll=false || true; \
	fi

lint:
	@echo "🔍 Running linting..."
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && flake8 . --max-line-length=100 || true; \
	fi
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		cd $(FRONTEND_DIR) && npm run lint || true; \
	fi

clean:
	@echo "🧹 Cleaning up..."
	@# Clean Docker resources
	docker system prune -f || true
	@# Clean Python cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@# Clean Node modules (keep package.json)
	@if [ -d "$(FRONTEND_DIR)/node_modules" ]; then \
		echo "Cleaning frontend node_modules..."; \
		rm -rf $(FRONTEND_DIR)/node_modules; \
	fi
	@echo "✅ Cleanup completed"

# Unified targets
deploy:
	@echo "🚀 Starting interactive deployment..."
	chmod +x deploy.sh && ./deploy.sh

backup:
	@echo "💾 Interactive backup selection..."
	@echo "Select backup type:"
	@echo "  [1] Native backup"
	@echo "  [2] Docker backup"
	@echo "  [3] Both backups"
	@read -p "Enter choice [1-3]: " choice; \
	case $$choice in \
		1) make native-backup ;; \
		2) make docker-backup ;; \
		3) make native-backup && make docker-backup ;; \
		*) echo "Invalid choice" ;; \
	esac

health:
	@echo "🏥 Checking system health..."
	@echo ""
	@echo "Native Health:"
	@curl -f http://localhost/health 2>/dev/null && echo "✅ Native: Healthy" || echo "❌ Native: Unhealthy"
	@echo ""
	@echo "Docker Health:"
	@curl -f http://localhost:8080/health 2>/dev/null && echo "✅ Docker: Healthy" || echo "❌ Docker: Unhealthy"
	@echo ""

install:
	@echo "📦 Installing all dependencies..."
	@# Backend dependencies
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && pip install -r requirements.txt; \
	fi
	@# Frontend dependencies
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		cd $(FRONTEND_DIR) && npm ci; \
	fi
	@echo "✅ Dependencies installed"

# Monitoring targets
monitor:
	@echo "📊 Starting monitoring stack..."
	cd $(DOCKER_ROOT)/deployment && docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Security targets
security-scan:
	@echo "🔒 Running security scan..."
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && bandit -r . -f json -o security-report.json || true; \
	fi
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		cd $(FRONTEND_DIR) && npm audit || true; \
	fi

# Quick start
quickstart: install docker-build deploy
	@echo "🎉 Jupiter SIEM quickstart completed!"
	@echo "Native: http://localhost"
	@echo "Docker: http://localhost:8080"