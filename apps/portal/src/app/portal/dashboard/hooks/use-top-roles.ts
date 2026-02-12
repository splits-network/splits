'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface TopRole {
    id: string;
    title: string;
    company?: { name: string };
    location?: string;
    status: string;
    candidate_count?: number;
}

export function useTopRoles() {
    const { getToken } = useAuth();
    const [roles, setRoles] = useState<TopRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/jobs', {
                params: { status: 'active', limit: 5 },
            });

            setRoles(response?.data || []);
        } catch (err: any) {
            console.error('[TopRoles] Failed to load:', err);
            setError(err.message || 'Failed to load roles');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { roles, loading, error, refresh };
}
