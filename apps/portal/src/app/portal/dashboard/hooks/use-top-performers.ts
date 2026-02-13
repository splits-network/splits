'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface TopPerformer {
    recruiter_id: string;
    recruiter_name: string;
    placement_count: number;
}

export function useTopPerformers() {
    const { getToken } = useAuth();
    const [performers, setPerformers] = useState<TopPerformer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/stats/top-performers');
            const data = response?.data || response || [];
            setPerformers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[useTopPerformers] Failed:', err);
            setError(err.message || 'Failed to load performers');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { performers, loading, error, refresh };
}
