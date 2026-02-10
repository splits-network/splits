"use client";

import { formatDate } from "@/lib/utils";
import { DataTableRow } from "@/components/ui/tables";
import { type Application, getStatusColor, formatStage } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface RowProps {
    item: Application;
    onViewDetails: (id: string) => void;
    onStageChange?: () => void;
}

export default function Row({ item, onViewDetails, onStageChange }: RowProps) {
    return (
        <DataTableRow onClick={() => onViewDetails(item.id)}>
            {/* Expand column spacer */}
            <td className="w-10">
                <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(item.id);
                    }}
                >
                    <i className="fa-duotone fa-regular fa-chevron-right" />
                </button>
            </td>

            {/* Position */}
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-8 flex items-center justify-center font-bold text-xs">
                            {item.job?.company?.logo_url ? (
                                <img
                                    src={item.job.company.logo_url}
                                    alt=""
                                    className="w-full h-full object-contain rounded-full"
                                />
                            ) : (
                                <span>
                                    {(item.job?.company?.name ||
                                        "C")[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="font-semibold text-sm">
                        {item.job?.title || "Unknown Position"}
                    </span>
                </div>
            </td>

            {/* Company */}
            <td>
                <span className="text-sm">
                    {item.job?.company?.name || item.company?.name || "Unknown"}
                </span>
            </td>

            {/* Location */}
            <td className="hidden md:table-cell">
                {item.job?.location ? (
                    <span className="text-sm">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1 text-xs" />
                        {item.job.location}
                    </span>
                ) : (
                    <span className="text-base-content/30">-</span>
                )}
            </td>

            {/* Status */}
            <td>
                <span
                    className={`badge badge-sm ${getStatusColor(item.stage)}`}
                >
                    {formatStage(item.stage)}
                </span>
            </td>

            {/* Recruiter */}
            <td className="hidden md:table-cell">
                {item.recruiter?.user?.name ? (
                    <span className="text-sm">{item.recruiter.user.name}</span>
                ) : (
                    <span className="text-base-content/30">-</span>
                )}
            </td>

            {/* Applied Date */}
            <td>
                <span className="text-sm">{formatDate(item.created_at)}</span>
            </td>

            {/* Actions */}
            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                <ActionsToolbar
                    item={item}
                    variant="icon-only"
                    size="sm"
                    onStageChange={onStageChange}
                />
            </td>
        </DataTableRow>
    );
}
