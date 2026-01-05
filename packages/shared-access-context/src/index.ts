import { SupabaseClient } from '@supabase/supabase-js';

export interface AccessContext {
    identityUserId: string | null;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
}

/**
 * Resolve role/access context starting from the Clerk user ID.
 * Converts Clerk -> identity.users -> memberships/recruiters/candidates.
 */
export async function resolveAccessContext(
    supabase: SupabaseClient,
    clerkUserId?: string
): Promise<AccessContext> {
    
    if (!clerkUserId) {
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
        };
    }

    const identityUserResult = await supabase
        .schema('identity')
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

    const identityUserId = identityUserResult.data?.id || null;

    if (!identityUserId) {
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
        };
    }

    const [candidateResult, recruiterResult, membershipsResult] = await Promise.all([
        supabase
            .schema('ats')
            .from('candidates')
            .select('id')
            .eq('user_id', identityUserId)
            .maybeSingle(),
        supabase
            .schema('network')
            .from('recruiters')
            .select('id')
            .eq('user_id', identityUserId)
            .eq('status', 'active')
            .maybeSingle(),
        supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id, role')
            .eq('user_id', identityUserId),
    ]);

    const memberships = membershipsResult.data || [];
    const organizationIds = memberships
        .map((m) => m.organization_id)
        .filter((orgId): orgId is string => Boolean(orgId));
    const roles = memberships
        .map((m) => m.role)
        .filter((role): role is string => Boolean(role));
    const isPlatformAdmin = roles.includes('platform_admin');

    const finalContext = {
        identityUserId,
        candidateId: candidateResult.data?.id || null,
        recruiterId: recruiterResult.data?.id || null,
        organizationIds,
        roles,
        isPlatformAdmin,
    };

    return finalContext;
}
