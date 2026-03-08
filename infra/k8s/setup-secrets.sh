#!/bin/bash

# Setup Kubernetes secrets for Splits Network deployment
# This script creates the required secrets in the target Kubernetes cluster

set -e

NAMESPACE="${1:-splits-network}"

echo "Setting up Kubernetes secrets in namespace: $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ============================================================================
# SUPABASE SECRETS
# ============================================================================
echo "Creating supabase-secrets..."

kubectl create secret generic supabase-secrets \
  --from-literal=supabase-url="$SUPABASE_URL" \
  --from-literal=supabase-anon-key="$SUPABASE_ANON_KEY" \
  --from-literal=supabase-service-role-key="$SUPABASE_SERVICE_ROLE_KEY" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ supabase-secrets created/updated"

# ============================================================================
# CLERK SECRETS
# ============================================================================
echo "Creating clerk-secrets..."

kubectl create secret generic clerk-secrets \
  --from-literal=splits-clerk-secret-key="$SPLITS_CLERK_SECRET_KEY" \
  --from-literal=splits-clerk-webhook-secret="${SPLITS_CLERK_WEBHOOK_SECRET:-}" \
  --from-literal=app-clerk-webhook-secret="${APP_CLERK_WEBHOOK_SECRET:-}" \
  --from-literal=app-clerk-secret-key="${APP_CLERK_SECRET_KEY:-}" \
  --from-literal=admin-clerk-secret-key="${ADMIN_CLERK_SECRET_KEY:-}" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ clerk-secrets created/updated"

# ============================================================================
# STRIPE SECRETS
# ============================================================================
echo "Creating stripe-secrets..."

kubectl create secret generic stripe-secrets \
  --from-literal=stripe-secret-key="$STRIPE_SECRET_KEY" \
  --from-literal=stripe-publishable-key="$STRIPE_PUBLISHABLE_KEY" \
  --from-literal=stripe-webhook-secret="$STRIPE_WEBHOOK_SECRET" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ stripe-secrets created/updated"

# ============================================================================
# OPENAI SECRETS
# ============================================================================
echo "Creating openai-secrets..."

kubectl create secret generic openai-secrets \
  --from-literal=openai-api-key="$OPENAI_API_KEY" \
  --from-literal=openai-model="${OPENAI_MODEL:-gpt-3.5-turbo}" \
  --from-literal=gpt-ec-private-key="${GPT_EC_PRIVATE_KEY:-}" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ openai-secrets created/updated"

# ============================================================================
# RESEND SECRETS
# ============================================================================
echo "Creating resend-secrets..."

kubectl create secret generic resend-secrets \
  --from-literal=resend-api-key="$RESEND_API_KEY" \
  --from-literal=resend-from-email="$RESEND_FROM_EMAIL" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ resend-secrets created/updated"

# ============================================================================
# INTEGRATION SECRETS
# ============================================================================
echo "Creating integration-secrets..."

kubectl create secret generic integration-secrets \
  --from-literal=integration-encryption-key="$INTEGRATION_ENCRYPTION_KEY" \
  --from-literal=google-client-id="${GOOGLE_CLIENT_ID:-}" \
  --from-literal=google-client-secret="${GOOGLE_CLIENT_SECRET:-}" \
  --from-literal=microsoft-client-id="${MICROSOFT_CLIENT_ID:-}" \
  --from-literal=microsoft-client-secret="${MICROSOFT_CLIENT_SECRET:-}" \
  --from-literal=linkedin-client-id="${LINKEDIN_CLIENT_ID:-}" \
  --from-literal=linkedin-client-secret="${LINKEDIN_CLIENT_SECRET:-}" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ integration-secrets created/updated"

# ============================================================================
# LIVEKIT SECRETS  
# ============================================================================
echo "Creating livekit-secrets..."

kubectl create secret generic livekit-secrets \
  --from-literal=livekit-api-key="$LIVEKIT_API_KEY" \
  --from-literal=livekit-api-secret="$LIVEKIT_API_SECRET" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ livekit-secrets created/updated"

# ============================================================================
# S3/STORAGE SECRETS
# ============================================================================
echo "Creating storage-secrets..."

kubectl create secret generic storage-secrets \
  --from-literal=supabase-s3-endpoint="$SUPABASE_S3_ENDPOINT" \
  --from-literal=supabase-s3-access-key="$SUPABASE_S3_ACCESS_KEY" \
  --from-literal=supabase-s3-secret-key="$SUPABASE_S3_SECRET_KEY" \
  --from-literal=supabase-s3-bucket="$SUPABASE_S3_BUCKET" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ storage-secrets created/updated"

# ============================================================================
# Verify all secrets
# ============================================================================
echo ""
echo "✅ All secrets created/updated successfully!"
echo ""
echo "Secrets in namespace '$NAMESPACE':"
kubectl get secrets -n "$NAMESPACE"
