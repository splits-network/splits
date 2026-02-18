"use client";

import { MemphisCard, MemphisEmpty, MemphisSkeleton } from "./primitives";
import { ACCENT, accentAt } from "./accent";
import { MarketplaceHealth } from "../hooks/use-marketplace-health";

interface MarketplaceHealthRadarProps {
    health: MarketplaceHealth;
    loading: boolean;
}

export default function MarketplaceHealthRadar({
    health,
    loading,
}: MarketplaceHealthRadarProps) {
    const headerRight = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                Score
            </span>
            <span className="text-sm font-black tabular-nums text-teal">
                {loading ? "—" : `${health.overallScore}/100`}
            </span>
        </div>
    );

    if (loading) {
        return (
            <MemphisCard
                title="Marketplace Health"
                icon="fa-heart-pulse"
                accent={ACCENT[1]}
                className="h-full"
                headerRight={headerRight}
            >
                <MemphisSkeleton count={5} />
            </MemphisCard>
        );
    }

    if (health.values.every((v) => v === 0)) {
        return (
            <MemphisCard
                title="Marketplace Health"
                icon="fa-heart-pulse"
                accent={ACCENT[1]}
                className="h-full"
                headerRight={headerRight}
            >
                <MemphisEmpty
                    icon="fa-heart-pulse"
                    title="Insufficient data"
                    description="Health metrics require marketplace activity to compute."
                />
            </MemphisCard>
        );
    }

    return (
        <MemphisCard
            title="Marketplace Health"
            icon="fa-heart-pulse"
            accent={ACCENT[1]}
            className="h-full"
            headerRight={headerRight}
        >
            <div className="space-y-3">
                {health.labels.map((label, i) => {
                    const value = health.values[i];
                    const accent = accentAt(i);
                    return (
                        <div key={label}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                                    {label}
                                </span>
                                <span
                                    className={`text-xs font-black tabular-nums ${accent.text}`}
                                >
                                    {value}
                                </span>
                            </div>
                            <div className="h-3 border-2 border-dark overflow-hidden">
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
