/**
 * Helper functions for V2 routes
 */

import { FastifyReply } from 'fastify';

export function requireUserContext(clerkUserId: string | undefined, reply: FastifyReply) {
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
