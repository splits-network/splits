import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';

/**
 * Proposals Routes (Phase 2)
 * - Job proposal management
 */
export function registerProposalsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // Create proposal (recruiters only)
    app.post('/api/proposals', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Create job proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        // Get recruiter ID for this user
        const recruiterResponse: any = await networkService().get(
            `/recruiters/by-user/${req.auth.userId}`,
            undefined,
            correlationId
        );

        const data = await networkService().post('/proposals', {
            ...(request.body as any),
            recruiter_id: recruiterResponse.data.id,
        }, correlationId);
        return reply.send(data);
    });

    // Get my proposals
    app.get('/api/proposals/my-proposals', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Get my proposals',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);
        const userRoles = req.auth.memberships.map(m => m.role);

        // If user is a recruiter, get their proposals
        if (userRoles.includes('recruiter')) {
            const recruiterResponse: any = await networkService().get(
                `/recruiters/by-user/${req.auth.userId}`,
                undefined,
                correlationId
            );

            const data = await networkService().get(
                `/recruiters/${recruiterResponse.data.id}/proposals`,
                request.query as Record<string, any>,
                correlationId
            );
            return reply.send(data);
        } else {
            // Company admins/hiring managers/platform admins see all proposals (Phase 2)
            return reply.send({ data: [] });
        }
    });

    // Get proposal by ID
    app.get('/api/proposals/:id', {
        schema: {
            description: 'Get proposal by ID',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await networkService().get(`/proposals/${id}`, undefined, correlationId);
        return reply.send(data);
    });

    // Accept proposal (company admins and hiring managers)
    app.post('/api/proposals/:id/accept', {
        preHandler: requireRoles(['company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Accept proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await networkService().post(`/proposals/${id}/accept`, request.body, correlationId);
        return reply.send(data);
    });

    // Decline proposal (company admins and hiring managers)
    app.post('/api/proposals/:id/decline', {
        preHandler: requireRoles(['company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Decline proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await networkService().post(`/proposals/${id}/decline`, request.body, correlationId);
        return reply.send(data);
    });

    // Process proposal timeouts (admin only)
    app.post('/api/proposals/process-timeouts', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Process proposal timeouts',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await networkService().post('/proposals/process-timeouts', {}, correlationId);
        return reply.send(data);
    });
}
