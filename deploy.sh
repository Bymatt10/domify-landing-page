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

# ⚠️  IMPORTANTE: Este script ahora funciona mejor con Portainer
# Para usar con Portainer:
# 1. Sube la imagen al registry
# 2. Actualiza el stack/container en Portainer con la nueva imagen
# 3. Las variables de entorno se manejan desde Portainer
echo "📌 NOTA: Para deployment completo, actualiza el container en Portainer con la nueva imagen"

# Run the new container (sin variables de entorno - se configuran en Portainer)
echo "🏃 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  $IMAGE_NAME

echo "⚠️  ATENCIÓN: Este container puede fallar sin las variables de entorno correctas"
echo "   Configura las siguientes variables en Portainer:"
echo "   - PUBLIC_SUPABASE_URL"
echo "   - PUBLIC_SUPABASE_ANON_KEY" 
echo "   - PRIVATE_SUPABASE_SERVICE_ROLE_KEY"
echo "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
echo "   - FROM_EMAIL"

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
    echo ""
    echo "💡 Tip: Verifica las variables de entorno en Portainer"
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!" 
echo "🔧 Recuerda configurar las variables de entorno en Portainer si es necesario" 