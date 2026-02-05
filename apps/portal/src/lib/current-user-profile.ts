import { createAuthenticatedClient } from "@/lib/api-client";

type UserProfile = Record<string, any>;
type Subscription = Record<string, any>;

/**
 * Fetch the current user's profile from the API.
 * This function NO LONGER CACHES - it always fetches fresh data.
 *
 * @param getToken - Function that returns the authentication token
 * @returns The user profile or null if not authenticated
 */
export async function getCurrentUserProfile(
    getToken: () => Promise<string | null>,
): Promise<UserProfile | null> {
    const token = await getToken();
    if (!token) return null;

    const client = createAuthenticatedClient(token);
    const response: any = await client.get("/users/me");
    return response?.data ?? null;
}

/**
 * No-op function for backward compatibility.
 * User profile is no longer cached, so this does nothing.
 *
 * @deprecated This function no longer serves a purpose and will be removed in a future version.
 */
export function setCachedCurrentUserProfile(profile: UserProfile | null) {
    // No-op - caching has been removed
}

/**
 * No-op function for backward compatibility.
 * User profile is no longer cached, so this does nothing.
 *
 * @deprecated This function no longer serves a purpose and will be removed in a future version.
 */
export function clearCachedCurrentUserProfile() {
    // No-op - caching has been removed
}

/**
 * Get just the current user's ID from the profile.
 * Replaces the deprecated current-user.ts file.
 *
 * @param getToken - Function that returns the authentication token
 * @returns The user ID or null if not authenticated
 */
export async function getCachedCurrentUserId(
    getToken: () => Promise<string | null>,
): Promise<string | null> {
    const profile = await getCurrentUserProfile(getToken);
    return profile?.id ?? null;
}

/**
 * Fetch the current user's subscription from the API.
 * This function NO LONGER CACHES - it always fetches fresh data.
 *
 * @param getToken - Function that returns the authentication token
 * @returns The subscription or null if not found
 */
export async function getCachedSubscription(
    getToken: () => Promise<string | null>,
): Promise<Subscription | null> {
    const token = await getToken();
    if (!token) return null;

    const client = createAuthenticatedClient(token);
    try {
        const response: any = await client.get("/subscriptions/me");
        return response?.data ?? null;
    } catch (err: any) {
        // 404 is expected for non-recruiters
        if (err?.response?.status === 404) {
            return null;
        }
        throw err;
    }
}
