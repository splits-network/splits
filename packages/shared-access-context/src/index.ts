import { SupabaseClient } from '@supabase/supabase-js';

export interface AccessContext {
    identityUserId: string | null;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;
    
}

/**
 * Resolve role/access context starting from the Clerk user ID.
 * Converts Clerk -> users -> memberships/recruiters/candidates.
 */
export async function resolveAccessContext(
    supabase: SupabaseClient,
    clerkUserId?: string
): Promise<AccessContext> {
    console.log('[DEBUG] resolveAccessContext called with clerkUserId:', { clerkUserId });
    try{
    if (!clerkUserId) {
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
            error: 'No clerkUserId provided',
        };
    }
    const identityUserResult = await supabase
        .from('users')
        .select(
            `
                id,
                candidates!candidates_user_id_fkey ( id ),
                recruiters!recruiters_user_id_fkey ( id, status ),
                memberships!memberships_user_id_fkey ( organization_id, role )
            `
        )
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();
console.log('[DEBUG] resolveAccessContext - identityUserResult:', { identityUserResult });
    const identityUserId = identityUserResult.data?.id || null;

    if (!identityUserId) {
        return {
            identityUserId: null,
            candidateId: null,
            recruiterId: null,
            organizationIds: [],
            roles: [],
            isPlatformAdmin: false,
            error: 'Identity user not found',
        };
    }

    const memberships = identityUserResult.data?.memberships || [];
    const organizationIds = memberships.map(m => m.organization_id).filter(Boolean);
    const roles = memberships.map(m => m.role).filter(Boolean);
    const activeRecruiter = identityUserResult.data?.recruiters?.find(r => r.status === 'active');

    const finalContext = {
        identityUserId,
        candidateId: identityUserResult.data?.candidates?.[0]?.id || null,
        recruiterId: activeRecruiter?.id || null,
        organizationIds,
        roles,
        isPlatformAdmin: roles.includes('platform_admin'),
        error: '',
    };

    return finalContext;
} catch (error) {
    console.error('Error in resolveAccessContext:', error);
    return {
        error: error instanceof Error ? error.message : String(error),
        identityUserId: null,
        candidateId: null,
        recruiterId: null,
        organizationIds: [],
        roles: [],
        isPlatformAdmin: false,
    };
}
}
