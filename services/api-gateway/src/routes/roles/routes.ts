import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest, isAdmin, isCompanyUser, isRecruiter } from '../../rbac';

/**
 * Roles Routes (RBAC-Filtered Job Listings)
 * - GET /api/roles - Get jobs filtered by user role
 * 
 * RBAC Data Scoping Rules:
 * - Platform admins: see all jobs
 * - Company users: see only their company's jobs
 * - Recruiters: see all active jobs (marketplace model - they need to discover opportunities)
 */
export function registerRolesRoutes(app: FastifyInstance, services: ServiceRegistry) {
    /**
     * Get jobs filtered by user role (RBAC enforced)
     */
    app.get('/api/roles', {
        preHandler: requireRoles(['platform_admin', 'company_admin', 'hiring_manager', 'recruiter'], services),
        schema: {
            description: 'Get jobs filtered by user role',
            tags: ['roles'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const atsService = services.get('ats');
        const correlationId = (request as any).correlationId;

        const isUserAdmin = isAdmin(req.auth);
        const isUserCompany = isCompanyUser(req.auth);
        const isUserRecruiter = await isRecruiter(req.auth, services, correlationId);

        const queryParams = request.query as any;
        let companyIds: string[] | undefined;

        // Platform admins see everything - no filtering
        if (isUserAdmin) {
            // No filtering needed
        }
        // Company users see only their company's jobs
        else if (isUserCompany) {
            const companyMemberships = req.auth.memberships.filter(
                m => m.role === 'company_admin' || m.role === 'hiring_manager'
            );

            if (companyMemberships.length === 0) {
                return reply.send({ data: [] });
            }

            try {
                const companiesResponse: any = await atsService.get('/companies', undefined, correlationId);
                const allCompanies = companiesResponse.data || [];
                
                const orgIds = companyMemberships.map(m => m.organization_id);
                const userCompanyIds = allCompanies
                    .filter((c: any) => orgIds.includes(c.identity_organization_id))
                    .map((c: any) => c.id);

                if (userCompanyIds.length === 0) {
                    return reply.send({ data: [] });
                }

                companyIds = userCompanyIds;
            } catch (error) {
                request.log.error({ error, userId: req.auth.userId }, 'Failed to get company IDs for user');
                return reply.send({ data: [] });
            }
        }
        // Recruiters see all active jobs (marketplace model)
        // requireRoles already verified active recruiter status

        // Get all jobs from ATS service
        const queryString = new URLSearchParams(queryParams).toString();
        const path = queryString ? `/jobs?${queryString}` : '/jobs';
        const jobsResponse: any = await atsService.get(path, undefined, correlationId);

        let jobs = jobsResponse.data || [];

        // Apply company filtering for company users
        if (companyIds) {
            jobs = jobs.filter((job: any) => companyIds!.includes(job.company_id));
        }

        return reply.send({ data: jobs });
    });
}
