"use client";

import { useMemo } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { GaugeChart } from "@splits-network/shared-charts";

interface JobSearchMomentumChartProps {
    recentActivityCount: number;
    responseRate: number;
    profileCompletion: number;
    activeRecruiters: number;
    loading?: boolean;
}

interface Segment {
    label: string;
    score: number;
    max: 25;
    icon: string;
}

function calculateActivityScore(recentApps: number): number {
    if (recentApps === 0) return 0;
    if (recentApps <= 2) return 10;
    if (recentApps <= 5) return 18;
    return 25;
}

function calculateAdvancementScore(responseRate: number): number {
    if (responseRate === 0) return 0;
    if (responseRate <= 20) return 10;
    if (responseRate <= 50) return 18;
    return 25;
}

function calculateProfileScore(completion: number): number {
    return Math.round((completion / 100) * 25);
}

function calculateEngagementScore(recruiters: number): number {
    if (recruiters === 0) return 0;
    if (recruiters === 1) return 15;
    return 25;
}

const SEGMENT_TEXT_COLORS = [
    "text-primary",
    "text-success",
    "text-accent",
    "text-secondary",
];
const SEGMENT_BG_COLORS = [
    "bg-primary/15",
    "bg-success/15",
    "bg-accent/15",
    "bg-secondary/15",
];
const SEGMENT_BAR_COLORS = [
    "bg-primary",
    "bg-success",
    "bg-accent",
    "bg-secondary",
];

export default function JobSearchMomentumChart({
    recentActivityCount,
    responseRate,
    profileCompletion,
    activeRecruiters,
    loading,
}: JobSearchMomentumChartProps) {
    const segments: Segment[] = useMemo(
        () => [
            {
                label: "Activity",
                score: calculateActivityScore(recentActivityCount),
                max: 25,
                icon: "fa-bolt",
            },
            {
                label: "Advancement",
                score: calculateAdvancementScore(responseRate),
                max: 25,
                icon: "fa-arrow-trend-up",
            },
            {
                label: "Profile",
                score: calculateProfileScore(profileCompletion),
                max: 25,
                icon: "fa-user-check",
            },
            {
                label: "Engagement",
                score: calculateEngagementScore(activeRecruiters),
                max: 25,
                icon: "fa-handshake",
            },
        ],
        [recentActivityCount, responseRate, profileCompletion, activeRecruiters],
    );

    const totalScore = useMemo(
        () => segments.reduce((sum, s) => sum + s.score, 0),
        [segments],
    );

    if (loading) {
        return <ChartLoadingState height={280} />;
    }

    const hasAnyData = totalScore > 0;

    return (
        <div className="flex flex-col h-full">
            {hasAnyData ? (
                <>
                    {/* Gauge chart showing overall score */}
                    <div className="flex-shrink-0">
                        <GaugeChart
                            value={totalScore}
                            max={100}
                            label="Momentum"
                            height={160}
                        />
                    </div>

                    {/* Legend with mini progress bars */}
                    <div className="mt-2 space-y-2.5 flex-1">
                        {segments.map((seg, idx) => (
                            <div
                                key={seg.label}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className={`w-6 h-6 ${SEGMENT_BG_COLORS[idx]} flex items-center justify-center shrink-0`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${seg.icon} text-sm ${SEGMENT_TEXT_COLORS[idx]}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-base-content/60 font-semibold uppercase tracking-wider">
                                            {seg.label}
                                        </span>
                                        <span
                                            className={`font-bold tabular-nums ${SEGMENT_TEXT_COLORS[idx]}`}
                                        >
                                            {seg.score}
                                        </span>
                                    </div>
                                    <div className="w-full bg-base-300 h-1.5 mt-1">
                                        <div
                                            className={`h-1.5 ${SEGMENT_BAR_COLORS[idx]} transition-all duration-500`}
                                            style={{
                                                width: `${(seg.score / seg.max) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-3">
                        <i className="fa-duotone fa-regular fa-rocket text-xl text-primary/40" />
                    </div>
                    <p className="text-sm font-semibold text-base-content/60">
                        Start your momentum
                    </p>
                    <p className="text-sm text-base-content/40 mt-1">
                        Apply to jobs to build your search score
                    </p>
                </div>
            )}
        </div>
    );
}
