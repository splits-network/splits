#!/bin/bash
# GitHub Secrets Setup Script (Bash version)
# ================================
# This script sets up GitHub Actions secrets for both staging and production environments.
# 
# Prerequisites:
# 1. Install GitHub CLI: https://cli.github.com/
# 2. Authenticate: gh auth login
# 3. Fill in the values below before running
#
# Usage: chmod +x scripts/setup-github-secrets.sh && ./scripts/setup-github-secrets.sh

set -e

# Repository (change if needed)
REPO="splits-network/splits"

echo -e "\033[36mSetting up GitHub secrets for $REPO\033[0m"
echo -e "\033[33mMake sure you've created 'staging' and 'production' environments in GitHub first!\033[0m"
echo ""

# ============================================================================
# SHARED SECRETS (Repository-level - same for all environments)
# ============================================================================

echo -e "\n\033[32m=== Setting Shared Repository Secrets ===\033[0m"

echo "  Setting SENTRY_AUTH_TOKEN..."
echo "YOUR_SENTRY_AUTH_TOKEN" | gh secret set SENTRY_AUTH_TOKEN --repo $REPO

echo "  Setting OPENAI_API_KEY..."
echo "YOUR_OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo $REPO

# ============================================================================
# PRODUCTION SECRETS
# ============================================================================

echo -e "\n\033[32m=== Setting Production Environment Secrets ===\033[0m"

# Azure/AKS
echo "  Setting AZURE_CREDENTIALS..."
cat << 'EOF' | gh secret set AZURE_CREDENTIALS --repo $REPO --env production
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "subscriptionId": "YOUR_SUBSCRIPTION_ID",
  "tenantId": "YOUR_TENANT_ID"
}
EOF

echo "  Setting ACR_NAME..."
echo "splitsnetwork" | gh secret set ACR_NAME --repo $REPO --env production

echo "  Setting ACR_LOGIN_SERVER..."
echo "splitsnetwork.azurecr.io" | gh secret set ACR_LOGIN_SERVER --repo $REPO --env production

echo "  Setting AKS_RESOURCE_GROUP..."
echo "splits-production-rg" | gh secret set AKS_RESOURCE_GROUP --repo $REPO --env production

echo "  Setting AKS_CLUSTER_NAME..."
echo "splits-production-aks" | gh secret set AKS_CLUSTER_NAME --repo $REPO --env production

# Supabase
echo "  Setting SUPABASE_URL..."
echo "https://einhgkqmxbkgdohwfayv.supabase.co" | gh secret set SUPABASE_URL --repo $REPO --env production

echo "  Setting SUPABASE_ANON_KEY..."
echo "YOUR_PRODUCTION_SUPABASE_ANON_KEY" | gh secret set SUPABASE_ANON_KEY --repo $REPO --env production

echo "  Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "YOUR_PRODUCTION_SUPABASE_SERVICE_ROLE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY --repo $REPO --env production

# Clerk
echo "  Setting CLERK_PUBLISHABLE_KEY..."
echo "YOUR_PRODUCTION_CLERK_PUBLISHABLE_KEY" | gh secret set CLERK_PUBLISHABLE_KEY --repo $REPO --env production

echo "  Setting CLERK_SECRET_KEY..."
echo "YOUR_PRODUCTION_CLERK_SECRET_KEY" | gh secret set CLERK_SECRET_KEY --repo $REPO --env production

echo "  Setting CLERK_JWKS_URL..."
echo "YOUR_PRODUCTION_CLERK_JWKS_URL" | gh secret set CLERK_JWKS_URL --repo $REPO --env production

# Stripe (LIVE)
echo "  Setting STRIPE_SECRET_KEY..."
echo "sk_live_YOUR_STRIPE_SECRET_KEY" | gh secret set STRIPE_SECRET_KEY --repo $REPO --env production

echo "  Setting STRIPE_PUBLISHABLE_KEY..."
echo "pk_live_YOUR_STRIPE_PUBLISHABLE_KEY" | gh secret set STRIPE_PUBLISHABLE_KEY --repo $REPO --env production

echo "  Setting STRIPE_WEBHOOK_SECRET..."
echo "whsec_YOUR_STRIPE_WEBHOOK_SECRET" | gh secret set STRIPE_WEBHOOK_SECRET --repo $REPO --env production

