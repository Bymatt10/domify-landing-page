#!/bin/bash

# Deploy script optimizado para Portainer
# Solo hace build, push y avisa sobre la actualización en Portainer

set -e

# Configuration
IMAGE_NAME="${DOCKER_REGISTRY:-localhost}/${DOCKER_IMAGE:-domify}:${TARGET_ENV:-latest}"
CONTAINER_NAME="domify-app"

echo "🚀 Starting Portainer-optimized deployment..."
echo "Image: $IMAGE_NAME"

# Build the image
echo "🏗️  Building Docker image..."
docker build -t $IMAGE_NAME .

# Push to registry (si hay registry configurado)
if [[ "$DOCKER_REGISTRY" != "localhost" && -n "$DOCKER_REGISTRY" ]]; then
    echo "📤 Pushing to registry..."
    docker push $IMAGE_NAME
    echo "✅ Image pushed to registry: $IMAGE_NAME"
else
    echo "📌 Local build completed: $IMAGE_NAME"
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 PRÓXIMOS PASOS EN PORTAINER:"
echo "1. Ve a tu Stack 'domify' en Portainer"
echo "2. Click 'Editor' en la página del stack"
echo "3. Verifica que la imagen sea: $IMAGE_NAME" 
echo "4. Click 'Update the stack'"
echo "5. Verifica que las variables de entorno estén configuradas:"
echo "   ✓ PUBLIC_SUPABASE_URL"
echo "   ✓ PUBLIC_SUPABASE_ANON_KEY"
echo "   ✓ PRIVATE_SUPABASE_SERVICE_ROLE_KEY"
echo "   ✓ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
echo "   ✓ FROM_EMAIL"
echo ""
echo "🔍 Para verificar el deployment:"
echo "   curl http://localhost:3000/api/health" 