"use client";

import { useMemo } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { HeatmapChart } from "@splits-network/shared-charts";

interface Application {
    id: string;
    created_at: string;
}

interface ActivityHeatmapProps {
    applications: Application[];
    loading?: boolean;
    compact?: boolean;
}

const NUM_DAYS = 120;

export default function ActivityHeatmap({
    applications,
    loading,
}: ActivityHeatmapProps) {
    const heatmapData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count applications per day
        const countMap = new Map<string, number>();
        applications.forEach((app) => {
            const date = new Date(app.created_at);
            const dateStr = date.toISOString().split("T")[0];
            countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
        });

        // Generate entries for last N days
        const data: { date: string; value: number }[] = [];
        for (let i = NUM_DAYS - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            data.push({
                date: dateStr,
                value: countMap.get(dateStr) || 0,
            });
        }

        return data;
    }, [applications]);

    if (loading) {
        return <ChartLoadingState height={140} />;
    }

    return (
        <HeatmapChart
            data={heatmapData}
            height={140}
            className="w-full h-full"
        />
    );
}
