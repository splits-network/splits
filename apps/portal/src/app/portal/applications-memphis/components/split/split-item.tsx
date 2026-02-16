"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Application } from "../../types";
import { getDisplayStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { candidateName, roleTitle, companyName, addedAgo, aiScore, isNew } from "../shared/helpers";

export function SplitItem({
    application,
    accent,
    isSelected,
    onSelect,
}: {
    application: Application;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const status = getDisplayStatus(application);
    const score = aiScore(application);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected ? `${ac.bgLight} ${ac.border}` : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isNew(application) && <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />}
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">{candidateName(application)}</h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">{addedAgo(application)}</span>
            </div>
            <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                {roleTitle(application)}
                <span className="text-dark/50 font-normal"> at {companyName(application)}</span>
            </div>
            <div className="flex items-center justify-between">
                <Badge variant={status.badgeClass.includes("success") ? "teal" : "purple"}>{status.label}</Badge>
                {score != null && <span className="text-sm font-bold text-dark/60">AI {score}%</span>}
            </div>
        </div>
    );
}
