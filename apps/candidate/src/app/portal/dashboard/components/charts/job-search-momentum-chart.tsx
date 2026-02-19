"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import {
    useBaselChartColors,
    BaselTooltip,
} from "@/components/basel/charts";

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
    colorKey: "primary" | "success" | "accent" | "secondary";
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

// Static Tailwind classes for legend (build-time safe)
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
    const colors = useBaselChartColors();

    const segments: Segment[] = useMemo(
        () => [
            {
                label: "Activity",
                score: calculateActivityScore(recentActivityCount),
                max: 25,
                icon: "fa-bolt",
                colorKey: "primary",
            },
            {
                label: "Advancement",
                score: calculateAdvancementScore(responseRate),
                max: 25,
                icon: "fa-arrow-trend-up",
                colorKey: "success",
            },
            {
                label: "Profile",
                score: calculateProfileScore(profileCompletion),
                max: 25,
                icon: "fa-user-check",
                colorKey: "accent",
            },
            {
                label: "Engagement",
                score: calculateEngagementScore(activeRecruiters),
                max: 25,
                icon: "fa-handshake",
                colorKey: "secondary",
            },
        ],
        [
            recentActivityCount,
            responseRate,
            profileCompletion,
            activeRecruiters,
        ],
    );

    const totalScore = useMemo(
        () => segments.reduce((sum, s) => sum + s.score, 0),
        [segments],
    );

    const chartData = useMemo(
        () =>
            segments.map((s) => ({
                name: s.label,
                value: s.score,
                color: colors[s.colorKey],
            })),
        [segments, colors],
    );

    if (loading) {
        return (
            <div className="bg-base-200 p-8 h-full">
                <ChartLoadingState height={280} />
            </div>
        );
    }

    const hasAnyData = totalScore > 0;

    return (
        <div className="bg-base-200 p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-gauge-high text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-base-content">
                        Job Search Momentum
                    </h3>
                    <p className="text-sm text-base-content/50">
                        Your search health score
                    </p>
                </div>
            </div>

            {hasAnyData ? (
                <>
                    {/* Chart with center score */}
                    <div className="relative h-[160px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={50}
                                    strokeWidth={1}
                                    stroke={colors.base100}
                                    cornerRadius={0}
                                >
                                    {chartData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={
                                        <BaselTooltip
                                            formatter={(value, name) =>
                                                `${value}/25`
                                            }
                                        />
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-3xl font-black text-base-content">
                                {totalScore}
                            </div>
                            <div className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                                / 100
                            </div>
                        </div>
                    </div>

                    {/* Legend with mini progress bars */}
                    <div className="mt-4 space-y-2.5 flex-1">
                        {segments.map((seg, idx) => (
                            <div
                                key={seg.label}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className={`w-6 h-6 ${SEGMENT_BG_COLORS[idx]} flex items-center justify-center shrink-0`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${seg.icon} text-[10px] ${SEGMENT_TEXT_COLORS[idx]}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs">
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
                    <p className="text-xs text-base-content/40 mt-1">
                        Apply to jobs to build your search score
                    </p>
                </div>
            )}
        </div>
    );
}
