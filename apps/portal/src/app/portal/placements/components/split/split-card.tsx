"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Placement } from "../../types";
import { getStatusDisplay, formatCurrency } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    candidateName,
    jobTitle,
    companyName,
    timeAgo,
} from "../shared/helpers";

export function SplitCard({
    placement,
    accent,
    isSelected,
    onSelect,
}: {
    placement: Placement;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const status = getStatusDisplay(placement);

    return (
        <div
            onClick={onSelect}
            className="cursor-pointer p-4 transition-colors border-b-2 border-dark/15"
            style={{
                backgroundColor: isSelected
                    ? `rgba(255,107,107,0.05)`
                    : "white",
                borderLeft: isSelected ? `4px solid` : "4px solid transparent",
                borderLeftColor: isSelected
                    ? ac.bg.replace("bg-", "")
                    : "transparent",
            }}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                        {candidateName(placement)}
                    </h4>
                </div>
                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {timeAgo(placement.hired_at)}
                </span>
            </div>
            <div className={`text-xs font-bold mb-1 ${ac.text}`}>
                {companyName(placement)}
            </div>
            <div className="text-[11px] font-semibold mb-1 text-dark/70">
                {jobTitle(placement)}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dark/70">
                    {formatCurrency(placement.salary || 0)}
                </span>
                <Badge color={statusVariant(placement.state || undefined)} size="sm">
                    {status.label}
                </Badge>
            </div>
        </div>
    );
}
