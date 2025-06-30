#!/bin/bash

# Script to build and push Docker images to GitHub Container Registry (GHCR)
# Usage: ./scripts/build-and-push.sh [your-github-username] [tag]

set -e

# Configuration
GITHUB_USERNAME_RAW=${1:-"GauvainThery"}
# Convert username to lowercase for GHCR compatibility
GITHUB_USERNAME=$(echo "${GITHUB_USERNAME_RAW}" | tr '[:upper:]' '[:lower:]')
TAG=${2:-"latest"}
REGISTRY="ghcr.io"

# Image names
BACKEND_IMAGE="${REGISTRY}/${GITHUB_USERNAME}/naubion-backend:${TAG}"
FRONTEND_IMAGE="${REGISTRY}/${GITHUB_USERNAME}/naubion-frontend:${TAG}"

echo "🏗️  Building and pushing Naubion images to GHCR..."
echo "Original username: ${GITHUB_USERNAME_RAW}"
echo "GHCR username:     ${GITHUB_USERNAME} (converted to lowercase)"
echo "Backend:  ${BACKEND_IMAGE}"
echo "Frontend: ${FRONTEND_IMAGE}"
echo ""

# Check if logged in to GHCR
echo "🔐 Checking GHCR authentication..."
if ! echo "$CR_PAT" | docker login ghcr.io -u "${GITHUB_USERNAME_RAW}" --password-stdin 2>/dev/null; then
    echo "❌ Failed to login to GHCR. Please ensure:"
    echo "   1. You have set the CR_PAT environment variable with your GitHub Personal Access Token"
    echo "   2. The token has 'write:packages' and 'read:packages' permissions"
    echo "   3. You have enabled 'Improve container support' in your GitHub token settings"
    echo ""
    echo "To set the token: export CR_PAT=your_github_token"
    exit 1
fi

echo "✅ Successfully authenticated with GHCR"
echo ""

# Build and tag backend image
echo "🏗️  Building backend image..."
docker build -f Dockerfile.backend -t "${BACKEND_IMAGE}" .

# Build and tag frontend image
echo "🏗️  Building frontend image..."
docker build -f Dockerfile.frontend -t "${FRONTEND_IMAGE}" .

echo "✅ Images built successfully"
echo ""

# Push images to GHCR
echo "📤 Pushing backend image to GHCR..."
docker push "${BACKEND_IMAGE}"

echo "📤 Pushing frontend image to GHCR..."
docker push "${FRONTEND_IMAGE}"

echo ""
echo "🎉 Successfully pushed images to GHCR!"
echo "   Backend:  ${BACKEND_IMAGE}"
echo "   Frontend: ${FRONTEND_IMAGE}"
echo ""
echo "📋 To use these images, update your docker-compose.yml:"
echo "   backend:"
echo "     image: ${BACKEND_IMAGE}"
echo "   frontend:"
echo "     image: ${FRONTEND_IMAGE}"
echo ""
echo "🚀 Run with: docker-compose pull && docker-compose up"
