/**
 * Connections V3 OAuth Service
 * Handles OAuth initiate/callback flows natively in V3.
 */

import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import {
  OAuthConnectionPublic,
  InitiateOAuthResponse,
  IntegrationEvent,
} from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events';
import { ConnectionRepository } from './repository';
import { ProviderRepository } from '../providers/repository';

/** In-memory state store for pending OAuth flows */
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

function getProviderFamily(providerSlug: string): string {
  if (providerSlug.startsWith('google_')) return 'GOOGLE';
  if (providerSlug.startsWith('microsoft_')) return 'MICROSOFT';
  if (providerSlug === 'linkedin') return 'LINKEDIN';
  return providerSlug.toUpperCase();
}

function getOAuthClientId(providerSlug: string): string {
  const key = `${getProviderFamily(providerSlug)}_CLIENT_ID`;
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function getOAuthClientSecret(providerSlug: string): string {
  const key = `${getProviderFamily(providerSlug)}_CLIENT_SECRET`;
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

/** Strip sensitive fields before returning to the client */
function toPublic(conn: any): OAuthConnectionPublic {
  const { clerk_user_id, access_token_enc, refresh_token_enc, token_expires_at, ...pub } = conn;
  return pub;
}

export class OAuthService {
  constructor(
    private connectionRepo: ConnectionRepository,
    private providerRepo: ProviderRepository,
    private eventPublisher: IEventPublisher,
    private logger: Logger,
    private crypto: CryptoService,
  ) {}

  async initiateOAuth(
    clerkUserId: string,
    providerSlug: string,
    redirectUri: string,
    organizationId?: string,
  ): Promise<InitiateOAuthResponse> {
    const provider = await this.providerRepo.findBySlug(providerSlug);
    if (!provider) throw new Error(`Unknown provider: ${providerSlug}`);
    if (!provider.is_active) throw new Error(`Provider ${providerSlug} is not active`);

    const existing = await this.connectionRepo.findByUserAndProvider(clerkUserId, providerSlug);
    if (existing && existing.status === 'active') {
      throw new Error(`Already connected to ${provider.name}`);
    }

    const state = randomUUID();

    pendingStates.set(state, {
      providerSlug,
      clerkUserId,
      organizationId,
      redirectUri,
      createdAt: Date.now(),
    });

    const params = new URLSearchParams({
      client_id: getOAuthClientId(providerSlug),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: (provider.oauth_scopes ?? []).join(' '),
      state,
    });

    if (providerSlug.startsWith('google_')) {
      params.set('access_type', 'offline');
      params.set('prompt', 'consent');
    } else if (providerSlug.startsWith('microsoft_')) {
      params.set('prompt', 'consent');
    }

    const authUrl = `${provider.oauth_auth_url}?${params.toString()}`;
    this.logger.info({ providerSlug, redirectUri }, 'OAuth initiation — authorization URL built');

    return { authorization_url: authUrl, state };
  }

  async handleCallback(code: string, state: string): Promise<OAuthConnectionPublic> {
    const pending = pendingStates.get(state);
    if (!pending) throw new Error('Invalid or expired state parameter');
    pendingStates.delete(state);

    const { providerSlug, clerkUserId, organizationId, redirectUri } = pending;
    const provider = await this.providerRepo.findBySlug(providerSlug);
    if (!provider) throw new Error(`Provider ${providerSlug} not found`);

    const tokenResponse = await this.exchangeCodeForTokens(
      provider.oauth_token_url!, code, redirectUri, providerSlug,
    );

    const accountInfo = await this.fetchAccountInfo(providerSlug, tokenResponse.access_token);

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
      access_token_enc: this.crypto.encrypt(tokenResponse.access_token),
      refresh_token_enc: tokenResponse.refresh_token
        ? this.crypto.encrypt(tokenResponse.refresh_token)
        : null,
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

    await this.publishEvent({
      type: 'integration.connected',
      connection_id: connection.id,
      provider_slug: providerSlug,
      clerk_user_id: clerkUserId,
      organization_id: organizationId,
      timestamp: new Date().toISOString(),
    });

    this.logger.info({ providerSlug, clerkUserId }, 'OAuth connection established');
    return toPublic(connection);
  }

  /* ── Private helpers ─────────────────────────────────────────────── */

  private async exchangeCodeForTokens(
    tokenUrl: string, code: string, redirectUri: string, providerSlug: string,
  ): Promise<{ access_token: string; refresh_token?: string; expires_in?: number; scope?: string }> {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: getOAuthClientId(providerSlug),
        client_secret: getOAuthClientSecret(providerSlug),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Token exchange failed (${response.status}): ${body}`);
    }

    return response.json() as Promise<{
      access_token: string; refresh_token?: string; expires_in?: number; scope?: string;
    }>;
  }

  private async fetchAccountInfo(
    providerSlug: string, accessToken: string,
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

  private async publishEvent(event: IntegrationEvent): Promise<void> {
    try {
      await this.eventPublisher.publish(event.type, event);
    } catch (err) {
      this.logger.error({ err, event }, 'Failed to publish integration event');
    }
  }
}
