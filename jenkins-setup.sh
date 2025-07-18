#!/bin/bash

# Jenkins Setup Script with Node.js
# This script helps migrate to a new Jenkins container with Node.js preinstalled

set -e

echo "🚀 Setting up Jenkins with Node.js..."

# Build the new Jenkins image
echo "📦 Building Jenkins image with Node.js..."
docker build -f Dockerfile.jenkins -t jenkins-with-node .

# Stop the current Jenkins container (if running)
echo "🛑 Stopping current Jenkins container..."
docker stop jenkins 2>/dev/null || echo "No running Jenkins container found"

# Remove the old container (if exists)
echo "🗑️  Removing old Jenkins container..."
docker rm jenkins 2>/dev/null || echo "No old Jenkins container to remove"

# Run the new Jenkins container
echo "🏃 Starting new Jenkins container with Node.js..."
docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-with-node

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Show the initial admin password
echo "🔑 Jenkins initial admin password:"
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "Password not available yet, check Jenkins logs"

# Show container status
echo "📊 Container status:"
docker ps | grep jenkins

echo "✅ Jenkins setup completed!"
echo "🌐 Access Jenkins at: http://localhost:8080"
echo "🔧 Jenkins now has Node.js and npm preinstalled" 