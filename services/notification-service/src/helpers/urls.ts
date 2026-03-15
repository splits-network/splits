/**
 * Centralized user-facing URL resolution for emails and in-app notifications.
 *
 * URLs are hardcoded per environment so misconfigured env vars can never
 * produce internal/docker hostnames in outbound emails.
 *
 * Environment detection:
 *   - NODE_ENV !== 'production' → localhost (dev/test)
 *   - PORTAL_URL contains 'staging' → staging domains
 *   - Otherwise → production domains
 */

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.PORTAL_URL?.includes('staging') ?? false;

export const PORTAL_URL = isProduction
    ? (isStaging ? 'https://staging.splits.network' : 'https://splits.network')
    : 'http://localhost:3100';

export const CANDIDATE_URL = isProduction
    ? (isStaging ? 'https://staging.applicant.network' : 'https://applicant.network')
    : 'http://localhost:3101';

export const CORPORATE_URL = isProduction
    ? (isStaging ? 'https://staging.employment-networks.com' : 'https://employment-networks.com')
    : 'http://localhost:3102';
