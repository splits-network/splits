import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from '../calendar/token-refresh';
import { LinkedInClient, LinkedInProfile } from './client';
import type { LinkedInProfilePublic } from '@splits-network/shared-types';

/* ── Service ─────────────────────────────────────────────────────────── */

export class LinkedInService {
    private client: LinkedInClient;

    constructor(
        private connectionRepo: ConnectionRepository,
        private tokenRefresh: TokenRefreshService,
        private logger: Logger,
    ) {
        this.client = new LinkedInClient(logger);
    }

    /**
     * Fetch the authenticated user's LinkedIn profile.
     * Returns normalized public profile data.
     */
    async getProfile(connectionId: string, clerkUserId: string): Promise<LinkedInProfilePublic> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        const profile = await this.client.getProfile(token);

        // Update connection metadata with profile data
        await this.connectionRepo.update(connectionId, {
            metadata: {
                ...connection.metadata,
                linkedin_sub: profile.sub,
                linkedin_name: profile.name,
                linkedin_email: profile.email,
                linkedin_picture: profile.picture,
                linkedin_email_verified: profile.email_verified,
                profile_fetched_at: new Date().toISOString(),
            },
            last_synced_at: new Date().toISOString(),
        });

        this.logger.info(
            { connectionId, linkedinSub: profile.sub },
            'LinkedIn profile fetched',
        );

        return {
            sub: profile.sub,
            name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
            given_name: profile.given_name,
            family_name: profile.family_name,
            email: profile.email,
            email_verified: profile.email_verified,
            picture: profile.picture,
        };
    }

    /**
     * Check if a LinkedIn connection is verified — i.e. the profile has been fetched
     * and the email is verified.
     */
    async getVerificationStatus(connectionId: string, clerkUserId: string): Promise<{
        verified: boolean;
        profile: LinkedInProfilePublic | null;
        connected_at: string;
        last_synced_at: string | null;
    }> {
        const connection = await this.authorize(connectionId, clerkUserId);

        const meta = connection.metadata || {};
        const hasProfile = !!meta.linkedin_sub;
        const emailVerified = meta.linkedin_email_verified === true;

        const profile: LinkedInProfilePublic | null = hasProfile
            ? {
                sub: meta.linkedin_sub,
                name: meta.linkedin_name,
                email: meta.linkedin_email,
                email_verified: meta.linkedin_email_verified,
                picture: meta.linkedin_picture,
            }
            : null;

        return {
            verified: hasProfile && emailVerified,
            profile,
            connected_at: connection.created_at,
            last_synced_at: connection.last_synced_at,
        };
    }

    /* ── Private ───────────────────────────────────────────────────────── */

    private async authorize(connectionId: string, clerkUserId: string) {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.clerk_user_id !== clerkUserId) throw new Error('Unauthorized');
        if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);
        return connection;
    }
}
