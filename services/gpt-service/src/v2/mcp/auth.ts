/**
 * MCP Auth Middleware
 *
 * Extracts and validates Bearer token from MCP HTTP requests.
 * Attaches auth context to the request for downstream tool handlers.
 */

import { IncomingMessage } from 'node:http';
import { OAuthService } from '../oauth/oauth-service.js';
import { McpAuthContext } from './types.js';

/**
 * Extract and validate auth from an incoming MCP HTTP request.
 * Returns the validated auth context, or throws on failure.
 */
export async function extractMcpAuth(
    req: IncomingMessage,
    oauthService: OAuthService,
): Promise<McpAuthContext> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer gpt_at_')) {
        throw new McpAuthError(
            'unauthorized',
            'Bearer token required',
            401,
        );
    }

    const token = authHeader.substring(7); // Strip 'Bearer '

    try {
        const validated = await oauthService.validateAccessToken(token);
        return {
            clerkUserId: validated.clerkUserId,
            sessionId: validated.sessionId,
            scopes: validated.scopes,
        };
    } catch (error: any) {
        const message = error.message || '';

        if (message.includes('expired')) {
            throw new McpAuthError(
                'token_expired',
                'Access token has expired',
                401,
            );
        }

        throw new McpAuthError(
            'invalid_token',
            'Invalid access token',
            401,
        );
    }
}

/**
 * Check that auth context has the required scope.
 */
export function requireMcpScope(auth: McpAuthContext, scope: string): void {
    if (!auth.scopes.includes(scope)) {
        throw new McpAuthError(
            'insufficient_scope',
            `Required scope: ${scope}`,
            403,
        );
    }
}

/**
 * Structured auth error for MCP requests.
 */
export class McpAuthError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = 'McpAuthError';
    }
}
