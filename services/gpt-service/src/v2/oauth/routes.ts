/**
 * OAuth2 Route Handlers for GPT Service
 * Phase 12: OAuth2 Provider
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OAuthService } from './oauth-service';
import { OAuthError, GPT_SCOPES } from './types';

interface RegisterOAuthConfig {
    oauthService: OAuthService;
}

// Route-specific query/body schemas
interface AuthorizeQuery {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    scope: string;
    state: string;
    code_challenge: string;
    code_challenge_method: 'S256' | 'plain';
}

interface TokenBody {
    grant_type: 'authorization_code' | 'refresh_token';
    code?: string;
    code_verifier?: string;
    client_id: string;
    client_secret: string;
    redirect_uri?: string;
    refresh_token?: string;
}

interface RevokeBody {
    session_id: string;
}

/**
 * Dual-auth resolution helper
 * Supports both GPT Bearer token (from ChatGPT) and x-gpt-clerk-user-id header (from candidate profile page via api-gateway)
 */
async function resolveClerkUserId(
    request: FastifyRequest,
    reply: FastifyReply,
    oauthService: OAuthService
): Promise<string | null> {
    // Option 1: GPT Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer gpt_at_')) {
        try {
            const token = authHeader.substring(7); // Remove 'Bearer '
            const validated = await oauthService.validateAccessToken(token);
            return validated.clerkUserId;
        } catch (error) {
            reply.status(401).send({
                error: 'invalid_token',
                error_description: 'Invalid or expired GPT access token',
            });
            return null;
        }
    }

    // Option 2: x-gpt-clerk-user-id header (trusted - behind api-gateway)
    const clerkUserId = request.headers['x-gpt-clerk-user-id'] as string | undefined;
    if (clerkUserId) {
        return clerkUserId;
    }

    // No auth provided
    reply.status(401).send({
        error: 'authentication_required',
        error_description: 'GPT access token or x-gpt-clerk-user-id header required',
    });
    return null;
}

/**
 * Register OAuth routes
 */
