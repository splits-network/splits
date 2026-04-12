#!/bin/bash
# ==============================================================================
# Cloud Run Deployment Script for Splits Network
#
# Deploys 28 backend services + 7 frontend apps to Google Cloud Run.
#
# Usage:
#   ./deploy.sh <ENV> [SERVICE_NAME] [--dry-run]
#
# Arguments:
#   ENV           Required. "staging" or "production".
#   SERVICE_NAME  Optional. Deploy only this service instead of all.
#   --dry-run     Optional. Print commands without executing.
#
# Examples:
#   ./deploy.sh production
#   ./deploy.sh staging api-gateway
#   ./deploy.sh production billing-service --dry-run
# ==============================================================================

set -euo pipefail

# ==============================================================================
# Color output
# ==============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[FAIL]${NC}  $*"; }
log_header()  { echo -e "\n${BOLD}============================================${NC}"; echo -e "${BOLD}  $*${NC}"; echo -e "${BOLD}============================================${NC}\n"; }

# ==============================================================================
# Parse arguments
# ==============================================================================
ENV="${1:?Usage: ./deploy.sh <staging|production> [SERVICE_NAME] [--dry-run]}"
SINGLE_SERVICE=""
DRY_RUN=false

shift
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            SINGLE_SERVICE="$1"
            shift
            ;;
    esac
done

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    log_error "ENV must be 'staging' or 'production'. Got: ${ENV}"
    exit 1
fi

# ==============================================================================
# Load environment config
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config/${ENV}.env"

if [[ ! -f "$CONFIG_FILE" ]]; then
    log_error "Config file not found: ${CONFIG_FILE}"
    exit 1
fi

log_info "Loading config from ${CONFIG_FILE}"
# shellcheck disable=SC1090
source "$CONFIG_FILE"

# Validate required config variables
: "${GCP_PROJECT:?GCP_PROJECT not set in config}"
: "${GCP_REGION:?GCP_REGION not set in config}"
: "${ARTIFACT_REGISTRY:?ARTIFACT_REGISTRY not set in config}"
: "${IMAGE_TAG:?IMAGE_TAG not set in config}"
: "${VPC_CONNECTOR:?VPC_CONNECTOR not set in config}"

log_info "Environment:       ${ENV}"
log_info "GCP Project:       ${GCP_PROJECT}"
log_info "Region:            ${GCP_REGION}"
log_info "Artifact Registry: ${ARTIFACT_REGISTRY}"
log_info "Image Tag:         ${IMAGE_TAG}"
if [[ -n "$SINGLE_SERVICE" ]]; then
    log_info "Single service:    ${SINGLE_SERVICE}"
fi
if [[ "$DRY_RUN" == "true" ]]; then
    log_warn "DRY RUN MODE -- no commands will be executed"
fi

# ==============================================================================
# Tracking arrays for summary
# ==============================================================================
DEPLOYED_SERVICES=()
SKIPPED_SERVICES=()
FAILED_SERVICES=()

# ==============================================================================
# Helper: check if a service is already running the target image
# ==============================================================================
is_up_to_date() {
    local name="$1"
    local target_image="${ARTIFACT_REGISTRY}/${name}:${IMAGE_TAG}"

    local current_image
    current_image=$(gcloud run services describe "$name" \
        --project="$GCP_PROJECT" \
        --region="$GCP_REGION" \
        --format='value(spec.template.spec.containers[0].image)' 2>/dev/null || echo "")

    [[ "$current_image" == "$target_image" ]]
}

# ==============================================================================
# Helper: get the URL of a deployed Cloud Run service
# ==============================================================================
get_service_url() {
    local name="$1"
    gcloud run services describe "$name" \
        --project="$GCP_PROJECT" \
        --region="$GCP_REGION" \
        --format='value(status.url)' 2>/dev/null || echo ""
}

