import { createAuthenticatedClient } from "@/lib/api-client";

type UserSummary = {
    id: string;
    name: string | null;
    email: string;
};

const cache = new Map<string, UserSummary>();
const pending = new Map<string, Promise<UserSummary | null>>();

export async function getCachedUserSummary(
    getToken: () => Promise<string | null>,
    userId: string,
): Promise<UserSummary | null> {
    if (cache.has(userId)) {
        return cache.get(userId) || null;
    }
    if (pending.has(userId)) {
        return pending.get(userId) || null;
    }

    const task = (async () => {
        const token = await getToken();
        if (!token) return null;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get(`/users/${userId}`);
        const user = response?.data;
        if (!user) return null;
        const summary = {
            id: user.id,
            name: user.name,
            email: user.email,
        } as UserSummary;
        cache.set(userId, summary);
        return summary;
    })();

    pending.set(userId, task);

    try {
        return await task;
    } finally {
        pending.delete(userId);
    }
}
