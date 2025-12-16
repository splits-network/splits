import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';

/**
 * Candidates Routes
 * - Candidate CRUD operations
 * - Candidate ownership (Phase 2)
 */
export function registerCandidatesRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // List candidates
    app.get('/api/candidates', {
        schema: {
            description: 'List all candidates',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/candidates?${queryString}` : '/candidates';
        const data = await atsService().get(path);
        return reply.send(data);
    });

    // Get candidate by ID
    app.get('/api/candidates/:id', {
        schema: {
            description: 'Get candidate by ID',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().get(`/candidates/${id}`);
        return reply.send(data);
    });

    // Get candidate applications
    app.get('/api/candidates/:id/applications', {
        schema: {
            description: 'Get applications for a candidate',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().get(`/candidates/${id}/applications`);
        return reply.send(data);
    });

    // List candidate sourcers (platform admins only)
    app.get('/api/candidates/sourcers', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'List candidate sourcers',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/candidates/sourcers?${queryString}` : '/candidates/sourcers';
        const data = await atsService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // ==========================================
    // Phase 2 Routes - Candidate Ownership
    // ==========================================

    // Source candidate (recruiters only)
    app.post('/api/candidates/:id/source', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Source a candidate (mark as sourced by recruiter)',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        // Get recruiter ID for this user
        const recruiterResponse: any = await networkService().get(
            `/recruiters/by-user/${req.auth.userId}`,
            undefined,
            correlationId
        );

        const data = await atsService().post(`/candidates/${id}/source`, {
            ...(request.body as any),
            recruiter_id: recruiterResponse.data.id,
        }, correlationId);
        return reply.send(data);
    });

    // Get candidate sourcer info
    app.get('/api/candidates/:id/sourcer', {
        schema: {
            description: 'Get candidate sourcer information',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/candidates/${id}/sourcer`, undefined, correlationId);
        return reply.send(data);
    });

    // Record outreach (recruiters only)
    app.post('/api/candidates/:id/outreach', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Record recruiter outreach to candidate',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        // Get recruiter ID for this user
        const recruiterResponse: any = await networkService().get(
            `/recruiters/by-user/${req.auth.userId}`,
            undefined,
            correlationId
        );

        const data = await atsService().post(`/candidates/${id}/outreach`, {
            ...(request.body as any),
            recruiter_id: recruiterResponse.data.id,
        }, correlationId);
        return reply.send(data);
    });

    // Check candidate protection status
    app.get('/api/candidates/:id/protection-status', {
        schema: {
            description: 'Check candidate protection status',
            tags: ['candidates'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/candidates/${id}/protection-status`, undefined, correlationId);
        return reply.send(data);
    });
}
