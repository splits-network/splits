import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { IEventPublisher } from '../shared/events';

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope?: string;
    token_type: string;
}

/**
 * Handles automatic token refresh for OAuth connections.
 * Called before each calendar API call to ensure a valid token.
 */
export class TokenRefreshService {
    constructor(
        private connectionRepo: ConnectionRepository,
        private eventPublisher: IEventPublisher,
        private logger: Logger,
    ) {}

    /**
     * Returns a valid access token for the given connection.
     * Refreshes the token if it's expired or about to expire (within 5 minutes).
     */
    async getValidToken(connectionId: string): Promise<string> {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);
        if (!connection.access_token_enc) throw new Error('No access token available');

        // Check if token needs refresh (expired or expiring within 5 min)
        const needsRefresh = connection.token_expires_at &&
            new Date(connection.token_expires_at).getTime() < Date.now() + 5 * 60_000;

        if (!needsRefresh) {
            return connection.access_token_enc;
        }

        if (!connection.refresh_token_enc) {
            // No refresh token — mark as expired
            await this.connectionRepo.updateStatus(connectionId, 'expired', 'Token expired and no refresh token');
            await this.publishEvent('integration.token_expired', connection);
            throw new Error('Token expired and no refresh token available');
        }

        // Refresh the token
        return this.refreshToken(connectionId, connection.provider_slug, connection.refresh_token_enc);
    }

    private async refreshToken(
        connectionId: string,
        providerSlug: string,
        refreshToken: string,
    ): Promise<string> {
        const tokenUrl = this.getTokenUrl(providerSlug);
        const clientId = this.getEnv(`${providerSlug.toUpperCase()}_CLIENT_ID`);
        const clientSecret = this.getEnv(`${providerSlug.toUpperCase()}_CLIENT_SECRET`);

        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            this.logger.error({ connectionId, status: res.status, body }, 'Token refresh failed');

            // If refresh token is revoked/invalid, mark connection as expired
            if (res.status === 400 || res.status === 401) {
                await this.connectionRepo.updateStatus(connectionId, 'expired', `Refresh failed: ${body}`);
                const connection = await this.connectionRepo.findById(connectionId);
                if (connection) await this.publishEvent('integration.token_expired', connection);
            }

            throw new Error(`Token refresh failed (${res.status}): ${body}`);
        }

        const tokens = await res.json() as TokenResponse;

        // Update the stored tokens
        await this.connectionRepo.update(connectionId, {
            access_token_enc: tokens.access_token,
            token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        });

        this.logger.info({ connectionId, providerSlug }, 'Token refreshed successfully');

        const connection = await this.connectionRepo.findById(connectionId);
        if (connection) await this.publishEvent('integration.token_refreshed', connection);

        return tokens.access_token;
    }

    private getTokenUrl(providerSlug: string): string {
        if (providerSlug.startsWith('google_')) return 'https://oauth2.googleapis.com/token';
        if (providerSlug.startsWith('microsoft_')) return 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        if (providerSlug === 'linkedin') return 'https://www.linkedin.com/oauth/v2/accessToken';
        throw new Error(`Unknown provider family for: ${providerSlug}`);
    }

    private getEnv(key: string): string {
        const value = process.env[key];
        if (!value) throw new Error(`Missing env var: ${key}`);
        return value;
    }

    private async publishEvent(type: string, connection: any): Promise<void> {
        try {
            await this.eventPublisher.publish(type, {
                type,
                connection_id: connection.id,
                provider_slug: connection.provider_slug,
                clerk_user_id: connection.clerk_user_id,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            this.logger.error({ err, type }, 'Failed to publish token event');
        }
    }
}
