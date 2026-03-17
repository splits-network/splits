/**
 * auth-headers.ts
 * Helper functions for building authentication headers for backend service requests
 * Part of API Role-Based Scoping Migration
 * 
 * NEW APPROACH: Gateway resolves access context ONCE and passes via headers.
 * Backend services read from headers instead of calling Supabase directly.
 * This eliminates the timeout issues caused by services making individual Supabase calls.
 */

import { FastifyRequest } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext, AccessContext } from '@splits-network/shared-access-context';
import { AuthContext } from '../auth';

export interface AuthHeaders extends Record<string, string> {
    'x-clerk-user-id': string;
    'x-access-context'?: string; // Serialized AccessContext JSON
}

export type OptionalAuthHeaders = Partial<AuthHeaders>;

// Cache for access context to avoid repeated Supabase calls within same request lifetime
const contextCache = new Map<string, { context: AccessContext; timestamp: number }>();
const CONTEXT_CACHE_TTL = 30000; // 30 seconds

// Supabase client for access context resolution (injected by main())
let supabaseClient: SupabaseClient | null = null;

export function setSupabaseClient(client: SupabaseClient) {
    supabaseClient = client;
}

// Extend FastifyRequest to include auth property
declare module 'fastify' {
    interface FastifyRequest {
        auth?: AuthContext;
    }
}

/**
 * Builds authentication headers from request auth context for backend service calls.
 * 
 * NEW: Resolves FULL AccessContext in gateway once and passes via x-access-context header.
 * Backend services read resolved context from headers instead of calling Supabase.
 * 
 * For public endpoints (e.g., jobs listing), this returns empty headers when no auth
 * is present, allowing backend services to handle optional authentication.
 * 
 * @param request - Fastify request with optional auth context populated by Clerk middleware
 * @returns Object with auth headers to pass to backend services (empty if no auth)
 */
export async function buildAuthHeaders(request: FastifyRequest): Promise<Record<string, string>> {
    // Check for internal service authentication first
    const internalServiceKey = request.headers['x-internal-service-key'] as string;
    if (internalServiceKey) {
        return {
            'x-internal-service-key': internalServiceKey,
        };
    }

    const auth = request.auth;

    if (!auth) {
        // Return passthrough headers for public/unauthenticated requests
        const headers: Record<string, string> = {};
        const supportSessionId = request.headers['x-support-session-id'] as string;
        if (supportSessionId) {
            headers['x-support-session-id'] = supportSessionId;
        }
        return headers;
    }

    const headers: Record<string, string> = {
        'x-clerk-user-id': auth.clerkUserId,
    };

    // Forward which Clerk app authenticated this user (portal or candidate)
    // Backend services need this for Clerk write-back operations (profile image sync, etc.)
    if (auth.sourceApp) {
        headers['x-source-app'] = auth.sourceApp;
    }

    // Resolve full access context once in gateway and pass to backend services
    if (supabaseClient) {
        try {
            const accessContext = await getCachedAccessContext(auth.clerkUserId);
            if (accessContext) {
                // Serialize AccessContext as JSON header
                headers['x-access-context'] = JSON.stringify(accessContext);

                // Include legacy organization ID for backwards compatibility
                if (accessContext.organizationIds && accessContext.organizationIds.length > 0) {
                    headers['x-organization-id'] = accessContext.organizationIds[0];
                }
            }
        } catch (error) {
            // Log error but don't fail request - backend services will fallback to DB resolution
            request.log.warn({
                err: error,
                clerkUserId: auth.clerkUserId
            }, 'Failed to resolve access context in gateway');
        }
    }

    // Forward support session ID for support service endpoints
    const supportSessionId = request.headers['x-support-session-id'] as string;
    if (supportSessionId) {
        headers['x-support-session-id'] = supportSessionId;
    }

    return headers;
}

/**
 * Get access context with caching to avoid repeated Supabase calls within same request lifetime
 */
async function getCachedAccessContext(clerkUserId: string): Promise<AccessContext | null> {
    if (!supabaseClient) return null;

    const cacheKey = clerkUserId;
    const cached = contextCache.get(cacheKey);

    // Return cached context if still valid
    if (cached && (Date.now() - cached.timestamp) < CONTEXT_CACHE_TTL) {
        return cached.context;
    }

    // Resolve fresh context from Supabase
    const context = await resolveAccessContext(supabaseClient, clerkUserId);

    // Cache resolved context
    contextCache.set(cacheKey, {
        context,
        timestamp: Date.now()
    });

    // Clean up expired cache entries periodically
    if (contextCache.size > 1000) {
        cleanupExpiredContextCache();
    }

    return context;
}

/**
 * Clean up expired cache entries to prevent memory leaks
 */
function cleanupExpiredContextCache() {
    const now = Date.now();
    for (const [key, value] of contextCache.entries()) {
        if (now - value.timestamp > CONTEXT_CACHE_TTL) {
            contextCache.delete(key);
        }
    }
}
}
