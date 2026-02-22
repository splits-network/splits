import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../shared/events';
import { ConnectionRepository } from './repository';
import { ProviderRepository } from '../providers/repository';
import {
    OAuthConnectionPublic,
    InitiateOAuthResponse,
    IntegrationEvent,
} from '@splits-network/shared-types';

/** In-memory state store — swap for Redis in production */
const pendingStates = new Map<string, {
    providerSlug: string;
    clerkUserId: string;
    organizationId?: string;
    redirectUri: string;
    createdAt: number;
}>();

// Clean up stale states every 5 minutes
setInterval(() => {
    const fiveMinAgo = Date.now() - 5 * 60_000;
    for (const [key, val] of pendingStates) {
        if (val.createdAt < fiveMinAgo) pendingStates.delete(key);
    }
}, 5 * 60_000);

export class ConnectionService {
    constructor(
        private connectionRepo: ConnectionRepository,
        private providerRepo: ProviderRepository,
        private eventPublisher: IEventPublisher,
        private logger: Logger,
    ) {}

    /** Strip sensitive fields before returning to the client */
    private toPublic(conn: any): OAuthConnectionPublic {
        const { clerk_user_id, access_token_enc, refresh_token_enc, ...pub } = conn;
        return pub;
    }

    async listConnections(clerkUserId: string): Promise<OAuthConnectionPublic[]> {
        const connections = await this.connectionRepo.listByUser(clerkUserId);
        return connections.map(c => this.toPublic(c));
    }

    async initiateOAuth(
        clerkUserId: string,
        providerSlug: string,
        redirectUri: string,
        organizationId?: string,
    ): Promise<InitiateOAuthResponse> {
        // Verify provider exists
        const provider = await this.providerRepo.findBySlug(providerSlug);
        if (!provider) throw new Error(`Unknown provider: ${providerSlug}`);
        if (!provider.is_active) throw new Error(`Provider ${providerSlug} is not active`);

        // Check if user already has an active connection
        const existing = await this.connectionRepo.findByUserAndProvider(clerkUserId, providerSlug);
        if (existing && existing.status === 'active') {
            throw new Error(`Already connected to ${provider.name}`);
        }

        // Generate state parameter for CSRF protection
        const state = randomUUID();

        // Store pending state
        pendingStates.set(state, {
            providerSlug,
            clerkUserId,
            organizationId,
            redirectUri,
            createdAt: Date.now(),
        });

        // Build authorization URL — provider-specific params
        const params = new URLSearchParams({
            client_id: this.getClientId(providerSlug),
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: (provider.oauth_scopes ?? []).join(' '),
            state,
        });

        // Provider-specific OAuth params
        if (providerSlug.startsWith('google_')) {
            params.set('access_type', 'offline');
            params.set('prompt', 'consent');
        } else if (providerSlug.startsWith('microsoft_')) {
            params.set('prompt', 'consent');
        }
        // LinkedIn uses defaults — no extra params needed

        const authUrl = `${provider.oauth_auth_url}?${params.toString()}`;

        return {
            authorization_url: authUrl,
            state,
        };
    }

    async handleCallback(code: string, state: string): Promise<OAuthConnectionPublic> {
        // Verify state
        const pending = pendingStates.get(state);
        if (!pending) throw new Error('Invalid or expired state parameter');
        pendingStates.delete(state);

        const { providerSlug, clerkUserId, organizationId, redirectUri } = pending;
        const provider = await this.providerRepo.findBySlug(providerSlug);
        if (!provider) throw new Error(`Provider ${providerSlug} not found`);

        // Exchange code for tokens
        const tokenResponse = await this.exchangeCodeForTokens(
            provider.oauth_token_url!,
            code,
            redirectUri,
            providerSlug,
        );

        // Get user info from the provider
        const accountInfo = await this.fetchAccountInfo(providerSlug, tokenResponse.access_token);

        // Upsert connection (revoke any existing, create new)
        const existing = await this.connectionRepo.findByUserAndProvider(clerkUserId, providerSlug);
        if (existing) {
            await this.connectionRepo.revoke(existing.id);
        }

        const connection = await this.connectionRepo.create({
            clerk_user_id: clerkUserId,
            organization_id: organizationId ?? null,
            provider_id: provider.id,
            provider_slug: providerSlug,
            status: 'active',
            access_token_enc: tokenResponse.access_token,  // TODO: encrypt at rest
            refresh_token_enc: tokenResponse.refresh_token ?? null,
            token_expires_at: tokenResponse.expires_in
                ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
                : null,
            scopes_granted: tokenResponse.scope ? tokenResponse.scope.split(' ') : provider.oauth_scopes,
            provider_account_id: accountInfo.id ?? null,
            provider_account_name: accountInfo.name ?? null,
            metadata: {},
            last_synced_at: null,
            last_error: null,
            error_at: null,
        });

        // Publish connected event
        await this.publishEvent({
            type: 'integration.connected',
            connection_id: connection.id,
            provider_slug: providerSlug,
            clerk_user_id: clerkUserId,
            organization_id: organizationId,
            timestamp: new Date().toISOString(),
        });

        this.logger.info({ providerSlug, clerkUserId }, 'OAuth connection established');
        return this.toPublic(connection);
    }

