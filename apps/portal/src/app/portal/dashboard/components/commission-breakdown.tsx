'use client';

import { useCommissionData } from '../hooks/use-commission-data';
import { MemphisCard, MemphisEmpty, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';

interface CommissionBreakdownProps {
    trendPeriod?: number;
    refreshKey?: number;
}

function formatCurrency(value: number) {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

export default function CommissionBreakdown({ trendPeriod = 12 }: CommissionBreakdownProps) {
    const { segments, total, loading, error } = useCommissionData(trendPeriod);

    if (loading) {
        return (
            <MemphisCard title="Commission Breakdown" icon="fa-pie-chart" accent={ACCENT[2]} className="h-full">
                <MemphisSkeleton count={4} />
            </MemphisCard>
        );
    }

    if (error || segments.length === 0) {
        return (
            <MemphisCard title="Commission Breakdown" icon="fa-pie-chart" accent={ACCENT[2]} className="h-full">
                <MemphisEmpty
                    icon="fa-pie-chart"
                    title="No commissions yet"
                    description="Complete your first placement to see how your commissions break down by role."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard title="Commission Breakdown" icon="fa-pie-chart" accent={ACCENT[2]} className="h-full">
            {/* Total hero */}
            <div className="text-center mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-1">
                    Total Earned
                </div>
                <div className="text-3xl font-black tabular-nums text-dark">
                    {formatCurrency(total)}
                </div>
            </div>

            {/* Stacked horizontal bar */}
            <div className="h-8 border-4 border-dark flex overflow-hidden mb-4">
                {segments.map((seg, i) => {
                    const pct = total > 0 ? (seg.amount / total) * 100 : 0;
                    if (pct === 0) return null;
                    const accent = accentAt(i);
                    return (
                        <div
                            key={seg.role}
                            className={`${accent.bg} transition-all duration-500 relative group`}
                            style={{ width: `${pct}%` }}
                            title={`${seg.role}: ${formatCurrency(seg.amount)} (${Math.round(pct)}%)`}
                        >
                            {pct > 15 && (
                                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${accent.textOnBg}`}>
                                    {Math.round(pct)}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {segments.map((seg, i) => {
                    const accent = accentAt(i);
                    const pct = total > 0 ? Math.round((seg.amount / total) * 100) : 0;
                    return (
                        <div key={seg.role} className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-4 border-dark ${accent.bg} shrink-0`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/70 flex-1">
                                {seg.role}
                            </span>
                            <span className="text-xs font-black tabular-nums text-dark">
                                {formatCurrency(seg.amount)}
                            </span>
                            <span className="text-[10px] font-bold tabular-nums text-dark/40 w-8 text-right">
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
