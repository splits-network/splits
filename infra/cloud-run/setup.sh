#!/bin/bash
# ==============================================================================
# GCP Project Setup for Splits Network (Cloud Run)
#
# One-time setup script that enables required APIs, creates an Artifact Registry
# Docker repository, and provisions VPC networking for service-to-service
# communication. Idempotent -- safe to re-run.
#
# Usage:
#   ./setup.sh <PROJECT_ID> [REGION]
#
# Example:
#   ./setup.sh splits-network-prod us-central1
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Arguments
# ------------------------------------------------------------------------------
PROJECT_ID="${1:?Usage: ./setup.sh <PROJECT_ID> [REGION]}"
REGION="${2:-us-central1}"

REPO_NAME="splits-network"
VPC_CONNECTOR_NAME="splits-connector"
VPC_NETWORK="default"

echo "============================================"
echo "  Splits Network -- GCP Project Setup"
echo "============================================"
echo ""
echo "  Project:  ${PROJECT_ID}"
echo "  Region:   ${REGION}"
echo ""

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

# Enable a GCP API if not already enabled.
enable_api() {
    local api="$1"
    echo "[api] Enabling ${api}..."
    gcloud services enable "${api}" \
        --project="${PROJECT_ID}" \
        --quiet
    echo "  -> ${api} enabled."
}

# ------------------------------------------------------------------------------
# 1. Enable required APIs
# ------------------------------------------------------------------------------
echo "----------------------------------------------"
echo "Step 1: Enable required GCP APIs"
echo "----------------------------------------------"

REQUIRED_APIS=(
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudscheduler.googleapis.com"
    "vpcaccess.googleapis.com"
    "compute.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    enable_api "${api}"
done

echo ""
echo "All required APIs enabled."
echo ""

# ------------------------------------------------------------------------------
# 2. Create Artifact Registry Docker repository
# ------------------------------------------------------------------------------
echo "----------------------------------------------"
echo "Step 2: Create Artifact Registry repository"
echo "----------------------------------------------"

if gcloud artifacts repositories describe "${REPO_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --format="value(name)" 2>/dev/null; then
    echo "  -> Artifact Registry repository '${REPO_NAME}' already exists. Skipping."
else
    echo "[ar] Creating Artifact Registry repository '${REPO_NAME}'..."
    gcloud artifacts repositories create "${REPO_NAME}" \
        --project="${PROJECT_ID}" \
        --location="${REGION}" \
        --repository-format=docker \
        --description="Splits Network container images" \
        --quiet
    echo "  -> Repository '${REPO_NAME}' created."
fi

REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"
echo ""
echo "  Registry URL: ${REGISTRY_URL}"
echo ""

# ------------------------------------------------------------------------------
# 3. Create VPC connector for Cloud Run service-to-service communication
# ------------------------------------------------------------------------------
echo "----------------------------------------------"
echo "Step 3: Create Serverless VPC Access connector"
echo "----------------------------------------------"

if gcloud compute networks vpc-access connectors describe "${VPC_CONNECTOR_NAME}" \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format="value(name)" 2>/dev/null; then
    echo "  -> VPC connector '${VPC_CONNECTOR_NAME}' already exists. Skipping."
else
    echo "[vpc] Creating VPC connector '${VPC_CONNECTOR_NAME}'..."
    echo "  Network:   ${VPC_NETWORK}"
    echo "  IP range:  10.8.0.0/28 (auto-assigned subnet for connector)"
    gcloud compute networks vpc-access connectors create "${VPC_CONNECTOR_NAME}" \
        --project="${PROJECT_ID}" \
        --region="${REGION}" \
        --network="${VPC_NETWORK}" \
        --range="10.8.0.0/28" \
        --min-instances=2 \
        --max-instances=10 \
        --machine-type=e2-micro \
        --quiet
    echo "  -> VPC connector '${VPC_CONNECTOR_NAME}' created."
fi

echo ""

# ------------------------------------------------------------------------------
# 4. Verify setup
# ------------------------------------------------------------------------------
echo "----------------------------------------------"
echo "Step 4: Verify setup"
echo "----------------------------------------------"

echo ""
echo "Artifact Registry:"
gcloud artifacts repositories describe "${REPO_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --format="table(name, format, sizeBytes)" 2>/dev/null || echo "  WARNING: Could not describe repository."

echo ""
echo "VPC Connector:"
gcloud compute networks vpc-access connectors describe "${VPC_CONNECTOR_NAME}" \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --format="table(name, state, network, ipCidrRange)" 2>/dev/null || echo "  WARNING: Could not describe VPC connector."

echo ""
echo "============================================"
echo "  Setup complete."
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Run ./secrets.sh ${PROJECT_ID} to configure secrets"
echo "  2. Authenticate Docker: gcloud auth configure-docker ${REGION}-docker.pkg.dev"
echo "  3. Push images to: ${REGISTRY_URL}/<service-name>:<tag>"
echo ""
