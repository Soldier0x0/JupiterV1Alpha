#!/bin/bash

# Jupiter SIEM Deployment Script
set -e

echo "🚀 Jupiter SIEM Deployment Starting..."

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.full.yml"

if [ "$ENVIRONMENT" = "development" ]; then
    ENV_FILE=".env.development"
    echo "📋 Deploying in DEVELOPMENT mode"
else
    ENV_FILE=".env.production"
    echo "📋 Deploying in PRODUCTION mode"
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

echo "🔧 Preparing infrastructure..."

# Create necessary directories
mkdir -p logs/{vector,backend,frontend}
mkdir -p data/{clickhouse,mongodb,redis}
mkdir -p backups
mkdir -p config/{clickhouse,vector,nifi,prometheus,grafana}

# Set permissions
chmod 755 logs data backups config
chmod 600 $ENV_FILE

echo "🗄️  Initializing databases..."

# Start ClickHouse first to initialize schema
echo "Starting ClickHouse..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d clickhouse

# Wait for ClickHouse to be ready
echo "Waiting for ClickHouse to be ready..."
max_attempts=30
attempt=1
while ! docker-compose -f $COMPOSE_FILE exec -T clickhouse wget --no-verbose --tries=1 --spider http://localhost:8123/ping > /dev/null 2>&1; do
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ ClickHouse failed to start after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Attempt $attempt/$max_attempts - waiting for ClickHouse..."
    sleep 5
    ((attempt++))
done

echo "✅ ClickHouse is ready"

# Start MongoDB
echo "Starting MongoDB..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d mongodb

# Wait for MongoDB
echo "Waiting for MongoDB to be ready..."
max_attempts=20
attempt=1
while ! docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ MongoDB failed to start after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Attempt $attempt/$max_attempts - waiting for MongoDB..."
    sleep 3
    ((attempt++))
done

echo "✅ MongoDB is ready"

# Start Redis
echo "Starting Redis..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d redis

echo "📊 Starting monitoring stack..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d prometheus grafana

echo "🔄 Starting log processing pipeline..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d vector nifi

echo "⚙️  Starting SOAR platform..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d postgres n8n

echo "🖥️  Starting application services..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d backend frontend

echo "🌐 Starting reverse proxy..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d nginx

echo "🔍 Verifying deployment..."

# Health check function
check_service() {
    service_name=$1
    health_url=$2
    max_attempts=${3:-10}
    
    echo "Checking $service_name..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 5
        ((attempt++))
    done
    echo "⚠️  $service_name health check failed"
    return 1
}

# Health checks
check_service "Backend API" "http://localhost:8001/api/health"
check_service "Frontend" "http://localhost:3000"
check_service "ClickHouse" "http://localhost:8123/ping"
check_service "Vector API" "http://localhost:8686/health"

echo "📋 Deployment Summary:"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8001/api/docs"
echo "ClickHouse: http://localhost:8123"
echo "Grafana: http://localhost:3001 (admin/jupiter_grafana_2024)"
echo "n8n SOAR: http://localhost:5678 (admin/jupiter_n8n_2024)"
echo "NiFi: https://localhost:8443 (admin/jupiter_nifi_2024)"
echo "Vector API: http://localhost:8686"

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🔐 PRODUCTION SECURITY REMINDERS:"
    echo "- Change all default passwords immediately"
    echo "- Configure SSL/TLS certificates"
    echo "- Set up proper firewall rules"
    echo "- Configure backup schedules"
    echo "- Review and update .env.production"
fi

echo ""
echo "🚀 Jupiter SIEM deployment complete!"
echo "📖 Check logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "🛑 Stop services: docker-compose -f $COMPOSE_FILE down"