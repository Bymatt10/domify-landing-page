#!/bin/bash


# Domify Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
IMAGE_NAME="domify"
CONTAINER_NAME="domify-app"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$ENVIRONMENT .

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the new container
echo "▶️  Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  $IMAGE_NAME:$ENVIRONMENT

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Deployment successful! Application is running on http://localhost:3000"
else
  echo "❌ Deployment failed! Application is not responding"
  docker logs $CONTAINER_NAME
  exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!" 