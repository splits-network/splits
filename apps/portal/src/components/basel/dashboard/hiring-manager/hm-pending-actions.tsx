"use client";

import Link from "next/link";
import { BaselChartCard } from "@splits-network/basel-ui";

interface PendingAction {
    id: string;
    candidateName: string;
    jobTitle: string;
    stage: string;
    daysSinceUpdate: number;
    applicationId: string;
}

interface HmPendingActionsProps {
    actions: PendingAction[];
    loading: boolean;
}

const STAGE_COLORS: Record<string, string> = {
    screen: "badge-info",
    submitted: "badge-primary",
    interview: "badge-accent",
    offer: "badge-warning",
};

export function HmPendingActions({ actions, loading }: HmPendingActionsProps) {
    if (loading) {
        return (
            <BaselChartCard
                title="Pending Reviews"
                subtitle="Candidates awaiting your decision"
                icon="fa-duotone fa-regular fa-clock"
                accentColor="warning"
                compact
            >
                <div className="space-y-3 p-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-base-content/10 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 bg-base-content/10 animate-pulse w-40" />
                                <div className="h-2.5 bg-base-content/5 animate-pulse w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </BaselChartCard>
        );
    }

    if (actions.length === 0) {
        return (
            <BaselChartCard
                title="Pending Reviews"
                subtitle="Candidates awaiting your decision"
                icon="fa-duotone fa-regular fa-clock"
                accentColor="warning"
                compact
            >
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-success/10 flex items-center justify-center mb-3">
                        <i className="fa-duotone fa-regular fa-check text-xl text-success" />
                    </div>
                    <p className="text-sm font-semibold text-base-content/60">
                        All caught up
                    </p>
                    <p className="text-sm text-base-content/40 mt-1">
                        No candidates waiting for your review
                    </p>
                </div>
            </BaselChartCard>
        );
    }

    return (
        <BaselChartCard
            title="Pending Reviews"
            subtitle={`${actions.length} candidate${actions.length !== 1 ? "s" : ""} awaiting your decision`}
            icon="fa-duotone fa-regular fa-clock"
            accentColor="warning"
            compact
        >
            <div className="space-y-1 p-1">
                {actions.slice(0, 8).map((action) => (
                    <Link
                        key={action.id}
                        href={`/portal/applications/${action.applicationId}`}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-base-content/5 transition-colors group"
                        style={{ borderRadius: 0 }}
                    >
                        <div className="w-8 h-8 bg-warning/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-warning">
                                {action.candidateName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                                {action.candidateName}
                            </p>
                            <p className="text-sm text-base-content/40 truncate">
                                {action.jobTitle}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span
                                className={`badge badge-sm ${STAGE_COLORS[action.stage] || "badge-ghost"}`}
                                style={{ borderRadius: 0 }}
                            >
                                {action.stage}
                            </span>
                            {action.daysSinceUpdate >= 3 && (
                                <span className="text-sm text-warning font-medium tabular-nums">
                                    {action.daysSinceUpdate}d
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
                {actions.length > 8 && (
                    <div className="text-center pt-2 border-t border-base-content/5">
                        <Link
                            href="/portal/applications"
                            className="text-sm text-primary font-medium hover:underline"
                        >
                            View all {actions.length} pending
                        </Link>
                    </div>
                )}
            </div>
        </BaselChartCard>
    );
}
