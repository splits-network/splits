import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId } from './common';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const MATCHING_RESOURCES: ResourceDefinition[] = [
    {
        name: 'matches',
        service: 'matching',
        basePath: '/matches',
        serviceBasePath: '/api/v2/matches',
        tag: 'matching',
    },
];

export function registerMatchingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    MATCHING_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));

    const serviceClient = () => services.get('matching');

    // Custom route: dismiss a match
    app.patch(
        '/api/v2/matches/:id/dismiss',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().patch(
                `/api/v2/matches/${id}/dismiss`,
                request.body,
                correlationId,
                buildAuthHeaders(request),
            );
            return reply.send(data);
        },
    );

    // Custom route: admin refresh
    app.post(
        '/api/v2/matches/refresh',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().post(
                '/api/v2/matches/refresh',
                request.body,
                correlationId,
                buildAuthHeaders(request),
            );
            return reply.send(data);
        },
    );

    // Custom route: internal batch refresh (no auth, uses internal key)
    app.post(
        '/api/v2/matches/batch-refresh',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const headers: Record<string, string> = {};
            const internalKey = request.headers['x-internal-service-key'] as string;
            if (internalKey) headers['x-internal-service-key'] = internalKey;
            const data = await serviceClient().post(
                '/api/v2/matches/batch-refresh',
                request.body,
                correlationId,
                headers,
            );
            return reply.send(data);
        },
    );
}
