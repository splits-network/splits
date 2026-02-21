"use client";

import type { Application } from "../../types";
import { stageColor } from "../shared/status-color";
import {
    companyName,
    recruiterName,
    appliedAgo,
    salaryDisplay,
    formatStage,
} from "../shared/helpers";
import ActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
    app,
    isSelected,
    onSelect,
    onStageChange,
}: {
    app: Application;
    isSelected: boolean;
    onSelect: () => void;
    onStageChange?: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: title + applied ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                    {app.job?.title || "Untitled Position"}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {appliedAgo(app)}
                </span>
            </div>

            {/* Row 2: company name */}
            <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                {companyName(app)}
            </div>

            {/* Row 3: location + stage pill */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    {app.job?.location ? (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {app.job.location}
                        </>
                    ) : null}
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold flex-shrink-0 ${stageColor(app.stage)}`}
                >
                    {formatStage(app.stage)}
                </span>
            </div>

            {/* Row 4: salary, recruiter name */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-base-content/70">
                    {salaryDisplay(app) || "Competitive"}
                </span>
                <span className="text-sm text-base-content/40">
                    {recruiterName(app)}
                </span>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <ActionsToolbar
                    item={app}
                    variant="icon-only"
                    size="xs"
                    onStageChange={onStageChange}
                />
            </div>
        </div>
    );
}
