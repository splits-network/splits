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

interface Application {
    id: string;
    stage: string;
    job?: {
        status?: string;
    };
}

interface ApplicationStatusChartProps {
    applications: Application[];
    loading?: boolean;
    compact?: boolean;
}

// Complete stage-to-group mapping covering all 17 ATS stages
const STAGE_TO_GROUP: Record<string, string> = {
    draft: "review",
    ai_review: "review",
    ai_reviewed: "review",
    recruiter_request: "review",
    recruiter_proposed: "review",
    recruiter_review: "review",
    submitted: "active",
    company_review: "active",
    company_feedback: "active",
    screen: "active",
    interview: "active",
    final_interview: "active",
    offer: "offers",
    hired: "placed",
    rejected: "archived",
    withdrawn: "archived",
    expired: "archived",
};

const GROUP_KEYS = ["active", "review", "offers", "placed", "archived"] as const;

const GROUP_LABELS: Record<string, string> = {
    active: "Active",
    review: "In Review",
    offers: "Offers",
    placed: "Placed",
    archived: "Archived",
};

export default function ApplicationStatusChart({
    applications,
    loading,
    compact,
}: ApplicationStatusChartProps) {
    const colors = useBaselChartColors();

    // Map group keys to DaisyUI semantic colors
    const groupColors: Record<string, string> = useMemo(
        () => ({
            active: colors.primary,
            review: colors.info,
            offers: colors.warning,
            placed: colors.success,
            archived: colors.neutral,
        }),
        [colors],
    );

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            active: 0,
            review: 0,
            offers: 0,
            placed: 0,
            archived: 0,
        };

        applications.forEach((app) => {
            if (
                app.job?.status === "closed" ||
                app.job?.status === "filled"
            ) {
                counts.archived++;
            } else {
                const group = STAGE_TO_GROUP[app.stage];
                if (group && counts[group] !== undefined) {
                    counts[group]++;
                }
            }
        });

        const total = applications.length;
        const activeTotal = counts.active + counts.review + counts.offers;

        return { counts, total, activeTotal };
    }, [applications]);

    const chartData = useMemo(
        () =>
            GROUP_KEYS.map((key) => ({
                name: GROUP_LABELS[key],
                value: statusData.counts[key],
                color: groupColors[key],
            })),
        [statusData, groupColors],
    );

    if (loading) {
        return <ChartLoadingState height={compact ? 200 : 240} />;
    }

    if (applications.length === 0) {
        return (
            <div
                className={`flex flex-col items-center justify-center ${compact ? "h-[200px]" : "h-60"} text-base-content/60`}
            >
                <i className="fa-duotone fa-regular fa-chart-pie text-2xl mb-2" />
                <p className="text-sm">No application data yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Chart with center text */}
            <div className="relative h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={55}
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
                                    formatter={(value, name) => {
                                        const pct =
                                            statusData.total > 0
                                                ? Math.round(
                                                      (value /
                                                          statusData.total) *
                                                          100,
                                                  )
                                                : 0;
                                        return `${value} (${pct}%)`;
                                    }}
                                />
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-bold text-primary tabular-nums">
                        {statusData.activeTotal}
                    </div>
                    <div className="text-[10px] text-base-content/50 font-medium">
                        Active
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {GROUP_KEYS.map((key) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span
                            className="w-2.5 h-2.5 shrink-0"
                            style={{
                                backgroundColor: groupColors[key],
                            }}
                        />
                        <span className="text-[11px] text-base-content/60">
                            {GROUP_LABELS[key]}
                        </span>
                        <span className="text-[11px] font-semibold tabular-nums text-base-content/80">
                            {statusData.counts[key]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
