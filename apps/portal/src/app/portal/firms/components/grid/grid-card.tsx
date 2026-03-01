"use client";

import type { Firm } from "../../types";
import { formatCurrency } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    firmInitials,
    memberCountDisplay,
} from "../shared/helpers";
import { FirmActionsToolbar } from "../shared/actions-toolbar";

export function GridCard({
    firm,
    isSelected,
    onSelect,
    onRefresh,
}: {
    firm: Firm;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Status pill */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(firm.status)}`}
                >
                    {formatStatus(firm.status)}
                </span>
            </div>

            {/* Firm name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {firm.name}
            </h3>

            {/* Member count */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {memberCountDisplay(firm)}
            </div>

            {/* Stats: placements */}
            <div className="text-sm text-base-content/70 mb-1">
                <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                {firm.total_placements} placement
                {firm.total_placements !== 1 ? "s" : ""}
            </div>

            {/* Revenue -- highlighted */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {formatCurrency(firm.total_revenue)}
            </div>

            {/* Created ago */}
            <div className="text-xs text-base-content/40">
                {createdAgo(firm)}
            </div>

            {/* Footer: firm initials + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                        {firmInitials(firm.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-base-content truncate">
                            {firm.name}
                        </div>
                    </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <FirmActionsToolbar
                        firm={firm}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            inviteMember: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
