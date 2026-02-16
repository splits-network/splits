"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Application } from "../../types";
import { getDisplayStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { candidateName, candidateInitials, roleTitle, companyName, aiScore, isNew } from "../shared/helpers";
import ActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    application,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    application: Application;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const status = getDisplayStatus(application);
    const score = aiScore(application);
    const candidate = candidateName(application);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isNew(application) && (
                    <Badge variant="yellow" className="mb-2">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}

                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark truncate">
                    {candidate}
                </h3>
                <div className={`text-sm font-bold mb-2 ${ac.text} truncate`}>
                    {roleTitle(application)}
                </div>

                <div className="text-sm text-dark/60 mb-3 truncate">{companyName(application)}</div>

                <div className="flex items-center justify-between mb-3 gap-2">
                    <Badge variant={status.badgeClass.includes("success") ? "teal" : "purple"}>
                        {status.label}
                    </Badge>
                    {score != null && (
                        <Badge variant="yellow">
                            <i className="fa-duotone fa-regular fa-robot mr-1" />
                            {score}%
                        </Badge>
                    )}
                </div>
            </div>

            <div className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}>
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}>
                        {candidateInitials(candidate)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">{candidate}</div>
                        <div className="text-sm text-dark/50 truncate">{roleTitle(application)}</div>
                    </div>
                </div>
                <div className="mt-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsToolbar
                        application={application}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{ viewDetails: false }}
                    />
                </div>
            </div>
        </Card>
    );
}
