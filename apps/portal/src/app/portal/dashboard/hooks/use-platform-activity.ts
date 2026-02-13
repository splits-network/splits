'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PlatformActivityEvent {
    type: 'placement' | 'recruiter_join' | 'company_join' | 'fraud_alert' | 'application' | 'payout';
    title: string;
    description: string;
    href: string;
    created_at: string;
}

export function usePlatformActivity() {
    const { getToken } = useAuth();
    const [events, setEvents] = useState<PlatformActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/stats/platform-activity');
            const data = response?.data || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[usePlatformActivity] Failed:', err);
            setError(err.message || 'Failed to load activity');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { events, loading, error, refresh };
}
