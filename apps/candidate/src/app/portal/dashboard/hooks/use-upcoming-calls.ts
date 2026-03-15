'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CallParticipant {
    user_id: string;
    role: string;
    name?: string;
}

export interface CallListItem {
    id: string;
    title: string | null;
    call_type: string;
    scheduled_at: string;
    status: string;
    participants: CallParticipant[];
}

export function useUpcomingCalls() {
    const { getToken } = useAuth();
    const [calls, setCalls] = useState<CallListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: CallListItem[] }>('/calls', {
                params: {
                    status: 'scheduled',
                    sort_by: 'scheduled_at',
                    sort_order: 'asc',
                    limit: 5,
                },
            });

            setCalls(res.data || []);
        } catch (err) {
            console.error('[UpcomingCalls] Failed to load:', err);
            setCalls([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { calls, loading, refresh };
}