# ==============================================================================
# Core deploy function
# ==============================================================================
# deploy_service NAME PORT CPU MEMORY MIN_INSTANCES MAX_INSTANCES INGRESS [extra gcloud flags...]
deploy_service() {
    local name="$1"
    local port="$2"
    local cpu="$3"
    local memory="$4"
    local min_instances="$5"
    local max_instances="$6"
    local ingress="$7"
    shift 7
    local extra_flags=("$@")

    local image="${ARTIFACT_REGISTRY}/${name}:${IMAGE_TAG}"

    # Skip if single-service mode and this is not the target
    if [[ -n "$SINGLE_SERVICE" && "$name" != "$SINGLE_SERVICE" ]]; then
        return 0
    fi

    log_info "Deploying ${name}..."

    # Check if already up to date
    if [[ "$DRY_RUN" == "false" ]] && is_up_to_date "$name"; then
        log_warn "Skipping ${name} -- already running image tag ${IMAGE_TAG}"
        SKIPPED_SERVICES+=("$name")
        return 0
    fi

    local cmd=(
        gcloud run deploy "$name"
        --project="$GCP_PROJECT"
        --region="$GCP_REGION"
        --image="$image"
        --port="$port"
        --cpu="$cpu"
        --memory="$memory"
        --min-instances="$min_instances"
        --max-instances="$max_instances"
        --ingress="$ingress"
        --set-env-vars="NODE_ENV=production,PORT=${port}"
        --quiet
    )

    # Append extra flags
    if [[ ${#extra_flags[@]} -gt 0 ]]; then
        cmd+=("${extra_flags[@]}")
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY RUN] ${cmd[*]}"
        DEPLOYED_SERVICES+=("$name")
        return 0
    fi

    if "${cmd[@]}"; then
        log_success "Deployed ${name}"
        DEPLOYED_SERVICES+=("$name")
    else
        log_error "Failed to deploy ${name}"
        FAILED_SERVICES+=("$name")
    fi
}

# ==============================================================================
# Secret flag builders
#
# Cloud Run uses --set-secrets=ENV_VAR=SECRET_NAME:VERSION format.
# All secrets reference "latest" version from GCP Secret Manager.
# ==============================================================================

# Base Supabase secrets shared by all backend services
supabase_secrets() {
    echo "SUPABASE_URL=supabase-url:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest"
}

# CloudAMQP (RabbitMQ) secret
amqp_secret() {
    echo "CLOUDAMQP_URL=cloudamqp-url:latest"
}

# Upstash Redis secret
redis_secret() {
    echo "UPSTASH_REDIS_URL=upstash-redis-url:latest"
}

# Clerk secrets (portal + candidate app)
clerk_secrets_full() {
    echo "SPLITS_CLERK_PUBLISHABLE_KEY=splits-clerk-publishable-key:latest,SPLITS_CLERK_SECRET_KEY=splits-clerk-secret-key:latest,SPLITS_CLERK_JWKS_URL=splits-clerk-jwks-url:latest,APP_CLERK_PUBLISHABLE_KEY=app-clerk-publishable-key:latest,APP_CLERK_SECRET_KEY=app-clerk-secret-key:latest,APP_CLERK_JWKS_URL=app-clerk-jwks-url:latest"
}

# Clerk secrets (portal + candidate, no JWKS -- for gateways that only need auth keys)
clerk_secrets_keys() {
    echo "SPLITS_CLERK_PUBLISHABLE_KEY=splits-clerk-publishable-key:latest,SPLITS_CLERK_SECRET_KEY=splits-clerk-secret-key:latest,APP_CLERK_PUBLISHABLE_KEY=app-clerk-publishable-key:latest,APP_CLERK_SECRET_KEY=app-clerk-secret-key:latest"
}

# Internal service key
internal_secret() {
    echo "INTERNAL_SERVICE_KEY=internal-service-key:latest"
}

# Build a --set-secrets flag from comma-separated secret mappings
build_secrets_flag() {
    local combined=""
    for part in "$@"; do
        if [[ -n "$combined" ]]; then
            combined="${combined},${part}"
        else
            combined="$part"
        fi
    done
    echo "--set-secrets=${combined}"
}

# ==============================================================================
# Service URL environment variable map (populated after backend deploys)
# ==============================================================================
declare -A SERVICE_URLS

capture_service_url() {
    local name="$1"
    local var_name="$2"
    if [[ "$DRY_RUN" == "true" ]]; then
        SERVICE_URLS["$var_name"]="https://${name}-PLACEHOLDER.run.app"
    else
        local url
        url=$(get_service_url "$name")
        if [[ -n "$url" ]]; then
            SERVICE_URLS["$var_name"]="$url"
            log_info "  ${var_name}=${url}"
        else
            log_warn "  Could not resolve URL for ${name}"
            SERVICE_URLS["$var_name"]=""
        fi
    fi
}

# ==============================================================================
# Phase 1: Deploy backend services
# ==============================================================================
log_header "Phase 1: Backend Services"

# --------------------------------------------------------------------------
# identity-service
# --------------------------------------------------------------------------
deploy_service identity-service 3001 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "CLERK_SECRET_KEY=splits-clerk-secret-key:latest,SPLITS_CLERK_WEBHOOK_SECRET=splits-clerk-webhook-secret:latest,APP_CLERK_WEBHOOK_SECRET=app-clerk-webhook-secret:latest")"

# --------------------------------------------------------------------------
# ats-service
# --------------------------------------------------------------------------
deploy_service ats-service 3002 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# network-service
# --------------------------------------------------------------------------
deploy_service network-service 3003 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# billing-service
# --------------------------------------------------------------------------
deploy_service billing-service 3004 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest")"

# --------------------------------------------------------------------------
# notification-service
# --------------------------------------------------------------------------
deploy_service notification-service 3005 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    --set-env-vars="^@^NODE_ENV=production@PORT=3005@PORTAL_URL=${PORTAL_URL}@CANDIDATE_URL=${CANDIDATE_URL}@FROM_EMAIL=${FROM_EMAIL}@RESEND_CANDIDATE_FROM_EMAIL=${RESEND_CANDIDATE_FROM_EMAIL}" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "RESEND_API_KEY=resend-api-key:latest,VAPID_PUBLIC_KEY=vapid-public-key:latest,VAPID_PRIVATE_KEY=vapid-private-key:latest")"

