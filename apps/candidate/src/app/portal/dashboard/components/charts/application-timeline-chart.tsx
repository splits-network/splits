"use client";

import { useMemo } from "react";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import {
    useBaselChartColors,
    hexWithAlpha,
    BaselTooltip,
} from "@/components/basel/charts";

interface Application {
    id: string;
    stage: string;
    created_at: string;
}

interface ApplicationTimelineChartProps {
    applications: Application[];
    loading?: boolean;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
    compact?: boolean;
}

function getLastNMonths(n: number): string[] {
    const months: string[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(
            date.toLocaleDateString("en-US", { month: "short" }),
        );
    }
    return months;
}

export default function ApplicationTimelineChart({
    applications,
    loading,
    trendPeriod,
    compact,
}: ApplicationTimelineChartProps) {
    const colors = useBaselChartColors();

    const chartData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        const totalApps = new Array(months).fill(0);
        const interviewingApps = new Array(months).fill(0);
        const offerApps = new Array(months).fill(0);

        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff =
                (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                totalApps[index]++;

                if (
                    app.stage === "interview" ||
                    app.stage === "final_interview"
                ) {
                    interviewingApps[index]++;
                }
                if (app.stage === "offer") {
                    offerApps[index]++;
                }
            }
        });

        return labels.map((label, i) => ({
            name: label,
            Total: totalApps[i],
            Interviewing: interviewingApps[i],
            Offers: offerApps[i],
        }));
    }, [applications, trendPeriod]);

    if (loading) {
        return <ChartLoadingState height={compact ? 200 : 240} />;
    }

    if (applications.length === 0) {
        return (
            <div
                className={`flex flex-col items-center justify-center ${compact ? "h-[200px]" : "h-60"} text-base-content/60`}
            >
                <i className="fa-duotone fa-regular fa-chart-line text-2xl mb-2" />
                <p className="text-sm">No trend data yet</p>
            </div>
        );
    }

    // Limit ticks on compact mode
    const tickInterval =
        compact && trendPeriod > 6
            ? Math.ceil(trendPeriod / 6) - 1
            : 0;

    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2"
                        style={{ backgroundColor: colors.primary }}
                    />
                    <span className="text-base-content/60">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2"
                        style={{ backgroundColor: colors.info }}
                    />
                    <span className="text-base-content/60">
                        Interviewing
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2"
                        style={{ backgroundColor: colors.warning }}
                    />
                    <span className="text-base-content/60">Offers</span>
                </div>
            </div>

            {/* Chart */}
            <div className={compact ? "h-[180px]" : "h-[200px]"}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={hexWithAlpha(colors.baseContent, 0.08)}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{
                                fontSize: 10,
                                fill: hexWithAlpha(colors.baseContent, 0.6),
                                fontWeight: 500,
                            }}
                            axisLine={{
                                stroke: hexWithAlpha(colors.baseContent, 0.15),
                            }}
                            tickLine={false}
                            interval={tickInterval}
                        />
                        <YAxis
                            tick={{
                                fontSize: 10,
                                fill: hexWithAlpha(colors.baseContent, 0.6),
                                fontWeight: 500,
                            }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={<BaselTooltip />}
                        />
                        <Area
                            type="monotone"
                            dataKey="Total"
                            stroke={colors.primary}
                            fill={colors.primary}
                            fillOpacity={0.08}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                fill: colors.base100,
                                stroke: colors.primary,
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Interviewing"
                            stroke={colors.info}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            activeDot={{
                                r: 3,
                                strokeWidth: 2,
                                fill: colors.base100,
                                stroke: colors.info,
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Offers"
                            stroke={colors.warning}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            activeDot={{
                                r: 3,
                                strokeWidth: 2,
                                fill: colors.base100,
                                stroke: colors.warning,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
