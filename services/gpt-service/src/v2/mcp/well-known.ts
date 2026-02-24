/**
 * OAuth 2.1 Well-Known Endpoints for MCP
 *
 * Provides discovery metadata required by the MCP Apps OAuth 2.1 spec:
 * - /.well-known/oauth-protected-resource
 * - /.well-known/oauth-authorization-server
 * - POST /api/v2/oauth/register (Dynamic Client Registration passthrough)
 */

import { FastifyInstance } from 'fastify';
import { GptConfig } from '@splits-network/shared-config';

interface WellKnownConfig {
    gptConfig: GptConfig;
}

/**
 * The base URL for public-facing endpoints.
 * In production, this is the API gateway URL.
 */
function getBaseUrl(): string {
    return process.env.PUBLIC_BASE_URL || 'https://api.splits.network';
}

export function registerWellKnownRoutes(app: FastifyInstance, config: WellKnownConfig) {
    const { gptConfig } = config;
    const baseUrl = getBaseUrl();

    /**
     * GET /.well-known/oauth-protected-resource
     * RFC 9728: OAuth 2.0 Protected Resource Metadata
     */
    app.get('/.well-known/oauth-protected-resource', async (_request, reply) => {
        return reply.send({
            resource: `${baseUrl}/api/v1/gpt/mcp`,
            authorization_servers: [`${baseUrl}`],
            scopes_supported: ['jobs:read', 'applications:read', 'applications:write', 'resume:read'],
            bearer_methods_supported: ['header'],
        });
    });

    /**
     * GET /.well-known/oauth-authorization-server
     * RFC 8414: OAuth 2.0 Authorization Server Metadata
     */
    app.get('/.well-known/oauth-authorization-server', async (_request, reply) => {
        return reply.send({
            issuer: baseUrl,
            authorization_endpoint: `${baseUrl}/api/v1/gpt/oauth/authorize`,
            token_endpoint: `${baseUrl}/api/v1/gpt/oauth/token`,
            registration_endpoint: `${baseUrl}/api/v1/gpt/oauth/register`,
            scopes_supported: ['jobs:read', 'applications:read', 'applications:write', 'resume:read'],
            response_types_supported: ['code'],
            grant_types_supported: ['authorization_code', 'refresh_token'],
            token_endpoint_auth_methods_supported: ['client_secret_post'],
            code_challenge_methods_supported: ['S256'],
            revocation_endpoint: `${baseUrl}/api/v1/gpt/oauth/revoke`,
        });
    });

    /**
     * POST /api/v2/oauth/register
     * Dynamic Client Registration (RFC 7591) — Passthrough pattern
     *
     * MCP clients (ChatGPT, Claude) send a registration request.
     * We return our existing static client credentials.
     * No new DB record needed.
     */
    app.post('/api/v2/oauth/register', async (request, reply) => {
        const body = request.body as Record<string, any> || {};

        // Log the registration request for visibility
        app.log.info(
            { client_name: body.client_name, redirect_uris: body.redirect_uris },
            'MCP Dynamic Client Registration request',
        );

        // Return existing static client credentials
        return reply.status(201).send({
            client_id: gptConfig.clientId,
            client_secret: gptConfig.clientSecret,
            client_name: body.client_name || 'Career Copilot Client',
            redirect_uris: body.redirect_uris || [gptConfig.redirectUri],
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            token_endpoint_auth_method: 'client_secret_post',
        });
    });
}
