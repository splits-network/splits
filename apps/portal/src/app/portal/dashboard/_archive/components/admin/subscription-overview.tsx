'use client';

import { ContentCard } from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { PlatformFinancials } from '../../hooks/use-platform-financials';

interface SubscriptionOverviewProps {
    financials: PlatformFinancials;
    loading: boolean;
}

interface SubscriptionSegment {
    label: string;
    count: number;
    color: string;
    bgColor: string;
}

export default function SubscriptionOverview({ financials, loading }: SubscriptionOverviewProps) {
    if (loading) {
        return (
            <ContentCard title="Subscriptions" icon="fa-credit-card" className="bg-base-200 h-full">
                <SkeletonList count={4} variant="text-block" gap="gap-3" />
            </ContentCard>
        );
    }

    const totalSubs =
        financials.active_subscriptions +
        financials.trialing_subscriptions +
        financials.past_due_subscriptions +
        financials.canceled_subscriptions;

    const segments: SubscriptionSegment[] = [
        {
            label: 'Active',
            count: financials.active_subscriptions,
            color: 'bg-success',
            bgColor: 'bg-success/10',
        },
        {
            label: 'Trialing',
            count: financials.trialing_subscriptions,
            color: 'bg-info',
            bgColor: 'bg-info/10',
        },
        {
            label: 'Past due',
            count: financials.past_due_subscriptions,
            color: 'bg-warning',
            bgColor: 'bg-warning/10',
        },
        {
            label: 'Canceled',
            count: financials.canceled_subscriptions,
            color: 'bg-error',
            bgColor: 'bg-error/10',
        },
    ];

    return (
        <ContentCard title="Subscriptions" icon="fa-credit-card" className="bg-base-200 h-full">
            {/* Total count header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Total subscriptions</span>
                <span className="text-2xl font-extrabold tabular-nums">{totalSubs.toLocaleString()}</span>
            </div>

            {/* Stacked bar */}
            {totalSubs > 0 ? (
                <div className="h-4 rounded-full overflow-hidden flex bg-base-300/50 mb-4">
                    {segments.map((seg) => {
                        const pct = (seg.count / totalSubs) * 100;
                        if (pct === 0) return null;
                        return (
                            <div
                                key={seg.label}
                                className={`${seg.color} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                                title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                            ></div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-4 rounded-full bg-base-300/50 mb-4"></div>
            )}

            {/* Legend + individual bars */}
            <div className="space-y-3">
                {segments.map((seg) => {
                    const pct = totalSubs > 0 ? (seg.count / totalSubs) * 100 : 0;
                    return (
                        <div key={seg.label}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`}></div>
                                    <span className="text-sm text-base-content/70">{seg.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-base-content/40 tabular-nums">
                                        {Math.round(pct)}%
                                    </span>
                                    <span className="text-sm font-bold tabular-nums w-10 text-right">
                                        {seg.count}
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-base-300/50 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${seg.color} transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ContentCard>
    );
}
