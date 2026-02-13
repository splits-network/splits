'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PipelineStage {
    label: string;
    key: string;
    count: number;
}

const DEFAULTS: PipelineStage[] = [
    { label: 'Applied', key: 'submitted', count: 0 },
    { label: 'Screen', key: 'screen', count: 0 },
    { label: 'Interview', key: 'interview', count: 0 },
    { label: 'Offer', key: 'offer', count: 0 },
    { label: 'Hired', key: 'hired', count: 0 },
];

export function usePlatformPipeline() {
    const { getToken } = useAuth();
    const [stages, setStages] = useState<PipelineStage[]>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/platform-pipeline', {
                params: { scope: 'platform' },
            });

            const chartData = response?.data?.data || response?.data || response;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const labels = chartData.labels as string[];
                const data = chartData.datasets[0].data as number[];
                const stageKeys = ['submitted', 'screen', 'interview', 'offer', 'hired'];
                setStages(labels.map((label: string, i: number) => ({
                    label,
                    key: stageKeys[i] || label.toLowerCase(),
                    count: data[i] || 0,
                })));
            }
        } catch (err: any) {
            console.error('[usePlatformPipeline] Failed:', err);
            setError(err.message || 'Failed to load pipeline data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stages, loading, error, refresh };
}
