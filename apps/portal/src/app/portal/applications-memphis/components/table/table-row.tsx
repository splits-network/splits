"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Application } from "../../types";
import { getDisplayStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { DetailLoader } from "../shared/application-detail";
import ActionsToolbar from "../shared/actions-toolbar";
import {
    candidateName,
    candidateInitials,
    roleTitle,
    companyName,
    aiScore,
    addedAgo,
    isNew,
} from "../shared/helpers";

export function TableRow({
    application,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    application: Application;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const status = getDisplayStatus(application);
    const score = aiScore(application);
    const candidate = candidateName(application);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected ? `${ac.bgLight} ${ac.border}` : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`} />
                </td>

                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${ac.bg} flex items-center justify-center`}>
                            <span className={`text-xs font-black ${ac.textOnBg}`}>{candidateInitials(candidate)}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            {isNew(application) && <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow flex-shrink-0" />}
                            <span className="font-black text-sm text-dark uppercase truncate">{candidate}</span>
                        </div>
                    </div>
                </td>

                <td className="px-4 py-3">
                    <div className="min-w-0">
                        <span className="text-sm font-bold text-dark block truncate">{roleTitle(application)}</span>
                        <span className={`text-xs font-semibold ${ac.text} block truncate`}>{companyName(application)}</span>
                    </div>
                </td>

                <td className="px-4 py-3">
                    <Badge
                        variant={status.badgeClass.includes("success") ? "teal" : "purple"}
                        className="max-w-[160px] truncate"
                        title={status.label}
                    >
                        {status.label}
                    </Badge>
                </td>

                <td className="px-4 py-3 text-sm font-bold text-dark">{score != null ? `${score}%` : "-"}</td>

                <td className="px-4 py-3 text-sm text-dark/60">{addedAgo(application)}</td>

                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <ActionsToolbar
                            application={application}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{ viewDetails: false }}
                        />
                    </div>
                </td>
            </tr>

            {isSelected && (
                <tr>
                    <td colSpan={colSpan} className={`border-t-4 border-b-4 ${ac.border}`}>
                        <DetailLoader
                            applicationId={application.id}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
