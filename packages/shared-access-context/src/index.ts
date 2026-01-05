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
    console.log('[ACCESS CONTEXT DEBUG] Resolving access context for Clerk user:', clerkUserId);
    
    if (!clerkUserId) {
        console.log('[ACCESS CONTEXT DEBUG] No Clerk user ID provided - returning empty context');
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
        };
    }

    console.log('[ACCESS CONTEXT DEBUG] Looking up identity user for Clerk ID:', clerkUserId);
    const identityUserResult = await supabase
        .schema('identity')
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

    console.log('[ACCESS CONTEXT DEBUG] Identity user lookup result:', {
        data: identityUserResult.data,
        error: identityUserResult.error
    });

    const identityUserId = identityUserResult.data?.id || null;

    if (!identityUserId) {
        console.log('[ACCESS CONTEXT DEBUG] No identity user found for Clerk ID - returning empty context');
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
        };
    }

    console.log('[ACCESS CONTEXT DEBUG] Looking up candidate, recruiter, and memberships for identity user:', identityUserId);
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

    console.log('[ACCESS CONTEXT DEBUG] Database lookups completed:', {
        candidate: candidateResult.data,
        candidateError: candidateResult.error,
        recruiter: recruiterResult.data, 
        recruiterError: recruiterResult.error,
        memberships: membershipsResult.data,
        membershipsError: membershipsResult.error
    });

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

    console.log('[ACCESS CONTEXT DEBUG] Final access context:', finalContext);

    return finalContext;
}
