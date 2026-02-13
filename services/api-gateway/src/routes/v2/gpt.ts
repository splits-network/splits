import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildQueryString, getCorrelationId } from './common';

/**
 * GPT OAuth2 and API routes
 *
 * These routes bypass Clerk authentication as they use GPT-issued OAuth tokens.
 * The gpt-service handles its own token validation.
 *
 * Routes:
 * - GET /api/v1/gpt/oauth/authorize - OAuth authorization endpoint
 * - POST /api/v1/gpt/oauth/token - OAuth token endpoint
 * - POST /api/v1/gpt/oauth/revoke - OAuth revocation endpoint
 * - GET/POST /api/v1/gpt/* - Wildcard for GPT API endpoints
 */
export function registerGptRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const gptService = () => services.get('gpt');

    // OAuth authorization endpoint
    // GET /api/v1/gpt/oauth/authorize -> gpt-service /api/v2/oauth/authorize
    app.get(
        '/api/v1/gpt/oauth/authorize',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/oauth/authorize?${queryString}` : '/api/v2/oauth/authorize';

            try {
                const data = await gptService().get(path, undefined, correlationId, {});
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy GPT OAuth authorize request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy OAuth authorize request' });
            }
        }
    );

    // OAuth token endpoint
    // POST /api/v1/gpt/oauth/token -> gpt-service /api/v2/oauth/token
    app.post(
        '/api/v1/gpt/oauth/token',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);

            try {
                const data = await gptService().post(
                    '/api/v2/oauth/token',
                    request.body,
                    correlationId,
                    {}
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy GPT OAuth token request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy OAuth token request' });
            }
        }
    );

    // OAuth revocation endpoint
    // POST /api/v1/gpt/oauth/revoke -> gpt-service /api/v2/oauth/revoke
    app.post(
        '/api/v1/gpt/oauth/revoke',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeader = request.headers['authorization'];

            const headers: Record<string, string> = {};
            if (authHeader) {
                headers['authorization'] = authHeader;
            }

            try {
                const data = await gptService().post(
                    '/api/v2/oauth/revoke',
                    request.body,
                    correlationId,
                    headers
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy GPT OAuth revoke request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy OAuth revoke request' });
            }
        }
    );

    // Wildcard GET route for GPT API endpoints
    // GET /api/v1/gpt/:path(*) -> gpt-service /api/v2/:path
    app.get(
        '/api/v1/gpt/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeader = request.headers['authorization'];
            const clerkUserIdHeader = request.headers['x-gpt-clerk-user-id'];

            // Extract path after /api/v1/gpt/
            const fullPath = request.url;
            const gptPath = fullPath.replace(/^\/api\/v1\/gpt\//, '');
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/${gptPath}?${queryString}` : `/api/v2/${gptPath}`;

            const headers: Record<string, string> = {};
            if (authHeader) {
                headers['authorization'] = authHeader;
            }
            if (clerkUserIdHeader) {
                headers['x-gpt-clerk-user-id'] = clerkUserIdHeader as string;
            }

            try {
                const data = await gptService().get(path, undefined, correlationId, headers);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy GPT API request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy GPT API request' });
            }
        }
    );

    // Wildcard POST route for GPT API endpoints
    // POST /api/v1/gpt/:path(*) -> gpt-service /api/v2/:path
    app.post(
        '/api/v1/gpt/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeader = request.headers['authorization'];
            const clerkUserIdHeader = request.headers['x-gpt-clerk-user-id'];

            // Extract path after /api/v1/gpt/
            const fullPath = request.url.split('?')[0];
            const gptPath = fullPath.replace(/^\/api\/v1\/gpt\//, '');
            const path = `/api/v2/${gptPath}`;

            const headers: Record<string, string> = {};
            if (authHeader) {
                headers['authorization'] = authHeader;
            }
            if (clerkUserIdHeader) {
                headers['x-gpt-clerk-user-id'] = clerkUserIdHeader as string;
            }

            try {
                const data = await gptService().post(path, request.body, correlationId, headers);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy GPT API request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy GPT API request' });
            }
        }
    );
}
