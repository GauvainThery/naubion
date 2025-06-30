#!/bin/bash

# Build script for Naubion Docker images
set -e

echo "🐳 Building Naubion Docker Images"

# Build both backend and frontend using unified Dockerfile
echo "🏗️  Building unified image with both targets..."

echo "🔨 Building backend..."
docker build --target backend -t naubion-backend:latest .

echo "🎨 Building frontend..."
docker build --target frontend -t naubion-frontend:latest .

echo "✅ Build complete!"

# Optional: Run the containers
if [ "$1" = "--run" ]; then
    echo "🚀 Starting containers..."
    
    echo "Starting backend on port 8080..."
    docker run -d --name naubion-backend -p 8080:8080 naubion-backend:latest
    
    echo "Starting frontend on port 3000..."
    docker run -d --name naubion-frontend -p 3000:8080 naubion-frontend:latest
    
    echo "✅ Containers started!"
    echo "Backend: http://localhost:8080"
    echo "Frontend: http://localhost:3000"
fi
