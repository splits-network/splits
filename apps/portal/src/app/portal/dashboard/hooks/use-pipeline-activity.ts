'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PipelineApplication {
    id: string;
    stage: string;
    updated_at: string;
    created_at: string;
    candidate?: { full_name: string };
    job?: { title: string; company?: { name: string } };
}

export function usePipelineActivity() {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState<PipelineApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/applications/views/listing', {
                params: {
                    limit: 10,
                    sort_by: 'updated_at',
                    sort_order: 'desc',
                },
            });

            const data = response?.data || [];
            setApplications(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[PipelineActivity] Failed to load:', err);
            setError(err.message || 'Failed to load pipeline');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { applications, loading, error, refresh };
}
