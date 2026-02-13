import { FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { UnauthorizedError, ForbiddenError } from '@splits-network/shared-fastify';
import { MultiClerkConfig, ClerkConfig } from '@splits-network/shared-config';

export type UserRole = 'candidate' | 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin';

export interface MembershipContext {
    id: string;
    organization_id: string;
    organization_name: string;
    role: UserRole;
}

export interface AuthContext {
    userId: string;
    clerkUserId: string;
    email: string;
    name: string;
    memberships: MembershipContext[];
    sourceApp?: 'portal' | 'candidate'; // Track which app the token came from
}

interface ClerkClientEntry {
    name: 'portal' | 'candidate';
    client: ReturnType<typeof createClerkClient>;
    secretKey: string;
}

interface CachedUser {
    clerkUserId: string;
    email: string;
    name: string;
    sourceApp: 'portal' | 'candidate';
    cachedAt: number;
}

const USER_CACHE_TTL_MS = 60_000; // 60 seconds

export class AuthMiddleware {
    private clerkClients: ClerkClientEntry[];
    private userCache = new Map<string, CachedUser>();

    /**
     * Create AuthMiddleware with multiple Clerk applications
     * Allows authenticating tokens from both Portal and Candidate apps
     */
    constructor(config: MultiClerkConfig) {
        this.clerkClients = [
            {
                name: 'portal',
                client: createClerkClient({ secretKey: config.portal.secretKey }),
                secretKey: config.portal.secretKey,
            },
            {
                name: 'candidate',
                client: createClerkClient({ secretKey: config.candidate.secretKey }),
                secretKey: config.candidate.secretKey,
            },
        ];
    }

    async verifyToken(request: FastifyRequest): Promise<AuthContext> {
        const authHeader = request.headers.authorization;

        // Debug logging for profile image uploads
        if (request.url?.includes('profile-image')) {
            request.log.info({
                url: request.url,
                method: request.method,
                hasAuthHeader: !!authHeader,
                authHeaderStart: authHeader?.substring(0, 20) + '...',
                contentType: request.headers['content-type']
            }, 'Profile image auth debug');
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);

        // Try each Clerk client until one succeeds
        let lastError: Error | null = null;

        for (const entry of this.clerkClients) {
            try {
                // Verify the token with this Clerk client (local JWT verification)
                const verified = await verifyToken(token, {
                    secretKey: entry.secretKey,
                });

                if (!verified || !verified.sub) {
                    continue; // Try next client
                }

                // Check cache before calling Clerk API
                const cached = this.getCachedUser(verified.sub);
                if (cached) {
                    return {
                        userId: '',
                        clerkUserId: cached.clerkUserId,
                        email: cached.email,
                        name: cached.name,
                        memberships: [],
                        sourceApp: cached.sourceApp,
                    };
                }

                // Get user details from Clerk API
                const user = await entry.client.users.getUser(verified.sub);

                if (!user) {
                    continue; // Try next client
                }

                const authContext: AuthContext = {
                    userId: '', // Will be filled by identity service
                    clerkUserId: user.id,
                    email: user.emailAddresses[0]?.emailAddress || '',
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                    memberships: [], // Will be filled when resolving user context
                    sourceApp: entry.name,
                };

                // Cache the user for subsequent requests
                this.cacheUser(verified.sub, authContext);

                return authContext;
            } catch (error: any) {
                lastError = error;
                // Continue to try next client
            }
        }

        // All clients failed
        request.log.error({
            err: lastError,
            message: lastError?.message,
        }, 'Token verification failed with all Clerk clients');

        throw new UnauthorizedError('Token verification failed');
    }

    private getCachedUser(clerkUserId: string): CachedUser | null {
        const cached = this.userCache.get(clerkUserId);
        if (!cached) return null;
        if (Date.now() - cached.cachedAt > USER_CACHE_TTL_MS) {
            this.userCache.delete(clerkUserId);
            return null;
        }
        return cached;
    }

    private cacheUser(clerkUserId: string, context: AuthContext): void {
        this.userCache.set(clerkUserId, {
            clerkUserId: context.clerkUserId,
            email: context.email,
            name: context.name,
            sourceApp: context.sourceApp || 'portal',
            cachedAt: Date.now(),
        });
    }

    createMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const authContext = await this.verifyToken(request);
                // Attach to request for downstream use
                (request as any).auth = authContext;
            } catch (error) {
                throw error;
            }
        };
    }
}
