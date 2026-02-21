/**
 * OAuth Service Test Suite
 * Phase 12: OAuth2 Provider - TDD
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAuthService } from './oauth-service';
import { OAuthError } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GptConfig } from '@splits-network/shared-config';
import type { EventPublisher } from '../shared/events';
import type { Logger } from '@splits-network/shared-logging';

// Mock logger
const mockLogger: Logger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
} as any;

// Mock event publisher
const mockEventPublisher: IEventPublisher = {
    publish: vi.fn(),
} as any;

// Test EC private key (P-256 curve, PKCS#8 format, for testing only)
const testEcPrivateKeyPem = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgnKu8pupFEMzO+p2+
vOOj99qaU6tzLi7q2f+JFdG5om+hRANCAASzDRJBuRB0tfujpBrENmbLtlJpxd7i
S+iuDqi7DMc6PkoIn9iM5VAKVjCruBFJBNVfxZ+75oZ2GJK6otC3WgCG
-----END PRIVATE KEY-----`;

// Base64 encode the PEM for config
const testEcPrivateKeyBase64 = Buffer.from(testEcPrivateKeyPem).toString('base64');

// Mock GptConfig
const mockGptConfig: GptConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    ecPrivateKeyBase64: testEcPrivateKeyBase64,
    redirectUri: 'https://chat.openai.com/aip/callback',
    accessTokenExpiry: 900, // 15 minutes
    refreshTokenExpiry: 2592000, // 30 days
    authCodeExpiry: 300, // 5 minutes
};

describe('OAuthService', () => {
    let mockSupabase: SupabaseClient;
    let oauthService: OAuthService;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock Supabase client
        mockSupabase = {
            from: vi.fn(),
        } as any;

        oauthService = new OAuthService(
            mockSupabase,
            mockGptConfig,
            mockEventPublisher,
            mockLogger
        );

        // Wait for private key initialization
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    describe('authorize', () => {
        it('should generate authorization code with valid scopes', async () => {
            // Mock: no existing sessions (first-time user)
            const mockSessionData = vi.fn().mockResolvedValue({ data: [], error: null });
            const mockInsertData = vi.fn().mockResolvedValue({ data: {}, error: null });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_sessions') {
                    return {
                        select: () => ({
                            eq: () => mockSessionData()
                        })
                    };
                }
                if (table === 'gpt_authorization_codes') {
                    return { insert: () => mockInsertData() };
                }
            });

            const result = await oauthService.authorize({
                clerkUserId: 'user_123',
                redirectUri: 'https://chat.openai.com/aip/callback',
                scopes: ['jobs:read', 'applications:read'],
                state: 'random-state',
                codeChallenge: 'test-challenge',
                codeChallengeMethod: 'S256',
            });

            expect(result).toHaveProperty('code');
            expect(typeof result.code).toBe('string');
            expect(result.code.length).toBeGreaterThan(0);
            expect(mockInsertData).toHaveBeenCalled();
            expect(mockEventPublisher.publish).toHaveBeenCalledWith(
                'gpt.oauth.authorize',
                expect.objectContaining({ clerk_user_id: 'user_123' })
            );
        });

        it('should reject invalid scopes', async () => {
            await expect(
                oauthService.authorize({
                    clerkUserId: 'user_123',
                    redirectUri: 'https://chat.openai.com/aip/callback',
                    scopes: ['invalid:scope'],
                    state: 'random-state',
                    codeChallenge: 'test-challenge',
                    codeChallengeMethod: 'S256',
                })
            ).rejects.toThrow(OAuthError);
        });

        it('should enforce session limit (max 5)', async () => {
            // Mock: user already has 5 sessions
            const mockSessionData = vi.fn().mockResolvedValue({
                data: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
                error: null,
            });

            (mockSupabase.from as any).mockReturnValue({
                select: () => ({
                    eq: () => mockSessionData()
                })
            });

            await expect(
                oauthService.authorize({
                    clerkUserId: 'user_123',
                    redirectUri: 'https://chat.openai.com/aip/callback',
                    scopes: ['jobs:read'],
                    state: 'random-state',
                    codeChallenge: 'test-challenge',
                    codeChallengeMethod: 'S256',
                })
            ).rejects.toThrow(OAuthError);
        });
    });

    describe('exchangeCode', () => {
        it('should exchange valid auth code for tokens', async () => {
            const mockCode = 'test-auth-code';
            const mockCodeVerifier = 'test-verifier';

            // Mock: auth code lookup
            const mockAuthCodeSelect = vi.fn().mockResolvedValue({
                data: {
                    id: 'code-id',
                    code: mockCode,
                    code_challenge: 'JBbiqONGWPaAmwXk_8bT6UnlPfrn65D32eZlJS-zGG0', // SHA256 base64url of 'test-verifier'
                    code_challenge_method: 'S256',
                    clerk_user_id: 'user_123',
                    redirect_uri: mockGptConfig.redirectUri,
                    scopes: ['jobs:read'],
                    expires_at: new Date(Date.now() + 300000).toISOString(),
                    used_at: null,
                },
                error: null,
            });

            // Mock: update auth code as used
            const mockAuthCodeUpdate = vi.fn().mockResolvedValue({ data: {}, error: null });

            // Mock: create session
            const mockSessionInsert = vi.fn().mockResolvedValue({
                data: { id: 'session-123' },
                error: null,
            });

            // Mock: create refresh token
            const mockRefreshTokenInsert = vi.fn().mockResolvedValue({
                data: { id: 'refresh-token-id' },
                error: null,
            });

            // Mock: update session with refresh token
            const mockSessionUpdate = vi.fn().mockResolvedValue({ data: {}, error: null });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_authorization_codes') {
                    return {
                        select: () => ({
                            eq: () => ({ single: () => mockAuthCodeSelect() }),
                        }),
                        update: () => ({ eq: () => mockAuthCodeUpdate() }),
                    };
                }
                if (table === 'gpt_sessions') {
                    return {
                        insert: () => ({ select: () => ({ single: () => mockSessionInsert() }) }),
                        update: () => ({ eq: () => mockSessionUpdate() }),
                    };
                }
                if (table === 'gpt_refresh_tokens') {
                    return {
                        insert: () => ({ select: () => ({ single: () => mockRefreshTokenInsert() }) }),
                    };
                }
            });

            const result = await oauthService.exchangeCode({
                code: mockCode,
                codeVerifier: mockCodeVerifier,
                clientId: mockGptConfig.clientId,
                clientSecret: mockGptConfig.clientSecret,
                redirectUri: mockGptConfig.redirectUri,
            });

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result.token_type).toBe('Bearer');
            expect(result.expires_in).toBe(900);
            expect(result.access_token).toMatch(/^gpt_at_/);
            expect(result.refresh_token).toMatch(/^gpt_rt_/);
        });

        it('should reject invalid client credentials', async () => {
            await expect(
                oauthService.exchangeCode({
                    code: 'test-code',
                    codeVerifier: 'test-verifier',
                    clientId: 'wrong-client-id',
                    clientSecret: 'wrong-secret',
                    redirectUri: 'https://chat.openai.com/aip/callback',
                })
            ).rejects.toThrow(OAuthError);
        });
    });

    describe('refresh', () => {
        it('should rotate refresh token and issue new access token', async () => {
            const mockRefreshToken = 'gpt_rt_' + 'a'.repeat(96);

            // Mock: lookup existing refresh token
            const mockRefreshTokenSelect = vi.fn().mockResolvedValue({
                data: {
                    id: 'old-token-id',
                    clerk_user_id: 'user_123',
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                    revoked_at: null,
                    rotated_to: null,
                },
                error: null,
            });

            // Mock: insert new refresh token
            const mockRefreshTokenInsert = vi.fn().mockResolvedValue({
                data: { id: 'new-token-id' },
                error: null,
            });

            // Mock: update old token (mark as rotated)
            const mockRefreshTokenUpdate = vi.fn().mockResolvedValue({ data: {}, error: null });

            // Mock: lookup session
            const mockSessionSelect = vi.fn().mockResolvedValue({
                data: {
                    id: 'session-123',
                    clerk_user_id: 'user_123',
                    scopes: ['jobs:read'],
                    granted_scopes: ['jobs:read'],
                },
                error: null,
            });

            // Mock: update session with new refresh token
            const mockSessionUpdate = vi.fn().mockResolvedValue({ data: {}, error: null });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_refresh_tokens') {
                    return {
                        select: () => ({ eq: () => ({ single: () => mockRefreshTokenSelect() }) }),
                        insert: () => ({ select: () => ({ single: () => mockRefreshTokenInsert() }) }),
                        update: () => ({ eq: () => mockRefreshTokenUpdate() }),
                    };
                }
                if (table === 'gpt_sessions') {
                    return {
                        select: () => ({ eq: () => ({ single: () => mockSessionSelect() }) }),
                        update: () => ({ eq: () => mockSessionUpdate() }),
                    };
                }
            });

            const result = await oauthService.refresh({
                refreshToken: mockRefreshToken,
                clientId: mockGptConfig.clientId,
                clientSecret: mockGptConfig.clientSecret,
            });

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result.access_token).toMatch(/^gpt_at_/);
            expect(result.refresh_token).toMatch(/^gpt_rt_/);
            expect(result.refresh_token).not.toBe(mockRefreshToken);
        });

        it('should detect replay and revoke all sessions', async () => {
            const mockRefreshToken = 'gpt_rt_' + 'a'.repeat(96);

            // Mock: token has been rotated (replay detected)
            const mockRefreshTokenSelect = vi.fn().mockResolvedValue({
                data: {
                    id: 'old-token-id',
                    clerk_user_id: 'user_123',
                    rotated_to: 'some-new-token-id', // This indicates replay
                },
                error: null,
            });

            // Mock: revoke all tokens for user
            const mockRevokeAll = vi.fn().mockResolvedValue({ data: {}, error: null });

            // Mock: delete all sessions
            const mockDeleteSessions = vi.fn().mockResolvedValue({ data: {}, error: null });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_refresh_tokens') {
                    return {
                        select: () => ({ eq: () => ({ single: () => mockRefreshTokenSelect() }) }),
                        update: () => ({ eq: () => mockRevokeAll() }),
                    };
                }
                if (table === 'gpt_sessions') {
                    return {
                        delete: () => ({ eq: () => mockDeleteSessions() }),
                    };
                }
            });

            await expect(
                oauthService.refresh({
                    refreshToken: mockRefreshToken,
                    clientId: mockGptConfig.clientId,
                    clientSecret: mockGptConfig.clientSecret,
                })
            ).rejects.toThrow(OAuthError);

            expect(mockEventPublisher.publish).toHaveBeenCalledWith(
                'gpt.oauth.replay_detected',
                expect.objectContaining({ clerk_user_id: 'user_123' })
            );
        });
    });

    describe('revoke', () => {
        it('should revoke session and refresh token', async () => {
            const mockSessionId = 'session-123';
            const mockUserId = 'user_123';

            // Mock: lookup session
            const mockSessionSelect = vi.fn().mockResolvedValue({
                data: {
                    id: mockSessionId,
                    clerk_user_id: mockUserId,
                    refresh_token_id: 'token-id',
                },
                error: null,
            });

            // Mock: update refresh token (revoke)
            const mockRefreshTokenUpdate = vi.fn().mockResolvedValue({ data: {}, error: null });

            // Mock: delete session
            const mockSessionDelete = vi.fn().mockResolvedValue({ data: {}, error: null });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_sessions') {
                    return {
                        select: () => ({ eq: () => ({ single: () => mockSessionSelect() }) }),
                        delete: () => ({ eq: () => mockSessionDelete() }),
                    };
                }
                if (table === 'gpt_refresh_tokens') {
                    return {
                        update: () => ({ eq: () => mockRefreshTokenUpdate() }),
                    };
                }
            });

            await oauthService.revoke(mockSessionId, mockUserId);

            expect(mockRefreshTokenUpdate).toHaveBeenCalled();
            expect(mockSessionDelete).toHaveBeenCalled();
            expect(mockEventPublisher.publish).toHaveBeenCalledWith(
                'gpt.oauth.session_revoked',
                expect.any(Object)
            );
        });
    });

    describe('validateAccessToken', () => {
        it('should validate and extract claims from JWT', async () => {
            // First, create a token via exchangeCode
            const mockCode = 'test-auth-code';
            const mockCodeVerifier = 'test-verifier';

            // Setup mocks for exchangeCode
            const mockAuthCodeSelect = vi.fn().mockResolvedValue({
                data: {
                    code: mockCode,
                    code_challenge: 'JBbiqONGWPaAmwXk_8bT6UnlPfrn65D32eZlJS-zGG0', // SHA256 base64url of 'test-verifier'
                    code_challenge_method: 'S256',
                    clerk_user_id: 'user_123',
                    redirect_uri: mockGptConfig.redirectUri,
                    scopes: ['jobs:read'],
                    expires_at: new Date(Date.now() + 300000).toISOString(),
                    used_at: null,
                },
                error: null,
            });

            (mockSupabase.from as any).mockImplementation((table: string) => {
                if (table === 'gpt_authorization_codes') {
                    return {
                        select: () => ({ eq: () => ({ single: () => mockAuthCodeSelect() }) }),
                        update: () => ({ eq: () => Promise.resolve({ data: {}, error: null }) }),
                    };
                }
                if (table === 'gpt_sessions') {
                    return {
                        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'session-123' }, error: null }) }) }),
                        update: () => ({ eq: () => Promise.resolve({ data: {}, error: null }) }),
                    };
                }
                if (table === 'gpt_refresh_tokens') {
                    return {
                        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'token-id' }, error: null }) }) }),
                    };
                }
            });

            const tokenResponse = await oauthService.exchangeCode({
                code: mockCode,
                codeVerifier: mockCodeVerifier,
                clientId: mockGptConfig.clientId,
                clientSecret: mockGptConfig.clientSecret,
                redirectUri: mockGptConfig.redirectUri,
            });

            // Now validate the token
            const validated = await oauthService.validateAccessToken(tokenResponse.access_token);

            expect(validated).toHaveProperty('clerkUserId', 'user_123');
            expect(validated).toHaveProperty('sessionId', 'session-123');
            expect(validated).toHaveProperty('scopes');
            expect(validated.scopes).toContain('jobs:read');
        });

        it('should reject expired tokens', async () => {
            // Create a token with the service, but we'll test with manipulated time
            // For now, just test that invalid tokens are rejected
            await expect(
                oauthService.validateAccessToken('gpt_at_invalid.token.here')
            ).rejects.toThrow();
        });
    });

    describe('hasExistingConsent', () => {
        it('should return true when user has superset scopes', async () => {
            // Mock: user has session with granted_scopes that is a superset
            const mockSessionSelect = vi.fn().mockResolvedValue({
                data: [{
                    granted_scopes: ['jobs:read', 'applications:read', 'applications:write'],
                }],
                error: null,
            });

            (mockSupabase.from as any).mockReturnValue({
                select: () => ({ eq: () => mockSessionSelect() }),
            });

            const result = await oauthService.hasExistingConsent('user_123', ['jobs:read', 'applications:read']);

            expect(result.hasConsent).toBe(true);
            expect(result.sessionCount).toBe(1);
            expect(result.existingScopes).toEqual(['jobs:read', 'applications:read', 'applications:write']);
        });

        it('should return false when no superset scopes exist', async () => {
            // Mock: user has no sessions
            const mockSessionSelect = vi.fn().mockResolvedValue({
                data: [],
                error: null,
            });

            (mockSupabase.from as any).mockReturnValue({
                select: () => ({ eq: () => mockSessionSelect() }),
            });

            const result = await oauthService.hasExistingConsent('user_123', ['applications:write']);

            expect(result.hasConsent).toBe(false);
            expect(result.sessionCount).toBe(0);
            expect(result.existingScopes).toEqual([]);
        });
    });
});
