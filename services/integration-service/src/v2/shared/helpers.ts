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

/**
 * Maps a provider slug (e.g. 'google_calendar', 'microsoft_email')
 * to its OAuth family prefix for env var lookups.
 *
 * Env vars: GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, LINKEDIN_CLIENT_ID
 */
export function getProviderFamily(providerSlug: string): string {
    if (providerSlug.startsWith('google_')) return 'GOOGLE';
    if (providerSlug.startsWith('microsoft_')) return 'MICROSOFT';
    if (providerSlug === 'linkedin') return 'LINKEDIN';
    return providerSlug.toUpperCase();
}

export function getOAuthClientId(providerSlug: string): string {
    const key = `${getProviderFamily(providerSlug)}_CLIENT_ID`;
    const value = process.env[key];
    if (!value) throw new Error(`Missing env var: ${key}`);
    return value;
}

export function getOAuthClientSecret(providerSlug: string): string {
    const key = `${getProviderFamily(providerSlug)}_CLIENT_SECRET`;
    const value = process.env[key];
    if (!value) throw new Error(`Missing env var: ${key}`);
    return value;
}
