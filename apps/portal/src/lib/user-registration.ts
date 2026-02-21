/**
 * User Registration Utility
 *
 * Thin wrapper around POST /onboarding/init — the backend handles
 * idempotent user creation, duplicate detection, and webhook race conditions.
 *
 * Type exports are kept for consumers that need UserRegistrationResult shapes.
 */

import { createAuthenticatedClient } from '@/lib/api-client';

/**
 * Data required to register a new user
 */
export interface UserRegistrationData {
    clerk_user_id: string;
    email: string;
    name?: string;
    image_url?: string;
    referred_by_recruiter_id?: string;
}

/**
 * Result of the user registration attempt
 */
export interface UserRegistrationResult {
    success: boolean;
    user: {
        id: string;
        clerk_user_id: string;
        email: string;
        name: string | null;
        onboarding_status: string;
        onboarding_step: number;
        roles?: string[];
        is_platform_admin?: boolean;
        recruiter_id?: string | null;
        candidate_id?: string | null;
        organization_ids?: string[];
    } | null;
    error?: string;
    /** Whether this was an existing user or newly created */
    wasExisting: boolean;
}

/**
 * Ensures a user exists in the database.
 *
 * Delegates to POST /onboarding/init which handles all orchestration:
 * - Idempotent user creation (GET first, POST if 404, handle 409 duplicate)
 * - Race condition handling with Clerk webhooks
 *
 * @deprecated Prefer calling POST /onboarding/init directly via createAuthenticatedClient.
 */
export async function ensureUserInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserRegistrationResult> {
    const client = createAuthenticatedClient(token);

    try {
        const response = await client.post<{
            data: {
                user: UserRegistrationResult['user'];
                was_existing: { user: boolean };
            };
        }>('/onboarding/init', {
            email: data.email,
            name: data.name || '',
            image_url: data.image_url,
            referred_by_recruiter_id: data.referred_by_recruiter_id,
            source_app: 'portal',
        });

        const user = response?.data?.user ?? null;
        const wasExisting = response?.data?.was_existing?.user ?? true;

        return {
            success: true,
            user,
            wasExisting,
        };
    } catch (error: any) {
        console.error('[UserRegistration] POST /onboarding/init failed:', error);
        return {
            success: false,
            user: null,
            error: error?.message || 'Failed to create user account',
            wasExisting: false,
        };
    }
}
