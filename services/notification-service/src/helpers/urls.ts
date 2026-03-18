/**
 * Centralized user-facing URL resolution for emails and in-app notifications.
 *
 * Priority:
 *   1. Explicit env vars (PORTAL_URL, CANDIDATE_URL, CORPORATE_URL)
 *   2. Environment detection based on NODE_ENV
 *
 * This ensures local dev pointing at staging DB still generates correct URLs
 * when the env vars are set, while production/staging K8s always has them.
 */

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.PORTAL_URL?.includes('staging') ?? false;

function resolve(envVar: string | undefined, staging: string, prod: string, local: string): string {
    if (envVar) return envVar;
    if (!isProduction) return local;
    return isStaging ? staging : prod;
}

export const PORTAL_URL = resolve(
    process.env.PORTAL_URL,
    'https://staging.splits.network',
    'https://splits.network',
    'http://localhost:3100',
);

export const CANDIDATE_URL = resolve(
    process.env.CANDIDATE_URL,
    'https://staging.applicant.network',
    'https://applicant.network',
    'http://localhost:3101',
);

export const CORPORATE_URL = resolve(
    process.env.CORPORATE_URL,
    'https://staging.employment-networks.com',
    'https://employment-networks.com',
    'http://localhost:3102',
);
