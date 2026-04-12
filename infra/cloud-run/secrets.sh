#!/bin/bash
# ==============================================================================
# GCP Secret Manager Setup for Splits Network
#
# Creates all required secrets in Google Cloud Secret Manager and grants the
# default Compute Engine service account access to read them. Each secret value
# is prompted interactively (hidden input for sensitive values).
#
# Usage:
#   ./secrets.sh <PROJECT_ID> [--skip-existing]
#
# Options:
#   --skip-existing   Skip secrets that already exist instead of prompting to
#                     update them.
#
# Example:
#   ./secrets.sh splits-network-prod
#   ./secrets.sh splits-network-prod --skip-existing
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Arguments and flags
# ------------------------------------------------------------------------------
PROJECT_ID=""
SKIP_EXISTING=false

for arg in "$@"; do
    case "${arg}" in
        --skip-existing)
            SKIP_EXISTING=true
            ;;
        -*)
            echo "Unknown flag: ${arg}"
            echo "Usage: ./secrets.sh <PROJECT_ID> [--skip-existing]"
            exit 1
            ;;
        *)
            if [ -z "${PROJECT_ID}" ]; then
                PROJECT_ID="${arg}"
            else
                echo "Unexpected argument: ${arg}"
                echo "Usage: ./secrets.sh <PROJECT_ID> [--skip-existing]"
                exit 1
            fi
            ;;
    esac
done

if [ -z "${PROJECT_ID}" ]; then
    echo "Usage: ./secrets.sh <PROJECT_ID> [--skip-existing]"
    exit 1
fi

echo "============================================"
echo "  Splits Network -- Secret Manager Setup"
echo "============================================"
echo ""
echo "  Project:        ${PROJECT_ID}"
echo "  Skip existing:  ${SKIP_EXISTING}"
echo ""

# ------------------------------------------------------------------------------
# Resolve the default Compute Engine service account
# ------------------------------------------------------------------------------
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "  Service account: ${SERVICE_ACCOUNT}"
echo ""

# ------------------------------------------------------------------------------
# Counters
# ------------------------------------------------------------------------------
CREATED=0
UPDATED=0
SKIPPED=0

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

# Check if a secret already exists in Secret Manager.
secret_exists() {
    local name="$1"
    gcloud secrets describe "${name}" \
        --project="${PROJECT_ID}" \
        --format="value(name)" 2>/dev/null && return 0 || return 1
}

# Prompt the user for a secret value (hidden input).
prompt_secret_value() {
    local name="$1"
    local value=""
    while [ -z "${value}" ]; do
        read -rsp "  Enter value for '${name}': " value
        echo ""
        if [ -z "${value}" ]; then
            echo "  Value cannot be empty. Please try again."
        fi
    done
    echo "${value}"
}

# Create or update a single secret. Prompts for the value interactively.
# If the secret already exists and --skip-existing is set, it will be skipped.
# If the secret already exists and --skip-existing is NOT set, a new version
# will be added with the prompted value.
create_or_update_secret() {
    local name="$1"
    local description="${2:-}"

    if [ -n "${description}" ]; then
        echo "[secret] ${name} -- ${description}"
    else
        echo "[secret] ${name}"
    fi

    if secret_exists "${name}"; then
        if [ "${SKIP_EXISTING}" = true ]; then
            echo "  -> Already exists. Skipping (--skip-existing)."
            SKIPPED=$((SKIPPED + 1))
            return 0
        fi
        echo "  -> Already exists. Will add a new version."
        local value
        value=$(prompt_secret_value "${name}")
        printf '%s' "${value}" | gcloud secrets versions add "${name}" \
            --project="${PROJECT_ID}" \
            --data-file=- \
            --quiet
        echo "  -> Secret '${name}' updated with new version."
        UPDATED=$((UPDATED + 1))
    else
        local value
        value=$(prompt_secret_value "${name}")
        printf '%s' "${value}" | gcloud secrets create "${name}" \
            --project="${PROJECT_ID}" \
            --data-file=- \
            --replication-policy="automatic" \
            --quiet
        echo "  -> Secret '${name}' created."
        CREATED=$((CREATED + 1))

        # Grant the default compute service account access to read this secret.
        grant_secret_access "${name}"
    fi
}

