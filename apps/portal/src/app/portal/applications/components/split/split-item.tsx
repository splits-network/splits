"use client";

import type { Application } from "../../types";
import {
    candidateName,
    roleTitle,
    companyName,
    addedAgo,
    aiScore,
    isNew,
} from "../shared/helpers";
import { getStageDisplay, getAIScoreBadge } from "../shared/status-color";

export function SplitItem({
    application,
    isSelected,
    onSelect,
}: {
    application: Application;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const stage = getStageDisplay(application.stage);
    const score = aiScore(application);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 border-b border-base-200 transition-colors border-l-4 ${
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
                    {" "}at {companyName(application)}
                </span>
            </div>

            {/* Row 3: stage badge + AI score */}
            <div className="flex items-center gap-2">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold ${stage.badge}`}
                >
                    <i className={`fa-duotone fa-regular ${stage.icon} text-[10px]`} />
                    {stage.label}
                </span>
                {score != null && (
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold ${getAIScoreBadge(score)}`}
                    >
                        <i className="fa-duotone fa-regular fa-robot text-[10px]" />
                        {score}%
                    </span>
                )}
            </div>
        </div>
    );
}
