"use client";

import { MemphisCard, MemphisSkeleton } from "./primitives";
import { ACCENT, accentAt } from "./accent";
import { PlatformFinancials } from "../hooks/use-platform-financials";

interface SubscriptionOverviewProps {
    financials: PlatformFinancials;
    loading: boolean;
}

export default function SubscriptionOverview({
    financials,
    loading,
}: SubscriptionOverviewProps) {
    if (loading) {
        return (
            <MemphisCard
                title="Subscriptions"
                icon="fa-credit-card"
                accent={ACCENT[3]}
                className="h-full"
            >
                <MemphisSkeleton count={4} />
            </MemphisCard>
        );
    }

    const totalSubs =
        financials.active_subscriptions +
        financials.trialing_subscriptions +
        financials.past_due_subscriptions +
        financials.canceled_subscriptions;

    const segments = [
        {
            label: "Active",
            count: financials.active_subscriptions,
            accentIdx: 1,
        },
        {
            label: "Trialing",
            count: financials.trialing_subscriptions,
            accentIdx: 3,
        },
        {
            label: "Past due",
            count: financials.past_due_subscriptions,
            accentIdx: 2,
        },
        {
            label: "Canceled",
            count: financials.canceled_subscriptions,
            accentIdx: 0,
        },
    ];

    return (
        <MemphisCard
            title="Subscriptions"
            icon="fa-credit-card"
            accent={ACCENT[3]}
            className="h-full"
        >
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                    Total subscriptions
                </span>
                <span className="text-2xl font-black tabular-nums text-dark">
                    {totalSubs.toLocaleString()}
                </span>
            </div>

            {/* Stacked bar */}
            {totalSubs > 0 ? (
                <div className="h-5 border-2 border-dark flex overflow-hidden mb-4">
                    {segments.map((seg) => {
                        const pct = (seg.count / totalSubs) * 100;
                        if (pct === 0) return null;
                        const accent = accentAt(seg.accentIdx);
                        return (
                            <div
                                key={seg.label}
                                className={`${accent.bg} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                                title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="h-5 border-2 border-dark bg-dark/5 mb-4" />
            )}

            {/* Breakdown bars */}
            <div className="space-y-3">
                {segments.map((seg) => {
                    const pct =
                        totalSubs > 0 ? (seg.count / totalSubs) * 100 : 0;
                    const accent = accentAt(seg.accentIdx);
                    return (
                        <div key={seg.label}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 border-2 border-dark ${accent.bg}`}
                                    />
                                    <span className="text-[10px] font-bold text-dark/60">
                                        {seg.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold tabular-nums text-dark/30">
                                        {Math.round(pct)}%
                                    </span>
                                    <span className="text-sm font-black tabular-nums text-dark w-8 text-right">
                                        {seg.count}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 border-1 border-dark overflow-hidden bg-dark/5">
                                <div
                                    className={`h-full ${accent.bg} transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
