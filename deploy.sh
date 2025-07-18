#!/bin/bash

# Deploy script for Domify application
# This script is executed on the target server by Jenkins

set -e

# Configuration
CONTAINER_NAME="domify-app"
IMAGE_NAME="${DOCKER_REGISTRY:-localhost}/${DOCKER_IMAGE:-domify}:${TARGET_ENV:-latest}"
PORT="${PORT:-3000}"

echo "🚀 Starting deployment..."
echo "Container: $CONTAINER_NAME"
echo "Image: $IMAGE_NAME"
echo "Port: $PORT"

# Stop and remove existing container if it exists
echo "📦 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || echo "No existing container to stop"
docker rm $CONTAINER_NAME 2>/dev/null || echo "No existing container to remove"

# Pull the latest image
echo "⬇️  Pulling latest image..."
docker pull $IMAGE_NAME

# Run the new container
echo "🏃 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  $IMAGE_NAME

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! Application is healthy."
    docker logs $CONTAINER_NAME --tail 20
else
    echo "❌ Deployment failed! Application is not responding."
    echo "Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!" 