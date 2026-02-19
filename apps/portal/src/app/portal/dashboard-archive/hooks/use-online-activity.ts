'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ActivitySnapshot } from '../components/online-activity-chart';

export function useOnlineActivity() {
    const { getToken } = useAuth();
    const [snapshot, setSnapshot] = useState<ActivitySnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/activity/online');
            const data = response?.data || response;

            if (data) {
                setSnapshot(data);
            }
        } catch (err: any) {
            console.error('[useOnlineActivity] Failed:', err);
            setError(err.message || 'Failed to load online activity');
            // Don't reset snapshot on error - keep showing last known data
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { snapshot, loading, error, refresh, setSnapshot };
}