import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';

/**
 * Companies Routes
 * - Company CRUD operations
 * - Company-scoped resources (applications, candidates)
 * 
 * NEW PATTERN: Use buildAuthHeaders() for role-based scoping
 * - Sends x-clerk-user-id and x-organization-id headers
 * - Backend resolves role via database JOINs (no x-user-role header)
 */
export function registerCompaniesRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    /**
     * NEW ENDPOINT: List companies with role-based scoping
     * - Platform Admin: All companies
     * - Company User: Only their company
     * - Recruiter: All companies (marketplace model)
     */
    app.get('/api/companies', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'], services),
        schema: {
            description: 'List companies with role-based scoping',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/companies?${queryString}` : '/companies';
        const data = await atsService().get(path, undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * LEGACY ENDPOINT: For backward compatibility
     * List all companies (no role scoping)
     */
    app.get('/api/companies/legacy', {
        schema: {
            description: 'List all companies (legacy endpoint)',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/companies/legacy?${queryString}` : '/companies/legacy';
        const data = await atsService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // Get company by ID
    app.get('/api/companies/:id', {
        schema: {
            description: 'Get company by ID',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/companies/${id}`, undefined, correlationId);
        return reply.send(data);
    });

    // Get company by organization ID
    app.get('/api/companies/by-org/:orgId', {
        schema: {
            description: 'Get company by organization ID',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { orgId } = request.params as { orgId: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/companies/by-org/${orgId}`, undefined, correlationId);
        return reply.send(data);
    });

    // Create company (company admins and platform admins only)
    app.post('/api/companies', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Create new company',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await atsService().post('/companies', request.body);
        return reply.send(data);
    });

    // Update company
    app.patch('/api/companies/:id', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Update company',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().patch(`/companies/${id}`, request.body);
        return reply.send(data);
    });

    // Get company-specific applications (with candidate masking)
    app.get('/api/companies/:companyId/applications', {
        preHandler: requireRoles(['company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Get applications for a company (with candidate masking)',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { companyId } = request.params as { companyId: string };
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString 
            ? `/companies/${companyId}/applications?${queryString}` 
            : `/companies/${companyId}/applications`;
        const data = await atsService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // Get company-specific candidate (with masking)
    app.get('/api/companies/:companyId/candidates/:id', {
        preHandler: requireRoles(['company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Get candidate for a company (with masking)',
            tags: ['companies'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { companyId, id } = request.params as { companyId: string; id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/companies/${companyId}/candidates/${id}`, undefined, correlationId);
        return reply.send(data);
    });
}
