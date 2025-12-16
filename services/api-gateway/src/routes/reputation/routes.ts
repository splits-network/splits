import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';

/**
 * Reputation Routes (Phase 2)
 * - Recruiter reputation management
 */
export function registerReputationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // Get recruiter reputation
    app.get('/api/recruiters/:id/reputation', {
        schema: {
            description: 'Get recruiter reputation',
            tags: ['reputation'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await networkService().get(`/recruiters/${id}/reputation`, undefined, correlationId);
        return reply.send(data);
    });

    // Recalculate recruiter reputation (admin only)
    app.post('/api/recruiters/:id/reputation/recalculate', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Recalculate recruiter reputation',
            tags: ['reputation'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await networkService().post(`/recruiters/${id}/reputation/recalculate`, {}, correlationId);
        return reply.send(data);
    });

    // Get reputation leaderboard
    app.get('/api/reputation/leaderboard', {
        schema: {
            description: 'Get reputation leaderboard',
            tags: ['reputation'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/reputation/leaderboard?${queryString}` : '/reputation/leaderboard';
        const data = await networkService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // Get reputation history
    app.get('/api/recruiters/:id/reputation/history', {
        schema: {
            description: 'Get reputation history',
            tags: ['reputation'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/recruiters/${id}/reputation/history?${queryString}` : `/recruiters/${id}/reputation/history`;
        const data = await networkService().get(path, undefined, correlationId);
        return reply.send(data);
    });
}
