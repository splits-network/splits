"use client";

import type { Placement } from "../../types";
import type { AccentClasses } from "./accent";
import {
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";
import { Badge } from "@splits-network/memphis-ui";
import { candidateName, jobTitle, companyName } from "./helpers";
import { statusVariant } from "./accent";

export function DetailLoader({
    placement,
    accent,
    onCloseAction,
}: {
    placement: Placement;
    accent: AccentClasses;
    onCloseAction?: () => void;
}) {
    const ac = accent;
    const status = getStatusDisplay(placement);

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className={`p-6 border-b-4 ${ac.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {candidateName(placement)}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`font-bold ${ac.text}`}>
                                {companyName(placement)}
                            </span>
                            <span className="text-dark/50">|</span>
                            <span className="text-dark/70">
                                <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                                {jobTitle(placement)}
                            </span>
                        </div>
                    </div>
                    {onCloseAction && (
                        <button
                            onClick={onCloseAction}
                            className={`w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-sm border-2 transition-transform hover:-translate-y-0.5 ${ac.border} ${ac.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Status */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge color={status.badge}>
                        {status.icon && <i className={status.icon}></i>}
                        {status.label}
                    </Badge>
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className={`grid grid-cols-3 border-b-4 ${ac.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${ac.text}`}>
                        {formatCurrency(placement.salary || 0)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Salary
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${ac.text}`}>
                        {placement.fee_percentage || 0}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Fee Rate
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${ac.text}`}>
                        {formatCurrency(placement.recruiter_share || 0)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                        Your Share
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Dates */}
                <div>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        Dates
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dark/60 font-bold">
                                Hired:
                            </span>
                            <span className="font-black text-dark">
                                {formatPlacementDate(placement.hired_at)}
                            </span>
                        </div>
                        {placement.start_date && (
                            <div className="flex justify-between">
                                <span className="text-dark/60 font-bold">
                                    Start Date:
                                </span>
                                <span className="font-black text-dark">
                                    {formatPlacementDate(placement.start_date)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Guarantee Period */}
                {placement.guarantee_days && (
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                            Guarantee Period
                        </h3>
                        <div className={`p-4 border-4 ${ac.border} bg-cream`}>
                            <div className="text-lg font-black text-dark">
                                {placement.guarantee_days} days
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
