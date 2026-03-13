"use client";

import { useMemo } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { AreaChart } from "@splits-network/shared-charts";

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
        months.push(date.toLocaleDateString("en-US", { month: "short" }));
    }
    return months;
}

export default function ApplicationTimelineChart({
    applications,
    loading,
    trendPeriod,
    compact,
}: ApplicationTimelineChartProps) {
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

        return { labels, totalApps, interviewingApps, offerApps };
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

    return (
        <AreaChart
            series={[
                { name: "Total", data: chartData.totalApps },
                { name: "Interviewing", data: chartData.interviewingApps },
                { name: "Offers", data: chartData.offerApps },
            ]}
            xLabels={chartData.labels}
            height={compact ? 200 : 240}
            showLegend
            smooth
            gradient
        />
    );
}
