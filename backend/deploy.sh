#!/bin/bash

# Google Cloud Run Deployment Script for TruSwap Backend
# Make sure you're logged in: gcloud auth login
# Set your project: gcloud config set project YOUR_PROJECT_ID

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-us-central1}
SERVICE_NAME="truswap-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying TruSwap Backend to Google Cloud Run${NC}"
echo ""

# Check if project is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: Google Cloud project not set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${YELLOW}Project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Service: ${SERVICE_NAME}${NC}"
echo ""

# Check if .env file exists for environment variables
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found. You'll need to set environment variables manually.${NC}"
    ENV_VARS=""
else
    echo -e "${GREEN}✓ Found .env file${NC}"
    # Read .env and format for gcloud
    ENV_VARS=$(grep -v '^#' .env | grep -v '^$' | sed 's/^/--set-env-vars /' | tr '\n' ',' | sed 's/,$//' | sed 's/,/ /g')
fi

# Build Docker image
echo -e "${GREEN}📦 Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

# Push to Google Container Registry
echo -e "${GREEN}📤 Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo -e "${GREEN}🚀 Deploying to Cloud Run...${NC}"

if [ -z "$ENV_VARS" ]; then
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10
else
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        ${ENV_VARS}
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update PAYPAL_BASE_URL with this URL:"
echo "   gcloud run services update ${SERVICE_NAME} --region ${REGION} --update-env-vars PAYPAL_BASE_URL=${SERVICE_URL}"
echo ""
echo "2. Update CORS configuration in SecurityConfig.java to include:"
echo "   ${SERVICE_URL}"
echo ""
echo "3. Update frontend VITE_API_BASE_URL to:"
echo "   ${SERVICE_URL}/api"

