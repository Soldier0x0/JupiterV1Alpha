# Jupiter SIEM Makefile
# Comprehensive build, test, and deployment automation

.PHONY: help build test deploy clean install dev prod

# Default target
help:
	@echo "Jupiter SIEM - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make install      - Install dependencies"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linting"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build all Docker images"
	@echo "  make deploy       - Deploy to production"
	@echo "  make prod         - Start production environment"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean up containers and images"
	@echo "  make backup       - Create system backup"
	@echo "  make restore      - Restore from backup"
	@echo "  make logs         - View application logs"

# Development
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

install:
	@echo "📦 Installing dependencies..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Dependencies installed"

test:
	@echo "🧪 Running comprehensive test suite..."
	cd backend && python -m pytest tests/ -v --tb=short --cov=. --cov-report=html
	cd frontend && npm test -- --coverage --watchAll=false
	@echo "✅ All tests completed"

test:integration
	@echo "🔗 Running integration tests..."
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
	@echo "✅ Integration tests completed"

lint:
	@echo "🔍 Running linting..."
	cd backend && flake8 . --max-line-length=100
	cd frontend && npm run lint
	@echo "✅ Linting completed"

# Production
build:
	@echo "🏗️ Building production images..."
	docker build -t jupiter-siem-backend:latest -f backend/Dockerfile backend/
	docker build -t jupiter-siem-frontend:latest -f frontend/Dockerfile frontend/
	docker build -t jupiter-siem-nginx:latest -f nginx/Dockerfile nginx/
	@echo "✅ All images built"

deploy:
	@echo "🚀 Deploying to production..."
	./deploy-comprehensive.sh
	@echo "✅ Deployment completed"

deploy:cloudflare
	@echo "☁️ Deploying with Cloudflare optimization..."
	./deploy-cloudflare.sh
	@echo "✅ Cloudflare deployment completed"

prod:
	@echo "🏭 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production environment started"

prod:cloudflare
	@echo "☁️ Starting Cloudflare-optimized production environment..."
	docker-compose -f docker-compose.cloudflare.yml up -d
	@echo "✅ Cloudflare production environment started"

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down --volumes --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "✅ Cleanup completed"

backup:
	@echo "💾 Creating backup..."
	./backup.sh
	@echo "✅ Backup completed"

restore:
	@echo "📥 Restoring from backup..."
	@read -p "Enter backup file path: " backup_file; \
	./restore.sh $$backup_file
	@echo "✅ Restore completed"

logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f

# Security
security-scan:
	@echo "🔒 Running security scan..."
	cd backend && bandit -r . -f json -o security-report.json
	cd frontend && npm audit
	@echo "✅ Security scan completed"

# Monitoring
monitor:
	@echo "📊 Starting monitoring stack..."
	docker-compose -f docker-compose.monitoring.yml up -d
	@echo "✅ Monitoring started"
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001"

# Database
db-migrate:
	@echo "🗄️ Running database migrations..."
	docker-compose exec backend python -m alembic upgrade head
	@echo "✅ Database migrations completed"

db-seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend python scripts/seed_database.py
	@echo "✅ Database seeded"

# SSL
ssl-generate:
	@echo "🔐 Generating SSL certificates..."
	./scripts/generate-ssl.sh
	@echo "✅ SSL certificates generated"

# Health checks
health:
	@echo "🏥 Checking system health..."
	curl -f http://localhost/health || echo "❌ Health check failed"
	curl -f http://localhost:8000/api/security-ops/healthz || echo "❌ Backend health check failed"
	@echo "✅ Health checks completed"

# Performance
benchmark:
	@echo "⚡ Running performance benchmarks..."
	cd tests && python benchmark.py
	@echo "✅ Benchmarks completed"

# Documentation
docs:
	@echo "📚 Generating documentation..."
	cd backend && python -m pydoc -w .
	cd frontend && npm run docs
	@echo "✅ Documentation generated"

# Quick start
quickstart: install build deploy
	@echo "🎉 Jupiter SIEM is ready!"
	@echo "Access the application at: http://localhost"
	@echo "Admin credentials: admin@jupiter-siem.local / JupiterSIEM2024!"
