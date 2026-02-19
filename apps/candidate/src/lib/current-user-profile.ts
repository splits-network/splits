import { createAuthenticatedClient } from "@/lib/api-client";

type UserProfile = Record<string, any>;

/**
 * Fetch the current user's profile without any module-level caching.
 * Safe for use in server components and layouts (no shared state between requests).
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

let cachedProfile: UserProfile | null = null;
let pending: Promise<UserProfile | null> | null = null;

export async function getCachedCurrentUserProfile(
    getToken: () => Promise<string | null>,
    options?: { force?: boolean },
): Promise<UserProfile | null> {
    if (options?.force) {
        cachedProfile = null;
    }
    if (cachedProfile) return cachedProfile;
    if (pending) return pending;

    pending = (async () => {
        const token = await getToken();
        if (!token) return null;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/users/me");
        const profile = response?.data ?? null;
        if (profile) {
            cachedProfile = profile;
        }
        return profile;
    })();

    try {
        return await pending;
    } finally {
        pending = null;
    }
}

export function setCachedCurrentUserProfile(profile: UserProfile | null) {
    if (profile) {
        cachedProfile = profile;
    }
}

export function clearCachedCurrentUserProfile() {
    cachedProfile = null;
}

/**
 * Get just the current user's ID from the cached profile.
 * Replaces the deprecated current-user.ts file.
 */
export async function getCachedCurrentUserId(
    getToken: () => Promise<string | null>,
): Promise<string | null> {
    const profile = await getCachedCurrentUserProfile(getToken);
    return profile?.id ?? null;
}
