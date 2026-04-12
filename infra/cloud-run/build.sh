#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# build.sh -- Build and push Docker images to GCP Artifact Registry
#
# Usage:
#   ./build.sh <ENV> [SERVICE_FILTER] [FLAGS]
#
# Arguments:
#   ENV              Required. "staging" or "production".
#   SERVICE_FILTER   Optional. Name of a single service/app to build.
#
# Flags:
#   --local          Build locally with docker build + docker push (default).
#   --cloud          Build remotely with gcloud builds submit.
#   --parallel       Run builds in parallel (local mode only).
#   --dry-run        Print what would be built without executing.
#   --help           Show this help message.
#
# Examples:
#   ./build.sh staging                        # Build all images for staging
#   ./build.sh production portal              # Build only portal for production
#   ./build.sh staging --cloud                # Build all via Cloud Build
#   ./build.sh staging --local --parallel     # Build all locally in parallel
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "${SCRIPT_DIR}/../../" && pwd)"

# ---- Defaults ------------------------------------------------------------

BUILD_MODE="local"
PARALLEL=false
DRY_RUN=false
SERVICE_FILTER=""
ENV=""

# ---- Color helpers --------------------------------------------------------

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_header()  { echo -e "\n${BOLD}=== $* ===${NC}"; }

# ---- Usage ----------------------------------------------------------------

usage() {
    sed -n '/^# Usage:/,/^# ----/{ /^# ----/d; s/^# \?//; p }' "$0"
    exit 0
}

# ---- Parse arguments ------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case "$1" in
        --local)    BUILD_MODE="local";  shift ;;
        --cloud)    BUILD_MODE="cloud";  shift ;;
        --parallel) PARALLEL=true;       shift ;;
        --dry-run)  DRY_RUN=true;        shift ;;
        --help|-h)  usage ;;
        -*)
            log_error "Unknown flag: $1"
            usage
            ;;
        *)
            if [[ -z "$ENV" ]]; then
                ENV="$1"
            elif [[ -z "$SERVICE_FILTER" ]]; then
                SERVICE_FILTER="$1"
            else
                log_error "Unexpected argument: $1"
                usage
            fi
            shift
            ;;
    esac
done

# ---- Validate environment -------------------------------------------------

if [[ -z "$ENV" ]]; then
    log_error "ENV argument is required (staging|production)."
    usage
fi

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    log_error "ENV must be 'staging' or 'production'. Got: '$ENV'"
    exit 1
fi

# ---- Load environment config ----------------------------------------------

CONFIG_FILE="${SCRIPT_DIR}/config/${ENV}.env"

if [[ ! -f "$CONFIG_FILE" ]]; then
    log_error "Config file not found: ${CONFIG_FILE}"
    log_error "Create it with at least ARTIFACT_REGISTRY and GCP_PROJECT_ID."
    exit 1
fi

log_info "Loading config from ${CONFIG_FILE}"
# shellcheck disable=SC1090
source "$CONFIG_FILE"

# Validate required config variables
for var in ARTIFACT_REGISTRY GCP_PROJECT_ID; do
    if [[ -z "${!var:-}" ]]; then
        log_error "Required variable ${var} is not set in ${CONFIG_FILE}"
        exit 1
    fi
done

# ---- Resolve image tag ----------------------------------------------------

IMAGE_TAG="${IMAGE_TAG:-$(git -C "$MONOREPO_ROOT" rev-parse --short=12 HEAD 2>/dev/null || echo "unknown")}"
VERSION="$(cat "${MONOREPO_ROOT}/VERSION" 2>/dev/null || echo "0.0.0")"

log_info "Environment:       ${ENV}"
log_info "Build mode:        ${BUILD_MODE}"
log_info "Parallel:          ${PARALLEL}"
log_info "Artifact Registry: ${ARTIFACT_REGISTRY}"
log_info "Image tag:         ${IMAGE_TAG}"
log_info "Version:           v${VERSION}"
log_info "Monorepo root:     ${MONOREPO_ROOT}"

# ---- Service definitions --------------------------------------------------

BACKEND_SERVICES=(
    api-gateway
    admin-gateway
    identity-service
    ats-service
    network-service
    billing-service
    notification-service
    automation-service
    document-service
    ai-service
    document-processing-service
    analytics-service
    chat-gateway
    analytics-gateway
    chat-service
    matching-service
    search-service
    gpt-service
    content-service
    integration-service
    health-monitor
    gamification-service
    video-service
    call-service
    support-service
    support-gateway
    onboarding-service
    outbox-service
)

FRONTEND_APPS=(
    portal
    candidate
    corporate
    admin
    status
    video
)

