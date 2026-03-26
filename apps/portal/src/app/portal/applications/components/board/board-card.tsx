"use client";

import type { Application } from "../../types";
import {
    candidateName,
    candidateInitials,
    roleTitle,
    companyName,
    aiScore,
    addedAgo,
    jobSalaryRange,
} from "../shared/helpers";
import { getStageDisplay } from "@splits-network/basel-ui";
import { getAIScoreBadgeColor } from "../shared/status-color";
import { BaselBadge, BaselAvatar } from "@splits-network/basel-ui";

const SCORE_COLORS: Record<string, string> = {
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning",
    error: "text-error",
    neutral: "text-base-content/40",
};

export function BoardCard({
    application,
    isSelected,
    onSelect,
}: {
    application: Application;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const name = candidateName(application);
    const initials = candidateInitials(name);
    const role = roleTitle(application);
    const company = companyName(application);
    const score = aiScore(application);
    const scoreColor = getAIScoreBadgeColor(score);
    const salary = jobSalaryRange(application);
    const ago = addedAgo(application);
    const stage = getStageDisplay(application.stage, {
        expiredAt: (application as any).expired_at,
        acceptedByCandidate: application.accepted_by_candidate,
    });

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col gap-2 p-3 bg-base-100 border transition-colors",
                isSelected
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Top row: avatar + name + time */}
            <div className="flex items-start gap-2.5">
                <BaselAvatar initials={initials} size="sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-base-content truncate leading-tight group-hover:text-primary transition-colors">
                        {name}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">
                        {role}
                    </p>
                </div>
                {score !== null && (
                    <span
                        className={`text-sm font-black shrink-0 ${SCORE_COLORS[scoreColor] || "text-base-content"}`}
                    >
                        {score}%
                    </span>
                )}
            </div>

            {/* Meta row: company + salary */}
            <div className="flex items-center justify-between text-xs text-base-content/50">
                <span className="truncate font-medium">{company}</span>
                {salary && (
                    <span className="shrink-0 text-success font-medium">
                        {salary}
                    </span>
                )}
            </div>

            {/* Footer: stage badge + time */}
            <div className="flex items-center justify-between">
                <BaselBadge
                    color={stage.color}
                    variant="soft"
                    size="xs"
                    icon={stage.icon}
                >
                    {stage.label}
                </BaselBadge>
                <span className="text-xs text-base-content/30">{ago}</span>
            </div>
        </article>
    );
}
