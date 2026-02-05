/**
 * User Registration Utility
 * Ensures users exist in the database for SSO sign-ups
 * 
 * This module provides idempotent user creation that handles:
 * - First-time SSO sign-ups
 * - Race conditions with Clerk webhooks
 * - Duplicate key errors gracefully
 */

import { createAuthenticatedClient } from '@/lib/api-client';
import { getCurrentUserProfile, setCachedCurrentUserProfile } from '@/lib/current-user-profile';

/**
 * Data required to register a new user
 */
export interface UserRegistrationData {
    clerk_user_id: string;
    email: string;
    name?: string;
    image_url?: string;
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
 * This function is idempotent - safe to call multiple times.
 * It will:
 * 1. First check if user exists via /users/me endpoint
 * 2. If not exists, create via /users/register endpoint
 * 3. Handle duplicate key errors gracefully (race condition with webhook)
 * 
 * @param token - Clerk JWT token for authentication
 * @param data - User registration data from Clerk
 * @returns UserRegistrationResult with success status and user data
 */
export async function ensureUserInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserRegistrationResult> {
    const apiClient = createAuthenticatedClient(token);

    try {
        // Step 1: Check if user already exists via /users/me
        try {
            const existing = await getCurrentUserProfile(async () => token);

            if (existing) {
                console.log('[UserRegistration] User already exists:', existing.id);
                return {
                    success: true,
                    user: existing as UserRegistrationResult['user'],
                    wasExisting: true,
                };
            }
        } catch (checkError: any) {
            // 404 or similar - user doesn't exist, continue to create
            const status = checkError?.response?.status || checkError?.status;
            if (status !== 404 && status !== 500) {
                // Unexpected error, but we'll try to create anyway
                console.warn('[UserRegistration] Error checking existing user, will try to create:', checkError);
            }
        }

        // Step 2: Create new user via /users/register
        console.log('[UserRegistration] Creating new user for:', data.email);

        const createResponse = await apiClient.post<{ data: UserRegistrationResult['user'] }>('/users/register', {
            clerk_user_id: data.clerk_user_id,
            email: data.email,
            name: data.name || '',
            image_url: data.image_url,
        });

        if (createResponse?.data) {
            console.log('[UserRegistration] User created successfully:', createResponse.data.id);
            return {
                success: true,
                user: createResponse.data,
                wasExisting: false,
            };
        }

        // Unexpected empty response
        throw new Error('Empty response from user registration');

    } catch (error: any) {
        // Handle duplicate key error (race condition with webhook)
        const errorMessage = error?.message || error?.response?.data?.error?.message || '';
        const isDuplicateKey =
            errorMessage.toLowerCase().includes('already registered') ||
            errorMessage.toLowerCase().includes('duplicate') ||
            errorMessage.toLowerCase().includes('already exists') ||
            error?.response?.status === 409;

        if (isDuplicateKey) {
            console.log('[UserRegistration] User created by webhook, fetching existing...');

            // User was created by webhook during our check, fetch them
            try {
                const retryUser = await getCurrentUserProfile(async () => token);

                if (retryUser) {
                    return {
                        success: true,
                        user: retryUser as UserRegistrationResult['user'],
                        wasExisting: true,
                    };
                }
            } catch (retryError) {
                console.error('[UserRegistration] Failed to fetch user after duplicate error:', retryError);
            }
        }

        // Log and return error
        console.error('[UserRegistration] Failed to ensure user:', error);
        return {
            success: false,
            user: null,
            error: errorMessage || 'Failed to create user account',
            wasExisting: false,
        };
    }
}

/**
 * Check if a user exists in the database without creating them.
 *
 * @param token - Clerk JWT token for authentication
 * @returns User data if exists, null otherwise
 */
export async function checkUserExists(
    token: string
): Promise<UserRegistrationResult['user'] | null> {
    try {
        return await getCurrentUserProfile(async () => token) as UserRegistrationResult['user'] | null;
    } catch {
        return null;
    }
}
