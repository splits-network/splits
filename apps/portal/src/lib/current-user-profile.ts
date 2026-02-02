import { createAuthenticatedClient } from "@/lib/api-client";

type UserProfile = Record<string, any>;
type Subscription = Record<string, any>;

let cachedProfile: UserProfile | null = null;
let pending: Promise<UserProfile | null> | null = null;
let cachedSubscription: Subscription | null = null;
let subscriptionPending: Promise<Subscription | null> | null = null;

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
    cachedSubscription = null;
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

export async function getCachedSubscription(
    getToken: () => Promise<string | null>,
    options?: { force?: boolean },
): Promise<Subscription | null> {
    if (options?.force) {
        cachedSubscription = null;
    }
    if (cachedSubscription) return cachedSubscription;
    if (subscriptionPending) return subscriptionPending;

    subscriptionPending = (async () => {
        const token = await getToken();
        if (!token) return null;
        const client = createAuthenticatedClient(token);
        try {
            const response: any = await client.get("/subscriptions/me");
            const subscription = response?.data ?? null;
            if (subscription) {
                cachedSubscription = subscription;
            }
            return subscription;
        } catch (err: any) {
            // 404 is expected for non-recruiters
            if (err?.response?.status === 404) {
                return null;
            }
            throw err;
        }
    })();

    try {
        return await subscriptionPending;
    } finally {
        subscriptionPending = null;
    }
}
