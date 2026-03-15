'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface RecruiterScore {
    id: string;
    name: string;
    submissions: number;
    interviews: number;
    placements: number;
    conversionRate: number;
    avgDaysToPlace: number;
}

/**
 * Fetches pre-computed recruiter scorecard from analytics service.
 * Server-side aggregation — no client-side grouping or limit issues.
 */
export function useRecruiterScorecard() {
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState<RecruiterScore[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/views/recruiter-scorecard', {
                params: { limit: 20 },
            });

            const rows = response?.data || [];
            const mapped: RecruiterScore[] = rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                submissions: row.submissions,
                interviews: row.interviews,
                placements: row.placements,
                conversionRate: row.conversion_rate,
                avgDaysToPlace: row.avg_days_to_place,
            }));

            setRecruiters(mapped);
        } catch (err) {
            console.error('[RecruiterScorecard] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { recruiters, loading, refresh };
}
