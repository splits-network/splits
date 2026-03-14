"use client";

import { useMemo } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { PieChart } from "@splits-network/shared-charts";

interface Application {
    id: string;
    stage: string;
    expired_at?: string | null;
    job?: {
        status?: string;
    };
}

interface ApplicationStatusChartProps {
    applications: Application[];
    loading?: boolean;
    compact?: boolean;
}

const STAGE_TO_GROUP: Record<string, string> = {
    draft: "review",
    ai_review: "review",
    gpt_review: "review",
    ai_failed: "review",
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

const GROUP_KEYS = [
    "active",
    "review",
    "offers",
    "placed",
    "archived",
] as const;

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
    const chartData = useMemo(() => {
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
                app.job?.status === "filled" ||
                app.expired_at
            ) {
                counts.archived++;
            } else {
                const group = STAGE_TO_GROUP[app.stage];
                if (group && counts[group] !== undefined) {
                    counts[group]++;
                }
            }
        });

        return GROUP_KEYS.map((key) => ({
            name: GROUP_LABELS[key],
            value: counts[key],
        }));
    }, [applications]);

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
        <PieChart
            data={chartData}
            donut
            height={compact ? 200 : 240}
            showLabels={false}
            showLegend
        />
    );
}
