#!/bin/bash
# ==============================================================================
# Cloud Scheduler Setup for Splits Network
#
# Creates or updates Cloud Scheduler jobs that replace Kubernetes CronJobs.
# Each job triggers an HTTP POST endpoint on the appropriate Cloud Run service.
#
# Usage:
#   ./scheduler.sh <ENV>
#
# Arguments:
#   ENV   - "staging" or "production"
#
# Example:
#   ./scheduler.sh staging
#   ./scheduler.sh production
#
# The script is idempotent -- safe to re-run. It will update existing jobs
# or create them if they do not exist.
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Arguments and config
# ------------------------------------------------------------------------------
ENV="${1:?Usage: ./scheduler.sh <ENV> (staging|production)}"

if [[ "${ENV}" != "staging" && "${ENV}" != "production" ]]; then
    echo "ERROR: ENV must be 'staging' or 'production', got '${ENV}'"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config/${ENV}.env"

if [[ ! -f "${CONFIG_FILE}" ]]; then
    echo "ERROR: Config file not found: ${CONFIG_FILE}"
    exit 1
fi

# shellcheck source=/dev/null
source "${CONFIG_FILE}"

echo "============================================"
echo "  Splits Network -- Cloud Scheduler Setup"
echo "============================================"
echo ""
echo "  Environment:  ${ENV}"
echo "  Project:      ${GCP_PROJECT}"
echo "  Region:       ${GCP_REGION}"
echo ""

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

# Resolve the Cloud Run service URL for a given service name.
# Falls back to a constructed URL if the service is not yet deployed.
get_service_url() {
    local service_name="$1"
    local url

    url=$(gcloud run services describe "${service_name}" \
        --project="${GCP_PROJECT}" \
        --region="${GCP_REGION}" \
        --format="value(status.url)" 2>/dev/null || true)

    if [[ -z "${url}" ]]; then
        echo "WARNING: Could not resolve URL for '${service_name}'. Using placeholder." >&2
        url="https://${service_name}-${GCP_PROJECT}.${GCP_REGION}.run.app"
    fi

    echo "${url}"
}

# Create or update a Cloud Scheduler HTTP job.
#
# Arguments:
#   $1 - Job name (unique identifier for the scheduler job)
#   $2 - Cron schedule (standard cron expression, UTC timezone)
#   $3 - Cloud Run service name (used to resolve the target URL)
#   $4 - HTTP path (e.g., /api/v2/billing/escrow-releases)
#   $5 - Description (human-readable)
upsert_scheduler_job() {
    local job_name="$1"
    local schedule="$2"
    local service_name="$3"
    local http_path="$4"
    local description="$5"

    local service_url
    service_url=$(get_service_url "${service_name}")
    local target_url="${service_url}${http_path}"

    echo "[scheduler] ${job_name}"
    echo "  Service:  ${service_name}"
    echo "  Schedule: ${schedule}"
    echo "  Target:   ${target_url}"

    # Attempt to update first; if the job does not exist, create it.
    if gcloud scheduler jobs describe "${job_name}" \
        --project="${GCP_PROJECT}" \
        --location="${GCP_REGION}" \
        --format="value(name)" &>/dev/null; then

        echo "  -> Updating existing job..."
        gcloud scheduler jobs update http "${job_name}" \
            --project="${GCP_PROJECT}" \
            --location="${GCP_REGION}" \
            --schedule="${schedule}" \
            --uri="${target_url}" \
            --http-method=POST \
            --headers="Content-Type=application/json,X-Internal-Service-Key=${INTERNAL_SERVICE_KEY:-}" \
            --oidc-service-account-email="${SCHEDULER_SERVICE_ACCOUNT}" \
            --oidc-token-audience="${service_url}" \
            --attempt-deadline="600s" \
            --time-zone="UTC" \
            --description="${description}" \
            --quiet
    else
        echo "  -> Creating new job..."
        gcloud scheduler jobs create http "${job_name}" \
            --project="${GCP_PROJECT}" \
            --location="${GCP_REGION}" \
            --schedule="${schedule}" \
            --uri="${target_url}" \
            --http-method=POST \
            --headers="Content-Type=application/json,X-Internal-Service-Key=${INTERNAL_SERVICE_KEY:-}" \
            --oidc-service-account-email="${SCHEDULER_SERVICE_ACCOUNT}" \
            --oidc-token-audience="${service_url}" \
            --attempt-deadline="600s" \
            --time-zone="UTC" \
            --description="${description}" \
            --quiet
    fi

    echo "  -> Done."
    echo ""
}

