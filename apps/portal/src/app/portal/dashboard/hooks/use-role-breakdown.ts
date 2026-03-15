'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface RoleBreakdown {
    id: string;
    title: string;
    location: string;
    status: string;
    applications_count: number;
    interview_count: number;
    offer_count: number;
    hire_count: number;
    days_open: number;
}

/**
 * Fetches pre-computed role breakdown from analytics service.
 * Server-side aggregation — no client-side cross-join or limit issues.
 */
export function useRoleBreakdown() {
    const { getToken } = useAuth();
    const [roles, setRoles] = useState<RoleBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/views/role-breakdown', {
                params: { limit: 20 },
            });

            const rows = response?.data || [];
            setRoles(rows);
        } catch (err: any) {
            console.error('[RoleBreakdown] Failed to load:', err);
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
