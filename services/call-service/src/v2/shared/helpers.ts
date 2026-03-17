import { FastifyRequest } from 'fastify';

export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw Object.assign(
            new Error('Missing x-clerk-user-id header'),
            { statusCode: 401 },
        );
    }

    return { clerkUserId };
}
