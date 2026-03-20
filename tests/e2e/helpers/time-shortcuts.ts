/**
 * Time-dependent test shortcuts.
 * These helpers fast-forward guarantee periods and trigger payout processing
 * by calling admin API endpoints or direct DB operations.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function adminApiRequest<T = any>(
  method: string,
  endpoint: string,
  body?: any,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/v2${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin API ${method} ${endpoint} failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

/**
 * Fast-forward a placement's guarantee period by updating guarantee_expires_at
 * to a past date. Requires platform admin token.
 */
export async function fastForwardGuarantee(
  placementId: string,
  adminToken: string
): Promise<void> {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await adminApiRequest(
    'PATCH',
    `/placements/${placementId}`,
    { guarantee_expires_at: pastDate },
    adminToken
  );
}

/**
 * Trigger payout schedule processing.
 * In production this runs as a cron job at 2am UTC.
 * For testing, we call the admin endpoint directly.
 */
export async function triggerPayoutProcessing(
  adminToken: string
): Promise<void> {
  await adminApiRequest(
    'POST',
    '/admin/payouts/process-schedules',
    {},
    adminToken
  );
}

/**
 * Release an escrow hold for a placement.
 * Simulates what happens when the guarantee period expires naturally.
 */
export async function releaseEscrow(
  placementId: string,
  adminToken: string
): Promise<void> {
  await adminApiRequest(
    'POST',
    `/admin/payouts/release-escrow`,
    { placement_id: placementId },
    adminToken
  );
}

/**
 * Simulate a company invoice being paid.
 * Triggers the payout schedule for the associated placement.
 */
export async function simulateInvoicePaid(
  placementId: string,
  adminToken: string
): Promise<void> {
  await adminApiRequest(
    'POST',
    `/admin/payouts/simulate-invoice-paid`,
    { placement_id: placementId },
    adminToken
  );
}

/**
 * Process eligible payout transactions via Stripe (or test mode).
 * Moves transactions from pending → processing → paid.
 */
export async function processEligiblePayouts(
  adminToken: string
): Promise<void> {
  await adminApiRequest(
    'POST',
    '/admin/payouts/process-eligible',
    {},
    adminToken
  );
}

/**
 * Get payout transactions for a placement to verify state.
 */
export async function getPayoutTransactions(
  placementId: string,
  adminToken: string
): Promise<any[]> {
  return adminApiRequest(
    'GET',
    `/admin/payouts/transactions?placement_id=${placementId}`,
    undefined,
    adminToken
  );
}

/**
 * Get placement splits to verify commission calculations.
 */
export async function getPlacementSplits(
  placementId: string,
  adminToken: string
): Promise<any[]> {
  return adminApiRequest(
    'GET',
    `/admin/payouts/splits?placement_id=${placementId}`,
    undefined,
    adminToken
  );
}
