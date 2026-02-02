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

export class AuthMiddleware {
    private clerkClients: ClerkClientEntry[];

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
                // Verify the token with this Clerk client
                const verified = await verifyToken(token, {
                    secretKey: entry.secretKey,
                });

                if (!verified || !verified.sub) {
                    continue; // Try next client
                }

                // Get user details from Clerk
                const user = await entry.client.users.getUser(verified.sub);

                if (!user) {
                    continue; // Try next client
                }

                return {
                    userId: '', // Will be filled by identity service
                    clerkUserId: user.id,
                    email: user.emailAddresses[0]?.emailAddress || '',
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                    memberships: [], // Will be filled when resolving user context
                    sourceApp: entry.name,
                };
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
