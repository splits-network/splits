/**
 * proposals/routes.ts
 * Proposals Routes using Direct Supabase Query Pattern
 * 
 * Key improvements:
 * - Uses buildAuthHeaders() helper for consistent auth context
 * - Role-based filtering handled by backend via database JOINs
 * - No userRole in headers - backend resolves from database records
 * - Cleaner, more maintainable code
 * 
 * @see docs/migration/MIGRATION-PROGRESS.md
 * @see docs/migration/DATABASE-JOIN-PATTERN.md
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';

export function registerProposalsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    /**
     * GET /api/proposals
     * Get all proposals for current user (role-filtered by backend)
     * 
     * Backend (ATS Service) determines data scope via database JOINs.
     * Role resolved from database records (recruiters, memberships, candidates).
     */
    app.get('/api/proposals', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
        schema: {
            description: 'Get all proposals for current user',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        // Use helper to build auth headers
        const authHeaders = buildAuthHeaders(request);

        // Forward query params directly to ATS service
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = `/api/proposals${queryString ? `?${queryString}` : ''}`;

        const data = await atsService().get(path, undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/actionable
     * Get proposals requiring user's action
     */
    app.get('/api/proposals/actionable', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
        schema: {
            description: 'Get proposals requiring your action',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        const data = await atsService().get('/api/proposals/actionable', undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/pending
     * Get proposals awaiting response from others
     */
    app.get('/api/proposals/pending', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
        schema: {
            description: 'Get proposals awaiting response from others',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        const data = await atsService().get('/api/proposals/pending', undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/summary
     * Get summary statistics
     */
    app.get('/api/proposals/summary', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
        schema: {
            description: 'Get proposal summary statistics',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        const data = await atsService().get('/api/proposals/summary', undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/:id
     * Get single proposal details
     */
    app.get('/api/proposals/:id', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
        schema: {
            description: 'Get proposal by ID',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        const data = await atsService().get(`/api/proposals/${id}`, undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * POST /api/proposals/:id/accept
     * Accept a proposal (candidate accepts job opportunity, company accepts application)
     */
    app.post('/api/proposals/:id/accept', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'candidate'], services),
        schema: {
            description: 'Accept a proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        // Map to appropriate ATS endpoint based on stage
        const data = await atsService().post(`/applications/${id}/accept`, request.body, correlationId, authHeaders);
        return reply.send(data);
    });

    /**
     * POST /api/proposals/:id/decline
     * Decline a proposal
     */
    app.post('/api/proposals/:id/decline', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'candidate'], services),
        schema: {
            description: 'Decline a proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        // Map to appropriate ATS endpoint
        const data = await atsService().post(`/applications/${id}/decline`, request.body, correlationId, authHeaders);
        return reply.send(data);
    });
}