# ---- Build-arg resolver for frontend apps ---------------------------------

# Returns a newline-separated list of --build-arg flags for the given app.
# All NEXT_PUBLIC_* values come from the sourced config/${ENV}.env file.
get_frontend_build_args() {
    local app="$1"
    local args=()

    case "$app" in
        portal)
            args=(
                "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-}"
                "NEXT_PUBLIC_CHAT_GATEWAY_URL=${NEXT_PUBLIC_CHAT_GATEWAY_URL:-}"
                "NEXT_PUBLIC_ANALYTICS_GATEWAY_URL=${NEXT_PUBLIC_ANALYTICS_GATEWAY_URL:-}"
                "NEXT_PUBLIC_SUPPORT_GATEWAY_URL=${NEXT_PUBLIC_SUPPORT_GATEWAY_URL:-}"
                "NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL:-}"
                "NEXT_PUBLIC_CANDIDATE_APP_URL=${NEXT_PUBLIC_CANDIDATE_APP_URL:-}"
                "NEXT_PUBLIC_VIDEO_APP_URL=${NEXT_PUBLIC_VIDEO_APP_URL:-}"
                "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_PORTAL_CLERK_PUBLISHABLE_KEY:-}"
                "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"
                "SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}"
            )
            ;;
        candidate)
            args=(
                "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-}"
                "NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL:-}"
                "NEXT_PUBLIC_CHAT_GATEWAY_URL=${NEXT_PUBLIC_CHAT_GATEWAY_URL:-}"
                "NEXT_PUBLIC_ANALYTICS_GATEWAY_URL=${NEXT_PUBLIC_ANALYTICS_GATEWAY_URL:-}"
                "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_CANDIDATE_APP_URL:-}"
                "NEXT_PUBLIC_VIDEO_APP_URL=${NEXT_PUBLIC_VIDEO_APP_URL:-}"
                "NEXT_PUBLIC_SUPPORT_GATEWAY_URL=${NEXT_PUBLIC_SUPPORT_GATEWAY_URL:-}"
                "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CANDIDATE_CLERK_PUBLISHABLE_KEY:-}"
                "SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}"
            )
            ;;
        corporate)
            args=(
                "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_CORPORATE_APP_URL:-}"
                "NEXT_PUBLIC_SUPPORT_GATEWAY_URL=${NEXT_PUBLIC_SUPPORT_GATEWAY_URL:-}"
                "NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL:-}"
            )
            ;;
        admin)
            args=(
                "NEXT_PUBLIC_ADMIN_GATEWAY_URL=${NEXT_PUBLIC_ADMIN_GATEWAY_URL:-}"
                "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_ADMIN_CLERK_PUBLISHABLE_KEY:-}"
            )
            ;;
        status)
            args=(
                "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_STATUS_APP_URL:-}"
                "NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL:-}"
            )
            ;;
        video)
            args=(
                "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-}"
                "NEXT_PUBLIC_LIVEKIT_URL=${NEXT_PUBLIC_LIVEKIT_URL:-}"
                "SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}"
            )
            ;;
        *)
            log_warn "No build args defined for frontend app: ${app}"
            ;;
    esac

    for arg in "${args[@]}"; do
        echo "--build-arg ${arg}"
    done
}

# ---- Resolve Dockerfile path for a service --------------------------------

get_dockerfile_path() {
    local name="$1"
    local dockerfile=""

    # Check if it is a frontend app
    for app in "${FRONTEND_APPS[@]}"; do
        if [[ "$name" == "$app" ]]; then
            dockerfile="apps/${name}/Dockerfile"
            echo "$dockerfile"
            return 0
        fi
    done

    # Otherwise it is a backend service
    dockerfile="services/${name}/Dockerfile"
    echo "$dockerfile"
    return 0
}

# ---- Check if a service is a frontend app ---------------------------------

is_frontend_app() {
    local name="$1"
    for app in "${FRONTEND_APPS[@]}"; do
        if [[ "$name" == "$app" ]]; then
            return 0
        fi
    done
    return 1
}

# ---- Build a single service -----------------------------------------------

BUILD_FAILURES=()
BUILD_COUNT=0
BUILD_SUCCESS=0

