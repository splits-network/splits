"use client";

import { MemphisCard, MemphisEmpty, MemphisSkeleton } from "./primitives";
import { ACCENT, accentAt } from "./accent";
import { PlatformStats } from "../hooks/use-platform-stats";

interface RoleDistributionProps {
    stats: PlatformStats;
    loading: boolean;
}

export default function RoleDistribution({
    stats,
    loading,
}: RoleDistributionProps) {
    if (loading) {
        return (
            <MemphisCard
                title="Role Distribution"
                icon="fa-chart-pie"
                accent={ACCENT[3]}
            >
                <MemphisSkeleton count={4} />
            </MemphisCard>
        );
    }

    const { job_statuses } = stats;
    const total =
        job_statuses.active +
        job_statuses.closed +
        job_statuses.expired +
        job_statuses.draft;

    if (total === 0) {
        return (
            <MemphisCard
                title="Role Distribution"
                icon="fa-chart-pie"
                accent={ACCENT[3]}
            >
                <MemphisEmpty
                    icon="fa-chart-pie"
                    title="No roles yet"
                    description="Job distribution will appear once companies post roles."
                />
            </MemphisCard>
        );
    }

    const segments = [
        { label: "Active", count: job_statuses.active, accentIdx: 1 },
        { label: "Closed", count: job_statuses.closed, accentIdx: 3 },
        { label: "Expired", count: job_statuses.expired, accentIdx: 2 },
        { label: "Draft", count: job_statuses.draft, accentIdx: 0 },
    ];

    return (
        <MemphisCard
            title="Role Distribution"
            icon="fa-chart-pie"
            accent={ACCENT[3]}
        >
            {/* Total hero */}
            <div className="text-center mb-5">
                <div className="text-3xl font-black tabular-nums text-dark">
                    {total.toLocaleString()}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                    Total Roles
                </div>
            </div>

            {/* Stacked horizontal bar */}
            <div className="h-8 border-3 border-dark flex overflow-hidden mb-4">
                {segments.map((seg) => {
                    const pct = (seg.count / total) * 100;
                    if (pct === 0) return null;
                    const accent = accentAt(seg.accentIdx);
                    return (
                        <div
                            key={seg.label}
                            className={`${accent.bg} transition-all duration-500 relative group`}
                            style={{ width: `${pct}%` }}
                            title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                        >
                            {pct > 15 && (
                                <span
                                    className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${accent.textOnBg}`}
                                >
                                    {Math.round(pct)}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
                {segments.map((seg) => {
                    const accent = accentAt(seg.accentIdx);
                    return (
                        <div
                            key={seg.label}
                            className="flex items-center gap-2"
                        >
                            <div
                                className={`w-4 h-4 border-2 border-dark ${accent.bg} shrink-0`}
                            />
                            <span className="text-[10px] font-bold text-dark/60">
                                {seg.label}
                            </span>
                            <span className="text-xs font-black tabular-nums text-dark ml-auto">
                                {seg.count.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>
        </MemphisCard>
    );
}
