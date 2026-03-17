'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PendingReview {
    id: string;
    candidateName: string;
    jobTitle: string;
    stage: string;
    daysSinceUpdate: number;
    applicationId: string;
}

/**
 * Fetches pre-computed pending reviews from analytics service.
 * Server-side filtering by stage + sorting by staleness — no client-side filtering.
 */
export function usePendingReviews() {
    const { getToken } = useAuth();
    const [actions, setActions] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/views/pending-reviews', {
                params: { limit: 50 },
            });

            const rows = response?.data || [];
            const mapped: PendingReview[] = rows.map((row: any) => ({
                id: row.id,
                candidateName: row.candidate_name,
                jobTitle: row.job_title,
                stage: row.stage,
                daysSinceUpdate: row.days_since_update,
                applicationId: row.id,
            }));

            setActions(mapped);
        } catch (err) {
            console.error('[PendingReviews] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { actions, loading, refresh };
}
