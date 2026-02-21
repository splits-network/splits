"use client";

import type { Application } from "../../types";
import {
    candidateName,
    candidateInitials,
    roleTitle,
    companyName,
    aiScore,
    isNew,
    addedAgo,
} from "../shared/helpers";
import { getStageDisplay, getAIScoreBadge } from "../shared/status-color";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";

export function GridCard({
    application,
    isSelected,
    onSelect,
    onRefresh,
}: {
    application: Application;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = candidateName(application);
    const initials = candidateInitials(name);
    const role = roleTitle(application);
    const company = companyName(application);
    const score = aiScore(application);
    const stage = getStageDisplay(application.stage);
    const scoreBadge = getAIScoreBadge(score);
    const companyInitials = company
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: stage badge + NEW indicator */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${stage.badge}`}
                >
                    <i className={`fa-duotone fa-regular ${stage.icon} mr-1`} />
                    {stage.label}
                </span>

                {isNew(application) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}

                {/* Timestamp pushed right */}
                <span className="text-[10px] uppercase tracking-wider text-base-content/40 ml-auto">
                    {addedAgo(application)}
                </span>
            </div>

            {/* Candidate name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {name}
            </h3>

            {/* Role title */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {role}
            </div>

            {/* Company meta row */}
            <div className="flex items-center gap-1.5 text-sm text-base-content/50 mb-4">
                <i className="fa-duotone fa-regular fa-building" />
                {company}
            </div>
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                    {companyInitials}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-base-content truncate">
                        {company}
                    </div>
                </div>
            </div>

            {/* AI score badge */}
            {score !== null && (
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${scoreBadge}`}
                    >
                        <i className="fa-duotone fa-regular fa-robot mr-1" />
                        AI {score}%
                    </span>
                </div>
            )}

            {/* Footer: company initials avatar + actions toolbar */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsToolbar
                        application={application}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                            advanceStage: true,
                            reject: true,
                            requestPrescreen: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
