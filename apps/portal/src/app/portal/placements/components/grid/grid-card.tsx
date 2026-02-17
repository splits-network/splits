"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Placement } from "../../types";
import {
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import { isNew, candidateName, jobTitle, companyName } from "../shared/helpers";

export function GridCard({
    placement,
    accent,
    isSelected,
    onSelectAction,
}: {
    placement: Placement;
    accent: AccentClasses;
    isSelected?: boolean;
    onSelectAction: () => void;
}) {
    const ac = accent;
    const status = getStatusDisplay(placement);

    return (
        <Card
            onClick={onSelectAction}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isNew(placement) && (
                    <Badge color="yellow" className="mb-2">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {candidateName(placement)}
                </h3>
                <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                    {companyName(placement)}
                </div>

                <div className="flex items-center gap-1 text-xs mb-3 text-dark/60 font-bold">
                    <i className="fa-duotone fa-regular fa-briefcase" />
                    {jobTitle(placement)}
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-dark">
                        {formatCurrency(placement.salary || 0)}
                    </span>
                    <Badge color={getStatusDisplay(placement).badge}>
                        {getStatusDisplay(placement).label}
                    </Badge>
                </div>

                <div
                    className={`pt-3 border-t-4 ${ac.border} flex items-center justify-between`}
                >
                    <span className="text-xs font-bold text-dark/60 uppercase tracking-wider">
                        {formatPlacementDate(placement.hired_at)}
                    </span>
                    <span className={`text-xs font-black ${ac.text}`}>
                        {formatCurrency(placement.recruiter_share || 0)}
                    </span>
                </div>
            </div>
        </Card>
    );
}
