# Billing + Payouts Ops Checklist

This is the deployment/runbook checklist for snapshot-driven billing and payouts.

## One-Time Backfill

- Run the ATS backfill job to populate `placements.guarantee_expires_at` for existing records.
  - Kubernetes Job manifest: `infra/k8s/ats-service/jobs/backfill-guarantee-expires.yaml`
  - Job script: `services/ats-service/src/jobs/backfill-guarantee-expires.ts`

## CronJobs (Hourly Defaults)

These CronJobs are always-on and default to hourly schedules.

- Billing: create placement invoices
  - `infra/k8s/billing-service/cronjobs/create-placement-invoices.yaml`
- Billing: finalize placement invoices
  - `infra/k8s/billing-service/cronjobs/finalize-placement-invoices.yaml`
- Billing: process eligible payouts
  - `infra/k8s/billing-service/cronjobs/process-eligible-payouts.yaml`
- Billing: payout schedules
  - `infra/k8s/billing-service/cronjobs/payout-schedules.yaml`
- Billing: escrow releases
  - `infra/k8s/billing-service/cronjobs/escrow-releases.yaml`
- ATS: complete expired guarantees
  - `infra/k8s/ats-service/cronjobs/complete-expired-guarantees.yaml`

To switch daily vs hourly, update each CronJob `spec.schedule` (comments include both patterns).

## Required Secrets / Env

All CronJobs use the same secrets as their corresponding services:

- `supabase-secrets`: `supabase-url`, `supabase-service-role-key`
- `stripe-secrets`: `stripe-secret-key` (billing jobs only)
- `RABBITMQ_URL` is set to the cluster rabbitmq service in manifests
- `SENTRY_DSN` set to the service’s DSN for job-level alerts

## Validation

- Confirm hourly CronJobs exist in the cluster after deploy.
- Verify placement invoices appear for placements whose guarantee period has completed.
- Verify payout schedule processing respects invoice collectibility.
- Confirm `placement.status_changed` events emit from the guarantee completion job.

## Optional (Later)

- Add monitoring/alerting thresholds for:
  - `stripe_payout_missing_transfers`
  - Job failure counts for billing/ATS cronjobs
