/**
 * Public Firm Gateway Routes (unauthenticated)
 * Proxies public firm requests to the network service.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { optionalAuth } from '../../middleware/auth.js';
import { buildAuthHeaders } from '../../helpers/auth-headers.js';
import { getCorrelationId } from './common.js';

export function registerPublicFirmGatewayRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');

    // LIST marketplace-visible firms
    app.get(
        '/api/v2/public/firms',
        { preHandler: optionalAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/public/firms',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error }, 'Failed to list public firms');
                return reply
                    .status(error?.statusCode || 500)
                    .send(error?.jsonBody || { error: 'Failed to list firms' });
            }
        }
    );

    // GET firm by slug
    app.get(
        '/api/v2/public/firms/:slug',
        { preHandler: optionalAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { slug } = request.params as { slug: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/public/firms/${slug}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error }, 'Failed to fetch public firm');
                return reply
                    .status(error?.statusCode || 500)
                    .send(error?.jsonBody || { error: 'Failed to fetch firm' });
            }
        }
    );

    // GET enriched firm profile
    app.get(
        '/api/v2/public/firms/:slug/profile',
        { preHandler: optionalAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { slug } = request.params as { slug: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/public/firms/${slug}/profile`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error }, 'Failed to fetch firm profile');
                return reply
                    .status(error?.statusCode || 500)
                    .send(error?.jsonBody || { error: 'Failed to fetch firm profile' });
            }
        }
    );

    // GET firm public members
    app.get(
        '/api/v2/public/firms/:slug/members',
        { preHandler: optionalAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { slug } = request.params as { slug: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/public/firms/${slug}/members`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error }, 'Failed to fetch firm members');
                return reply
                    .status(error?.statusCode || 500)
                    .send(error?.jsonBody || { error: 'Failed to fetch firm members' });
            }
        }
    );
}
