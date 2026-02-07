"use client";

import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from "@/components/ui/tables";
import {
    Placement,
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface RowProps {
    item: Placement;
    onViewDetails: () => void;
}

export default function Row({ item, onViewDetails }: RowProps) {
    const status = getStatusDisplay(item);

    const cells = (
        <>
            {/* Hired Date */}
            <td>
                <span className="text-sm text-base-content/60">
                    {formatPlacementDate(item.hired_at)}
                </span>
            </td>
            {/* Candidate */}
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {(item.candidate?.full_name || "C")[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold"
                            title={item.candidate?.full_name ?? undefined}
                        >
                            {item.candidate?.full_name || "Unknown"}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {item.candidate?.email}
                        </div>
                    </div>
                </div>
            </td>
            {/* Job */}
            <td>
                <span className="text-sm font-medium">
                    {item.job?.title || "Unknown"}
                </span>
            </td>
            {/* Company */}
            <td>
                <span className="text-sm text-base-content/60">
                    {item.job?.company?.name || "N/A"}
                </span>
            </td>
            {/* Salary */}
            <td className="text-right">
                <span className="text-sm">
                    {formatCurrency(item.salary || 0)}
                </span>
            </td>
            {/* Fee % */}
            <td className="text-right">
                <span className="text-sm">{item.fee_percentage || 0}%</span>
            </td>
            {/* Your Share */}
            <td className="text-right">
                <span className="text-sm font-semibold text-success">
                    {formatCurrency(item.recruiter_share || 0)}
                </span>
            </td>
            {/* Status */}
            <td>
                <span
                    className={`badge ${status.badgeClass} badge-sm gap-1.5`}
                >
                    <i className={`fa-duotone fa-regular ${status.icon}`} />
                    {status.label}
                </span>
            </td>
            {/* Actions */}
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={onViewDetails}
                        title="View details"
                    >
                        <i className="fa-duotone fa-regular fa-eye fa-fw" />
                    </button>
                </div>
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            {/* Details Grid */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-calendar-check"
                    label="Hired Date"
                    value={formatPlacementDate(item.hired_at)}
                />
                {item.start_date && (
                    <ExpandedDetailItem
                        icon="fa-calendar-day"
                        label="Start Date"
                        value={formatPlacementDate(item.start_date)}
                    />
                )}
                <ExpandedDetailItem
                    icon="fa-circle-check"
                    label="Status"
                    value={
                        <span
                            className={`badge badge-sm ${status.badgeClass}`}
                        >
                            {status.label}
                        </span>
                    }
                />
                {item.guarantee_days && (
                    <ExpandedDetailItem
                        icon="fa-shield"
                        label="Guarantee Period"
                        value={`${item.guarantee_days} days`}
                    />
                )}
            </ExpandedDetailGrid>

            {/* Financial Breakdown */}
            <div className="bg-base-200 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
                    Financial Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <span className="text-xs text-base-content/50">
                            Salary
                        </span>
                        <div className="font-medium">
                            {formatCurrency(item.salary || 0)}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">
                            Fee Rate
                        </span>
                        <div className="font-medium">
                            {item.fee_percentage || 0}%
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">
                            Total Fee
                        </span>
                        <div className="font-medium">
                            {formatCurrency(item.fee_amount || 0)}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">
                            Your Share
                        </span>
                        <div className="font-bold text-success">
                            {formatCurrency(item.recruiter_share || 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <ActionsToolbar
                    placement={item}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    showActions={{ viewDetails: false }}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`placement-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
