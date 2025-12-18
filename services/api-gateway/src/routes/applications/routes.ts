import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';

/**
 * Applications Routes
 * - Application lifecycle management
 * - Stage transitions
 */
export function registerApplicationsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // List applications
    app.get('/api/applications', {
        schema: {
            description: 'List all applications',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/applications?${queryString}` : '/applications';
        const data = await atsService().get(path);
        return reply.send(data);
    });

    // Get application by ID
    app.get('/api/applications/:id', {
        schema: {
            description: 'Get application by ID',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().get(`/applications/${id}`);
        return reply.send(data);
    });

    // Submit application (recruiters only)
    app.post('/api/applications', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Submit new application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const networkService = services.get('network');
        const correlationId = getCorrelationId(request);

        // Get actual recruiter ID from network service using user ID
        let recruiterId: string | undefined;
        try {
            const recruiterResponse: any = await networkService.get(
                `/recruiters/by-user/${req.auth.userId}`,
                undefined,
                correlationId
            );
            recruiterId = recruiterResponse.data?.id;
        } catch (error) {
            request.log.error({ error, userId: req.auth.userId }, 'Failed to get recruiter ID');
            return reply.status(403).send({ error: 'Active recruiter status required' });
        }

        if (!recruiterId) {
            return reply.status(403).send({ error: 'Active recruiter status required' });
        }

        const data = await atsService().post('/applications', {
            ...(request.body as any),
            recruiter_id: recruiterId,
        }, correlationId);
        return reply.send(data);
    });

    // Accept application (company users only)
    app.post('/api/applications/:id/accept', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Accept application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/applications/${id}/accept`, request.body, correlationId);
        return reply.send(data);
    });

    // Change application stage (company users and admins)
    app.patch('/api/applications/:id/stage', {
        preHandler: requireRoles(['company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Change application stage',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().patch(`/applications/${id}/stage`, request.body);
        return reply.send(data);
    });
}
