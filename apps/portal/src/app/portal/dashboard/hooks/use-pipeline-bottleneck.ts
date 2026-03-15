'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface StageBottleneck {
    stage: string;
    count: number;
    avgDaysInStage: number;
}

/**
 * Derives pipeline bottleneck data from the hiring pipeline chart.
 * Shows candidate count + estimated time-in-stage per pipeline stage.
 */
export function usePipelineBottleneck() {
    const { getToken } = useAuth();
    const [stages, setStages] = useState<StageBottleneck[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            // Fetch hiring pipeline + time-to-place trends for stage duration estimates
            const [pipelineRes, timeRes] = await Promise.all([
                api.get('/charts/hiring-pipeline', {
                    params: { scope: 'company' },
                }) as Promise<any>,
                api.get('/charts/time-to-place-trends', {
                    params: { scope: 'company' },
                }) as Promise<any>,
            ]);

            const pipelineData = pipelineRes?.data?.data || pipelineRes?.data || null;
            const timeData = timeRes?.data?.data || timeRes?.data || null;

            if (pipelineData?.labels && pipelineData?.datasets?.[0]?.data) {
                const labels = pipelineData.labels as string[];
                const counts = pipelineData.datasets[0].data as number[];

                // If time data has per-stage breakdown, use it; otherwise estimate
                const timeDatasets = timeData?.datasets || [];
                const avgDaysDataset = timeDatasets.find(
                    (d: any) => d.label?.toLowerCase().includes('avg') || d.label?.toLowerCase().includes('days'),
                );

                const mapped: StageBottleneck[] = labels.map((label, i) => ({
                    stage: label,
                    count: counts[i] || 0,
                    avgDaysInStage: avgDaysDataset?.data?.[i] || 0,
                }));

                setStages(mapped);
            } else {
                setStages([]);
            }
        } catch (err) {
            console.error('[PipelineBottleneck] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stages, loading, refresh };
}
