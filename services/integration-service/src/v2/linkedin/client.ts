import { Logger } from '@splits-network/shared-logging';

/* ── LinkedIn API Types ──────────────────────────────────────────────── */

/** OpenID Connect userinfo response */
export interface LinkedInProfile {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
    locale?: { country: string; language: string };
}

/* ── Client ──────────────────────────────────────────────────────────── */

export class LinkedInClient {
    constructor(private logger: Logger) {}

    /**
     * Fetch the authenticated user's profile via OpenID Connect userinfo endpoint.
     * Requires 'openid', 'profile', 'email' scopes.
     */
    async getProfile(accessToken: string): Promise<LinkedInProfile> {
        const res = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`LinkedIn userinfo failed (${res.status}): ${text}`);
        }

        return res.json() as Promise<LinkedInProfile>;
    }
}