# --------------------------------------------------------------------------
# automation-service
# --------------------------------------------------------------------------
deploy_service automation-service 3007 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# document-service
# --------------------------------------------------------------------------
deploy_service document-service 3006 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "SUPABASE_S3_ENDPOINT=supabase-s3-endpoint:latest,SUPABASE_S3_ACCESS_KEY=supabase-s3-access-key:latest,SUPABASE_S3_SECRET_KEY=supabase-s3-secret-key:latest")"

# --------------------------------------------------------------------------
# document-processing-service
# --------------------------------------------------------------------------
deploy_service document-processing-service 3008 1 1Gi 1 5 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)" \
        "OPENAI_API_KEY=openai-api-key:latest,SUPABASE_S3_ENDPOINT=supabase-s3-endpoint:latest,SUPABASE_S3_ACCESS_KEY=supabase-s3-access-key:latest,SUPABASE_S3_SECRET_KEY=supabase-s3-secret-key:latest")"

# --------------------------------------------------------------------------
# ai-service
# --------------------------------------------------------------------------
deploy_service ai-service 3009 1 1Gi 1 5 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# analytics-service
# --------------------------------------------------------------------------
deploy_service analytics-service 3010 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# chat-service
# --------------------------------------------------------------------------
deploy_service chat-service 3011 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# health-monitor
# --------------------------------------------------------------------------
deploy_service health-monitor 3012 1 256Mi 1 2 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# search-service (no AMQP, no Redis)
# --------------------------------------------------------------------------
deploy_service search-service 3013 1 512Mi 1 3 internal \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)")"

# --------------------------------------------------------------------------
# gpt-service
# --------------------------------------------------------------------------
deploy_service gpt-service 3014 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    --set-env-vars="^@^NODE_ENV=production@PORT=3014@PUBLIC_BASE_URL=${PUBLIC_BASE_URL:-}@CANDIDATE_APP_URL=${CANDIDATE_APP_URL:-}@GPT_API_BASE_URL=${GPT_API_BASE_URL:-}" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(internal_secret)" \
        "OPENAI_API_KEY=openai-api-key:latest,GPT_CLIENT_ID=gpt-client-id:latest,GPT_CLIENT_SECRET=gpt-client-secret:latest,GPT_EC_PRIVATE_KEY=gpt-ec-private-key:latest,GPT_REDIRECT_URI=gpt-redirect-uri:latest,GPT_CLERK_WEBHOOK_SECRET=gpt-clerk-webhook-secret:latest")"

