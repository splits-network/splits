import { FastifyRequest } from 'fastify';

export function requireUserContext(request: FastifyRequest): { clerkUserId: string } {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
        throw { statusCode: 401, message: 'Missing x-clerk-user-id header' };
    }
    return { clerkUserId };
}

export function getOptionalUserContext(request: FastifyRequest): { clerkUserId?: string } {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    return { clerkUserId };
}
