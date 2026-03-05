"use client";

import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface InviteResult {
    data: {
        id: string;
        invite_status: string;
        recruiter_user_id: string | null;
    };
}

export function useMatchActions() {
    const { getToken } = useAuth();

    async function inviteCandidate(matchId: string): Promise<InviteResult> {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const client = createAuthenticatedClient(token);
        const res = await client.post<InviteResult>(`/matches/${matchId}/invite`);
        return res as unknown as InviteResult;
    }

    async function dismissMatch(matchId: string): Promise<void> {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const client = createAuthenticatedClient(token);
        await client.patch(`/matches/${matchId}/dismiss`);
    }

    return { inviteCandidate, dismissMatch };
}
