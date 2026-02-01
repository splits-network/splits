import { SupabaseClient } from '@supabase/supabase-js';

export interface AccessContext {
    identityUserId: string | null;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    companyIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;

}

/**
 * AccessContextResolver - Reusable class for services
 * Initialize once with Supabase client, then call resolve() as needed
 * 
 * @example
 * ```typescript
 * export class JobServiceV2 {
 *   private accessResolver: AccessContextResolver;
 *   
 *   constructor(supabase: SupabaseClient) {
 *     this.accessResolver = new AccessContextResolver(supabase);
 *   }
 *   
 *   async createJob(clerkUserId: string) {
 *     const context = await this.accessResolver.resolve(clerkUserId);
 *     // Use context.identityUserId, context.roles, etc.
 *   }
 * }
 * ```
 */
export class AccessContextResolver {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Resolve access context for a Clerk user ID
     */
    async resolve(clerkUserId?: string): Promise<AccessContext> {
        return resolveAccessContext(this.supabase, clerkUserId);
    }
}

/**
 * Resolve role/access context starting from the Clerk user ID.
 * Converts Clerk -> users -> memberships/recruiters/candidates.
 */
export async function resolveAccessContext(
    supabase: SupabaseClient,
    clerkUserId?: string
): Promise<AccessContext> {
    try {
        if (!clerkUserId) {
            return {
                identityUserId: null,
                candidateId: null,
                recruiterId: null,
                organizationIds: [],
                companyIds: [],
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
                memberships!memberships_user_id_fkey ( organization_id, company_id, role )
            `
            )
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        const identityUserId = identityUserResult.data?.id || null;

        if (!identityUserId) {
            return {
                identityUserId: null,
                candidateId: null,
                recruiterId: null,
                organizationIds: [],
                companyIds: [],
                roles: [],
                isPlatformAdmin: false,
                error: 'Identity user not found',
            };
        }

        const memberships = identityUserResult.data?.memberships || [];
        const organizationIds = memberships.map(m => m.organization_id).filter(Boolean);
        const companyIds = memberships.map(m => m.company_id).filter(Boolean);
        const roles = memberships.map(m => m.role).filter(Boolean);

        // Handle both array and single object cases for recruiters (Supabase returns object for 1:1, array for 1:many)
        const recruitersData = identityUserResult.data?.recruiters as { id: string; status: string }[] | { id: string; status: string } | null;
        const activeRecruiter = Array.isArray(recruitersData)
            ? recruitersData.find(r => r.status === 'active')
            : (recruitersData?.status === 'active' ? recruitersData : null);
        
        if(activeRecruiter) {
            roles.push('recruiter');
        }

        // Handle both array and single object cases for candidates
        const candidatesData = identityUserResult.data?.candidates as { id: string }[] | { id: string } | null;
        const candidateId = Array.isArray(candidatesData)
            ? candidatesData[0]?.id
            : candidatesData?.id || null;

        if(candidateId) {
            roles.push('candidate');
        }

        const finalContext = {
            identityUserId,
            candidateId,
            recruiterId: activeRecruiter?.id || null,
            organizationIds,
            companyIds,
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
            companyIds: [],
            roles: [],
            isPlatformAdmin: false,
        };
    }
}
