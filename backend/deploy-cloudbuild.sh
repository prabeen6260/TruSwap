#!/bin/bash

# Google Cloud Run Deployment using Cloud Build (No local Docker required)
# Make sure you're logged in: gcloud auth login
# Set your project: gcloud config set project YOUR_PROJECT_ID

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}
REGION=${REGION:-us-central1}
SERVICE_NAME="truswap-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying TruSwap Backend to Google Cloud Run (using Cloud Build)${NC}"
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with your environment variables"
    exit 1
fi

echo -e "${GREEN}✓ Found .env file${NC}"

# Read environment variables from .env
source .env

# Build substitution variables for Cloud Build
SUBSTITUTIONS=""
SUBSTITUTIONS+="_MONGODB_URI=${MONGODB_URI},"
SUBSTITUTIONS+="_MONGODB_DATABASE=${MONGODB_DATABASE},"
SUBSTITUTIONS+="_AUTH0_ISSUER_URI=${AUTH0_ISSUER_URI},"
SUBSTITUTIONS+="_AUTH0_AUDIENCE=${AUTH0_AUDIENCE},"
SUBSTITUTIONS+="_PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID},"
SUBSTITUTIONS+="_PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET},"
SUBSTITUTIONS+="_PAYPAL_MODE=${PAYPAL_MODE},"
SUBSTITUTIONS+="_PAYPAL_BASE_URL=${PAYPAL_BASE_URL:-http://localhost:8080}"

# Remove trailing comma
SUBSTITUTIONS=${SUBSTITUTIONS%,}

echo -e "${GREEN}📦 Building and deploying using Cloud Build...${NC}"

# Submit build to Cloud Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="${SUBSTITUTIONS}" \
  .

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}⚠️  Service might still be deploying. Check status with:${NC}"
    echo "gcloud run services list --region ${REGION}"
else
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
fi