build_service() {
    local name="$1"
    local dockerfile
    dockerfile="$(get_dockerfile_path "$name")"
    local full_dockerfile="${MONOREPO_ROOT}/${dockerfile}"
    local full_image="${ARTIFACT_REGISTRY}/${name}"

    # Validate Dockerfile exists
    if [[ ! -f "$full_dockerfile" ]]; then
        log_error "Dockerfile not found: ${full_dockerfile}"
        BUILD_FAILURES+=("$name")
        return 1
    fi

    local sha_tag="${full_image}:${IMAGE_TAG}"
    local version_tag="${full_image}:v${VERSION}"
    local env_latest_tag="${full_image}:${ENV}-latest"

    log_header "Building ${name}"
    log_info "Dockerfile: ${dockerfile}"
    log_info "Tags:       ${sha_tag}"
    log_info "            ${version_tag}"
    log_info "            ${env_latest_tag}"

    # Collect build args
    local build_args=()
    if is_frontend_app "$name"; then
        while IFS= read -r line; do
            [[ -n "$line" ]] && build_args+=($line)
        done < <(get_frontend_build_args "$name")

        if [[ ${#build_args[@]} -gt 0 ]]; then
            log_info "Build args: ${#build_args[@]} NEXT_PUBLIC_* variables"
        fi
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Would build: ${name}"
        return 0
    fi

    if [[ "$BUILD_MODE" == "local" ]]; then
        build_local "$name" "$dockerfile" "$sha_tag" "$version_tag" "$env_latest_tag" "${build_args[@]}"
    else
        build_cloud "$name" "$dockerfile" "$sha_tag" "$version_tag" "$env_latest_tag" "${build_args[@]}"
    fi
}

# ---- Local docker build + push --------------------------------------------

build_local() {
    local name="$1"
    local dockerfile="$2"
    local sha_tag="$3"
    local version_tag="$4"
    local env_latest_tag="$5"
    shift 5
    local build_args=("$@")

    local start_time
    start_time=$(date +%s)

    # Build
    if ! docker build \
        --platform linux/amd64 \
        -f "${MONOREPO_ROOT}/${dockerfile}" \
        -t "$sha_tag" \
        --target production \
        "${build_args[@]}" \
        "$MONOREPO_ROOT"; then
        log_error "Build failed: ${name}"
        BUILD_FAILURES+=("$name")
        return 1
    fi

    # Tag
    docker tag "$sha_tag" "$version_tag"
    docker tag "$sha_tag" "$env_latest_tag"

    # Push all tags
    log_info "Pushing ${name} (3 tags)..."
    docker push "$sha_tag"
    docker push "$version_tag"
    docker push "$env_latest_tag"

    local end_time
    end_time=$(date +%s)
    local elapsed=$(( end_time - start_time ))

    log_success "${name} built and pushed in ${elapsed}s"
    (( BUILD_SUCCESS++ )) || true
}

# ---- Cloud Build -----------------------------------------------------------

build_cloud() {
    local name="$1"
    local dockerfile="$2"
    local sha_tag="$3"
    local version_tag="$4"
    local env_latest_tag="$5"
    shift 5
    local build_args=("$@")

    local start_time
    start_time=$(date +%s)

    # Assemble --build-arg flags into substitutions for Cloud Build
    local substitutions="_DOCKERFILE=${dockerfile}"
    substitutions+=",_SHA_TAG=${sha_tag}"
    substitutions+=",_VERSION_TAG=${version_tag}"
    substitutions+=",_ENV_LATEST_TAG=${env_latest_tag}"

    # Build the gcloud builds submit command
    local cmd=(
        gcloud builds submit
        --project "$GCP_PROJECT_ID"
        --region "${GCP_REGION:-us-central1}"
        --tag "$sha_tag"
        --timeout "1800s"
        --machine-type "E2_HIGHCPU_8"
    )

    # For Cloud Build we generate an inline cloudbuild.yaml to handle
    # multi-tag + build args, since --tag does not support build args.
    local cloudbuild_file
    cloudbuild_file="$(mktemp /tmp/cloudbuild-${name}-XXXXXX.yaml)"

    # Build the docker build step args
    local docker_args=("build" "--platform" "linux/amd64" "-f" "$dockerfile" "-t" "$sha_tag" "--target" "production")
    for arg in "${build_args[@]}"; do
        docker_args+=("$arg")
    done
    docker_args+=(".")

    cat > "$cloudbuild_file" <<YAML
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: [$(printf "'%s', " "${docker_args[@]}" | sed 's/, $//')]
images:
  - '${sha_tag}'
tags:
  - '${name}'
  - '${ENV}'
timeout: 1800s
options:
  machineType: 'E2_HIGHCPU_8'
YAML

    if ! gcloud builds submit \
        --project "$GCP_PROJECT_ID" \
        --region "${GCP_REGION:-us-central1}" \
        --config "$cloudbuild_file" \
        --timeout "1800s" \
        "$MONOREPO_ROOT"; then
        log_error "Cloud Build failed: ${name}"
        rm -f "$cloudbuild_file"
        BUILD_FAILURES+=("$name")
        return 1
    fi

    rm -f "$cloudbuild_file"

    # Tag additional tags via docker (images are in registry after Cloud Build)
    log_info "Adding version and latest tags for ${name}..."
    gcloud artifacts docker tags add "$sha_tag" "$version_tag" --quiet 2>/dev/null || \
        log_warn "Could not add version tag (may require manual tagging)"
    gcloud artifacts docker tags add "$sha_tag" "$env_latest_tag" --quiet 2>/dev/null || \
        log_warn "Could not add env-latest tag (may require manual tagging)"

    local end_time
    end_time=$(date +%s)
    local elapsed=$(( end_time - start_time ))

    log_success "${name} built and pushed via Cloud Build in ${elapsed}s"
    (( BUILD_SUCCESS++ )) || true
}

# ---- Collect services to build --------------------------------------------

SERVICES_TO_BUILD=()

if [[ -n "$SERVICE_FILTER" ]]; then
    # Validate the filter matches a known service
    found=false
    for svc in "${BACKEND_SERVICES[@]}" "${FRONTEND_APPS[@]}"; do
        if [[ "$svc" == "$SERVICE_FILTER" ]]; then
            found=true
            break
        fi
    done
    if [[ "$found" == false ]]; then
        log_error "Unknown service: '${SERVICE_FILTER}'"
        log_error "Valid services: ${BACKEND_SERVICES[*]} ${FRONTEND_APPS[*]}"
        exit 1
    fi
    SERVICES_TO_BUILD=("$SERVICE_FILTER")
else
    SERVICES_TO_BUILD=("${BACKEND_SERVICES[@]}" "${FRONTEND_APPS[@]}")
fi

TOTAL=${#SERVICES_TO_BUILD[@]}
log_header "Building ${TOTAL} service(s) for ${ENV}"

# ---- Authenticate to registry ---------------------------------------------

if [[ "$DRY_RUN" == false ]]; then
    if [[ "$BUILD_MODE" == "local" ]]; then
        log_info "Authenticating Docker to Artifact Registry..."
        if ! gcloud auth configure-docker "${ARTIFACT_REGISTRY%%/*}" --quiet 2>/dev/null; then
            log_warn "Docker auth configuration returned non-zero. Builds may fail if not already authenticated."
        fi
    fi
fi

# ---- Execute builds -------------------------------------------------------

OVERALL_START=$(date +%s)
PIDS=()

if [[ "$PARALLEL" == true && "$BUILD_MODE" == "local" && ${#SERVICES_TO_BUILD[@]} -gt 1 ]]; then
    log_info "Starting parallel builds (${TOTAL} services)..."
    log_warn "Parallel output will be interleaved. Check individual results at the end."

    for svc in "${SERVICES_TO_BUILD[@]}"; do
        (( BUILD_COUNT++ )) || true
        (
            build_service "$svc"
        ) &
        PIDS+=($!)
    done

    # Wait for all background jobs
    PARALLEL_FAILURES=0
    for pid in "${PIDS[@]}"; do
        if ! wait "$pid"; then
            (( PARALLEL_FAILURES++ )) || true
        fi
    done

    if [[ $PARALLEL_FAILURES -gt 0 ]]; then
        log_error "${PARALLEL_FAILURES} build(s) failed in parallel mode."
    fi
else
    if [[ "$PARALLEL" == true && "$BUILD_MODE" == "cloud" ]]; then
        log_warn "Parallel mode is only supported with --local. Building sequentially."
    fi

    for svc in "${SERVICES_TO_BUILD[@]}"; do
        (( BUILD_COUNT++ )) || true
        log_info "[${BUILD_COUNT}/${TOTAL}] ${svc}"
        build_service "$svc" || true
    done
fi

# ---- Summary --------------------------------------------------------------

OVERALL_END=$(date +%s)
OVERALL_ELAPSED=$(( OVERALL_END - OVERALL_START ))

log_header "Build Summary"
log_info "Environment: ${ENV}"
log_info "Total:       ${TOTAL} service(s)"
log_info "Succeeded:   ${BUILD_SUCCESS}"
log_info "Duration:    ${OVERALL_ELAPSED}s"

if [[ ${#BUILD_FAILURES[@]} -gt 0 ]]; then
    log_error "Failed (${#BUILD_FAILURES[@]}): ${BUILD_FAILURES[*]}"
    exit 1
else
    log_success "All ${TOTAL} service(s) built and pushed successfully."
    exit 0
fi
