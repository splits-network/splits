"use client";

import type { Application } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    candidateName,
    roleTitle,
    companyName,
    addedAgo,
    aiScore,
    isNew,
} from "../shared/helpers";
import { getStageDisplay } from "@splits-network/basel-ui";
import { getAIScoreBadgeColor } from "../shared/status-color";
import ActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
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
    const stage = getStageDisplay(application.stage, {
        expiredAt: (application as any).expired_at,
        acceptedByCandidate: application.accepted_by_candidate,
    });
    const score = aiScore(application);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer p-4 border-b border-base-200 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "border-transparent hover:bg-base-200/50"
            }`}
        >
            {/* Row 1: candidate name + time ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(application) && (
                        <i className="fa-duotone fa-regular fa-sparkles text-primary text-xs flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {candidateName(application)}
                    </h4>
                </div>
                <span className="text-xs font-semibold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {addedAgo(application)}
                </span>
            </div>

            {/* Row 2: role title at company */}
            <div className="text-sm truncate mb-1">
                <span className="font-semibold text-primary">
                    {roleTitle(application)}
                </span>
                <span className="text-base-content/50">
                    {" "}
                    at {companyName(application)}
                </span>
            </div>

            {/* Row 3: stage badge + AI score */}
            <div className="flex items-center gap-2">
                <BaselBadge color={stage.color} size="xs" variant="soft">
                    <i className={`fa-duotone fa-regular ${stage.icon} text-sm`} />
                    {stage.label}
                </BaselBadge>
                {score != null && (
                    <BaselBadge color={getAIScoreBadgeColor(score)} size="xs" variant="soft">
                        <i className="fa-duotone fa-regular fa-robot text-sm" />
                        {score}%
                    </BaselBadge>
                )}
            </div>
        </div>
    );
}
