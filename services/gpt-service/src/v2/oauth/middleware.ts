/**
 * OAuth JWT Validation Middleware
 * Phase 12: OAuth2 Provider
 */

import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { OAuthService } from './oauth-service';

// Extend FastifyRequest to include gptAuth
declare module 'fastify' {
    interface FastifyRequest {
        gptAuth?: {
            clerkUserId: string;
            sessionId: string;
            scopes: string[];
        };
    }
}

/**
 * Extract and validate GPT access token from Authorization header
 * Populates request.gptAuth with validated token claims
 */
export function extractGptAuth(oauthService: OAuthService): preHandlerHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const authHeader = request.headers.authorization;

        // Check for Authorization header
        if (!authHeader) {
            return reply.status(401).send({
                error: 'token_missing',
                error_description: 'GPT access token required',
            });
        }

        // Check for Bearer token with gpt_at_ prefix
        if (!authHeader.startsWith('Bearer gpt_at_')) {
            return reply.status(401).send({
                error: 'token_missing',
                error_description: 'GPT access token required',
            });
        }

        // Extract token (strip 'Bearer ' prefix)
        const token = authHeader.substring(7);

        try {
            // Validate token via OAuthService
            const validated = await oauthService.validateAccessToken(token);

            // Attach to request for downstream handlers
            request.gptAuth = {
                clerkUserId: validated.clerkUserId,
                sessionId: validated.sessionId,
                scopes: validated.scopes,
            };
        } catch (error: any) {
            // Check error message to determine specific error code
            const errorMessage = error.message || '';

            if (errorMessage.includes('expired')) {
                return reply.status(401).send({
                    error: 'token_expired',
                    error_description: 'Access token has expired',
                });
            }

            // Invalid signature, claims, or other validation failure
            return reply.status(401).send({
                error: 'invalid_token',
                error_description: 'Invalid access token',
            });
        }
    };
}

/**
 * Require specific scope for endpoint access
 * Must be used after extractGptAuth middleware
 */
export function requireScope(scope: string): preHandlerHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Ensure gptAuth is populated (extractGptAuth must be called first)
        if (!request.gptAuth) {
            return reply.status(401).send({
                error: 'token_missing',
                error_description: 'GPT access token required',
            });
        }

        // Check if required scope is present
        if (!request.gptAuth.scopes.includes(scope)) {
            return reply.status(403).send({
                error: 'insufficient_scope',
                scope: scope,
            });
        }

        // Scope is present, continue to handler
    };
}