    async disconnect(connectionId: string, clerkUserId: string): Promise<void> {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.clerk_user_id !== clerkUserId) throw new Error('Unauthorized');

        // Try to revoke at the provider (best-effort)
        try {
            await this.revokeAtProvider(connection.provider_slug, connection.access_token_enc);
        } catch (err) {
            this.logger.warn({ err, connectionId }, 'Failed to revoke token at provider');
        }

        await this.connectionRepo.revoke(connectionId);

        await this.publishEvent({
            type: 'integration.disconnected',
            connection_id: connectionId,
            provider_slug: connection.provider_slug,
            clerk_user_id: clerkUserId,
            timestamp: new Date().toISOString(),
        });

        this.logger.info({ connectionId, providerSlug: connection.provider_slug }, 'OAuth connection revoked');
    }

    /* ── Private helpers ─────────────────────────────────────────────────── */

    private getClientId(providerSlug: string): string {
        const envKey = `${providerSlug.toUpperCase()}_CLIENT_ID`;
        const value = process.env[envKey];
        if (!value) throw new Error(`Missing env var: ${envKey}`);
        return value;
    }

    private getClientSecret(providerSlug: string): string {
        const envKey = `${providerSlug.toUpperCase()}_CLIENT_SECRET`;
        const value = process.env[envKey];
        if (!value) throw new Error(`Missing env var: ${envKey}`);
        return value;
    }

    private async exchangeCodeForTokens(
        tokenUrl: string,
        code: string,
        redirectUri: string,
        providerSlug: string,
    ): Promise<{ access_token: string; refresh_token?: string; expires_in?: number; scope?: string }> {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: this.getClientId(providerSlug),
                client_secret: this.getClientSecret(providerSlug),
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Token exchange failed (${response.status}): ${body}`);
        }

        return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in?: number; scope?: string }>;
    }

    private async fetchAccountInfo(
        providerSlug: string,
        accessToken: string,
    ): Promise<{ id?: string; name?: string }> {
        try {
            if (providerSlug.startsWith('google_')) {
                const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                    const data = await res.json() as Record<string, any>;
                    return { id: data.email, name: data.name || data.email };
                }
            }

            if (providerSlug.startsWith('microsoft_')) {
                const res = await fetch('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                    const data = await res.json() as Record<string, any>;
                    return { id: data.userPrincipalName, name: data.displayName || data.userPrincipalName };
                }
            }

            if (providerSlug === 'linkedin') {
                const res = await fetch('https://api.linkedin.com/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                    const data = await res.json() as Record<string, any>;
                    return {
                        id: data.sub,
                        name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
                    };
                }
            }
        } catch (err) {
            this.logger.warn({ err, providerSlug }, 'Failed to fetch account info');
        }

        return {};
    }

    private async revokeAtProvider(providerSlug: string, accessToken: string | null): Promise<void> {
        if (!accessToken) return;

        if (providerSlug.startsWith('google_')) {
            await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' });
        }
        // Microsoft doesn't have a simple revoke endpoint — token expiry handles it
    }

    private async publishEvent(event: IntegrationEvent): Promise<void> {
        try {
            await this.eventPublisher.publish(event.type, event);
        } catch (err) {
            this.logger.error({ err, event }, 'Failed to publish integration event');
        }
    }
}
