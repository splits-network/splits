import { FastifyRequest } from 'fastify';

/**
 * Extracts user context from request headers.
 * Support endpoints accept either authenticated (clerk) or anonymous (session-based) visitors.
 */
export function getSupportContext(request: FastifyRequest): {
    clerkUserId?: string;
    sessionId?: string;
    isAdmin: boolean;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const sessionId = request.headers['x-support-session-id'] as string | undefined;
    const isAdmin = request.headers['x-is-platform-admin'] === 'true';

    return { clerkUserId, sessionId, isAdmin };
}

export function requireSupportIdentity(request: FastifyRequest): {
    clerkUserId?: string;
    sessionId?: string;
    isAdmin: boolean;
} {
    const ctx = getSupportContext(request);

    if (!ctx.clerkUserId && !ctx.sessionId) {
        const error = new Error('Missing identity: provide x-clerk-user-id or x-support-session-id header') as any;
        error.statusCode = 401;
        throw error;
    }

    return ctx;
}

export function requireAdminContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const isAdmin = request.headers['x-is-platform-admin'] === 'true';

    if (!clerkUserId || !isAdmin) {
        const error = new Error('Unauthorized: platform admin access required') as any;
        error.statusCode = 403;
        throw error;
    }

    return { clerkUserId };
}
