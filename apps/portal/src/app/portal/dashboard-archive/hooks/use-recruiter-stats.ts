'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface RecruiterStats {
    active_roles: number;
    candidates_in_process: number;
    offers_pending: number;
    placements_this_month: number;
    placements_this_year: number;
    total_earnings_ytd: number;
    pending_payouts: number;
    pipeline_value: number;
    submissions_mtd: number;
    stale_candidates: number;
    pending_reviews: number;
    trends?: {
        active_roles?: number;
        candidates_in_process?: number;
        placements_this_month?: number;
        placements_this_year?: number;
    };
}

const DEFAULT_STATS: RecruiterStats = {
    active_roles: 0,
    candidates_in_process: 0,
    offers_pending: 0,
    placements_this_month: 0,
    placements_this_year: 0,
    total_earnings_ytd: 0,
    pending_payouts: 0,
    pipeline_value: 0,
    submissions_mtd: 0,
    stale_candidates: 0,
    pending_reviews: 0,
};

export function useRecruiterStats() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<RecruiterStats>(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/stats', {
                params: { scope: 'recruiter', range: 'ytd' },
            });

            const metrics = response?.data?.metrics || response?.data || null;
            setStats(metrics || DEFAULT_STATS);
        } catch (err: any) {
            console.error('[RecruiterStats] Failed to load:', err);
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