# Resend
echo "  Setting RESEND_API_KEY..."
echo "YOUR_RESEND_API_KEY" | gh secret set RESEND_API_KEY --repo $REPO --env production

# Internal
echo "  Setting INTERNAL_SERVICE_KEY..."
echo "YOUR_INTERNAL_SERVICE_KEY" | gh secret set INTERNAL_SERVICE_KEY --repo $REPO --env production

# ============================================================================
# STAGING SECRETS
# ============================================================================

echo -e "\n\033[32m=== Setting Staging Environment Secrets ===\033[0m"

# Azure/AKS
echo "  Setting AZURE_CREDENTIALS..."
cat << 'EOF' | gh secret set AZURE_CREDENTIALS --repo $REPO --env staging
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "subscriptionId": "YOUR_SUBSCRIPTION_ID",
  "tenantId": "YOUR_TENANT_ID"
}
EOF

echo "  Setting ACR_NAME..."
echo "splitsnetworkstaging" | gh secret set ACR_NAME --repo $REPO --env staging

echo "  Setting ACR_LOGIN_SERVER..."
echo "splitsnetworkstaging.azurecr.io" | gh secret set ACR_LOGIN_SERVER --repo $REPO --env staging

echo "  Setting AKS_RESOURCE_GROUP..."
echo "splits-staging-rg" | gh secret set AKS_RESOURCE_GROUP --repo $REPO --env staging

echo "  Setting AKS_CLUSTER_NAME..."
echo "splits-staging-aks" | gh secret set AKS_CLUSTER_NAME --repo $REPO --env staging

# Supabase
echo "  Setting SUPABASE_URL..."
echo "https://YOUR_STAGING_PROJECT.supabase.co" | gh secret set SUPABASE_URL --repo $REPO --env staging

echo "  Setting SUPABASE_ANON_KEY..."
echo "YOUR_STAGING_SUPABASE_ANON_KEY" | gh secret set SUPABASE_ANON_KEY --repo $REPO --env staging

echo "  Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "YOUR_STAGING_SUPABASE_SERVICE_ROLE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY --repo $REPO --env staging

# Clerk
echo "  Setting CLERK_PUBLISHABLE_KEY..."
echo "pk_test_YOUR_STAGING_CLERK_KEY" | gh secret set CLERK_PUBLISHABLE_KEY --repo $REPO --env staging

echo "  Setting CLERK_SECRET_KEY..."
echo "sk_test_YOUR_STAGING_CLERK_SECRET" | gh secret set CLERK_SECRET_KEY --repo $REPO --env staging

echo "  Setting CLERK_JWKS_URL..."
echo "https://YOUR_STAGING_CLERK/.well-known/jwks.json" | gh secret set CLERK_JWKS_URL --repo $REPO --env staging

# Stripe (TEST)
echo "  Setting STRIPE_SECRET_KEY..."
echo "sk_test_YOUR_STRIPE_TEST_SECRET_KEY" | gh secret set STRIPE_SECRET_KEY --repo $REPO --env staging

echo "  Setting STRIPE_PUBLISHABLE_KEY..."
echo "pk_test_YOUR_STRIPE_TEST_PUBLISHABLE_KEY" | gh secret set STRIPE_PUBLISHABLE_KEY --repo $REPO --env staging

echo "  Setting STRIPE_WEBHOOK_SECRET..."
echo "whsec_YOUR_STRIPE_TEST_WEBHOOK_SECRET" | gh secret set STRIPE_WEBHOOK_SECRET --repo $REPO --env staging

# Resend
echo "  Setting RESEND_API_KEY..."
echo "YOUR_RESEND_API_KEY" | gh secret set RESEND_API_KEY --repo $REPO --env staging

# Internal
echo "  Setting INTERNAL_SERVICE_KEY..."
echo "YOUR_STAGING_INTERNAL_SERVICE_KEY" | gh secret set INTERNAL_SERVICE_KEY --repo $REPO --env staging

echo -e "\n\033[32m✅ All secrets have been set!\033[0m"
echo ""
echo -e "\033[36mNext steps:\033[0m"
echo "1. Verify secrets in GitHub: Settings → Secrets and variables → Actions"
echo "2. Check that 'staging' and 'production' environments exist"
echo "3. Test with a deployment"