# Grant secretAccessor role to the default compute service account.
grant_secret_access() {
    local name="$1"
    gcloud secrets add-iam-policy-binding "${name}" \
        --project="${PROJECT_ID}" \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet > /dev/null 2>&1
    echo "  -> Granted access to ${SERVICE_ACCOUNT}."
}

# Process a group of secrets with a section header.
process_secret_group() {
    local group_name="$1"
    shift
    echo ""
    echo "----------------------------------------------"
    echo "${group_name}"
    echo "----------------------------------------------"
}

# ==============================================================================
# Secret definitions
# ==============================================================================

# --- Supabase -----------------------------------------------------------------
process_secret_group "Supabase"
create_or_update_secret "supabase-url"              "Supabase project URL"
create_or_update_secret "supabase-anon-key"         "Supabase anonymous/public key"
create_or_update_secret "supabase-service-role-key" "Supabase service role key (admin)"

# --- Supabase S3 Storage -----------------------------------------------------
process_secret_group "Supabase S3 Storage"
create_or_update_secret "supabase-s3-endpoint"   "S3-compatible storage endpoint"
create_or_update_secret "supabase-s3-access-key" "S3 access key ID"
create_or_update_secret "supabase-s3-secret-key" "S3 secret access key"

# --- Clerk (Portal / splits.network) -----------------------------------------
process_secret_group "Clerk -- Portal (splits.network)"
create_or_update_secret "splits-clerk-publishable-key" "Portal Clerk publishable key"
create_or_update_secret "splits-clerk-secret-key"      "Portal Clerk secret key"
create_or_update_secret "splits-clerk-jwks-url"        "Portal Clerk JWKS URL"
create_or_update_secret "splits-clerk-webhook-secret"  "Portal Clerk webhook signing secret"

# --- Clerk (Candidate / applicant.network) ------------------------------------
process_secret_group "Clerk -- Candidate (applicant.network)"
create_or_update_secret "app-clerk-publishable-key" "Candidate app Clerk publishable key"
create_or_update_secret "app-clerk-secret-key"      "Candidate app Clerk secret key"
create_or_update_secret "app-clerk-jwks-url"        "Candidate app Clerk JWKS URL"
create_or_update_secret "app-clerk-webhook-secret"  "Candidate app Clerk webhook signing secret"

# --- Clerk (Admin) ------------------------------------------------------------
process_secret_group "Clerk -- Admin"
create_or_update_secret "admin-clerk-publishable-key" "Admin Clerk publishable key"
create_or_update_secret "admin-clerk-secret-key"      "Admin Clerk secret key"

# --- Stripe -------------------------------------------------------------------
process_secret_group "Stripe"
create_or_update_secret "stripe-secret-key"      "Stripe secret API key"
create_or_update_secret "stripe-webhook-secret"  "Stripe webhook signing secret"
create_or_update_secret "stripe-publishable-key" "Stripe publishable key"

# --- Resend -------------------------------------------------------------------
process_secret_group "Resend"
create_or_update_secret "resend-api-key" "Resend transactional email API key"

# --- OpenAI -------------------------------------------------------------------
process_secret_group "OpenAI"
create_or_update_secret "openai-api-key" "OpenAI API key"

# --- Internal Service Key -----------------------------------------------------
process_secret_group "Internal Service Key"
create_or_update_secret "internal-service-key" "Shared key for service-to-service auth"

