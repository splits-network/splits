/**
 * Token Refresh Service — V3
 * Ensures OAuth tokens are valid before API calls.
 * Auto-refreshes if expired or expiring within 5 minutes.
 */

import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { getOAuthClientId, getOAuthClientSecret } from '../../v2/shared/helpers';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

const TOKEN_URLS: Record<string, string> = {
  google: 'https://oauth2.googleapis.com/token',
  microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
};

const REFRESH_BUFFER_MS = 5 * 60_000; // 5 minutes

export class TokenRefreshService {
  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher,
    private logger: Logger,
    private crypto: CryptoService,
  ) {}

  /**
   * Returns a valid (decrypted) access token for the given connection.
   * Refreshes the token if it's expired or about to expire (within 5 min).
   */
  async getValidToken(connectionId: string): Promise<string> {
    const connection = await this.findConnection(connectionId);
    if (!connection) throw new Error('Connection not found');
    if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);
    if (!connection.access_token_enc) throw new Error('No access token available');

    const needsRefresh = connection.token_expires_at &&
      new Date(connection.token_expires_at).getTime() < Date.now() + REFRESH_BUFFER_MS;

    if (!needsRefresh) {
      return this.crypto.decrypt(connection.access_token_enc);
    }

    if (!connection.refresh_token_enc) {
      await this.markExpired(connectionId, 'Token expired and no refresh token');
      await this.publishEvent('integration.token_expired', connection);
      throw new Error('Token expired and no refresh token available');
    }

    const decryptedRefreshToken = this.crypto.decrypt(connection.refresh_token_enc);
    return this.refreshToken(connectionId, connection.provider_slug, decryptedRefreshToken);
  }

  private async refreshToken(
    connectionId: string,
    providerSlug: string,
    refreshToken: string,
  ): Promise<string> {
    const tokenUrl = this.getTokenUrl(providerSlug);
    const clientId = getOAuthClientId(providerSlug);
    const clientSecret = getOAuthClientSecret(providerSlug);

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

      if (res.status === 400 || res.status === 401) {
        await this.markExpired(connectionId, `Refresh failed: ${body}`);
        const connection = await this.findConnection(connectionId);
        if (connection) await this.publishEvent('integration.token_expired', connection);
      }

      throw new Error(`Token refresh failed (${res.status}): ${body}`);
    }

    const tokens = await res.json() as TokenResponse;

    await this.supabase.from('oauth_connections').update({
      access_token_enc: this.crypto.encrypt(tokens.access_token),
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }).eq('id', connectionId);

    this.logger.info({ connectionId, providerSlug }, 'Token refreshed successfully');

    const connection = await this.findConnection(connectionId);
    if (connection) await this.publishEvent('integration.token_refreshed', connection);

    return tokens.access_token;
  }

  private getTokenUrl(providerSlug: string): string {
    if (providerSlug.startsWith('google_')) return TOKEN_URLS.google;
    if (providerSlug.startsWith('microsoft_')) return TOKEN_URLS.microsoft;
    if (providerSlug === 'linkedin') return TOKEN_URLS.linkedin;
    throw new Error(`Unknown provider family for: ${providerSlug}`);
  }

  private async findConnection(id: string) {
    const { data, error } = await this.supabase
      .from('oauth_connections')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  private async markExpired(connectionId: string, reason: string): Promise<void> {
    await this.supabase.from('oauth_connections').update({
      status: 'expired',
      last_error: reason,
      error_at: new Date().toISOString(),
    }).eq('id', connectionId);
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
