/**
 * OAuth2 Types and Constants for GPT Service
 * Phase 12: OAuth2 Provider
 */

// ============================================================================
// Scope Constants
// ============================================================================

export const GPT_SCOPES = [
    'jobs:read',
    'applications:read',
    'applications:write',
    'resume:read',
] as const;

export const READ_SCOPES = [
    'jobs:read',
    'applications:read',
    'resume:read',
] as const;

export type GptScope = typeof GPT_SCOPES[number];

// ============================================================================
// OAuth Parameters
// ============================================================================

export interface AuthorizeParams {
    clerkUserId: string;
    redirectUri: string;
    scopes: string[];
    state: string;
    codeChallenge?: string;
    codeChallengeMethod?: 'S256' | 'plain';
}

export interface TokenExchangeParams {
    code: string;
    codeVerifier?: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface RefreshParams {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}

// ============================================================================
// OAuth Responses
// ============================================================================

export interface TokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token: string;
    scope: string;
}

// ============================================================================
// Session Types
// ============================================================================

export interface GptSession {
    id: string;
    clerk_user_id: string;
    scopes: string[];
    granted_scopes: string[];
    created_at: string;
    last_active: string;
    refresh_token_expiry?: string;
}

export interface ValidatedToken {
    clerkUserId: string;
    sessionId: string;
    scopes: string[];
}

// ============================================================================
// OAuth Errors
// ============================================================================

export type OAuthErrorCode =
    | 'invalid_request'
    | 'invalid_grant'
    | 'invalid_client'
    | 'invalid_scope'
    | 'session_limit_exceeded'
    | 'unauthorized_client'
    | 'unsupported_grant_type'
    | 'access_denied';

export class OAuthError extends Error {
    constructor(
        public code: OAuthErrorCode,
        message?: string
    ) {
        super(message || code);
        this.name = 'OAuthError';
    }
}