# --------------------------------------------------------------------------
# content-service
# --------------------------------------------------------------------------
deploy_service content-service 3015 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# integration-service
# --------------------------------------------------------------------------
deploy_service integration-service 3016 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,MICROSOFT_CLIENT_ID=microsoft-client-id:latest,MICROSOFT_CLIENT_SECRET=microsoft-client-secret:latest,LINKEDIN_CLIENT_ID=linkedin-client-id:latest,LINKEDIN_CLIENT_SECRET=linkedin-client-secret:latest")"

# --------------------------------------------------------------------------
# matching-service
# --------------------------------------------------------------------------
deploy_service matching-service 3017 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# gamification-service
# --------------------------------------------------------------------------
deploy_service gamification-service 3018 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# video-service
# --------------------------------------------------------------------------
deploy_service video-service 3019 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    --set-env-vars="^@^NODE_ENV=production@PORT=3019@LIVEKIT_URL=${LIVEKIT_URL:-}" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "LIVEKIT_API_KEY=livekit-api-key:latest,LIVEKIT_API_SECRET=livekit-api-secret:latest,SUPABASE_S3_ENDPOINT=supabase-s3-endpoint:latest,SUPABASE_S3_ACCESS_KEY=supabase-s3-access-key:latest,SUPABASE_S3_SECRET_KEY=supabase-s3-secret-key:latest")"

# --------------------------------------------------------------------------
# call-service
# --------------------------------------------------------------------------
deploy_service call-service 3020 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "LIVEKIT_API_KEY=livekit-api-key:latest,LIVEKIT_API_SECRET=livekit-api-secret:latest")"

# --------------------------------------------------------------------------
# support-service
# --------------------------------------------------------------------------
deploy_service support-service 3021 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)" \
        "$(redis_secret)")"

# --------------------------------------------------------------------------
# onboarding-service
# --------------------------------------------------------------------------
deploy_service onboarding-service 3023 1 512Mi 1 3 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# outbox-service
# --------------------------------------------------------------------------
deploy_service outbox-service 3013 1 512Mi 1 2 internal \
    --no-cpu-throttling \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(amqp_secret)")"

# --------------------------------------------------------------------------
# Internal gateways (not api-gateway -- that needs service URLs)
# --------------------------------------------------------------------------

# chat-gateway (WebSocket -- session affinity)
deploy_service chat-gateway 3020 1 512Mi 1 5 internal \
    --vpc-connector="$VPC_CONNECTOR" \
    --session-affinity \
    "$(build_secrets_flag \
        "$(clerk_secrets_full)" \
        "$(redis_secret)")"

# analytics-gateway
deploy_service analytics-gateway 3025 1 512Mi 1 3 internal \
    --vpc-connector="$VPC_CONNECTOR" \
    "$(build_secrets_flag \
        "$(redis_secret)")"

# support-gateway (WebSocket -- session affinity)
deploy_service support-gateway 3022 1 512Mi 1 3 internal \
    --vpc-connector="$VPC_CONNECTOR" \
    --session-affinity \
    "$(build_secrets_flag \
        "$(clerk_secrets_keys)" \
        "$(redis_secret)")"

# ==============================================================================
# Phase 2: Capture backend service URLs
# ==============================================================================
log_header "Phase 2: Resolve Service URLs"

