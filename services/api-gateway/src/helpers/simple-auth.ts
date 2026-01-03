/**
 * Simplified Authentication Helpers
 * 
 * Gateway responsibility: Only verify JWT authentication
 * Service responsibility: Handle authorization via access context
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@splits-network/shared-fastify';
import { AuthContext } from '../auth';

export interface AuthenticatedRequest extends FastifyRequest {
    auth: AuthContext;
}

/**
 * Simple authentication middleware
 * Only checks if user has valid JWT - no role checking
 * Authorization is delegated to V2 services
 */
export function requireAuth() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;

        if (!req.auth || !req.auth.clerkUserId) {
            throw new UnauthorizedError('Authentication required');
        }

        request.log.debug({ 
            clerkUserId: req.auth.clerkUserId, 
            path: request.url 
        }, 'Request authenticated');
        
        return;
    };
}

/**
 * No authentication required - for public endpoints
 */
export function noAuth() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // No-op - public endpoint
        return;
    };
}