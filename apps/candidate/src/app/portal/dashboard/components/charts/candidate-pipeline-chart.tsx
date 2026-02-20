"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { BaselEmptyState } from "@splits-network/basel-ui";
import {
    useBaselChartColors,
    hexWithAlpha,
    BaselTooltip,
} from "@/components/basel/charts";

interface Application {
    id: string;
    stage: string;
    job?: {
        status?: string;
    };
}

interface CandidatePipelineChartProps {
    applications: Application[];
    loading?: boolean;
}

const STAGE_MAPPING: Record<string, string> = {
    draft: "In Review",
    ai_review: "In Review",
    ai_reviewed: "In Review",
    recruiter_request: "In Review",
    recruiter_proposed: "In Review",
    recruiter_review: "In Review",
    submitted: "Submitted",
    company_review: "Submitted",
    company_feedback: "Submitted",
    screen: "Screen",
    interview: "Interview",
    final_interview: "Interview",
    offer: "Offer",
    hired: "Hired",
};

const PIPELINE_STAGES = [
    "In Review",
    "Submitted",
    "Screen",
    "Interview",
    "Offer",
    "Hired",
] as const;

// Map stages to DaisyUI semantic color keys
const STAGE_COLOR_KEYS: Record<
    string,
    keyof ReturnType<typeof useBaselChartColors>
> = {
    "In Review": "info",
    Submitted: "primary",
    Screen: "secondary",
    Interview: "warning",
    Offer: "accent",
    Hired: "success",
};

export default function CandidatePipelineChart({
    applications,
    loading,
}: CandidatePipelineChartProps) {
    const colors = useBaselChartColors();

    const stages = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const stage of PIPELINE_STAGES) {
            counts[stage] = 0;
        }

        applications.forEach((app) => {
            if (
                app.stage === "rejected" ||
                app.stage === "withdrawn" ||
                app.stage === "expired"
            )
                return;
            if (app.job?.status === "closed" || app.job?.status === "filled")
                return;

            const mapped = STAGE_MAPPING[app.stage];
            if (mapped && counts[mapped] !== undefined) {
                counts[mapped]++;
            }
        });

        return PIPELINE_STAGES.map((label) => ({
            name: label,
            count: counts[label],
            color: colors[STAGE_COLOR_KEYS[label]],
        }));
    }, [applications, colors]);

    const totalActive = stages.reduce((sum, s) => sum + s.count, 0);

    if (loading) {
        return (
            <div className="bg-base-200 p-8 h-full">
                <ChartLoadingState height={280} />
            </div>
        );
    }

    if (totalActive === 0) {
        return (
            <div className="bg-base-200 p-8 h-full">
                <h3 className="text-lg font-bold text-base-content mb-2">
                    Application Pipeline
                </h3>
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-filter"
                    title="No active applications"
                    description="Apply to jobs to see your application pipeline here."
                    actions={[
                        {
                            label: "Browse Jobs",
                            icon: "fa-duotone fa-regular fa-search",
                            href: "/jobs",
                            style: "btn-primary",
                        },
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="bg-base-200 p-8 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-base-content">
                        Application Pipeline
                    </h3>
                    <p className="text-sm text-base-content/50">
                        {totalActive} active &middot; conversion funnel
                    </p>
                </div>
            </div>

            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={stages}
                        layout="vertical"
                        margin={{
                            top: 0,
                            right: 40,
                            left: 10,
                            bottom: 0,
                        }}
                        barSize={28}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={80}
                            tick={{
                                fontSize: 11,
                                fontWeight: 600,
                                fill: hexWithAlpha(colors.baseContent, 0.6),
                            }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            content={
                                <BaselTooltip
                                    formatter={(value, name) =>
                                        `${value} application${value !== 1 ? "s" : ""}`
                                    }
                                />
                            }
                        />
                        <Bar
                            dataKey="count"
                            radius={[0, 0, 0, 0]}
                            strokeWidth={0}
                        >
                            {stages.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="right"
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fill: hexWithAlpha(colors.baseContent, 0.7),
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
