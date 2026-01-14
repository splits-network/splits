/**
 * Billing-specific access context helpers
 * Maps shared access context properties to billing domain concepts
 */

import { resolveAccessContext as sharedResolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export async function resolveAccessContext(supabase: SupabaseClient, clerkUserId: string) {
    return await sharedResolveAccessContext(supabase, clerkUserId);
}

/**
 * Check if context represents a recruiter
 */
export function isRecruiter(context: Awaited<ReturnType<typeof resolveAccessContext>>) {
    return context.recruiterId !== null;
}

/**
 * Check if context represents a company user (any organization role)
 */
export function isCompanyUser(context: Awaited<ReturnType<typeof resolveAccessContext>>) {
    return context.organizationIds.length > 0 && context.roles.length > 0;
}

/**
 * Get user's accessible company IDs (organization IDs)
 */
export function getAccessibleCompanyIds(context: Awaited<ReturnType<typeof resolveAccessContext>>) {
    return context.organizationIds;
}
