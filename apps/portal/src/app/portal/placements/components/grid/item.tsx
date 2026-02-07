"use client";

import { DataRow, DataList, MetricCard } from "@/components/ui/cards";
import {
    Placement,
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Placement;
    onViewDetails: () => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const status = getStatusDisplay(item);

    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                {(
                                    item.candidate?.full_name || "U"
                                )[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                {item.candidate?.full_name || "Unknown"}
                            </h3>
                            <p className="text-sm text-base-content/60 truncate">
                                {item.candidate?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <span
                            className={`badge ${status.badgeClass} badge-sm gap-1.5`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon}`}
                            />
                            {status.label}
                        </span>
                    </div>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                <DataList compact>
                    <DataRow
                        icon="fa-briefcase"
                        label="Job"
                        value={item.job?.title || "Unknown"}
                    />
                    <DataRow
                        icon="fa-building"
                        label="Company"
                        value={item.job?.company?.name || "N/A"}
                    />
                    <DataRow
                        icon="fa-dollar-sign"
                        label="Salary"
                        value={formatCurrency(item.salary || 0)}
                    />
                    <DataRow
                        icon="fa-calendar-check"
                        label="Hired"
                        value={formatPlacementDate(item.hired_at)}
                    />
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-success">
                            {formatCurrency(item.recruiter_share || 0)}
                        </span>
                        <ActionsToolbar
                            placement={item}
                            variant="icon-only"
                            size="sm"
                            showActions={{
                                viewDetails: false,
                                viewJob: false,
                                viewCandidate: false,
                                viewApplication: false,
                                viewCompany: false,
                                statusActions: true,
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={onViewDetails}
                        title="View details"
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        Details
                    </button>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