capture_service_url identity-service            IDENTITY_SERVICE_URL
capture_service_url ats-service                 ATS_SERVICE_URL
capture_service_url network-service             NETWORK_SERVICE_URL
capture_service_url billing-service             BILLING_SERVICE_URL
capture_service_url notification-service        NOTIFICATION_SERVICE_URL
capture_service_url automation-service          AUTOMATION_SERVICE_URL
capture_service_url document-service            DOCUMENT_SERVICE_URL
capture_service_url document-processing-service DOCUMENT_PROCESSING_SERVICE_URL
capture_service_url ai-service                  AI_SERVICE_URL
capture_service_url analytics-service           ANALYTICS_SERVICE_URL
capture_service_url chat-service                CHAT_SERVICE_URL
capture_service_url chat-gateway                CHAT_GATEWAY_URL
capture_service_url health-monitor              HEALTH_MONITOR_SERVICE_URL
capture_service_url search-service              SEARCH_SERVICE_URL
capture_service_url gpt-service                 GPT_SERVICE_URL
capture_service_url content-service             CONTENT_SERVICE_URL
capture_service_url integration-service         INTEGRATION_SERVICE_URL
capture_service_url matching-service            MATCHING_SERVICE_URL
capture_service_url gamification-service        GAMIFICATION_SERVICE_URL
capture_service_url video-service               VIDEO_SERVICE_URL
capture_service_url call-service                CALL_SERVICE_URL
capture_service_url support-service             SUPPORT_SERVICE_URL
capture_service_url onboarding-service          ONBOARDING_SERVICE_URL

# Build the service URL env vars string for the api-gateway
SERVICE_URL_ENVS=""
for var_name in "${!SERVICE_URLS[@]}"; do
    if [[ -n "${SERVICE_URLS[$var_name]}" ]]; then
        if [[ -n "$SERVICE_URL_ENVS" ]]; then
            SERVICE_URL_ENVS="${SERVICE_URL_ENVS}@${var_name}=${SERVICE_URLS[$var_name]}"
        else
            SERVICE_URL_ENVS="${var_name}=${SERVICE_URLS[$var_name]}"
        fi
    fi
done

# ==============================================================================
# Phase 3: Deploy api-gateway (needs all service URLs)
# ==============================================================================
log_header "Phase 3: API Gateway"

deploy_service api-gateway 3000 1 1Gi 1 10 all \
    --vpc-connector="$VPC_CONNECTOR" \
    --allow-unauthenticated \
    --set-env-vars="^@^NODE_ENV=production@PORT=3000@CORS_ORIGIN=${CORS_ORIGIN:-}@${SERVICE_URL_ENVS}" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "$(clerk_secrets_full)" \
        "$(redis_secret)")"

# ==============================================================================
# Phase 4: Deploy admin-gateway (needs service URLs)
# ==============================================================================
log_header "Phase 4: Admin Gateway"

# Build admin gateway service URL env vars (subset of all services)
ADMIN_GW_ENVS="NODE_ENV=production"
ADMIN_GW_ENVS="${ADMIN_GW_ENVS}@PORT=3030"
ADMIN_GW_ENVS="${ADMIN_GW_ENVS}@CORS_ORIGIN=${ADMIN_CORS_ORIGIN:-}"
for var_name in IDENTITY_SERVICE_URL ATS_SERVICE_URL NETWORK_SERVICE_URL BILLING_SERVICE_URL \
    NOTIFICATION_SERVICE_URL DOCUMENT_SERVICE_URL AUTOMATION_SERVICE_URL \
    DOCUMENT_PROCESSING_SERVICE_URL AI_SERVICE_URL ANALYTICS_SERVICE_URL \
    CONTENT_SERVICE_URL INTEGRATION_SERVICE_URL MATCHING_SERVICE_URL SUPPORT_SERVICE_URL; do
    if [[ -n "${SERVICE_URLS[$var_name]:-}" ]]; then
        ADMIN_GW_ENVS="${ADMIN_GW_ENVS}@${var_name}=${SERVICE_URLS[$var_name]}"
    fi
done

deploy_service admin-gateway 3030 1 512Mi 1 3 all \
    --vpc-connector="$VPC_CONNECTOR" \
    --allow-unauthenticated \
    --set-env-vars="^@^${ADMIN_GW_ENVS}" \
    "$(build_secrets_flag \
        "$(supabase_secrets)" \
        "ADMIN_CLERK_SECRET_KEY=admin-clerk-secret-key:latest" \
        "$(redis_secret)")"

