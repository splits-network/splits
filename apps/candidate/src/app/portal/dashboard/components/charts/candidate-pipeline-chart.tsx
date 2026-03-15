"use client";

import { useMemo } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { BaselEmptyState } from "@splits-network/basel-ui";

interface Application {
    id: string;
    stage: string;
    expired_at?: string | null;
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
    gpt_review: "In Review",
    ai_failed: "In Review",
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

const STAGE_COLORS: Record<string, string> = {
    "In Review": "bg-info",
    Submitted: "bg-primary",
    Screen: "bg-secondary",
    Interview: "bg-warning",
    Offer: "bg-accent",
    Hired: "bg-success",
};

export default function CandidatePipelineChart({
    applications,
    loading,
}: CandidatePipelineChartProps) {
    const stages = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const stage of PIPELINE_STAGES) {
            counts[stage] = 0;
        }

        applications.forEach((app) => {
            if (
                app.stage === "rejected" ||
                app.stage === "withdrawn" ||
                app.expired_at
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
            label,
            count: counts[label],
        }));
    }, [applications]);

    const totalActive = stages.reduce((sum, s) => sum + s.count, 0);

    if (loading) {
        return <ChartLoadingState height={200} />;
    }

    if (totalActive === 0) {
        return (
            <BaselEmptyState
                icon="fa-duotone fa-regular fa-filter"
                title="No active applications"
                description="Apply to jobs to see your pipeline here."
                actions={[
                    {
                        label: "Browse Jobs",
                        icon: "fa-duotone fa-regular fa-search",
                        href: "/jobs",
                        style: "btn-primary",
                    },
                ]}
            />
        );
    }

    const maxCount = Math.max(...stages.map((s) => s.count), 1);

    return (
        <div className="flex flex-col justify-evenly h-full" style={{ minHeight: 200 }}>
            {stages.map((stage, i) => {
                const pct = (stage.count / maxCount) * 100;
                const colorClass = STAGE_COLORS[stage.label] || "bg-base-content/20";
                const conversionRate =
                    i > 0 && stages[i - 1].count > 0
                        ? Math.round((stage.count / stages[i - 1].count) * 100)
                        : null;

                return (
                    <div key={stage.label}>
                        {conversionRate !== null && (
                            <div className="flex items-center gap-1.5 pl-20 py-0.5">
                                <i className="fa-solid fa-arrow-down text-[8px] text-base-content/30" />
                                <span className="text-sm tabular-nums text-base-content/40 font-medium">
                                    {conversionRate}%
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-base-content/60 w-18 text-right shrink-0 truncate">
                                {stage.label}
                            </span>
                            <div className="flex-1 h-6 bg-base-300/50 rounded overflow-hidden relative">
                                <div
                                    className={`h-full ${colorClass} rounded transition-all duration-500 ease-out`}
                                    style={{ width: `${Math.max(pct, 2)}%` }}
                                />
                                <span className="absolute inset-y-0 left-2 flex items-center text-sm font-semibold tabular-nums text-base-content/80">
                                    {stage.count.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
