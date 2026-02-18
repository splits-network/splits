'use client';

import { useReputationData } from '../hooks/use-reputation-data';
import { MemphisCard, MemphisEmpty, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';

interface ReputationRadarProps {
    refreshKey?: number;
}

const METRIC_LABELS = ['Speed', 'Volume', 'Quality', 'Collaboration', 'Consistency'] as const;
type MetricKey = 'speed' | 'volume' | 'quality' | 'collaboration' | 'consistency';
const METRIC_KEYS: MetricKey[] = ['speed', 'volume', 'quality', 'collaboration', 'consistency'];

function computeOverallScore(metrics: Record<MetricKey, number>) {
    const values = METRIC_KEYS.map(k => metrics[k]);
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export default function ReputationRadar({ refreshKey }: ReputationRadarProps) {
    const { metrics, loading, error } = useReputationData();

    const headerRight = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/40">Score</span>
            <span className="text-sm font-black tabular-nums text-teal">
                {loading ? '—' : computeOverallScore(metrics)}/100
            </span>
        </div>
    );

    if (loading) {
        return (
            <MemphisCard title="Reputation Score" icon="fa-shield-check" accent={ACCENT[1]} headerRight={headerRight}>
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    const hasData = METRIC_KEYS.some(k => metrics[k] > 0);

    if (error || !hasData) {
        return (
            <MemphisCard title="Reputation Score" icon="fa-shield-check" accent={ACCENT[1]} headerRight={headerRight}>
                <MemphisEmpty
                    icon="fa-shield-check"
                    title="No reputation data"
                    description="Your reputation score builds as you complete placements and collaborate with partners."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Reputation Score" icon="fa-shield-check" accent={ACCENT[1]} headerRight={headerRight}>
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
