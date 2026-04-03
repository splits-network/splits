/**
 * Public Recruiter Gateway Routes (unauthenticated)
 * Proxies public recruiter requests to the network service.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { optionalAuth } from '../../middleware/auth.js';
import { buildAuthHeaders } from '../../helpers/auth-headers.js';
import { getCorrelationId } from './common.js';

export function registerPublicRecruiterGatewayRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');

    // GET recruiter by slug
    app.get(
        '/api/v2/public/recruiters/:slug',
        { preHandler: optionalAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { slug } = request.params as { slug: string };
                const query = request.query as { include?: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/recruiters/by-slug/${slug}`,
                    query,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error }, 'Failed to fetch public recruiter');
                return reply
                    .status(error?.statusCode || 500)
                    .send(error?.jsonBody || { error: 'Failed to fetch recruiter' });
            }
        }
    );
}