# ------------------------------------------------------------------------------
# Resolve the scheduler service account
# ------------------------------------------------------------------------------

# The service account used by Cloud Scheduler to authenticate with Cloud Run.
# This must have roles/run.invoker on each target service.
SCHEDULER_SERVICE_ACCOUNT="${SCHEDULER_SA:-scheduler-invoker@${GCP_PROJECT}.iam.gserviceaccount.com}"

echo "  Scheduler SA: ${SCHEDULER_SERVICE_ACCOUNT}"
echo ""

# ==============================================================================
# ATS Service
# ==============================================================================
echo "----------------------------------------------"
echo "ATS Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "ats-auto-transition-job-statuses" \
    "*/5 * * * *" \
    "ats-service" \
    "/api/v2/jobs/auto-transition" \
    "Auto-transition job statuses based on expiration rules (every 5 minutes)"

upsert_scheduler_job \
    "ats-complete-expired-guarantees" \
    "45 * * * *" \
    "ats-service" \
    "/api/v2/jobs/complete-expired-guarantees" \
    "Complete placements with expired guarantee periods (hourly at :45)"

# ==============================================================================
# Automation Service
# ==============================================================================
echo "----------------------------------------------"
echo "Automation Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "automation-expiration-warning" \
    "0 */6 * * *" \
    "automation-service" \
    "/api/v2/automation/expiration-warning" \
    "Send expiration warnings for stalled applications (every 6 hours)"

upsert_scheduler_job \
    "automation-metrics-aggregation" \
    "0 3 * * *" \
    "automation-service" \
    "/api/v2/automation/metrics-aggregation" \
    "Aggregate platform metrics (daily at 3 AM UTC, before reputation recalculation)"

upsert_scheduler_job \
    "automation-proposal-timeout" \
    "0 */6 * * *" \
    "automation-service" \
    "/api/v2/automation/proposal-timeout" \
    "Check and timeout stalled proposals (every 6 hours)"

upsert_scheduler_job \
    "automation-reputation-recalculation" \
    "0 4 * * *" \
    "automation-service" \
    "/api/v2/automation/reputation-recalculation" \
    "Recalculate recruiter reputation scores (daily at 4 AM UTC)"

# ==============================================================================
# Billing Service
# ==============================================================================
echo "----------------------------------------------"
echo "Billing Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "billing-create-placement-invoices" \
    "0 * * * *" \
    "billing-service" \
    "/api/v2/billing/create-placement-invoices" \
    "Create invoices for completed placements (hourly at :00)"

upsert_scheduler_job \
    "billing-escrow-releases" \
    "30 * * * *" \
    "billing-service" \
    "/api/v2/billing/escrow-releases" \
    "Process escrow releases for confirmed placements (hourly at :30)"

upsert_scheduler_job \
    "billing-finalize-placement-invoices" \
    "30 * * * *" \
    "billing-service" \
    "/api/v2/billing/finalize-placement-invoices" \
    "Finalize placement invoices for payment processing (hourly at :30)"

upsert_scheduler_job \
    "billing-payout-schedules" \
    "0 * * * *" \
    "billing-service" \
    "/api/v2/billing/payout-schedules" \
    "Process scheduled payouts to recruiters (hourly at :00)"

upsert_scheduler_job \
    "billing-process-eligible-payouts" \
    "15 * * * *" \
    "billing-service" \
    "/api/v2/billing/process-eligible-payouts" \
    "Process eligible payouts via Stripe (hourly at :15)"

