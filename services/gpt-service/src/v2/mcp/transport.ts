/**
 * MCP Transport — Fastify-to-MCP Bridge
 *
 * Registers Fastify routes at /api/v2/mcp that bridge to the MCP SDK's
 * StreamableHTTPServerTransport. Uses reply.hijack() to hand raw
 * Node.js req/res to the MCP transport.
 */

import { FastifyInstance } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServerDeps } from './types';
import { createMcpServer } from './server';
import { extractMcpAuth, McpAuthError } from './auth';

/**
 * Register MCP transport routes on the Fastify instance.
 *
 * Creates a new StreamableHTTPServerTransport + McpServer per session.
 * Stateful mode: server generates session IDs, requests are validated.
 */
export function registerMcpRoutes(app: FastifyInstance, deps: McpServerDeps) {
    // Map of sessionId → { transport, setAuth }
    const sessions = new Map<string, {
        transport: StreamableHTTPServerTransport;
        setAuth: (auth: any) => void;
        server: ReturnType<typeof createMcpServer>['server'];
    }>();

    /**
     * POST /api/v2/mcp — Main MCP message endpoint
     *
     * Handles JSON-RPC messages. Creates new sessions on initialize,
     * routes to existing sessions for subsequent requests.
     */
    app.post('/api/v2/mcp', async (request, reply) => {
        try {
            // Authenticate
            const auth = await extractMcpAuth(request.raw, deps.oauthService);

            // Check for existing session
            const sessionId = request.headers['mcp-session-id'] as string | undefined;

            if (sessionId && sessions.has(sessionId)) {
                // Existing session
                const session = sessions.get(sessionId)!;
                session.setAuth(auth);

                // Hijack and delegate to MCP transport
                reply.hijack();
                await session.transport.handleRequest(request.raw, reply.raw, request.body);
                return;
            }

            // New session — create transport + server
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => `mcp_${crypto.randomUUID()}`,
            });

            const { server, setAuth } = createMcpServer(deps);
            setAuth(auth);

            // Connect server to transport
            await server.connect(transport);

            // Store session after connection (sessionId is set after first handleRequest)
            transport.onclose = () => {
                if (transport.sessionId) {
                    sessions.delete(transport.sessionId);
                    deps.logger.info({ sessionId: transport.sessionId }, 'MCP session closed');
                }
            };

            // Hijack and handle the initialize request
            reply.hijack();
            await transport.handleRequest(request.raw, reply.raw, request.body);

            // Store session after handling (sessionId now available)
            if (transport.sessionId) {
                sessions.set(transport.sessionId, { transport, setAuth, server });
                deps.logger.info({ sessionId: transport.sessionId }, 'MCP session created');
            }
        } catch (error) {
            if (error instanceof McpAuthError) {
                return reply.status(error.statusCode).send({
                    error: error.code,
                    error_description: error.message,
                });
            }
            deps.logger.error({ error }, 'MCP POST handler error');
            return reply.status(500).send({
                error: 'internal_error',
                error_description: 'Internal server error',
            });
        }
    });

    /**
     * GET /api/v2/mcp — SSE stream for server-initiated notifications
     */
    app.get('/api/v2/mcp', async (request, reply) => {
        try {
            const auth = await extractMcpAuth(request.raw, deps.oauthService);
            const sessionId = request.headers['mcp-session-id'] as string | undefined;

            if (!sessionId || !sessions.has(sessionId)) {
                return reply.status(400).send({
                    error: 'invalid_session',
                    error_description: 'Valid Mcp-Session-Id header required',
                });
            }

            const session = sessions.get(sessionId)!;
            session.setAuth(auth);

            reply.hijack();
            await session.transport.handleRequest(request.raw, reply.raw);
        } catch (error) {
            if (error instanceof McpAuthError) {
                return reply.status(error.statusCode).send({
                    error: error.code,
                    error_description: error.message,
                });
            }
            deps.logger.error({ error }, 'MCP GET handler error');
            return reply.status(500).send({
                error: 'internal_error',
                error_description: 'Internal server error',
            });
        }
    });

    /**
     * DELETE /api/v2/mcp — End an MCP session
     */
    app.delete('/api/v2/mcp', async (request, reply) => {
        try {
            const auth = await extractMcpAuth(request.raw, deps.oauthService);
            const sessionId = request.headers['mcp-session-id'] as string | undefined;

            if (!sessionId || !sessions.has(sessionId)) {
                return reply.status(400).send({
                    error: 'invalid_session',
                    error_description: 'Valid Mcp-Session-Id header required',
                });
            }

            const session = sessions.get(sessionId)!;
            session.setAuth(auth);

            reply.hijack();
            await session.transport.handleRequest(request.raw, reply.raw);
        } catch (error) {
            if (error instanceof McpAuthError) {
                return reply.status(error.statusCode).send({
                    error: error.code,
                    error_description: error.message,
                });
            }
            deps.logger.error({ error }, 'MCP DELETE handler error');
            return reply.status(500).send({
                error: 'internal_error',
                error_description: 'Internal server error',
            });
        }
    });
}
