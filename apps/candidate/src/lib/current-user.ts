import { createAuthenticatedClient } from "@/lib/api-client";

let cachedUserId: string | null = null;
let pending: Promise<string | null> | null = null;

export async function getCachedCurrentUserId(
    getToken: () => Promise<string | null>,
): Promise<string | null> {
    if (cachedUserId) return cachedUserId;
    if (pending) return pending;

    pending = (async () => {
        const token = await getToken();
        if (!token) return null;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/users/me");
        cachedUserId = response?.data?.id ?? null;
        return cachedUserId;
    })();

    try {
        return await pending;
    } finally {
        pending = null;
    }
}
