'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminStatsBanner } from '@/components/shared';
import { TimePeriodSelector } from '@/app/secure/components/time-period-selector';
import { BarChart, PieChart, AreaChart } from '@splits-network/shared-charts';
import type { AiUsageStats } from '@splits-network/shared-types';
import type { TimePeriod } from '@/hooks/use-admin-stats';

const OPERATION_LABELS: Record<string, string> = {
    fit_review: 'Fit Review',
    resume_extraction: 'Resume Extraction',
    call_summarization: 'Call Summarization',
    resume_generation: 'Resume Generation',
    resume_parsing: 'Resume Parsing',
    embedding: 'Embedding',
    matching_scoring: 'Match Scoring',
};

export function UsageDashboard() {
    const { getToken } = useAuth();
    const [period, setPeriod] = useState<TimePeriod>('30d');
    const [stats, setStats] = useState<AiUsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: AiUsageStats }>(`/ai/admin/ai/usage/stats?period=${period}`);
                if (!cancelled) setStats(res.data);
            } catch { /* non-critical */ } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

    const summaryStats = [
        { label: 'Total Cost', value: stats ? `$${stats.total_cost.toFixed(4)}` : '$0', icon: 'fa-duotone fa-regular fa-dollar-sign', color: 'primary' as const },
        { label: 'Total Tokens', value: stats?.total_tokens.toLocaleString() ?? '0', icon: 'fa-duotone fa-regular fa-coins', color: 'secondary' as const },
        { label: 'Total Calls', value: stats?.total_calls.toLocaleString() ?? '0', icon: 'fa-duotone fa-regular fa-arrow-right-arrow-left', color: 'accent' as const },
    ];

    const operationChartData = (stats?.by_operation ?? []).map((op) => ({
        label: OPERATION_LABELS[op.operation] ?? op.operation,
        value: op.cost,
    }));

    const providerChartData = (stats?.by_provider ?? []).map((p) => ({
        name: p.provider === 'openai' ? 'OpenAI' : 'Anthropic',
        value: p.calls,
    }));

    const dailyChartData = (stats?.daily_series ?? []).map((d) => ({
        x: d.date,
        y: d.cost,
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <TimePeriodSelector value={period} onChange={setPeriod} />
            </div>

            <AdminStatsBanner stats={summaryStats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-base-100 shadow-sm lg:col-span-2">
                    <div className="card-body">
                        <h3 className="card-title text-sm">Daily Cost</h3>
                        {dailyChartData.length > 0 ? (
                            <AreaChart data={dailyChartData} height={240} smooth gradient />
                        ) : (
                            <div className="flex items-center justify-center h-60 text-base-content/40">No data for this period</div>
                        )}
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-sm">By Provider</h3>
                        {providerChartData.length > 0 ? (
                            <PieChart data={providerChartData} height={240} donut showLabels={false} />
                        ) : (
                            <div className="flex items-center justify-center h-60 text-base-content/40">No data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-sm">Cost by Operation</h3>
                    {operationChartData.length > 0 ? (
                        <BarChart data={operationChartData} height={240} horizontal />
                    ) : (
                        <div className="flex items-center justify-center h-60 text-base-content/40">No data for this period</div>
                    )}
                </div>
            </div>
        </div>
    );
}
