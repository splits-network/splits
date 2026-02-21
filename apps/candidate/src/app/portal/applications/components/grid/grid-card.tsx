"use client";

import type { Application } from "../../types";
import { stageColor } from "../shared/status-color";
import {
    companyName,
    companyInitials,
    salaryDisplay,
    formatStage,
} from "../shared/helpers";
import ActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    app,
    isSelected,
    onSelect,
    onRefresh,
}: {
    app: Application;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = companyName(app);
    const salary = salaryDisplay(app);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
            style={{ borderRadius: 0 }}
        >
            {/* Top row: status pill */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${stageColor(app.stage)}`}
                >
                    {formatStage(app.stage)}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {app.job?.title || "Untitled Position"}
            </h3>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {name}
            </div>

            {/* Location */}
            {app.job?.location && (
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-4">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {app.job.location}
                </div>
            )}

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {salary || "Competitive"}
            </div>

            {/* Footer: company logo/initials left, actions right */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    {app.job?.company?.logo_url ? (
                        <img
                            src={app.job.company.logo_url}
                            alt={name}
                            className="w-9 h-9 shrink-0 object-contain bg-base-200 border border-base-300 p-1"
                            style={{ borderRadius: 0 }}
                        />
                    ) : (
                        <div
                            className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60"
                            style={{ borderRadius: 0 }}
                        >
                            {companyInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-base-content truncate">
                            {name}
                        </div>
                        {app.job?.company?.industry && (
                            <div className="text-xs text-base-content/40 truncate">
                                {app.job.company.industry}
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsToolbar
                        item={app}
                        variant="icon-only"
                        size="sm"
                        onStageChange={onRefresh}
                    />
                </div>
            </div>
        </div>
    );
}
