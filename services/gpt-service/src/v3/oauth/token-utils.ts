/**
 * OAuth2 Token Utilities V3 - JWT signing, token hashing, PKCE
 * Extracted from auth-service to keep files under ~200 lines.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { SignJWT, jwtVerify, importPKCS8, type KeyLike } from 'jose';
import { randomBytes, createHash } from 'crypto';
import { ValidatedToken } from '../../v2/oauth/types';

export class TokenUtils {
  private privateKey: KeyLike | null = null;
  private readonly issuer = 'splits-network-gpt';
  private readonly audience = 'gpt';

  constructor(
    private supabase: SupabaseClient,
    private gptConfig: GptConfig,
    private logger: Logger,
  ) {
    this.initializePrivateKey();
  }

  private async initializePrivateKey(): Promise<void> {
    try {
      const pemString = Buffer.from(this.gptConfig.ecPrivateKeyBase64, 'base64').toString('utf-8');
      this.privateKey = await importPKCS8(pemString, 'ES256');
      this.logger.debug('EC private key loaded successfully');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to load EC private key');
      throw new Error('Failed to initialize OAuth service: invalid EC private key');
    }
  }

  private async ensurePrivateKey(): Promise<KeyLike> {
    if (!this.privateKey) await this.initializePrivateKey();
    if (!this.privateKey) throw new Error('Private key not initialized');
    return this.privateKey;
  }

  async generateAccessToken(clerkUserId: string, sessionId: string, scopes: string[]): Promise<string> {
    const privateKey = await this.ensurePrivateKey();
    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({ session_id: sessionId, scopes })
      .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setSubject(clerkUserId)
      .setIssuedAt(now)
      .setExpirationTime(now + this.gptConfig.accessTokenExpiry)
      .sign(privateKey);

    return `gpt_at_${jwt}`;
  }

  async validateAccessToken(token: string): Promise<ValidatedToken> {
    if (!token.startsWith('gpt_at_')) throw new Error('Invalid token format');
    const jwt = token.substring(7);

    try {
      const privateKey = await this.ensurePrivateKey();
      const { payload } = await jwtVerify(jwt, privateKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return {
        clerkUserId: payload.sub as string,
        sessionId: payload.session_id as string,
        scopes: payload.scopes as string[],
      };
    } catch (error) {
      this.logger.warn({ err: error }, 'Token validation failed');
      throw new Error('Invalid or expired token');
    }
  }

  async createRefreshToken(clerkUserId: string): Promise<{ refreshToken: string; tokenId: string }> {
    const refreshToken = `gpt_rt_${randomBytes(48).toString('hex')}`;
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.gptConfig.refreshTokenExpiry * 1000);

    const { data, error } = await this.supabase
      .from('gpt_refresh_tokens')
      .insert({
        token_hash: refreshTokenHash,
        clerk_user_id: clerkUserId,
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (error || !data) {
      this.logger.error({ err: error }, 'Failed to create refresh token');
      throw new Error('Failed to create refresh token');
    }

    return { refreshToken, tokenId: data.id };
  }

  generateAuthCode(): string {
    return randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generatePkceChallenge(verifier: string): string {
    return createHash('sha256').update(verifier).digest('base64url');
  }
}
