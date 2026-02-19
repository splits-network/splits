'use client';

import { useCompanyHealth } from '../hooks/use-company-health';
import { MemphisCard, MemphisEmpty, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';

interface CompanyHealthRadarProps {
    refreshKey?: number;
}

const METRIC_LABELS = ['Time-to-Fill', 'Candidate Flow', 'Interview Rate', 'Offer Rate', 'Fill Rate'] as const;
type MetricKey = 'timeToFill' | 'candidateFlow' | 'interviewRate' | 'offerRate' | 'fillRate';
const METRIC_KEYS: MetricKey[] = ['timeToFill', 'candidateFlow', 'interviewRate', 'offerRate', 'fillRate'];

function computeOverallScore(metrics: Record<MetricKey, number>) {
    const values = METRIC_KEYS.map(k => metrics[k]);
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export default function CompanyHealthRadar({ refreshKey }: CompanyHealthRadarProps) {
    const { metrics, loading, error } = useCompanyHealth();

    const headerRight = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/40">Health</span>
            <span className="text-sm font-black tabular-nums text-teal">
                {loading ? '—' : computeOverallScore(metrics)}/100
            </span>
        </div>
    );

    if (loading) {
        return (
            <MemphisCard title="Role Health" icon="fa-heart-pulse" accent={ACCENT[1]} className="h-full" headerRight={headerRight}>
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    const hasData = METRIC_KEYS.some(k => metrics[k] > 0);

    if (error || !hasData) {
        return (
            <MemphisCard title="Role Health" icon="fa-heart-pulse" accent={ACCENT[1]} className="h-full" headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-heart-pulse"
                    title="No health data"
                    description="Post roles and receive candidates to see your hiring health metrics."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Role Health" icon="fa-heart-pulse" accent={ACCENT[1]} className="h-full" headerRight={headerRight}>
            <div className="space-y-3">
                {METRIC_KEYS.map((key, i) => {
                    const value = metrics[key];
                    const accent = accentAt(i);
                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                                    {METRIC_LABELS[i]}
                                </span>
                                <span className={`text-xs font-black tabular-nums ${accent.text}`}>
                                    {value}
                                </span>
                            </div>
                            <div className="h-3 border-4 border-dark overflow-hidden">
                                <div
                                    className={`h-full ${accent.bg} transition-all duration-700`}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
