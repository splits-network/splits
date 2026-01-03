import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '@splits-network/shared-fastify';
import { AuthContext, UserRole } from './auth';
import { ServiceRegistry } from './clients';

export interface AuthenticatedRequest extends FastifyRequest {
    auth: AuthContext;
}

/**
 * Simple authentication middleware - Gateway responsibility ends here
 * 
 * GATEWAY: Verify JWT and pass authenticated user to service
 * SERVICE: Handle authorization via resolveAccessContext(clerkUserId, supabase)
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
        }, 'Request authenticated - authorization delegated to service');
    };
}

/**
 * @deprecated Use requireAuth() instead - authorization moved to services
 */
export function requireRoles(allowedRoles: UserRole[], services?: ServiceRegistry) {
    return requireAuth();
}

// ROLE HELPER FUNCTIONS REMOVED
// Authorization logic moved to V2 services via access context resolution
// Each service determines user permissions based on resolveAccessContext(clerkUserId, supabase)


