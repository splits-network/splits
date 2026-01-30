import { FastifyRequest } from 'fastify';

export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return { clerkUserId };
}

export function getOptionalUserContext(request: FastifyRequest): {
    clerkUserId?: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    return { clerkUserId };
}