# --- GPT Custom Action (OAuth) ------------------------------------------------
process_secret_group "GPT Custom Action (OAuth)"
create_or_update_secret "gpt-client-id"        "GPT OAuth client ID"
create_or_update_secret "gpt-client-secret"     "GPT OAuth client secret"
create_or_update_secret "gpt-ec-private-key"    "GPT EC private key (PEM)"
create_or_update_secret "gpt-redirect-uri"      "GPT OAuth redirect URI"
create_or_update_secret "gpt-clerk-webhook-secret" "GPT Clerk webhook signing secret"

# --- Google OAuth -------------------------------------------------------------
process_secret_group "Google OAuth"
create_or_update_secret "google-client-id"     "Google OAuth client ID"
create_or_update_secret "google-client-secret"  "Google OAuth client secret"

# --- Microsoft OAuth ----------------------------------------------------------
process_secret_group "Microsoft OAuth"
create_or_update_secret "microsoft-client-id"     "Microsoft OAuth client ID"
create_or_update_secret "microsoft-client-secret"  "Microsoft OAuth client secret"

# --- LinkedIn OAuth -----------------------------------------------------------
process_secret_group "LinkedIn OAuth"
create_or_update_secret "linkedin-client-id"     "LinkedIn OAuth client ID"
create_or_update_secret "linkedin-client-secret"  "LinkedIn OAuth client secret"

# --- LiveKit ------------------------------------------------------------------
process_secret_group "LiveKit"
create_or_update_secret "livekit-api-key"    "LiveKit API key"
create_or_update_secret "livekit-api-secret" "LiveKit API secret"

# --- CloudAMQP (RabbitMQ) ----------------------------------------------------
process_secret_group "CloudAMQP (RabbitMQ)"
create_or_update_secret "cloudamqp-url" "CloudAMQP Elegant Ermine connection URL (amqps://...)"

# --- Upstash Redis ------------------------------------------------------------
process_secret_group "Upstash Redis"
create_or_update_secret "upstash-redis-url" "Upstash Redis URL with TLS (rediss://...)"

# --- Web Push (VAPID) ---------------------------------------------------------
process_secret_group "Web Push (VAPID)"
create_or_update_secret "vapid-public-key"  "VAPID public key for web push"
create_or_update_secret "vapid-private-key" "VAPID private key for web push"

# --- Sentry -------------------------------------------------------------------
process_secret_group "Sentry"
create_or_update_secret "sentry-dsn" "Sentry DSN for error reporting"

# ==============================================================================
# Grant access to all existing secrets (catch any that were created previously
# but may not have the IAM binding)
# ==============================================================================
echo ""
echo "----------------------------------------------"
echo "Ensuring IAM bindings for all secrets"
echo "----------------------------------------------"

ALL_SECRETS=$(gcloud secrets list \
    --project="${PROJECT_ID}" \
    --format="value(name)" 2>/dev/null)

if [ -n "${ALL_SECRETS}" ]; then
    while IFS= read -r secret_name; do
        echo "  Granting access: ${secret_name}..."
        gcloud secrets add-iam-policy-binding "${secret_name}" \
            --project="${PROJECT_ID}" \
            --member="serviceAccount:${SERVICE_ACCOUNT}" \
            --role="roles/secretmanager.secretAccessor" \
            --quiet > /dev/null 2>&1 || echo "    WARNING: Could not bind IAM for ${secret_name}"
    done <<< "${ALL_SECRETS}"
    echo "  -> IAM bindings verified for all secrets."
else
    echo "  No secrets found -- nothing to bind."
fi

# ==============================================================================
# Summary
# ==============================================================================
echo ""
echo "============================================"
echo "  Secret Manager setup complete."
echo "============================================"
echo ""
echo "  Created:  ${CREATED}"
echo "  Updated:  ${UPDATED}"
echo "  Skipped:  ${SKIPPED}"
echo ""
echo "  Service account with access:"
echo "    ${SERVICE_ACCOUNT}"
echo ""
echo "To verify, run:"
echo "  gcloud secrets list --project=${PROJECT_ID}"
echo ""
