'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CompanyActivity {
    id: string;
    stage: string;
    candidate_name: string;
    job_title: string;
    updated_at: string;
    created_at: string;
}

export function useCompanyActivity() {
    const { getToken } = useAuth();
    const [activities, setActivities] = useState<CompanyActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/applications', {
                params: {
                    limit: 8,
                    sort_by: 'updated_at',
                    sort_order: 'desc',
                },
            });

            const data = response?.data || [];
            setActivities(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[CompanyActivity] Failed to load:', err);
            setError(err.message || 'Failed to load activity');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { activities, loading, error, refresh };
}
