/**
 * Helper functions for V2 routes
 */

import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Validate internal service authentication
 * Allows trusted services (automation, notification) to call endpoints without user auth
 */
export function validateInternalService(request: FastifyRequest): boolean {
    const serviceKey = request.headers['x-internal-service-key'] as string | undefined;
    const expectedKey = process.env.INTERNAL_SERVICE_KEY;
    
    if (!expectedKey) {
        // If no internal service key is configured, don't allow internal service auth
        return false;
    }
    
    return serviceKey === expectedKey;
}

export function requireUserContext(clerkUserId: string | undefined, reply: FastifyReply, request?: FastifyRequest) {
    // Allow internal services to bypass user auth
    if (request && validateInternalService(request)) {
        return true;
    }
    
    if (!clerkUserId) {
        reply.status(401).send({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Missing x-clerk-user-id header. Authentication required.',
            },
        });
        return false;
    }
    return true;
}

export function validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
