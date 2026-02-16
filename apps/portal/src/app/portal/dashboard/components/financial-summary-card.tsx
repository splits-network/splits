'use client';

import { MemphisCard, MemphisSkeleton } from './primitives';
import { ACCENT, accentAt } from './accent';
import { PlatformFinancials } from '../hooks/use-platform-financials';

interface FinancialSummaryCardProps {
    financials: PlatformFinancials;
    loading: boolean;
}

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

export default function FinancialSummaryCard({ financials, loading }: FinancialSummaryCardProps) {
    if (loading) {
        return (
            <MemphisCard title="Financial Overview" icon="fa-sack-dollar" accent={ACCENT[2]} className="h-full">
                <MemphisSkeleton count={6} />
            </MemphisCard>
        );
    }

    const metrics = [
        { label: 'Payouts YTD', value: formatCurrency(financials.total_payouts_processed_ytd), icon: 'fa-money-bill-transfer', accentIdx: 1 },
        { label: 'Pending payouts', value: formatCurrency(financials.pending_payouts_amount), sublabel: `${financials.pending_payouts_count} awaiting`, icon: 'fa-clock', accentIdx: 2 },
        { label: 'Active escrow', value: formatCurrency(financials.active_escrow_amount), sublabel: `${financials.active_escrow_holds} holds`, icon: 'fa-lock', accentIdx: 3 },
        { label: 'Avg fee %', value: formatPercent(financials.avg_fee_percentage), icon: 'fa-percent', accentIdx: 1 },
        { label: 'Avg placement', value: formatCurrency(financials.avg_placement_value), icon: 'fa-gem', accentIdx: 0 },
    ];

    return (
        <MemphisCard title="Financial Overview" icon="fa-sack-dollar" accent={ACCENT[2]} className="h-full">
            {/* Hero revenue */}
            <div className="mb-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                    Total Revenue YTD
                </div>
                <div className="text-4xl font-black tabular-nums text-teal mt-1">
                    {formatCurrency(financials.total_revenue)}
                </div>
            </div>

            {/* Secondary metrics */}
            <div className="border-t-4 border-dark pt-4 space-y-2.5">
                {metrics.map((metric) => {
                    const accent = accentAt(metric.accentIdx);
                    return (
                        <div key={metric.label} className="flex items-center gap-3">
                            <div className={`w-8 h-8 border-4 border-dark ${accent.bg}/20 flex items-center justify-center shrink-0`}>
                                <i className={`fa-duotone fa-regular ${metric.icon} text-xs ${accent.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-dark/60">{metric.label}</span>
                                {metric.sublabel && (
                                    <span className="text-[10px] text-dark/30 ml-1.5">({metric.sublabel})</span>
                                )}
                            </div>
                            <span className="text-sm font-black tabular-nums text-dark">{metric.value}</span>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
