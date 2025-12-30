import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';

/**
 * Extract user context from headers (set by API Gateway)
 * NEW PATTERN: Backend resolves role via database JOINs
 * NO x-user-role header - security via database queries
 */
function requireUserContext(request: FastifyRequest): { clerkUserId: string; organizationId: string | null } {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const organizationId = (request.headers['x-organization-id'] as string) || null;

    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return { clerkUserId, organizationId };
}

export function registerCompanyRoutes(app: FastifyInstance, service: AtsService) {
    /**
     * NEW ENDPOINT: Get companies with role-based scoping
     * - Platform Admin: All companies
     * - Company User: Only their company
     * - Recruiter: All companies (marketplace model)
     * 
     * Query params: search, sort_by, sort_order, page, limit
     * Returns: { data: Company[], pagination: { total, page, limit, total_pages } }
     */
    app.get(
        '/companies',
        async (request: FastifyRequest<{
            Querystring: {
                search?: string;
                sort_by?: string;
                sort_order?: 'asc' | 'desc';
                page?: number;
                limit?: number;
            };
        }>, reply: FastifyReply) => {
            const { clerkUserId, organizationId } = requireUserContext(request);

            const result = await service.getCompaniesForUser(clerkUserId, organizationId, {
                search: request.query.search,
                sort_by: request.query.sort_by,
                sort_order: request.query.sort_order,
                page: request.query.page ? parseInt(request.query.page.toString()) : undefined,
                limit: request.query.limit ? parseInt(request.query.limit.toString()) : undefined,
            });

            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        }
    );

    /**
     * LEGACY ENDPOINT: For backward compatibility
     * Get all companies or filter by org_id
     */
    app.get(
        '/companies/legacy',
        async (request: FastifyRequest<{ Querystring: { org_id?: string } }>, reply: FastifyReply) => {
            const { org_id } = request.query;
            if (org_id) {
                const company = await service.getCompanyByOrgId(org_id);
                return reply.send({ data: company ? [company] : [] });
            }
            const companies = await service.getCompanies();
            return reply.send({ data: companies });
        }
    );

    // Get company by ID
    app.get(
        '/companies/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const company = await service.getCompanyById(request.params.id);
            return reply.send({ data: company });
        }
    );

    // Get company by organization ID
    app.get(
        '/companies/by-org/:orgId',
        async (request: FastifyRequest<{ Params: { orgId: string } }>, reply: FastifyReply) => {
            const company = await service.getCompanyByOrgId(request.params.orgId);
            if (!company) {
                return reply.status(404).send({ 
                    error: { code: 'NOT_FOUND', message: 'Company not found for this organization' } 
                });
            }
            return reply.send({ data: company });
        }
    );

    // Create new company
    app.post(
        '/companies',
        async (request: FastifyRequest<{
            Body: {
                name: string;
                identity_organization_id?: string;
                website?: string;
                industry?: string;
                company_size?: string;
                headquarters_location?: string;
                description?: string;
                logo_url?: string;
            }
        }>, reply: FastifyReply) => {
            const { name, identity_organization_id, website, industry, company_size, headquarters_location, description, logo_url } = request.body;

            if (!name) {
                throw new BadRequestError('Company name is required');
            }

            const company = await service.createCompany(
                name,
                identity_organization_id,
                { website, industry, company_size, headquarters_location, description, logo_url }
            );
            return reply.status(201).send({ data: company });
        }
    );

    // Update company
    app.patch(
        '/companies/:id',
        async (request: FastifyRequest<{
            Params: { id: string };
            Body: {
                name?: string;
                identity_organization_id?: string;
                website?: string;
                industry?: string;
                company_size?: string;
                headquarters_location?: string;
                description?: string;
                logo_url?: string;
            }
        }>, reply: FastifyReply) => {
            const company = await service.updateCompany(request.params.id, request.body);
            return reply.send({ data: company });
        }
    );

    // Get jobs for a company
    app.get(
        '/companies/:companyId/jobs',
        async (request: FastifyRequest<{ Params: { companyId: string } }>, reply: FastifyReply) => {
            const jobs = await service.getJobsByCompanyId(request.params.companyId);
            return reply.send({ data: jobs });
        }
    );

    // Get applications for a company
    app.get(
        '/companies/:companyId/applications',
        async (request: FastifyRequest<{ 
            Params: { companyId: string };
            Querystring: { job_id?: string; stage?: string }
        }>, reply: FastifyReply) => {
            const { job_id, stage } = request.query;
            const applications = await service.getApplicationsForCompany(
                request.params.companyId,
                { job_id, stage }
            );
            return reply.send({ data: applications });
        }
    );

    // Get candidate for a company (with masking)
    app.get(
        '/companies/:companyId/candidates/:id',
        async (request: FastifyRequest<{ Params: { companyId: string; id: string } }>, reply: FastifyReply) => {
            const candidate = await service.getCandidateForCompany(
                request.params.id,
                request.params.companyId
            );

            // Log that company viewed this candidate
            const isMasked = (candidate as any)._masked;
            request.log.info({
                candidateId: request.params.id,
                companyId: request.params.companyId,
                userId: (request as any).auth?.userId,
                viewedMasked: isMasked,
            }, 'Company user viewed candidate');

            return reply.send({ data: candidate });
        }
    );

    // Get audit log for a company
    app.get(
        '/companies/:companyId/audit-log',
        async (request: FastifyRequest<{ 
            Params: { companyId: string };
            Querystring: { limit?: string }
        }>, reply: FastifyReply) => {
            const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
            const auditLog = await service.getCompanyAuditLogs(request.params.companyId, limit);
            return reply.send({ data: auditLog });
        }
    );
}
