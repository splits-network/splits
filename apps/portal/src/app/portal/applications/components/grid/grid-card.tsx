"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Application } from "../../types";
import { getDisplayStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import {
    candidateName,
    roleTitle,
    companyName,
    aiScore,
    isNew,
} from "../shared/helpers";
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
    const company = companyName(application);
    const companyInitials = company
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "?";

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isNew(application) && (
                    <Badge color="yellow" className="mb-2">
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

                <div className="text-sm text-dark/60 mb-3 truncate">
                    {companyName(application)}
                </div>

                <div className="flex items-center justify-between mb-3 gap-2">
                    <Badge
                        color={
                            status.badgeClass.includes("success")
                                ? "teal"
                                : "purple"
                        }
                        className="max-w-[140px] truncate"
                        title={status.label}
                    >
                        {status.label}
                    </Badge>
                    {score != null && (
                        <Badge color="yellow" className="shrink-0">
                            <i className="fa-duotone fa-regular fa-robot mr-1" />
                            {score}%
                        </Badge>
                    )}
                </div>
            </div>

            <div
                className={`card-actions flex-col items-stretch gap-3 pt-3 border-t-4 ${ac.border}/30`}
            >
                <div className="flex flex-row items-center gap-2 min-w-0">
                    <div
                        className={`w-10 h-10 shrink-0 flex items-center justify-center border-4 ${ac.border} bg-cream text-sm font-bold text-dark`}
                    >
                        {companyInitials}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">
                            {company}
                        </div>
                        <div className="text-sm text-dark/50 truncate">
                            {roleTitle(application)}
                        </div>
                    </div>
                </div>
                <div
                    className="w-full flex justify-end overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex gap-1 flex-wrap justify-end max-w-full">
                        <ActionsToolbar
                            application={application}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{ viewDetails: false }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
