'use client';

import { ContentCard } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { PlatformFinancials } from '../../hooks/use-platform-financials';

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
            <ContentCard title="Financial overview" icon="fa-sack-dollar" className="bg-base-200 h-full">
                <SkeletonList count={6} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    const metrics = [
        {
            label: 'Payouts processed YTD',
            value: formatCurrency(financials.total_payouts_processed_ytd),
            icon: 'fa-money-bill-transfer',
            color: 'text-primary',
        },
        {
            label: 'Pending payouts',
            value: formatCurrency(financials.pending_payouts_amount),
            sublabel: `${financials.pending_payouts_count} awaiting`,
            icon: 'fa-clock',
            color: 'text-warning',
        },
        {
            label: 'Active escrow',
            value: formatCurrency(financials.active_escrow_amount),
            sublabel: `${financials.active_escrow_holds} holds`,
            icon: 'fa-lock',
            color: 'text-info',
        },
        {
            label: 'Avg fee percentage',
            value: formatPercent(financials.avg_fee_percentage),
            icon: 'fa-percent',
            color: 'text-secondary',
        },
        {
            label: 'Avg placement value',
            value: formatCurrency(financials.avg_placement_value),
            icon: 'fa-gem',
            color: 'text-accent',
        },
    ];

    return (
        <ContentCard title="Financial overview" icon="fa-sack-dollar" className="bg-base-200 h-full">
            {/* Hero revenue number */}
            <div className="mb-5">
                <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Total Revenue YTD</span>
                <div className="text-4xl font-extrabold tabular-nums text-success mt-1">
                    {formatCurrency(financials.total_revenue)}
                </div>
            </div>

            {/* Secondary metrics */}
            <div className="border-t border-base-300/50 pt-4 space-y-2.5">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-base-300/50 flex items-center justify-center shrink-0">
                            <i className={`fa-duotone fa-regular ${metric.icon} text-sm ${metric.color}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm text-base-content/70">{metric.label}</span>
                            {metric.sublabel && (
                                <span className="text-xs text-base-content/40 ml-1.5">({metric.sublabel})</span>
                            )}
                        </div>
                        <span className="text-sm font-bold tabular-nums">{metric.value}</span>
                    </div>
                ))}
            </div>
        </ContentCard>
    );
}
