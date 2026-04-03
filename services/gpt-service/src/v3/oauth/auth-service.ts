/**
 * OAuth2 Auth Service V3 - Authorization Code Flow with PKCE
 * Handles authorize, token exchange, refresh (with replay detection), and revocation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import { TokenUtils } from './token-utils.js';
import {
  GPT_SCOPES,
  AuthorizeParams,
  TokenExchangeParams,
  RefreshParams,
  TokenResponse,
  ValidatedToken,
  OAuthError,
} from '../../v2/oauth/types.js';

export class OAuthAuthService {
  private tokens: TokenUtils;

  constructor(
    private supabase: SupabaseClient,
    private gptConfig: GptConfig,
    private eventPublisher: IEventPublisher,
    private logger: Logger,
  ) {
    this.tokens = new TokenUtils(supabase, gptConfig, logger);
  }

  async authorize(params: AuthorizeParams): Promise<{ code: string }> {
    const { clerkUserId, redirectUri, scopes, codeChallenge, codeChallengeMethod } = params;

    const invalidScopes = scopes.filter(s => !GPT_SCOPES.includes(s as any));
    if (invalidScopes.length > 0) {
      throw new OAuthError('invalid_scope', `Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    const { data: existing, error: countErr } = await this.supabase
      .from('gpt_sessions').select('id').eq('clerk_user_id', clerkUserId);

    if (countErr) {
      this.logger.error({ err: countErr }, 'Failed to check session count');
      throw new Error('Failed to check session count');
    }
    if (existing && existing.length >= 5) {
      throw new OAuthError('session_limit_exceeded', 'Maximum of 5 active sessions reached');
    }

    const code = this.tokens.generateAuthCode();
    const expiresAt = new Date(Date.now() + this.gptConfig.authCodeExpiry * 1000);

    const { error: insertErr } = await this.supabase
      .from('gpt_authorization_codes')
      .insert({
        code, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod,
        clerk_user_id: clerkUserId, redirect_uri: redirectUri, scopes,
        expires_at: expiresAt.toISOString(),
      });

    if (insertErr) {
      this.logger.error({ err: insertErr }, 'Failed to create authorization code');
      throw new Error('Failed to create authorization code');
    }

    await this.eventPublisher.publish('gpt.oauth.authorize', {
      clerk_user_id: clerkUserId, scopes, redirect_uri: redirectUri,
    });

    this.logger.info({ clerk_user_id: clerkUserId, scopes }, 'Authorization code generated');
    return { code };
  }

  async exchangeCode(params: TokenExchangeParams): Promise<TokenResponse> {
    const { code, codeVerifier, clientId, clientSecret, redirectUri } = params;
    this.validateClientCredentials(clientId, clientSecret);

    const authCode = await this.lookupAndValidateAuthCode(code, codeVerifier, redirectUri);

    await this.supabase.from('gpt_authorization_codes')
      .update({ used_at: new Date().toISOString() }).eq('code', code);

    const { data: session, error: sessErr } = await this.supabase
      .from('gpt_sessions')
      .insert({ clerk_user_id: authCode.clerk_user_id, scopes: authCode.scopes, granted_scopes: authCode.scopes })
      .select('id').single();

    if (sessErr || !session) {
      this.logger.error({ err: sessErr }, 'Failed to create session');
      throw new Error('Failed to create session');
    }

    const { refreshToken, tokenId } = await this.tokens.createRefreshToken(authCode.clerk_user_id);
    await this.supabase.from('gpt_sessions').update({ refresh_token_id: tokenId }).eq('id', session.id);

    const accessToken = await this.tokens.generateAccessToken(authCode.clerk_user_id, session.id, authCode.scopes);

    await this.eventPublisher.publish('gpt.oauth.token_exchanged', {
      clerk_user_id: authCode.clerk_user_id, session_id: session.id, scopes: authCode.scopes,
    });

    this.logger.info({ clerk_user_id: authCode.clerk_user_id, session_id: session.id }, 'Token exchanged');

    return {
      access_token: accessToken, token_type: 'Bearer',
      expires_in: this.gptConfig.accessTokenExpiry,
      refresh_token: refreshToken, scope: authCode.scopes.join(' '),
    };
  }

  async refresh(params: RefreshParams): Promise<TokenResponse> {
    const { refreshToken, clientId, clientSecret } = params;
    this.validateClientCredentials(clientId, clientSecret);

    const tokenHash = this.tokens.hashToken(refreshToken);
    const { data: tokenData, error: tokenErr } = await this.supabase
      .from('gpt_refresh_tokens').select('*').eq('token_hash', tokenHash).single();

    if (tokenErr || !tokenData) throw new OAuthError('invalid_grant', 'Invalid refresh token');

    if (tokenData.revoked_at || tokenData.rotated_to) {
      await this.handleReplayDetection(tokenData.clerk_user_id, tokenData.id);
      throw new OAuthError('invalid_grant', 'Refresh token has been revoked');
    }
    if (new Date(tokenData.expires_at) < new Date()) {
      throw new OAuthError('invalid_grant', 'Refresh token expired');
    }

    const { data: sessionData, error: sessErr } = await this.supabase
      .from('gpt_sessions').select('*').eq('refresh_token_id', tokenData.id).single();

    if (sessErr || !sessionData) throw new OAuthError('invalid_grant', 'Session not found');

    const { refreshToken: newRefreshToken, tokenId: newTokenId } =
      await this.tokens.createRefreshToken(tokenData.clerk_user_id);

    await this.supabase.from('gpt_refresh_tokens')
      .update({ rotated_to: newTokenId, revoked_at: new Date().toISOString() }).eq('id', tokenData.id);
    await this.supabase.from('gpt_sessions')
      .update({ refresh_token_id: newTokenId, last_active: new Date().toISOString() }).eq('id', sessionData.id);

    const accessToken = await this.tokens.generateAccessToken(sessionData.clerk_user_id, sessionData.id, sessionData.scopes);

    await this.eventPublisher.publish('gpt.oauth.token_refreshed', {
      clerk_user_id: sessionData.clerk_user_id, session_id: sessionData.id,
    });

    this.logger.info({ clerk_user_id: sessionData.clerk_user_id, session_id: sessionData.id }, 'Token refreshed');

    return {
      access_token: accessToken, token_type: 'Bearer',
      expires_in: this.gptConfig.accessTokenExpiry,
      refresh_token: newRefreshToken, scope: sessionData.scopes.join(' '),
    };
  }

  async revoke(sessionId: string, clerkUserId: string): Promise<void> {
    const { data: session, error } = await this.supabase
      .from('gpt_sessions').select('*').eq('id', sessionId).single();

    if (error || !session) throw new Error('Session not found');
    if (session.clerk_user_id !== clerkUserId) throw new Error('Session does not belong to user');

    if (session.refresh_token_id) {
      await this.supabase.from('gpt_refresh_tokens')
        .update({ revoked_at: new Date().toISOString() }).eq('id', session.refresh_token_id);
    }

    await this.supabase.from('gpt_sessions').delete().eq('id', sessionId);
    await this.eventPublisher.publish('gpt.oauth.session_revoked', { clerk_user_id: clerkUserId, session_id: sessionId });
    this.logger.info({ clerk_user_id: clerkUserId, session_id: sessionId }, 'Session revoked');
  }

  async revokeAllSessions(clerkUserId: string): Promise<void> {
    await this.supabase.from('gpt_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() }).eq('clerk_user_id', clerkUserId);
    await this.supabase.from('gpt_sessions').delete().eq('clerk_user_id', clerkUserId);
    await this.eventPublisher.publish('gpt.oauth.all_sessions_revoked', { clerk_user_id: clerkUserId });
    this.logger.info({ clerk_user_id: clerkUserId }, 'All sessions revoked');
  }

  async validateAccessToken(token: string): Promise<ValidatedToken> {
    return this.tokens.validateAccessToken(token);
  }

  // -- Private helpers --

  private validateClientCredentials(clientId: string, clientSecret: string): void {
    if (clientId !== this.gptConfig.clientId || clientSecret !== this.gptConfig.clientSecret) {
      throw new OAuthError('invalid_client', 'Invalid client credentials');
    }
  }

  private async lookupAndValidateAuthCode(code: string, codeVerifier: string | undefined, redirectUri: string) {
    const { data: authCode, error } = await this.supabase
      .from('gpt_authorization_codes').select('*').eq('code', code).single();

    if (error || !authCode) throw new OAuthError('invalid_grant', 'Invalid authorization code');
    if (authCode.used_at) throw new OAuthError('invalid_grant', 'Authorization code already used');
    if (new Date(authCode.expires_at) < new Date()) throw new OAuthError('invalid_grant', 'Authorization code expired');
    if (authCode.redirect_uri !== redirectUri) throw new OAuthError('invalid_grant', 'Redirect URI mismatch');

    if (authCode.code_challenge) {
      if (!codeVerifier) throw new OAuthError('invalid_grant', 'PKCE code_verifier required');
      if (this.tokens.generatePkceChallenge(codeVerifier) !== authCode.code_challenge) {
        throw new OAuthError('invalid_grant', 'PKCE verification failed');
      }
    }

    return authCode;
  }

  private async handleReplayDetection(clerkUserId: string, tokenId: string): Promise<void> {
    this.logger.warn({ clerk_user_id: clerkUserId }, 'REPLAY DETECTED - revoking all sessions');
    await this.supabase.from('gpt_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() }).eq('clerk_user_id', clerkUserId);
    await this.supabase.from('gpt_sessions').delete().eq('clerk_user_id', clerkUserId);
    await this.eventPublisher.publish('gpt.oauth.replay_detected', { clerk_user_id: clerkUserId, token_id: tokenId });
  }
}