# Also update chat-gateway with resolved service URLs
if [[ -z "$SINGLE_SERVICE" || "$SINGLE_SERVICE" == "chat-gateway" ]]; then
    log_info "Updating chat-gateway with resolved service URLs..."
    CHAT_GW_ENVS="NODE_ENV=production@PORT=3020@CORS_ORIGIN=${CORS_ORIGIN:-}"
    for var_name in IDENTITY_SERVICE_URL CHAT_SERVICE_URL; do
        if [[ -n "${SERVICE_URLS[$var_name]:-}" ]]; then
            CHAT_GW_ENVS="${CHAT_GW_ENVS}@${var_name}=${SERVICE_URLS[$var_name]}"
        fi
    done

    if [[ "$DRY_RUN" == "false" ]]; then
        gcloud run services update chat-gateway \
            --project="$GCP_PROJECT" \
            --region="$GCP_REGION" \
            --set-env-vars="^@^${CHAT_GW_ENVS}" \
            --quiet || log_warn "Could not update chat-gateway env vars"
    else
        echo "  [DRY RUN] gcloud run services update chat-gateway --set-env-vars=..."
    fi
fi

# ==============================================================================
# Phase 5: Deploy frontend apps
# ==============================================================================
log_header "Phase 5: Frontend Apps"

# portal
deploy_service portal 3100 1 512Mi 0 5 all \
    --allow-unauthenticated \
    --cpu-throttling

# candidate
deploy_service candidate 3101 1 512Mi 0 5 all \
    --allow-unauthenticated \
    --cpu-throttling

# corporate
deploy_service corporate 3102 1 512Mi 0 3 all \
    --allow-unauthenticated \
    --cpu-throttling

# admin
deploy_service admin 3200 1 512Mi 0 3 all \
    --allow-unauthenticated \
    --cpu-throttling

# status
deploy_service status 3103 1 256Mi 0 2 all \
    --allow-unauthenticated \
    --cpu-throttling

# video
deploy_service video 3104 1 512Mi 0 3 all \
    --allow-unauthenticated \
    --cpu-throttling

# ==============================================================================
# Phase 6: Summary
# ==============================================================================
log_header "Deployment Summary"

echo -e "  Environment: ${BOLD}${ENV}${NC}"
echo -e "  Image Tag:   ${BOLD}${IMAGE_TAG}${NC}"
echo ""

if [[ ${#DEPLOYED_SERVICES[@]} -gt 0 ]]; then
    echo -e "  ${GREEN}Deployed (${#DEPLOYED_SERVICES[@]}):${NC}"
    for svc in "${DEPLOYED_SERVICES[@]}"; do
        svc_url=$(get_service_url "$svc" 2>/dev/null || echo "")
        if [[ -n "$svc_url" && "$DRY_RUN" == "false" ]]; then
            echo -e "    ${GREEN}+${NC} ${svc}  ${CYAN}${svc_url}${NC}"
        else
            echo -e "    ${GREEN}+${NC} ${svc}"
        fi
    done
    echo ""
fi

if [[ ${#SKIPPED_SERVICES[@]} -gt 0 ]]; then
    echo -e "  ${YELLOW}Skipped -- up to date (${#SKIPPED_SERVICES[@]}):${NC}"
    for svc in "${SKIPPED_SERVICES[@]}"; do
        echo -e "    ${YELLOW}-${NC} ${svc}"
    done
    echo ""
fi

if [[ ${#FAILED_SERVICES[@]} -gt 0 ]]; then
    echo -e "  ${RED}Failed (${#FAILED_SERVICES[@]}):${NC}"
    for svc in "${FAILED_SERVICES[@]}"; do
        echo -e "    ${RED}x${NC} ${svc}"
    done
    echo ""
    log_error "Deployment completed with ${#FAILED_SERVICES[@]} failure(s)."
    exit 1
fi

if [[ ${#DEPLOYED_SERVICES[@]} -eq 0 && ${#SKIPPED_SERVICES[@]} -eq 0 ]]; then
    log_warn "No services were deployed. Check your SINGLE_SERVICE filter."
else
    log_success "Deployment completed successfully."
fi
