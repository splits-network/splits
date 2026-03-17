import { SupabaseClient } from '@supabase/supabase-js';

export interface AccessContext {
    identityUserId: string | null;
    candidateId: string | null;
    recruiterId: string | null;
    firmIds: string[];
    organizationIds: string[];
    orgWideOrganizationIds: string[];
    companyIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;
}

/**
 * AccessContextResolver - Reusable class for services
 * Initialize once with Supabase client, then call resolve() as needed
 *
 * Supports two resolution modes:
 * 1. From header: Read pre-resolved context from x-access-context header (API Gateway mode)
 * 2. From database: Query Supabase directly (legacy mode)
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
 *   // In route handler - try header first, fallback to database
 *   async createJob(clerkUserId: string, request?: { headers?: Record<string, any> }) {
 *     const context = await this.accessResolver.resolve(clerkUserId, request?.headers);
 *     // Use context.identityUserId, context.roles, etc.
 *   }
 * }
 * ```
 */
export class AccessContextResolver {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Resolve access context for a Clerk user ID
     * @param clerkUserId - Clerk user ID
     * @param headers - Optional request headers (for header-based resolution)
     */
    async resolve(clerkUserId?: string, headers?: Record<string, any>): Promise<AccessContext> {
        return resolveAccessContext(this.supabase, clerkUserId, headers);
    }
}

const EMPTY_CONTEXT: AccessContext = {
    identityUserId: null,
    candidateId: null,
    recruiterId: null,
    firmIds: [],
    organizationIds: [],
    orgWideOrganizationIds: [],
    companyIds: [],
    roles: [],
    isPlatformAdmin: false,
    error: '',
};

/**
 * Resolve role/access context starting from the Clerk user ID.
 * 
 * Supports two resolution modes:
 * 1. Header mode: Read pre-resolved context from x-access-context header (faster, preferred)
 * 2. Database mode: Query Supabase directly (fallback for direct service access)
 * 
 * @param supabase - Supabase client (only used if header resolution fails)
 * @param clerkUserId - Clerk user ID
 * @param headers - Optional request headers (for header-based resolution)
 */
export async function resolveAccessContext(
    supabase: SupabaseClient,
    clerkUserId?: string,
    headers?: Record<string, any>
): Promise<AccessContext> {
    // Try header-based resolution first (API Gateway mode)
    if (headers && headers['x-access-context']) {
        try {
            const headerContext = JSON.parse(headers['x-access-context']) as AccessContext;
            console.log('Access context resolved from header for user:', clerkUserId);
            return headerContext;
        } catch (error) {
            console.warn('Failed to parse x-access-context header, falling back to database:', error);
            // Fall through to database resolution
        }
    }

    // Fallback to database resolution (direct service access)
    console.log('Access context resolved from database for user:', clerkUserId);
    return resolveAccessContextFromDatabase(supabase, clerkUserId);
}

/**
 * Internal function: Resolve access context from database
 * Reads from two tables in a single Supabase round-trip:
 * - memberships: org-scoped roles (company_admin, hiring_manager) with organization_id/company_id
 * - user_roles: entity-linked roles (recruiter, candidate) with role_entity_id, and system-level roles (platform_admin) with role_entity_id = NULL
 *
 * Returns an AccessContext with roles, org IDs, company IDs, recruiter/candidate IDs.
 */
async function resolveAccessContextFromDatabase(
    supabase: SupabaseClient,
    clerkUserId?: string
): Promise<AccessContext> {
    try {
        if (!clerkUserId) {
            return { ...EMPTY_CONTEXT, error: 'No clerkUserId provided' };
        }

        const userResult = await supabase
            .from('users')
            .select(
                `
                id,
                memberships!memberships_user_id_fkey1 (
                    role_name,
                    organization_id,
                    company_id
                ),
                user_roles!user_roles_user_id_fkey (
                    role_name,
                    role_entity_id
                )
            `
            )
            .eq('clerk_user_id', clerkUserId)
            .is('memberships.deleted_at', null)
            .is('user_roles.deleted_at', null)
            .maybeSingle();

        if (userResult.error) {
            console.error('resolveAccessContext query error:', userResult.error);
            return { ...EMPTY_CONTEXT, error: userResult.error.message };
        }

        const identityUserId = userResult.data?.id || null;

        if (!identityUserId) {
            return { ...EMPTY_CONTEXT, error: 'Identity user not found' };
        }

        // Handle both array and single object cases (Supabase returns object for 1:1, array for 1:many)
        const membershipsData = userResult.data?.memberships as MembershipRow[] | MembershipRow | null;
        const memberships: MembershipRow[] = Array.isArray(membershipsData)
            ? membershipsData
            : membershipsData ? [membershipsData] : [];

        const userRolesData = userResult.data?.user_roles as EntityRoleRow[] | EntityRoleRow | null;
        const userRoles: EntityRoleRow[] = Array.isArray(userRolesData)
            ? userRolesData
            : userRolesData ? [userRolesData] : [];

        // Extract role names (deduplicated union of both tables)
        const roles = [...new Set([
            ...memberships.map(m => m.role_name),
            ...userRoles.map(r => r.role_name),
        ].filter(Boolean))];

        // Extract organization and company IDs from memberships
        const organizationIds = [...new Set(
            memberships.map(m => m.organization_id).filter(Boolean) as string[]
        )];
        const companyIds = [...new Set(
            memberships.map(m => m.company_id).filter(Boolean) as string[]
        )];

        // Org-wide org IDs: orgs where user has membership WITHOUT company_id constraint
        const orgWideOrganizationIds = [...new Set(
            memberships.filter(m => !m.company_id).map(m => m.organization_id).filter(Boolean) as string[]
        )];

        // Extract entity-linked IDs from user_roles (role_name determines entity type)
        const recruiterRole = userRoles.find(r => r.role_name === 'recruiter');
        const candidateRole = userRoles.find(r => r.role_name === 'candidate');

        const recruiterId = recruiterRole?.role_entity_id || null;
        const candidateId = candidateRole?.role_entity_id || null;

        // Resolve firm membership for recruiter users
        let firmIds: string[] = [];
        if (recruiterId) {
            const { data: firmMembers } = await supabase
                .from('firm_members')
                .select('firm_id')
                .eq('recruiter_id', recruiterId)
                .eq('status', 'active');
            firmIds = [...new Set(
                (firmMembers || []).map(fm => fm.firm_id).filter(Boolean) as string[]
            )];
        }

        return {
            identityUserId,
            candidateId,
            recruiterId,
            firmIds,
            organizationIds,
            orgWideOrganizationIds,
            companyIds,
            roles,
            isPlatformAdmin: roles.includes('platform_admin'),
            error: '',
        };
    } catch (error) {
        console.error('Error in resolveAccessContext:', error);
        return {
            ...EMPTY_CONTEXT,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/** Shape of a memberships row (org-scoped) */
interface MembershipRow {
    role_name: string;
    organization_id: string;
    company_id: string | null;
}

/** Shape of a user_roles row (entity-linked or platform_admin with NULL entity) */
interface EntityRoleRow {
    role_name: string;
    role_entity_id: string | null;
}

export { EntitlementChecker } from './entitlement-checker';

