/**
 * V2 Shared Helpers
 * Common utilities for v2 routes and services
 */

import { FastifyRequest } from 'fastify';

export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
        throw { statusCode: 401, message: 'Missing x-clerk-user-id header' };
    }
    return { clerkUserId };
}

export function validatePaginationParams(
    page?: number | string,
    limit?: number | string
): { page: number; limit: number } {
    const p = page ? parseInt(String(page), 10) : 1;
    const l = limit ? parseInt(String(limit), 10) : 25;

    if (isNaN(p) || p < 1) {
        throw { statusCode: 400, message: 'Invalid page number' };
    }
    if (isNaN(l) || l < 1 || l > 100) {
        throw { statusCode: 400, message: 'Limit must be between 1 and 100' };
    }

    return { page: p, limit: l };
}

export function buildPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
} {
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
        },
    };
}
