import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { request as httpRequest } from 'node:http';
import { URL } from 'node:url';
import { ServiceRegistry } from '../../clients';
import { buildQueryString, getCorrelationId } from './common';

/**
 * GPT OAuth2, API, and MCP App routes
 *
 * These routes bypass Clerk authentication as they use GPT-issued OAuth tokens.
 * The gpt-service handles its own token validation.
 *
 * Rate limits (per-user, keyed by Bearer token suffix):
 * - Read endpoints (GET, OAuth): 30 requests/min
 * - Write/expensive endpoints (POST wildcard): 10 requests/min
 *
 * Routes:
 * - GET /api/v1/gpt/oauth/authorize - OAuth authorization endpoint
 * - POST /api/v1/gpt/oauth/token - OAuth token endpoint
 * - POST /api/v1/gpt/oauth/revoke - OAuth revocation endpoint
 * - GET/POST /api/v1/gpt/* - Wildcard for GPT API endpoints
 * - POST/GET/DELETE /api/v1/gpt/mcp - MCP streaming transport (raw proxy)
 * - GET /.well-known/oauth-protected-resource - OAuth resource metadata
 * - GET /.well-known/oauth-authorization-server - OAuth server metadata
 */
export function registerGptRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const gptService = () => services.get('gpt');

    // GPT read endpoints: 30 requests/min per user
    const gptReadRateLimit = {
        rateLimit: {
            max: 30,
            timeWindow: '1 minute',
            keyGenerator: (request: any) => {
                const auth = request.headers['authorization'];
                if (auth) return `gpt-read:${auth.slice(-16)}`;
                return `gpt-read:${request.ip}`;
            },
        },
    };

    // GPT write/expensive endpoints: 10 requests/min per user
    const gptWriteRateLimit = {
        rateLimit: {
            max: 10,
            timeWindow: '1 minute',
            keyGenerator: (request: any) => {
                const auth = request.headers['authorization'];
                if (auth) return `gpt-write:${auth.slice(-16)}`;
                return `gpt-write:${request.ip}`;
            },
        },
    };

    // OAuth authorization endpoint
    // GET /api/v1/gpt/oauth/authorize -> gpt-service /api/v2/oauth/authorize
    app.get(
        '/api/v1/gpt/oauth/authorize',
        { config: gptReadRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/oauth/authorize?${queryString}` : '/api/v2/oauth/authorize';

            const clerkUserIdHeader = request.headers['x-clerk-user-id'];
            const headers: Record<string, string> = {};
            if (clerkUserIdHeader) {
                headers['x-clerk-user-id'] = clerkUserIdHeader as string;
            }

            try {
                const data = await gptService().get(path, undefined, correlationId, headers);
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
        { config: gptReadRateLimit },
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
        { config: gptReadRateLimit },
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
        { config: gptReadRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeader = request.headers['authorization'];
            const clerkUserIdHeader = request.headers['x-gpt-clerk-user-id'];
            const clerkUserIdDirect = request.headers['x-clerk-user-id'];

            // Extract path after /api/v1/gpt/
            const fullPath = request.url.split('?')[0];
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
            if (clerkUserIdDirect) {
                headers['x-clerk-user-id'] = clerkUserIdDirect as string;
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

    // Wildcard POST route for GPT API endpoints (excluding MCP — handled below)
    // POST /api/v1/gpt/:path(*) -> gpt-service /api/v2/:path
    app.post(
        '/api/v1/gpt/*',
        { config: gptWriteRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            // Skip MCP routes — they use raw streaming proxy below
            const fullPath = request.url.split('?')[0];
            if (fullPath === '/api/v1/gpt/mcp') return;

            const correlationId = getCorrelationId(request);
            const authHeader = request.headers['authorization'];
            const clerkUserIdHeader = request.headers['x-gpt-clerk-user-id'];

            // Extract path after /api/v1/gpt/
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

    // ========================================================================
    // MCP Streaming Transport — Raw HTTP Proxy
    // MCP uses SSE streams that can't go through JSON-based ServiceClient.
    // We pipe raw req/res to the upstream gpt-service.
    // ========================================================================

    /**
     * Raw HTTP proxy for MCP transport.
     * Pipes the incoming request directly to gpt-service and streams the response back.
     */
    function proxyMcpRaw(
        request: FastifyRequest,
        reply: FastifyReply,
        method: string,
    ) {
        const upstreamUrl = new URL('/api/v2/mcp', gptService().baseURL);
        const correlationId = getCorrelationId(request);

        // Forward relevant headers
        const proxyHeaders: Record<string, string> = {
            'x-correlation-id': correlationId,
        };
        const headersToForward = ['authorization', 'content-type', 'accept', 'mcp-session-id'];
        for (const h of headersToForward) {
            const val = request.headers[h];
            if (val) proxyHeaders[h] = Array.isArray(val) ? val[0] : val;
        }

        reply.hijack();

        const proxyReq = httpRequest(
            {
                hostname: upstreamUrl.hostname,
                port: upstreamUrl.port,
                path: upstreamUrl.pathname,
                method,
                headers: proxyHeaders,
            },
            (proxyRes) => {
                // Write status + headers
                reply.raw.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
                // Pipe response body (SSE stream or JSON)
                proxyRes.pipe(reply.raw);
            },
        );

        proxyReq.on('error', (err) => {
            request.log.error({ err, correlationId }, 'MCP proxy error');
            if (!reply.raw.headersSent) {
                reply.raw.writeHead(502);
                reply.raw.end(JSON.stringify({ error: 'MCP proxy error' }));
            }
        });

        // Pipe request body for POST
        if (method === 'POST' || method === 'DELETE') {
            request.raw.pipe(proxyReq);
        } else {
            proxyReq.end();
        }
    }

    // POST /api/v1/gpt/mcp — MCP messages (JSON-RPC over HTTP)
    app.post(
        '/api/v1/gpt/mcp',
        { config: gptWriteRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            proxyMcpRaw(request, reply, 'POST');
        },
    );

    // GET /api/v1/gpt/mcp — MCP SSE stream
    app.get(
        '/api/v1/gpt/mcp',
        { config: gptReadRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            proxyMcpRaw(request, reply, 'GET');
        },
    );

    // DELETE /api/v1/gpt/mcp — MCP session termination
    app.delete(
        '/api/v1/gpt/mcp',
        { config: gptReadRateLimit },
        async (request: FastifyRequest, reply: FastifyReply) => {
            proxyMcpRaw(request, reply, 'DELETE');
        },
    );

    // ========================================================================
    // Well-Known OAuth Endpoints — Proxy to gpt-service
    // ========================================================================

    // GET /.well-known/oauth-protected-resource
    app.get(
        '/.well-known/oauth-protected-resource',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            try {
                const data = await gptService().get(
                    '/.well-known/oauth-protected-resource',
                    undefined,
                    correlationId,
                    {},
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy well-known resource metadata');
                return reply.status(500).send({ error: 'Failed to fetch resource metadata' });
            }
        },
    );

    // GET /.well-known/oauth-authorization-server
    app.get(
        '/.well-known/oauth-authorization-server',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            try {
                const data = await gptService().get(
                    '/.well-known/oauth-authorization-server',
                    undefined,
                    correlationId,
                    {},
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy well-known server metadata');
                return reply.status(500).send({ error: 'Failed to fetch server metadata' });
            }
        },
    );

    // POST /api/v1/gpt/oauth/register — Dynamic Client Registration
    app.post(
        '/api/v1/gpt/oauth/register',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            try {
                const data = await gptService().post(
                    '/api/v2/oauth/register',
                    request.body,
                    correlationId,
                    {},
                );
                return reply.status(201).send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy DCR request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to register client' });
            }
        },
    );
}
