'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PlatformStats {
    // Core counts
    total_users: number;
    total_recruiters: number;
    total_companies: number;
    total_candidates: number;
    total_jobs: number;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    total_revenue: number;
    // Growth
    new_signups_mtd: number;
    placements_this_month: number;
    // Operations
    pending_payouts_count: number;
    pending_payouts_amount: number;
    active_fraud_signals: number;
    active_escrow_holds: number;
    active_escrow_amount: number;
    pending_recruiter_approvals: number;
    // Financial
    total_payouts_processed_ytd: number;
    avg_fee_percentage: number;
    avg_placement_value: number;
    // Subscriptions
    active_subscriptions: number;
    trialing_subscriptions: number;
    past_due_subscriptions: number;
    canceled_subscriptions: number;
    // Distributions
    recruiter_statuses: { active: number; pending: number; suspended: number };
    job_statuses: { active: number; closed: number; expired: number; draft: number };
    // Trends
    trends?: {
        active_jobs?: number;
        active_recruiters?: number;
        total_applications?: number;
        total_placements?: number;
        total_revenue?: number;
    };
}

const DEFAULTS: PlatformStats = {
    total_users: 0,
    total_recruiters: 0,
    total_companies: 0,
    total_candidates: 0,
    total_jobs: 0,
    active_recruiters: 0,
    active_companies: 0,
    active_jobs: 0,
    total_applications: 0,
    total_placements: 0,
    total_revenue: 0,
    new_signups_mtd: 0,
    placements_this_month: 0,
    pending_payouts_count: 0,
    pending_payouts_amount: 0,
    active_fraud_signals: 0,
    active_escrow_holds: 0,
    active_escrow_amount: 0,
    pending_recruiter_approvals: 0,
    total_payouts_processed_ytd: 0,
    avg_fee_percentage: 0,
    avg_placement_value: 0,
    active_subscriptions: 0,
    trialing_subscriptions: 0,
    past_due_subscriptions: 0,
    canceled_subscriptions: 0,
    recruiter_statuses: { active: 0, pending: 0, suspended: 0 },
    job_statuses: { active: 0, closed: 0, expired: 0, draft: 0 },
};

export function usePlatformStats() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<PlatformStats>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/stats', {
                params: { scope: 'platform', range: 'ytd' },
            });

            const metrics = response?.data?.metrics || response?.metrics || response;
            if (metrics) {
                setStats({ ...DEFAULTS, ...metrics });
            }
        } catch (err: any) {
            console.error('[usePlatformStats] Failed:', err);
            setError(err.message || 'Failed to load platform stats');
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