export function registerOAuthRoutes(app: FastifyInstance, config: RegisterOAuthConfig) {
    const { oauthService } = config;

    /**
     * GET /api/v2/oauth/authorize
     * Generate authorization code after consent page authenticates user
     */
    app.get<{ Querystring: AuthorizeQuery }>(
        '/api/v2/oauth/authorize',
        async (request, reply) => {
            const {
                response_type,
                client_id,
                redirect_uri,
                scope,
                state,
                code_challenge,
                code_challenge_method,
            } = request.query;

            try {
                // Validate response_type
                if (response_type !== 'code') {
                    return reply.status(400).send({
                        error: 'unsupported_response_type',
                        error_description: 'Only "code" response type is supported',
                    });
                }

                // Parse scopes
                const scopes = scope.split(' ').filter((s: string) => s.length > 0);

                // Validate scopes
                const invalidScopes = scopes.filter((s: string) => !GPT_SCOPES.includes(s as any));
                if (invalidScopes.length > 0) {
                    return reply.status(400).send({
                        error: 'invalid_scope',
                        error_description: `Invalid scopes: ${invalidScopes.join(', ')}`,
                    });
                }

                // Read clerk_user_id from header (set by consent page after Clerk auth)
                const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
                if (!clerkUserId) {
                    return reply.status(401).send({
                        error: 'access_denied',
                        error_description: 'User not authenticated',
                    });
                }

                // Generate authorization code
                const result = await oauthService.authorize({
                    clerkUserId,
                    redirectUri: redirect_uri,
                    scopes,
                    state,
                    codeChallenge: code_challenge,
                    codeChallengeMethod: code_challenge_method,
                });

                // Return authorization code as JSON (consent page handles redirect)
                return reply.status(200).send({
                    data: { code: result.code },
                });
            } catch (error) {
                if (error instanceof OAuthError) {
                    return reply.status(400).send({
                        error: error.code,
                        error_description: error.message,
                    });
                }

                request.log.error({ err: error }, 'Unexpected error in authorize endpoint');
                return reply.status(500).send({
                    error: 'server_error',
                    error_description: 'Internal server error',
                });
            }
        }
    );

    /**
     * POST /api/v2/oauth/token
     * Exchange authorization code or refresh token for access tokens
     */
    app.post<{ Body: TokenBody }>(
        '/api/v2/oauth/token',
        async (request, reply) => {
            const {
                grant_type,
                code,
                code_verifier,
                client_id,
                client_secret,
                redirect_uri,
                refresh_token,
            } = request.body;

            try {
                if (grant_type === 'authorization_code') {
                    // Validate required params
                    if (!code || !code_verifier || !redirect_uri) {
                        return reply.status(400).send({
                            error: 'invalid_request',
                            error_description: 'Missing required parameters: code, code_verifier, redirect_uri',
                        });
                    }

                    // Exchange code for tokens
                    const tokenResponse = await oauthService.exchangeCode({
                        code,
                        codeVerifier: code_verifier,
                        clientId: client_id,
                        clientSecret: client_secret,
                        redirectUri: redirect_uri,
                    });

                    return reply.status(200).send(tokenResponse);
                } else if (grant_type === 'refresh_token') {
                    // Validate required params
                    if (!refresh_token) {
                        return reply.status(400).send({
                            error: 'invalid_request',
                            error_description: 'Missing required parameter: refresh_token',
                        });
                    }

                    // Refresh tokens
                    const tokenResponse = await oauthService.refresh({
                        refreshToken: refresh_token,
                        clientId: client_id,
                        clientSecret: client_secret,
                    });

                    return reply.status(200).send(tokenResponse);
                } else {
                    return reply.status(400).send({
                        error: 'unsupported_grant_type',
                        error_description: 'Only authorization_code and refresh_token grant types are supported',
                    });
                }
            } catch (error) {
                // OAuth error - return 400 with error details
                if (error instanceof OAuthError) {
                    return reply.status(400).send({
                        error: error.code,
                        error_description: error.message,
                    });
                }

                // Unexpected error - return 500
                request.log.error({ err: error }, 'Unexpected error in token endpoint');
                return reply.status(500).send({
                    error: 'server_error',
                    error_description: 'Internal server error',
                });
            }
        }
    );

    /**
     * POST /api/v2/oauth/revoke
     * Revoke a specific session
     * Authorization: Bearer token (GPT access token) OR x-gpt-clerk-user-id header
     */
    app.post<{ Body: RevokeBody }>(
        '/api/v2/oauth/revoke',
        async (request, reply) => {
            const { session_id } = request.body;

            if (!session_id) {
                return reply.status(400).send({
                    error: 'invalid_request',
                    error_description: 'Missing required parameter: session_id',
                });
            }

            try {
                // Resolve clerk_user_id from GPT token or header
                const clerkUserId = await resolveClerkUserId(request, reply, oauthService);
                if (!clerkUserId) return; // resolveClerkUserId already sent error response

                // Revoke session
                await oauthService.revoke(session_id, clerkUserId);

                return reply.status(200).send({
                    data: { revoked: true },
                });
            } catch (error) {
                request.log.error({ err: error }, 'Error revoking session');
                return reply.status(500).send({
                    error: 'server_error',
                    error_description: 'Failed to revoke session',
                });
            }
        }
    );

    /**
     * GET /api/v2/oauth/sessions
     * List active sessions for authenticated user
     * Authorization: Bearer token (GPT access token) OR x-gpt-clerk-user-id header
     */
    app.get('/api/v2/oauth/sessions', async (request, reply) => {
        try {
            // Resolve clerk_user_id from GPT token or header
            const clerkUserId = await resolveClerkUserId(request, reply, oauthService);
            if (!clerkUserId) return; // resolveClerkUserId already sent error response

            // List sessions
            const sessions = await oauthService.listSessions(clerkUserId);

            return reply.status(200).send({
                data: sessions,
            });
        } catch (error) {
            request.log.error({ err: error }, 'Error listing sessions');
            return reply.status(500).send({
                error: 'server_error',
                error_description: 'Failed to list sessions',
            });
        }
    });

    /**
     * GET /api/v2/oauth/consent-check
     * Check if user has existing consent for requested scopes
     * No auth required - called by consent page frontend (which has Clerk auth)
     */
    app.get<{ Querystring: { scopes: string } }>(
        '/api/v2/oauth/consent-check',
        async (request, reply) => {
            const { scopes } = request.query;

            if (!scopes) {
                return reply.status(400).send({
                    error: 'invalid_request',
                    error_description: 'Missing required parameter: scopes',
                });
            }

            // Read clerk_user_id from header (set by consent page backend after Clerk auth)
            const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
            if (!clerkUserId) {
                return reply.status(401).send({
                    error: 'authentication_required',
                    error_description: 'x-clerk-user-id header required',
                });
            }

            try {
                // Parse comma-separated scopes
                const scopeArray = scopes.split(',').filter(s => s.length > 0);

                // Check existing consent
                const result = await oauthService.hasExistingConsent(clerkUserId, scopeArray);

                return reply.status(200).send({
                    data: result,
                });
            } catch (error) {
                request.log.error({ err: error }, 'Error checking consent');
                return reply.status(500).send({
                    error: 'server_error',
                    error_description: 'Failed to check consent',
                });
            }
        }
    );
}
