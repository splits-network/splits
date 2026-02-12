'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CompanyStats {
    active_roles: number;
    total_applications: number;
    interviews_scheduled: number;
    offers_extended: number;
    placements_this_month: number;
    placements_this_year: number;
    avg_time_to_hire_days: number;
    active_recruiters: number;
    stale_roles: number;
    applications_mtd: number;
    trends?: {
        active_roles?: number;
        total_applications?: number;
        placements_this_year?: number;
    };
}

const DEFAULT_STATS: CompanyStats = {
    active_roles: 0,
    total_applications: 0,
    interviews_scheduled: 0,
    offers_extended: 0,
    placements_this_month: 0,
    placements_this_year: 0,
    avg_time_to_hire_days: 0,
    active_recruiters: 0,
    stale_roles: 0,
    applications_mtd: 0,
};

export function useCompanyStats() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<CompanyStats>(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/stats', {
                params: { scope: 'company', range: 'ytd' },
            });

            const metrics = response?.data?.metrics || response?.data || null;
            setStats(metrics ? { ...DEFAULT_STATS, ...metrics } : DEFAULT_STATS);
        } catch (err: any) {
            console.error('[CompanyStats] Failed to load:', err);
            setError(err.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stats, loading, error, refresh };
}