# ==============================================================================
# Document Processing Service
# ==============================================================================
echo "----------------------------------------------"
echo "Document Processing Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "doc-reconcile-resume-metadata" \
    "0 */6 * * *" \
    "document-processing-service" \
    "/api/v2/documents/reconcile-resume-metadata" \
    "Reconcile resume metadata with storage (every 6 hours)"

# ==============================================================================
# GPT Service
# ==============================================================================
echo "----------------------------------------------"
echo "GPT Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "gpt-token-cleanup" \
    "0 */6 * * *" \
    "gpt-service" \
    "/api/v2/gpt/token-cleanup" \
    "Clean up expired OAuth tokens and artifacts (every 6 hours)"

# ==============================================================================
# Health Monitor
# ==============================================================================
echo "----------------------------------------------"
echo "Health Monitor"
echo "----------------------------------------------"

upsert_scheduler_job \
    "health-cleanup-health-checks" \
    "0 3 * * *" \
    "health-monitor" \
    "/api/v2/health/cleanup" \
    "Delete health check records older than 7 days (daily at 3 AM UTC)"

# ==============================================================================
# Matching Service
# ==============================================================================
echo "----------------------------------------------"
echo "Matching Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "matching-batch-refresh" \
    "0 2 * * *" \
    "matching-service" \
    "/api/v2/matches/batch-refresh" \
    "Batch refresh match scores for all active jobs (daily at 2 AM UTC)"

# ==============================================================================
# Notification Service
# ==============================================================================
echo "----------------------------------------------"
echo "Notification Service"
echo "----------------------------------------------"

upsert_scheduler_job \
    "notification-expire-recording-cleanup" \
    "0 3 * * *" \
    "notification-service" \
    "/api/v2/notifications/expire-recording-cleanup" \
    "Clean up expired recording data (daily at 3 AM UTC)"

upsert_scheduler_job \
    "notification-send-aftercare-reminders" \
    "0 8 * * *" \
    "notification-service" \
    "/api/v2/notifications/send-aftercare-reminders" \
    "Send aftercare reminders for active placements (daily at 8 AM UTC)"

upsert_scheduler_job \
    "notification-send-candidate-match-digest" \
    "0 8 * * 1" \
    "notification-service" \
    "/api/v2/notifications/send-candidate-match-digest" \
    "Send candidate match digest emails (Monday at 8 AM UTC)"

upsert_scheduler_job \
    "notification-send-candidate-reminders" \
    "0 10 * * 3" \
    "notification-service" \
    "/api/v2/notifications/send-candidate-reminders" \
    "Send reminders to candidates with pending actions (Wednesday at 10 AM UTC)"

upsert_scheduler_job \
    "notification-send-monthly-report" \
    "0 9 1 * *" \
    "notification-service" \
    "/api/v2/notifications/send-monthly-report" \
    "Send monthly activity report to recruiters (1st of month at 9 AM UTC)"

upsert_scheduler_job \
    "notification-send-recruiter-reminders" \
    "0 9 * * 4" \
    "notification-service" \
    "/api/v2/notifications/send-recruiter-reminders" \
    "Send reminders to recruiters with pending actions (Thursday at 9 AM UTC)"

upsert_scheduler_job \
    "notification-send-weekly-digest" \
    "0 8 * * 1" \
    "notification-service" \
    "/api/v2/notifications/send-weekly-digest" \
    "Send weekly activity digest to recruiters (Monday at 8 AM UTC)"

# ==============================================================================
# Summary
# ==============================================================================
echo "============================================"
echo "  Cloud Scheduler setup complete."
echo "============================================"
echo ""
echo "Total jobs configured: 21"
echo ""
echo "To list all jobs:"
echo "  gcloud scheduler jobs list --project=${GCP_PROJECT} --location=${GCP_REGION}"
echo ""
echo "To manually trigger a job:"
echo "  gcloud scheduler jobs run <JOB_NAME> --project=${GCP_PROJECT} --location=${GCP_REGION}"
echo ""
