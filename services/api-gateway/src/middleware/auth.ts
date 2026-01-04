import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';

/**
 * Simple authentication middleware that verifies Clerk JWT exists
 * Services handle their own authorization via access context
 */
export const requireAuth = (): preHandlerHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Check if user is authenticated via Clerk
        if (!request.auth?.clerkUserId) {
            return reply.status(401).send({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }
    };
};

/**
 * Optional authentication middleware - allows both authenticated and unauthenticated requests
 * Populates request.auth if token is present, but doesn't reject if missing
 * Use for public endpoints that enhance functionality when authenticated
 */
export const optionalAuth = (): preHandlerHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Auth is already parsed by @clerk/fastify plugin
        // This middleware does nothing but allows the request to proceed
        // Backend services check request.auth?.clerkUserId to determine if authenticated
    };
};