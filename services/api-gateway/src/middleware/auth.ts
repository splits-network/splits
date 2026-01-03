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