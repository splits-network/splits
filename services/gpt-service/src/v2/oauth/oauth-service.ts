/**
 * OAuth Service - OAuth2 Authorization Code Flow with PKCE and JWT
 * Phase 12: OAuth2 Provider
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { EventPublisher } from '../shared/events';
import { SignJWT, jwtVerify, importPKCS8, type KeyLike } from 'jose';
import { randomBytes, createHash } from 'crypto';
import {
    GPT_SCOPES,
    AuthorizeParams,
    TokenExchangeParams,
    RefreshParams,
    TokenResponse,
    GptSession,
    ValidatedToken,
    OAuthError,
} from './types';

export class OAuthService {
    private privateKey: KeyLike | null = null;
    private readonly issuer = 'splits-network-gpt';
    private readonly audience = 'gpt';

    constructor(
        private supabase: SupabaseClient,
        private gptConfig: GptConfig,
        private eventPublisher: EventPublisher,
        private logger: Logger
    ) {
        this.initializePrivateKey();
    }

    /**
     * Initialize EC private key from base64-encoded PEM
     */
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

    /**
     * Ensure private key is loaded
     */
    private async ensurePrivateKey(): Promise<KeyLike> {
        if (!this.privateKey) {
            await this.initializePrivateKey();
        }
        if (!this.privateKey) {
            throw new Error('Private key not initialized');
        }
        return this.privateKey;
    }

    /**
     * Generate authorization code
     */
    async authorize(params: AuthorizeParams): Promise<{ code: string }> {
        const { clerkUserId, redirectUri, scopes, state, codeChallenge, codeChallengeMethod } = params;

        // Validate scopes
        const invalidScopes = scopes.filter(scope => !GPT_SCOPES.includes(scope as any));
        if (invalidScopes.length > 0) {
            throw new OAuthError('invalid_scope', `Invalid scopes: ${invalidScopes.join(', ')}`);
        }

        // Check session count (max 5)
        const { data: existingSessions, error: sessionError } = await this.supabase
            .from('gpt_sessions')
            .select('id')
            .eq('clerk_user_id', clerkUserId);

        if (sessionError) {
            this.logger.error({ err: sessionError }, 'Failed to check session count');
            throw new Error('Failed to check session count');
        }

        if (existingSessions && existingSessions.length >= 5) {
            throw new OAuthError('session_limit_exceeded', 'Maximum of 5 active sessions reached');
        }

        // Generate authorization code
        const code = randomBytes(32).toString('hex');

        // Calculate expiry
        const expiresAt = new Date(Date.now() + this.gptConfig.authCodeExpiry * 1000);

        // Insert authorization code
        const { error: insertError } = await this.supabase
            .from('gpt_authorization_codes')
            .insert({
                code,
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
                clerk_user_id: clerkUserId,
                redirect_uri: redirectUri,
                scopes,
                expires_at: expiresAt.toISOString(),
            });

        if (insertError) {
            this.logger.error({ err: insertError }, 'Failed to create authorization code');
            throw new Error('Failed to create authorization code');
        }

        // Publish event
        await this.eventPublisher.publish('gpt.oauth.authorize', {
            clerk_user_id: clerkUserId,
            scopes,
            redirect_uri: redirectUri,
        });

        this.logger.info({ clerk_user_id: clerkUserId, scopes }, 'Authorization code generated');

        return { code };
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCode(params: TokenExchangeParams): Promise<TokenResponse> {
        const { code, codeVerifier, clientId, clientSecret, redirectUri } = params;

        // Validate client credentials
        if (clientId !== this.gptConfig.clientId || clientSecret !== this.gptConfig.clientSecret) {
            throw new OAuthError('invalid_client', 'Invalid client credentials');
        }

        // Look up authorization code
        const { data: authCode, error: authCodeError } = await this.supabase
            .from('gpt_authorization_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (authCodeError || !authCode) {
            throw new OAuthError('invalid_grant', 'Invalid authorization code');
        }

        // Check if already used
        if (authCode.used_at) {
            throw new OAuthError('invalid_grant', 'Authorization code already used');
        }

        // Check expiry
        if (new Date(authCode.expires_at) < new Date()) {
            throw new OAuthError('invalid_grant', 'Authorization code expired');
        }

        // Validate redirect URI
        if (authCode.redirect_uri !== redirectUri) {
            throw new OAuthError('invalid_grant', 'Redirect URI mismatch');
        }

        // Validate PKCE
        const challenge = this.generatePkceChallenge(codeVerifier);
        if (challenge !== authCode.code_challenge) {
            throw new OAuthError('invalid_grant', 'PKCE verification failed');
        }

        // Mark auth code as used
        await this.supabase
            .from('gpt_authorization_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', code);

        // Create session
        const { data: sessionData, error: sessionError } = await this.supabase
            .from('gpt_sessions')
            .insert({
                clerk_user_id: authCode.clerk_user_id,
                scopes: authCode.scopes,
                granted_scopes: authCode.scopes,
            })
            .select('id')
            .single();

        if (sessionError || !sessionData) {
            this.logger.error({ err: sessionError }, 'Failed to create session');
            throw new Error('Failed to create session');
        }

        const sessionId = sessionData.id;

        // Generate and store refresh token
        const refreshToken = this.generateRefreshToken();
        const refreshTokenHash = this.hashToken(refreshToken);
        const refreshTokenExpiry = new Date(Date.now() + this.gptConfig.refreshTokenExpiry * 1000);

        const { data: refreshTokenData, error: refreshTokenError } = await this.supabase
            .from('gpt_refresh_tokens')
            .insert({
                token_hash: refreshTokenHash,
                clerk_user_id: authCode.clerk_user_id,
                expires_at: refreshTokenExpiry.toISOString(),
            })
            .select('id')
            .single();

        if (refreshTokenError || !refreshTokenData) {
            this.logger.error({ err: refreshTokenError }, 'Failed to create refresh token');
            throw new Error('Failed to create refresh token');
        }

        // Link session to refresh token
        await this.supabase
            .from('gpt_sessions')
            .update({ refresh_token_id: refreshTokenData.id })
            .eq('id', sessionId);

        // Generate JWT access token
        const accessToken = await this.generateAccessToken(
            authCode.clerk_user_id,
            sessionId,
            authCode.scopes
        );

        // Publish event
        await this.eventPublisher.publish('gpt.oauth.token_exchanged', {
            clerk_user_id: authCode.clerk_user_id,
            session_id: sessionId,
            scopes: authCode.scopes,
        });

        this.logger.info({ clerk_user_id: authCode.clerk_user_id, session_id: sessionId }, 'Token exchanged');

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: this.gptConfig.accessTokenExpiry,
            refresh_token: refreshToken,
            scope: authCode.scopes.join(' '),
        };
    }

    /**
     * Refresh access token with token rotation
     */
    async refresh(params: RefreshParams): Promise<TokenResponse> {
        const { refreshToken, clientId, clientSecret } = params;

        // Validate client credentials
        if (clientId !== this.gptConfig.clientId || clientSecret !== this.gptConfig.clientSecret) {
            throw new OAuthError('invalid_client', 'Invalid client credentials');
        }

        // Hash and look up refresh token
        const tokenHash = this.hashToken(refreshToken);
        const { data: tokenData, error: tokenError } = await this.supabase
            .from('gpt_refresh_tokens')
            .select('*')
            .eq('token_hash', tokenHash)
            .single();

        if (tokenError || !tokenData) {
            throw new OAuthError('invalid_grant', 'Invalid refresh token');
        }

        // REPLAY DETECTION: If token is revoked or rotated, revoke all sessions
        if (tokenData.revoked_at || tokenData.rotated_to) {
            this.logger.warn({ clerk_user_id: tokenData.clerk_user_id }, 'REPLAY DETECTED - revoking all sessions');

            // Revoke all refresh tokens for user
            await this.supabase
                .from('gpt_refresh_tokens')
                .update({ revoked_at: new Date().toISOString() })
                .eq('clerk_user_id', tokenData.clerk_user_id);

            // Delete all sessions
            await this.supabase
                .from('gpt_sessions')
                .delete()
                .eq('clerk_user_id', tokenData.clerk_user_id);

            // Publish replay detected event
            await this.eventPublisher.publish('gpt.oauth.replay_detected', {
                clerk_user_id: tokenData.clerk_user_id,
                token_id: tokenData.id,
            });

            throw new OAuthError('invalid_grant', 'Refresh token has been revoked');
        }

        // Check expiry
        if (new Date(tokenData.expires_at) < new Date()) {
            throw new OAuthError('invalid_grant', 'Refresh token expired');
        }

        // Look up session
        const { data: sessionData, error: sessionError } = await this.supabase
            .from('gpt_sessions')
            .select('*')
            .eq('refresh_token_id', tokenData.id)
            .single();

        if (sessionError || !sessionData) {
            throw new OAuthError('invalid_grant', 'Session not found');
        }

        // TOKEN ROTATION: Generate new refresh token
        const newRefreshToken = this.generateRefreshToken();
        const newRefreshTokenHash = this.hashToken(newRefreshToken);
        const newRefreshTokenExpiry = new Date(Date.now() + this.gptConfig.refreshTokenExpiry * 1000);

        const { data: newTokenData, error: newTokenError } = await this.supabase
            .from('gpt_refresh_tokens')
            .insert({
                token_hash: newRefreshTokenHash,
                clerk_user_id: tokenData.clerk_user_id,
                expires_at: newRefreshTokenExpiry.toISOString(),
            })
            .select('id')
            .single();

        if (newTokenError || !newTokenData) {
            this.logger.error({ err: newTokenError }, 'Failed to create new refresh token');
            throw new Error('Failed to create new refresh token');
        }

        // Mark old token as rotated and revoked
        await this.supabase
            .from('gpt_refresh_tokens')
            .update({
                rotated_to: newTokenData.id,
                revoked_at: new Date().toISOString(),
            })
            .eq('id', tokenData.id);

        // Update session with new refresh token
        await this.supabase
            .from('gpt_sessions')
            .update({
                refresh_token_id: newTokenData.id,
                last_active: new Date().toISOString(),
            })
            .eq('id', sessionData.id);

        // Generate new JWT access token
        const accessToken = await this.generateAccessToken(
            sessionData.clerk_user_id,
            sessionData.id,
            sessionData.scopes
        );

        // Publish event
        await this.eventPublisher.publish('gpt.oauth.token_refreshed', {
            clerk_user_id: sessionData.clerk_user_id,
            session_id: sessionData.id,
        });

        this.logger.info({ clerk_user_id: sessionData.clerk_user_id, session_id: sessionData.id }, 'Token refreshed');

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: this.gptConfig.accessTokenExpiry,
            refresh_token: newRefreshToken,
            scope: sessionData.scopes.join(' '),
        };
    }

    /**
     * Revoke a specific session
     */
    async revoke(sessionId: string, clerkUserId: string): Promise<void> {
        // Look up session
        const { data: sessionData, error: sessionError } = await this.supabase
            .from('gpt_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (sessionError || !sessionData) {
            throw new Error('Session not found');
        }

        // Verify ownership
        if (sessionData.clerk_user_id !== clerkUserId) {
            throw new Error('Session does not belong to user');
        }

        // Revoke refresh token
        if (sessionData.refresh_token_id) {
            await this.supabase
                .from('gpt_refresh_tokens')
                .update({ revoked_at: new Date().toISOString() })
                .eq('id', sessionData.refresh_token_id);
        }

        // Delete session
        await this.supabase
            .from('gpt_sessions')
            .delete()
            .eq('id', sessionId);

        // Publish event
        await this.eventPublisher.publish('gpt.oauth.session_revoked', {
            clerk_user_id: clerkUserId,
            session_id: sessionId,
        });

        this.logger.info({ clerk_user_id: clerkUserId, session_id: sessionId }, 'Session revoked');
    }

    /**
     * Revoke all sessions for a user
     */
    async revokeAllSessions(clerkUserId: string): Promise<void> {
        // Revoke all refresh tokens
        await this.supabase
            .from('gpt_refresh_tokens')
            .update({ revoked_at: new Date().toISOString() })
            .eq('clerk_user_id', clerkUserId);

        // Delete all sessions
        await this.supabase
            .from('gpt_sessions')
            .delete()
            .eq('clerk_user_id', clerkUserId);

        // Publish event
        await this.eventPublisher.publish('gpt.oauth.all_sessions_revoked', {
            clerk_user_id: clerkUserId,
        });

        this.logger.info({ clerk_user_id: clerkUserId }, 'All sessions revoked');
    }

    /**
     * List active sessions for a user
     */
    async listSessions(clerkUserId: string): Promise<GptSession[]> {
        const { data, error } = await this.supabase
            .from('gpt_sessions')
            .select(`
                id,
                clerk_user_id,
                scopes,
                granted_scopes,
                created_at,
                last_active,
                gpt_refresh_tokens!inner (
                    expires_at
                )
            `)
            .eq('clerk_user_id', clerkUserId);

        if (error) {
            this.logger.error({ err: error }, 'Failed to list sessions');
            throw new Error('Failed to list sessions');
        }

        return (data || []).map((session: any) => ({
            id: session.id,
            clerk_user_id: session.clerk_user_id,
            scopes: session.scopes,
            granted_scopes: session.granted_scopes,
            created_at: session.created_at,
            last_active: session.last_active,
            refresh_token_expiry: session.gpt_refresh_tokens?.expires_at,
        }));
    }

    /**
     * Validate JWT access token
     */
    async validateAccessToken(token: string): Promise<ValidatedToken> {
        // Strip prefix
        if (!token.startsWith('gpt_at_')) {
            throw new Error('Invalid token format');
        }

        const jwt = token.substring(7); // Remove 'gpt_at_' prefix

        try {
            const privateKey = await this.ensurePrivateKey();

            // Verify JWT signature
            const { payload } = await jwtVerify(jwt, privateKey, {
                issuer: this.issuer,
                audience: this.audience,
            });

            // Extract claims
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

    /**
     * Check if user has existing consent for requested scopes
     */
    async hasExistingConsent(clerkUserId: string, requestedScopes: string[]): Promise<{ hasConsent: boolean; sessionCount: number; existingScopes: string[] }> {
        const { data, error } = await this.supabase
            .from('gpt_sessions')
            .select('granted_scopes')
            .eq('clerk_user_id', clerkUserId);

        if (error || !data || data.length === 0) {
            return { hasConsent: false, sessionCount: 0, existingScopes: [] };
        }

        // Collect all unique scopes ever granted across all sessions
        const allGrantedScopes = new Set<string>();
        data.forEach((session: { granted_scopes: string[] | null }) => {
            const grantedScopes: string[] = session.granted_scopes || [];
            grantedScopes.forEach((s: string) => allGrantedScopes.add(s));
        });

        const existingScopes = Array.from(allGrantedScopes);

        // Check if any session has granted_scopes that is a superset of requestedScopes
        const hasConsent = data.some((session: { granted_scopes: string[] | null }) => {
            const grantedScopes: string[] = session.granted_scopes || [];
            return requestedScopes.every((s: string) => grantedScopes.includes(s));
        });

        return {
            hasConsent,
            sessionCount: data.length,
            existingScopes,
        };
    }

    /**
     * Generate JWT access token
     */
    private async generateAccessToken(
        clerkUserId: string,
        sessionId: string,
        scopes: string[]
    ): Promise<string> {
        const privateKey = await this.ensurePrivateKey();

        const now = Math.floor(Date.now() / 1000);
        const exp = now + this.gptConfig.accessTokenExpiry;

        const jwt = await new SignJWT({
            session_id: sessionId,
            scopes,
        })
            .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
            .setIssuer(this.issuer)
            .setAudience(this.audience)
            .setSubject(clerkUserId)
            .setIssuedAt(now)
            .setExpirationTime(exp)
            .sign(privateKey);

        return `gpt_at_${jwt}`;
    }

    /**
     * Generate opaque refresh token
     */
    private generateRefreshToken(): string {
        const token = randomBytes(48).toString('hex');
        return `gpt_rt_${token}`;
    }

    /**
     * Hash token with SHA-256
     */
    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    /**
     * Generate PKCE challenge from verifier
     */
    private generatePkceChallenge(verifier: string): string {
        return createHash('sha256')
            .update(verifier)
            .digest('base64url');
    }
}
